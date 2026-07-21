import { useState, useRef, useEffect } from 'react'
import { getEffectiveStatus, parseApptDate } from '../../contexts/AppointmentContext'
import ConfirmSheet from '../ConfirmSheet/ConfirmSheet'
import OrderMosaic from '../OrderMosaic/OrderMosaic'
import { getInitials } from '../../utils/nameUtils'
import styles from './AppointmentDetail.module.css'


const APPT_TYPES = [
  { id: 'fitting',      label: 'Fitting',      icon: 'checkroom'      },
  { id: 'consultation', label: 'Consultation', icon: 'forum'          },
  { id: 'pickup',       label: 'Pick-up',      icon: 'inventory_2'    },
  { id: 'measurement',  label: 'Measurement',  icon: 'straighten'     },
  { id: 'delivery',     label: 'Delivery',     icon: 'local_shipping' },
  { id: 'other',        label: 'Other',        icon: 'calendar_today' },
]

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.4)'  },
  done:      { label: 'Done',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.4)'   },
  missed:    { label: 'Missed',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)'   },
  cancelled: { label: 'Cancelled', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)' },
}

const STATUS_ICON = {
  upcoming: 'schedule',
  done: 'check_circle',
  missed: 'event_busy',
  cancelled: 'cancel',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m]  = timeStr.split(':')
  const hour    = parseInt(h, 10)
  const ampm    = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${m} ${ampm}`
}

function isDateInPast(appt) {
  const date = parseApptDate(appt)
  return date ? date < new Date() : false
}

function isChipLocked(key, appt) {
  if (key === 'missed')   return true
  if (key === 'upcoming') return isDateInPast(appt)
  return false
}

function CustomerLinkIcon({ customer }) {
  if (!customer) {
    return <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>person</span>
  }
  return (
    <div className={styles.linkedAvatar}>
      {customer.photo
        ? <img src={customer.photo} alt="" className={styles.linkedAvatarImg} />
        : <span className={styles.linkedAvatarInitials}>{getInitials(customer.name)}</span>}
    </div>
  )
}

function OrderLinkIcon({ order }) {
  if (!order) {
    return <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>content_cut</span>
  }
  return <OrderMosaic items={order.items} size="sm" />
}


export function AppointmentDetail({ appt, customer, order, onClose, onStatusChange, onDelete, onGoToCustomer }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const statusRef = useRef(null)

  useEffect(() => {
    if (!showStatusMenu) return
    function handleClickOutside(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setShowStatusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showStatusMenu])

  if (!appt) return null

  const effectiveStatus = getEffectiveStatus(appt)
  const isMissed        = effectiveStatus === 'missed'
  const activeMeta      = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.upcoming

  function handleStatusPick(key) {
    if (isChipLocked(key, appt) || key === effectiveStatus) {
      setShowStatusMenu(false)
      return
    }
    onStatusChange(appt.id, key)
    setShowStatusMenu(false)
  }

  function handleDeleteConfirm() {
    setConfirmDelete(false)
    onDelete(appt)
  }

  return (
    <div
      className={styles.detailOverlay}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.detailPanel}>
        <div className={styles.detailHandle} />

        <div className={styles.detailHeader}>
          <button className={styles.detailCloseBtn} onClick={onClose}>
            <span className="mi" style={{ fontSize: '1.35rem' }}>close</span>
          </button>
          <div className={styles.detailHeaderTitle}>Appointment</div>
          <button className={styles.detailHeaderDelete} onClick={() => setConfirmDelete(true)}>
            <span className="mi" style={{ fontSize: '1.1rem' }}>delete_outline</span>
          </button>
        </div>

        <div className={styles.detailBody}>

          <div className={styles.detailTitle}>{appt.title}</div>

          <div className={styles.statusRow}>
            <div className={styles.chipLabel}>Status</div>
            <div className={styles.statusDropdown} ref={statusRef}>
              <button
                type="button"
                className={styles.statusTrigger}
                onClick={() => setShowStatusMenu(v => !v)}
                style={{ background: activeMeta.bg, borderColor: activeMeta.border }}
              >
                <span className={styles.statusTriggerLeft}>
                  <span className="mi" style={{ fontSize: '0.9rem', color: activeMeta.color }}>
                    {STATUS_ICON[effectiveStatus]}
                  </span>
                  <span style={{ color: activeMeta.color }}>{activeMeta.label}</span>
                </span>
                <span
                  className="mi"
                  style={{
                    fontSize: '1.1rem',
                    color: activeMeta.color,
                    opacity: 0.7,
                    transform: showStatusMenu ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s',
                  }}
                >
                  expand_more
                </span>
              </button>

              {showStatusMenu && (
                <div className={styles.statusMenu}>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const isActive = effectiveStatus === key
                    const locked = isChipLocked(key, appt)
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={locked}
                        className={`${styles.statusMenuItem} ${isActive ? styles.statusMenuItemActive : ''} ${locked ? styles.statusMenuItemLocked : ''}`}
                        onClick={() => handleStatusPick(key)}
                      >
                        <span
                          className="mi"
                          style={{ fontSize: '0.9rem', color: locked && !isActive ? 'var(--text3)' : cfg.color }}
                        >
                          {STATUS_ICON[key]}
                        </span>
                        <span style={{ color: isActive ? cfg.color : locked ? 'var(--text3)' : 'var(--text)' }}>
                          {cfg.label}
                        </span>
                        {isActive && (
                          <span className="mi" style={{ marginLeft: 'auto', fontSize: '1rem', color: cfg.color }}>check</span>
                        )}
                        {locked && !isActive && (
                          <span className="mi" style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text3)' }}>lock</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoGridCell}>
              <div className={styles.infoGridLabel}>Type</div>
              <div className={styles.infoGridValue} style={{ textTransform: 'capitalize' }}>
                {APPT_TYPES.find(t => t.id === appt.type)?.label || appt.type}
              </div>
            </div>
            <div className={styles.infoGridCell}>
              <div className={styles.infoGridLabel}>Date</div>
              <div className={`${styles.infoGridValue} ${isMissed ? styles.overdueText : ''}`}>
                {formatDate(appt.date)}
              </div>
            </div>
            {appt.time && (
              <div className={styles.infoGridCell}>
                <div className={styles.infoGridLabel}>Time</div>
                <div className={styles.infoGridValue}>{formatTime(appt.time)}</div>
              </div>
            )}
            {appt.location && (
              <div className={styles.infoGridCell}>
                <div className={styles.infoGridLabel}>Location</div>
                <div className={styles.infoGridValue}>{appt.location}</div>
              </div>
            )}
          </div>

          {appt.customerName && (
            onGoToCustomer && appt.customerId ? (
              <button
                type="button"
                className={styles.sectionCardBtn}
                onClick={() => { onClose(); onGoToCustomer(appt.customerId) }}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.sectionCardLabel}>Customer</span>
                  <span className={`mi ${styles.chevronIcon}`} style={{ fontSize: '1.05rem', color: 'var(--text3)' }}>chevron_right</span>
                </div>
                <div className={styles.detailLinkedRow}>
                  <CustomerLinkIcon customer={customer} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{appt.customerName}</div>
                    {appt.customerPhone && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{appt.customerPhone}</div>
                    )}
                  </div>
                </div>
              </button>
            ) : (
              <div className={styles.detailSectionCard}>
                <div className={styles.detailSectionLabel}>Customer</div>
                <div className={styles.detailLinkedRow}>
                  <CustomerLinkIcon customer={customer} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{appt.customerName}</div>
                    {appt.customerPhone && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{appt.customerPhone}</div>
                    )}
                  </div>
                  {appt.customerPhone && (
                    <a
                      href={`tel:${appt.customerPhone}`}
                      className={styles.callBtn}
                      onClick={e => e.stopPropagation()}
                    >
                      <span className="mi" style={{ fontSize: '1rem' }}>call</span>
                    </a>
                  )}
                </div>
              </div>
            )
          )}

          {appt.orderDesc && (
            <div className={styles.detailSectionCard}>
              <div className={styles.detailSectionLabel}>Order</div>
              <div className={styles.detailLinkedRow}>
                <OrderLinkIcon order={order} />
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{appt.orderDesc}</span>
              </div>
            </div>
          )}

          {appt.notes && (
            <div className={styles.detailSectionCard}>
              <div className={styles.detailSectionLabel}>Notes</div>
              <p className={styles.detailNoteText}>{appt.notes}</p>
            </div>
          )}

        </div>
      </div>

      <ConfirmSheet
        open={confirmDelete}
        title="Delete this appointment?"
        message={`"${appt.title}" will be permanently deleted. This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}