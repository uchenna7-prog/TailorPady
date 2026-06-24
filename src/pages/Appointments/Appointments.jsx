import { useState, useRef, useCallback, useEffect } from 'react'
import { useCustomers } from '../../contexts/CustomerContext'
import { useOrders } from '../../contexts/OrdersContext'
import { useAppointments, getEffectiveStatus } from '../../contexts/AppointmentContext'
import { AppointmentDetail } from '../../components/AppointmentDetail/AppointmentDetail'
import { AppointmentRow, STATUS_CONFIG } from '../../components/AppointmentRow/AppointmentRow'
import Header from '../../components/Header/Header'
import ConfirmSheet from '../../components/ConfirmSheet/ConfirmSheet'
import Toast from '../../components/Toast/Toast'
import BottomNav from '../../components/BottomNav/BottomNav'
import styles from './Appointments.module.css'


const APPT_TYPES = [
  { id: 'fitting',      label: 'Fitting',      icon: 'checkroom'      },
  { id: 'consultation', label: 'Consultation', icon: 'forum'          },
  { id: 'pickup',       label: 'Pick-up',      icon: 'inventory_2'    },
  { id: 'measurement',  label: 'Measurement',  icon: 'straighten'     },
  { id: 'delivery',     label: 'Delivery',     icon: 'local_shipping' },
  { id: 'other',        label: 'Other',        icon: 'calendar_today' },
]

const TABS = [
  { id: 'all',      label: 'All'      },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'done',     label: 'Done'     },
  { id: 'missed',   label: 'Missed'   },
]

function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}


