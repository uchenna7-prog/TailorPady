import { useState, useRef, useCallback } from 'react'
import { useTasks }     from '../../contexts/TaskContext'
import { useCustomers } from '../../contexts/CustomerContext'
import { useOrders }    from '../../contexts/OrdersContext'
import Header       from '../../components/Header/Header'
import ConfirmSheet from '../../components/ConfirmSheet/ConfirmSheet'
import Toast        from '../../components/Toast/Toast'
import BottomNav    from '../../components/BottomNav/BottomNav'
import TaskDetail   from '../../components/TaskDetail/TaskDetail'
import { TaskRow, isTaskOverdue } from '../../components/TaskRow/TaskRow'
import styles from './Tasks.module.css'


const PRIORITY_LABELS = { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' }
const PRIORITY_COLORS = {
  low:    { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)', text: '#94a3b8' },
  normal: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.4)',  text: '#818cf8' },
  high:   { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.4)',  text: '#fb923c' },
  urgent: { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444' },
}

const CATEGORY_ICONS = {
  general: 'assignment', sewing: 'content_cut', delivery: 'local_shipping',
  payment: 'payments',   fitting: 'checkroom',  shopping: 'shopping_cart',
}

const CATEGORIES = [
  { id: 'general',  label: 'General',  icon: 'assignment'    },
  { id: 'sewing',   label: 'Sewing',   icon: 'content_cut'   },
  { id: 'delivery', label: 'Delivery', icon: 'local_shipping' },
  { id: 'payment',  label: 'Payment',  icon: 'payments'      },
  { id: 'fitting',  label: 'Fitting',  icon: 'checkroom'     },
  { id: 'shopping', label: 'Shopping', icon: 'shopping_cart' },
]

const TABS = [
  { id: 'all',     label: 'All'       },
  { id: 'pending', label: 'Pending'   },
  { id: 'done',    label: 'Completed' },
  { id: 'overdue', label: 'Overdue'   },
]

const SWIPE_THRESHOLD    = 50
const SWIPE_MAX_VERTICAL = 80

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}


function AddTaskModal({ isOpen, onClose, onSave, customers, allOrders }) {
  const [desc,          setDesc]         = useState('')
  const [notes,         setNotes]        = useState('')
  const [priority,      setPriority]     = useState('normal')
  const [dueDate,       setDueDate]      = useState('')
  const [dueTime,       setDueTime]      = useState('')
  const [reminder,      setReminder]     = useState(false)
  const [custQuery,     setCustQuery]    = useState('')
  const [selectedCust,  setSelectedCust] = useState(null)
  const [custDropOpen,  setCustDropOpen] = useState(false)
  const [selectedOrder, setSelectedOrder]= useState(null)
  const [orderDropOpen, setOrderDropOpen]= useState(false)
  const [category,      setCategory]     = useState('general')
  const [errors,        setErrors]       = useState({})

  const custSearchRef = useRef(null)

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
    setDesc(''); setNotes(''); setPriority('normal'); setDueDate(''); setDueTime('')
    setReminder(false); setCustQuery(''); setSelectedCust(null); setCustDropOpen(false)
    setSelectedOrder(null); setOrderDropOpen(false); setCategory('general'); setErrors({})
  }

  const handleClose = () => { reset(); onClose() }

  const validate = () => {
    const newErrors = {}
    if (!desc.trim()) newErrors.desc    = 'Task description is required'
    if (!dueDate)     newErrors.dueDate = 'Due date is required'
    if (!dueTime)     newErrors.dueTime = 'Due time is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      desc:         desc.trim(),
      notes:        notes.trim(),
      priority,
      dueDate,
      dueTime,
      reminder,
      category,
      customerId:   selectedCust  ? String(selectedCust.id)  : null,
      customerName: selectedCust  ? selectedCust.name        : null,
      orderId:      selectedOrder ? String(selectedOrder.id) : null,
      orderDesc:    selectedOrder ? selectedOrder.desc       : null,
      done:         false,
    })
    reset()
    onClose()
  }

  const clearError = (field) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className={`${styles.modalOverlay} ${isOpen ? styles.modalOpen : ''}`}>
      <Header
        type="back"
        title="New Task"
        onBackClick={handleClose}
        customActions={[{ label: 'Add', onClick: handleSave, color: 'var(--accent)' }]}
      />

      <div className={styles.modalBody}>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>What needs to be done? *</label>
          <textarea
            className={`${styles.textarea} ${errors.desc ? styles.inputError : ''}`}
            placeholder="e.g. Finish sewing the Senator suit for Uchendu"
            value={desc}
            onChange={e => { setDesc(e.target.value); clearError('desc') }}
            rows={2}
          />
          {errors.desc && <span className={styles.errorMsg}>{errors.desc}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Category</label>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`${styles.categoryChip} ${category === cat.id ? styles.categoryActive : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                <span className="mi" style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Priority</label>
          <div className={styles.priorityRow}>
            {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`${styles.priorityChip} ${priority === key ? styles.priorityActive : ''}`}
                style={priority === key ? {
                  background:  PRIORITY_COLORS[key].bg,
                  borderColor: PRIORITY_COLORS[key].border,
                  color:       PRIORITY_COLORS[key].text,
                } : {}}
                onClick={() => setPriority(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup} style={{ flex: 1 }}>
            <label className={styles.fieldLabel}>Due Date *</label>
            <input
              type="date"
              className={`${styles.input} ${errors.dueDate ? styles.inputError : ''}`}
              value={dueDate}
              onChange={e => { setDueDate(e.target.value); clearError('dueDate') }}
            />
            {errors.dueDate && <span className={styles.errorMsg}>{errors.dueDate}</span>}
          </div>
          <div className={styles.fieldGroup} style={{ flex: 1 }}>
            <label className={styles.fieldLabel}>Due Time *</label>
            <input
              type="time"
              className={`${styles.input} ${errors.dueTime ? styles.inputError : ''}`}
              value={dueTime}
              onChange={e => { setDueTime(e.target.value); clearError('dueTime') }}
            />
            {errors.dueTime && <span className={styles.errorMsg}>{errors.dueTime}</span>}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Reminder</div>
              <div className={styles.toggleSub}>Get notified when due</div>
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
          <label className={styles.fieldLabel}>
            Related Client <span className={styles.optional}>(optional)</span>
          </label>
          {selectedCust ? (
            <div className={styles.selectedChip}>
              <div className={styles.chipAvatar}>{getInitials(selectedCust.name)}</div>
              <span className={styles.chipName}>{selectedCust.name}</span>
              <button
                className={styles.chipRemove}
                onClick={() => { setSelectedCust(null); setSelectedOrder(null) }}
              >
                <span className="mi" style={{ fontSize: '1rem' }}>close</span>
              </button>
            </div>
          ) : (
            <div className={styles.searchWrap} ref={custSearchRef}>
              <span className="mi" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search client name or phone…"
                value={custQuery}
                onChange={e => { setCustQuery(e.target.value); setCustDropOpen(true) }}
                onFocus={() => setCustDropOpen(true)}
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
        </div>

        {selectedCust && (
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Related Order <span className={styles.optional}>(optional)</span>
            </label>
            {selectedOrder ? (
              <div className={styles.selectedChip}>
                <span className={styles.chipName}>
                  <span className="mi" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>content_cut</span>
                  {selectedOrder.desc}
                </span>
                <button className={styles.chipRemove} onClick={() => setSelectedOrder(null)}>
                  <span className="mi" style={{ fontSize: '1rem' }}>close</span>
                </button>
              </div>
            ) : (
              <div className={styles.orderDropWrap}>
                <button className={styles.orderDropBtn} onClick={() => setOrderDropOpen(p => !p)}>
                  <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--text3)' }}>assignment</span>
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
            placeholder="Any extra details…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </div>

      </div>
    </div>
  )
}


export default function Tasks({ onMenuClick }) {
  const { customers }                              = useCustomers()
  const { tasks, addTask, toggleTask, deleteTask } = useTasks()
  const { allOrders }                              = useOrders()

  const [activeTab,  setActiveTab]  = useState('all')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [detailTask, setDetailTask] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [toastMsg,   setToastMsg]   = useState('')
  const [search,     setSearch]     = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const toastTimer = useRef(null)
  const tabsRef    = useRef(null)
  const swipeRef   = useRef({ startX: 0, startY: 0, tracking: false })

  const activeIndex = TABS.findIndex(t => t.id === activeTab)

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400)
  }, [])

  function goToTab(index) {
    if (index < 0 || index >= TABS.length) return
    const tab = TABS[index]
    setActiveTab(tab.id)
    scrollTabIntoView(tab.id)
  }

  function scrollTabIntoView(tabId) {
    const bar = tabsRef.current
    if (!bar) return
    const chip = bar.querySelector(`[data-tab="${tabId}"]`)
    if (!chip) return
    const barRect  = bar.getBoundingClientRect()
    const chipRect = chip.getBoundingClientRect()
    const offset   = chipRect.left - barRect.left - barRect.width / 2 + chipRect.width / 2
    bar.scrollBy({ left: offset, behavior: 'smooth' })
  }

  function handleTouchStart(e) {
    const touch = e.touches[0]
    swipeRef.current = { startX: touch.clientX, startY: touch.clientY, tracking: true }
  }

  function handleTouchEnd(e) {
    if (!swipeRef.current.tracking) return
    const touch  = e.changedTouches[0]
    const deltaX = touch.clientX - swipeRef.current.startX
    const deltaY = touch.clientY - swipeRef.current.startY
    swipeRef.current.tracking = false

    if (Math.abs(deltaY) > SWIPE_MAX_VERTICAL) return
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return

    if (deltaX < 0) {
      goToTab(activeIndex + 1)
    } else {
      goToTab(activeIndex - 1)
    }
  }

  const handleAdd = async (taskData) => {
    try {
      await addTask(taskData)
      showToast('Task added')
    } catch {
      showToast('Failed to add task.')
    }
  }

  const handleToggle = async (id, currentDone) => {
    try {
      await toggleTask(id, currentDone)
      setDetailTask(prev =>
        prev && String(prev.id) === String(id) ? { ...prev, done: !currentDone } : prev
      )
    } catch {
      showToast('Failed to update task.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDel) return
    try {
      await deleteTask(confirmDel.id)
      showToast('Task deleted')
    } catch {
      showToast('Failed to delete task.')
    }
    setConfirmDel(null)
    setDetailTask(null)
  }

  const tabFiltered = tasks.filter(t => {
    if (activeTab === 'all')     return true
    if (activeTab === 'pending') return !t.done && !isTaskOverdue(t)
    if (activeTab === 'done')    return t.done
    if (activeTab === 'overdue') return isTaskOverdue(t)
    return true
  })

  const counts = {
    all:     tasks.length,
    pending: tasks.filter(t => !t.done && !isTaskOverdue(t)).length,
    done:    tasks.filter(t => t.done).length,
    overdue: tasks.filter(t => isTaskOverdue(t)).length,
  }

  const searchFiltered = search.trim()
    ? tabFiltered.filter(t =>
        (t.desc         || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.orderDesc    || '').toLowerCase().includes(search.toLowerCase())
      )
    : tabFiltered

  const grouped = searchFiltered.reduce((acc, t) => {
    const key = t.dueDate ? formatDate(t.dueDate) : 'No Due Date'
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} />

      <div className={styles.searchContainer}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <span className="mi" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
            <input
              type="text"
              placeholder="Search tasks or clients…"
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
                  {t.id === 'done'    ? 'check_circle'
                    : t.id === 'overdue' ? 'alarm_on'
                    : t.id === 'pending' ? 'pending'
                    : 'assignment'}
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

      <div className={styles.tabs} ref={tabsRef} onClick={() => filterOpen && setFilterOpen(false)}>
        {TABS.map(tab => (
          <div
            key={tab.id}
            data-tab={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab(tab.id); scrollTabIntoView(tab.id) }}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`${styles.tabBadge} ${tab.id === 'overdue' ? styles.badgeOverdue : ''}`}>
                {counts[tab.id]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        className={styles.listArea}
        onClick={() => filterOpen && setFilterOpen(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {searchFiltered.length === 0 && (
          <div className={styles.emptyState}>
            <span className="mi" style={{ fontSize: '2.8rem', opacity: 0.2 }}>
              {activeTab === 'done'    ? 'check_circle'
                : activeTab === 'overdue' ? 'alarm_on'
                : 'assignment'}
            </span>
            <p>
              {activeTab === 'all'     && 'No tasks yet.'}
              {activeTab === 'pending' && 'No pending tasks.'}
              {activeTab === 'done'    && 'No completed tasks yet.'}
              {activeTab === 'overdue' && "No overdue tasks. You're on track!"}
            </p>
            {activeTab === 'all' && (
              <span className={styles.emptyHint}>Tap + to add your first task</span>
            )}
          </div>
        )}

        {Object.entries(grouped).map(([groupKey, groupTasks]) => (
          <div key={groupKey} className={styles.taskGroup}>
            <div className={styles.taskGroupDate}>{groupKey}</div>
            <div className={styles.taskGroupDivider} />
            {groupTasks.map((task, idx) => (
              <TaskRow
                key={task.id}
                task={task}
                isLast={idx === groupTasks.length - 1}
                allOrders={allOrders}
                onToggle={handleToggle}
                onOpen={() => setDetailTask(task)}
              />
            ))}
          </div>
        ))}
      </div>

      <button className={styles.fab} onClick={() => setModalOpen(true)}>
        <span className="mi">add</span>
      </button>

      <AddTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAdd}
        customers={customers}
        allOrders={allOrders}
      />

      {detailTask && (
        <TaskDetail
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onToggle={handleToggle}
          onDelete={(t) => { setDetailTask(null); setConfirmDel(t) }}
        />
      )}

      <ConfirmSheet
        open={!!confirmDel}
        title="Delete Task?"
        message="This can't be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDel(null)}
      />

      <Toast message={toastMsg} />
      <BottomNav />
    </div>
  )
}