function AddAppointmentModal({ isOpen, onClose, onSave, customers, allOrders }) {
  const [title,         setTitle]         = useState('')
  const [type,          setType]          = useState('fitting')
  const [date,          setDate]          = useState('')
  const [time,          setTime]          = useState('')
  const [location,      setLocation]      = useState('')
  const [notes,         setNotes]         = useState('')
  const [custQuery,     setCustQuery]     = useState('')
  const [selectedCust,  setSelectedCust]  = useState(null)
  const [custDropOpen,  setCustDropOpen]  = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDropOpen, setOrderDropOpen] = useState(false)
  const [reminder,      setReminder]      = useState(true)
  const [errors,        setErrors]        = useState({})

  const custOrders = selectedCust
    ? allOrders.filter(o => String(o.customerId) === String(selectedCust.id))
    : []

  const filteredCusts = custQuery.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(custQuery.toLowerCase()) ||
        c.phone?.includes(custQuery)
      ).slice(0, 5)
    : customers.slice(0, 5)

  const reset = () => {
    setTitle(''); setType('fitting'); setDate(''); setTime(''); setLocation('')
    setNotes(''); setCustQuery(''); setSelectedCust(null); setCustDropOpen(false)
    setSelectedOrder(null); setOrderDropOpen(false); setReminder(true); setErrors({})
  }

  const handleClose = () => { reset(); onClose() }

  const validate = () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = 'Appointment title is required'
    if (!date)         newErrors.date  = 'Date is required'
    if (!time)         newErrors.time  = 'Time is required'
    if (!selectedCust) newErrors.cust  = 'Please select a client'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      title:         title.trim(),
      type,
      date,
      time,
      location:      location.trim(),
      notes:         notes.trim(),
      reminder,
      customerId:    selectedCust  ? String(selectedCust.id)  : null,
      customerName:  selectedCust  ? selectedCust.name        : null,
      customerPhone: selectedCust  ? selectedCust.phone       : null,
      orderId:       selectedOrder ? String(selectedOrder.id) : null,
      orderDesc:     selectedOrder ? selectedOrder.desc       : null,
      status:        'upcoming',
    })
    reset()
    onClose()
  }

  const clearError = (field) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <Header
        type="back"
        title="New Appointment"
        onBackClick={handleClose}
        customActions={[{ label: 'Save', onClick: handleSave, color: 'var(--accent)' }]}
      />

      <div className={styles.modalBody}>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Appointment Title *</label>
          <input
            type="text"
            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
            placeholder="e.g. Final fitting for Senator suit"
            value={title}
            onChange={e => { setTitle(e.target.value); clearError('title') }}
          />
          {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Type</label>
          <div className={styles.categoryGrid}>
            {APPT_TYPES.map(t => (
              <button
                key={t.id}
                className={`${styles.categoryChip} ${type === t.id ? styles.categoryActive : ''}`}
                onClick={() => setType(t.id)}
              >
                <span className="mi" style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup} style={{ flex: 1 }}>
            <label className={styles.fieldLabel}>Date *</label>
            <input
              type="date"
              className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
              value={date}
              onChange={e => { setDate(e.target.value); clearError('date') }}
            />
            {errors.date && <span className={styles.errorMsg}>{errors.date}</span>}
          </div>
          <div className={styles.fieldGroup} style={{ flex: 1 }}>
            <label className={styles.fieldLabel}>Time *</label>
            <input
              type="time"
              className={`${styles.input} ${errors.time ? styles.inputError : ''}`}
              value={time}
              onChange={e => { setTime(e.target.value); clearError('time') }}
            />
            {errors.time && <span className={styles.errorMsg}>{errors.time}</span>}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            Location <span className={styles.optional}>(optional)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. Shop, Client's address…"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Reminder</div>
              <div className={styles.toggleSub}>Don't let this slip</div>
            </div>
            <button
              className={`${styles.toggle} ${reminder ? styles.toggleOn : ''}`}
              onClick={() => setReminder(p => !p)}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Client *</label>
          {selectedCust ? (
            <div className={`${styles.selectedChip} ${errors.cust ? styles.selectedChipError : ''}`}>
              <div className={styles.chipAvatar}>{getInitials(selectedCust.name)}</div>
              <div style={{ flex: 1 }}>
                <div className={styles.chipName}>{selectedCust.name}</div>
                {selectedCust.phone && <div className={styles.chipSub}>{selectedCust.phone}</div>}
              </div>
              <button
                className={styles.chipRemove}
                onClick={() => { setSelectedCust(null); setSelectedOrder(null) }}
              >
                <span className="mi" style={{ fontSize: '1rem' }}>close</span>
              </button>
            </div>
          ) : (
            <div className={`${styles.searchWrap} ${errors.cust ? styles.inputError : ''}`}>
              <span className="mi" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search client name or phone…"
                value={custQuery}
                onChange={e => { setCustQuery(e.target.value); setCustDropOpen(true); clearError('cust') }}
                onFocus={() => { setCustDropOpen(true); clearError('cust') }}
                onBlur={() => setTimeout(() => setCustDropOpen(false), 150)}
              />
              {custDropOpen && (
                <div className={styles.dropdown}>
                  {filteredCusts.length === 0 ? (
                    <div className={styles.dropEmpty}>No clients found</div>
                  ) : (
                    filteredCusts.map(c => (
                      <button
                        key={c.id}
                        className={styles.dropItem}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setSelectedCust(c)
                          setCustQuery('')
                          setCustDropOpen(false)
                          setSelectedOrder(null)
                          clearError('cust')
                        }}
                      >
                        <div className={styles.dropAvatar}>{getInitials(c.name)}</div>
                        <div>
                          <div className={styles.dropName}>{c.name}</div>
                          <div className={styles.dropMeta}>{c.phone}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {errors.cust && <span className={styles.errorMsg}>{errors.cust}</span>}
        </div>

        {selectedCust && (
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Related Order <span className={styles.optional}>(optional)</span>
            </label>
            {selectedOrder ? (
              <div className={styles.selectedChip}>
                <span className="mi" style={{ fontSize: '1rem', color: 'var(--accent)' }}>content_cut</span>
                <span className={styles.chipName}>{selectedOrder.desc}</span>
                <button className={styles.chipRemove} onClick={() => setSelectedOrder(null)}>
                  <span className="mi" style={{ fontSize: '1rem' }}>close</span>
                </button>
              </div>
            ) : (
              <div className={styles.orderDropWrap}>
                <button className={styles.orderDropBtn} onClick={() => setOrderDropOpen(p => !p)}>
                  <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--text3)' }}>content_cut</span>
                  <span>{custOrders.length === 0 ? 'No orders for this client' : 'Select an order…'}</span>
                  <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)', marginLeft: 'auto' }}>expand_more</span>
                </button>
                {orderDropOpen && custOrders.length > 0 && (
                  <div className={styles.dropdown}>
                    {custOrders.map(o => (
                      <button
                        key={o.id}
                        className={styles.dropItem}
                        onClick={() => { setSelectedOrder(o); setOrderDropOpen(false) }}
                      >
                        <span className="mi" style={{ fontSize: '1.1rem' }}>content_cut</span>
                        <div>
                          <div className={styles.dropName}>{o.desc}</div>
                          <div className={styles.dropMeta}>{o.due ? `Due ${o.due}` : o.status}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            Notes <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            className={styles.textarea}
            placeholder="Anything to remember about this appointment…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </div>

      </div>
    </div>
  )
}


export default function Appointments({ onMenuClick }) {
  const { customers } = useCustomers()
  const { allOrders } = useOrders()
  const {
    allAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments()

  const [activeTab,  setActiveTab]  = useState('all')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [detailAppt, setDetailAppt] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [toastMsg,   setToastMsg]   = useState('')
  const [search,     setSearch]     = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const toastTimer  = useRef(null)
  const touchStart  = useRef(null)

  useEffect(() => {
    if (!detailAppt) return
    const updated = allAppointments.find(a => a.id === detailAppt.id)
    setDetailAppt(updated ?? null)
  }, [allAppointments])

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400)
  }, [])

  const handleAdd = async (apptData) => {
    try {
      await addAppointment(apptData)
      showToast('Appointment saved')
    } catch {
      showToast('Failed to save appointment.')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'missed') return
    try {
      await updateAppointment(id, { status: newStatus })
      showToast(`Marked as ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`)
    } catch {
      showToast('Failed to update status.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDel) return
    try {
      await deleteAppointment(confirmDel.id)
      showToast('Appointment deleted')
    } catch {
      showToast('Failed to delete appointment.')
    }
    setConfirmDel(null)
    setDetailAppt(null)
  }

  const handleListTouchStart = (e) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleListTouchEnd = (e) => {
    if (!touchStart.current) return
    const touch = e.changedTouches[0]
    const dx    = touch.clientX - touchStart.current.x
    const dy    = touch.clientY - touchStart.current.y
    touchStart.current = null

    const isHorizontalSwipe = Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5
    if (!isHorizontalSwipe) return

    const tabIds   = TABS.map(t => t.id)
    const curIndex = tabIds.indexOf(activeTab)

    if (dx < 0 && curIndex < tabIds.length - 1) {
      setActiveTab(tabIds[curIndex + 1])
    } else if (dx > 0 && curIndex > 0) {
      setActiveTab(tabIds[curIndex - 1])
    }
  }

  const tabFiltered = allAppointments.filter(a => {
    if (activeTab === 'all')      return true
    if (activeTab === 'upcoming') return getEffectiveStatus(a) === 'upcoming'
    if (activeTab === 'done')     return a.status === 'done'
    if (activeTab === 'missed')   return getEffectiveStatus(a) === 'missed'
    return true
  })

  const counts = {
    all:      allAppointments.length,
    upcoming: allAppointments.filter(a => getEffectiveStatus(a) === 'upcoming').length,
    done:     allAppointments.filter(a => a.status === 'done').length,
    missed:   allAppointments.filter(a => getEffectiveStatus(a) === 'missed').length,
  }

  const searchFiltered = search.trim()
    ? tabFiltered.filter(a =>
        (a.title        || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.orderDesc    || '').toLowerCase().includes(search.toLowerCase())
      )
    : tabFiltered

  const grouped = searchFiltered.reduce((acc, a) => {
    const key = a.date
      ? new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })
      : 'No Date'
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  return (
    <div className={styles.page}>
      <Header title="Appointments" onMenuClick={onMenuClick} />

      <div className={styles.searchContainer}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <span className="mi" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
            <input
              type="text"
              placeholder="Search appointments or clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text3)', display: 'flex', cursor: 'pointer', padding: 0 }}
                onClick={() => setSearch('')}
              >
                <span className="mi" style={{ fontSize: '1rem' }}>close</span>
              </button>
            )}
          </div>
          <button
            className={`${styles.filterBtn} ${filterOpen ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterOpen(p => !p)}
          >
            <span className="mi" style={{ fontSize: '1.2rem' }}>tune</span>
          </button>
        </div>

        {filterOpen && (
          <div className={styles.filterDropdown}>
            <div className={styles.filterDropdownTitle}>Filter by Status</div>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`${styles.filterOption} ${activeTab === t.id ? styles.filterOptionActive : ''}`}
                onClick={() => { setActiveTab(t.id); setFilterOpen(false) }}
              >
                <span className="mi" style={{ fontSize: '1.1rem' }}>
                  {t.id === 'upcoming' ? 'event_available'
                    : t.id === 'done'  ? 'check_circle'
                    : t.id === 'missed'? 'event_busy'
                    : 'calendar_today'}
                </span>
                {t.label}
                {activeTab === t.id && (
                  <span className="mi" style={{ fontSize: '1rem', marginLeft: 'auto', color: 'var(--accent)' }}>check</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.tabs} onClick={() => filterOpen && setFilterOpen(false)}>
        {TABS.map(tab => (
          <div
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`${styles.tabBadge} ${tab.id === 'missed' ? styles.badgeMissed : ''}`}>
                {counts[tab.id]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        className={styles.listArea}
        onClick={() => filterOpen && setFilterOpen(false)}
        onTouchStart={handleListTouchStart}
        onTouchEnd={handleListTouchEnd}
      >
        {searchFiltered.length === 0 && (
          <div className={styles.emptyState}>
            <span className="mi" style={{ fontSize: '2.8rem', opacity: 0.2 }}>
              {activeTab === 'done'         ? 'check_circle'
                : activeTab === 'missed'   ? 'event_busy'
                : activeTab === 'upcoming' ? 'event_available'
                : 'calendar_today'}
            </span>
            <p>
              {activeTab === 'all'      && 'No appointments yet.'}
              {activeTab === 'upcoming' && 'No upcoming appointments.'}
              {activeTab === 'done'     && 'No completed appointments yet.'}
              {activeTab === 'missed'   && 'No missed appointments. Good job!'}
            </p>
            {activeTab === 'all' && (
              <span className={styles.emptyHint}>Tap + to schedule your first appointment</span>
            )}
          </div>
        )}

        {Object.entries(grouped).map(([groupKey, groupAppts]) => (
          <div key={groupKey} className={styles.apptGroup}>
            <div className={styles.apptGroupDate}>{groupKey}</div>
            <div className={styles.apptGroupDivider} />
            {groupAppts.map((appt, idx) => (
              <AppointmentRow
                key={appt.id}
                appt={appt}
                isLast={idx === groupAppts.length - 1}
                allOrders={allOrders}
                onOpen={() => setDetailAppt(appt)}
              />
            ))}
          </div>
        ))}
      </div>

      <button className={styles.fab} onClick={() => setModalOpen(true)}>
        <span className="mi">add</span>
      </button>

      <AddAppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAdd}
        customers={customers}
        allOrders={allOrders}
      />

      {detailAppt && (
        <AppointmentDetail
          appt={detailAppt}
          onClose={() => setDetailAppt(null)}
          onStatusChange={handleStatusChange}
          onDelete={(a) => { setDetailAppt(null); setConfirmDel(a) }}
        />
      )}

      <ConfirmSheet
        open={!!confirmDel}
        title="Delete Appointment?"
        message="This can't be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDel(null)}
      />

      <Toast message={toastMsg} />
      <BottomNav />
    </div>
  )
}
