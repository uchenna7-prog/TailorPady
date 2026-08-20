import { useState, useRef, useEffect } from 'react'
import ConfirmSheet from '../ConfirmSheet/ConfirmSheet'
import OrderMosaic from '../OrderMosaic/OrderMosaic'
import { getInitials } from '../../utils/nameUtils'
import styles from './TaskDetail.module.css'

const PRIORITY_LABELS = { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' }

const PRIORITY_COLORS = {
  low:    { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)', text: '#94a3b8' },
  normal: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.4)',  text: '#818cf8' },
  high:   { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.4)',  text: '#fb923c' },
  urgent: { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444' },
}

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#a16207', bg: 'rgba(234,179,8,0.1)',  border: 'rgba(234,179,8,0.5)'  },
  overdue:   { label: 'Overdue',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)'  },
  completed: { label: 'Completed', color: '#15803d', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.5)'  },
}

const STATUS_ICON = {
  pending: 'schedule',
  overdue: 'event_busy',
  completed: 'check_circle',
}

function isTaskDateInPast(task) {
  if (!task.dueDate) return false
  const dt = task.dueTime
    ? new Date(`${task.dueDate}T${task.dueTime}`)
    : new Date(task.dueDate + 'T23:59:59')
  return dt < new Date()
}

function getEffectiveStatus(task) {
  if (task.done) return 'completed'
  if (isTaskDateInPast(task)) return 'overdue'
  return 'pending'
}

function isChipLocked(key, task) {
  if (key === 'overdue')  return true
  if (key === 'pending')  return isTaskDateInPast(task)
  return false
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function CustomerLinkIcon({ customer }) {
  if (!customer) {
    return <span className="mi-outlined" style={{ fontSize: '1rem', color: 'var(--text3)' }}>person</span>
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
    return <span className="mi-outlined" style={{ fontSize: '1rem', color: 'var(--text3)' }}>content_cut</span>
  }
  return <OrderMosaic items={order.items} size="sm" />
}


export default function TaskDetail({ task, customer, order, onClose, onToggle, onDelete, onGoToCustomer }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [localDone, setLocalDone] = useState(task?.done ?? false)
  const statusRef = useRef(null)

  useEffect(() => {
    setLocalDone(task?.done ?? false)
  }, [task?.id, task?.done])

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

  if (!task) return null

  const effectiveTask   = { ...task, done: localDone }
  const effectiveStatus = getEffectiveStatus(effectiveTask)
  const isOverdue        = effectiveStatus === 'overdue'
  const activeMeta       = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.pending
  const pc                = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.normal

  async function handleStatusPick(key) {
    if (isChipLocked(key, effectiveTask) || key === effectiveStatus) {
      setShowStatusMenu(false)
      return
    }
    setShowStatusMenu(false)
    if (key === 'completed' || key === 'pending') {
      const prevDone = localDone
      setLocalDone(key === 'completed')
      try {
        await onToggle(task.id, prevDone)
      } catch {
        setLocalDone(prevDone)
      }
    }
  }

  function handleDeleteConfirm() {
    setConfirmDelete(false)
    onDelete(task)
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
            <span className="mi-outlined" style={{ fontSize: '1.35rem' }}>close</span>
          </button>
          <div className={styles.detailHeaderTitle}>Task Details</div>
          <button className={styles.detailHeaderDelete} onClick={() => setConfirmDelete(true)}>
            <span className="mi-outlined" style={{ fontSize: '1.1rem' }}>delete_outline</span>
          </button>
        </div>

        <div className={styles.detailBody}>

          <div className={styles.detailTitle}>{task.desc}</div>

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
                  <span className="mi-outlined" style={{ fontSize: '0.9rem', color: activeMeta.color }}>
                    {STATUS_ICON[effectiveStatus]}
                  </span>
                  <span style={{ color: activeMeta.color }}>{activeMeta.label}</span>
                </span>
                <span
                  className="mi-outlined"
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
                    const locked = isChipLocked(key, effectiveTask)
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={locked}
                        className={`${styles.statusMenuItem} ${isActive ? styles.statusMenuItemActive : ''} ${locked ? styles.statusMenuItemLocked : ''}`}
                        onClick={() => handleStatusPick(key)}
                      >
                        <span
                          className="mi-outlined"
                          style={{ fontSize: '0.9rem', color: locked && !isActive ? 'var(--text3)' : cfg.color }}
                        >
                          {STATUS_ICON[key]}
                        </span>
                        <span style={{ color: isActive ? cfg.color : locked ? 'var(--text3)' : 'var(--text)' }}>
                          {cfg.label}
                        </span>
                        {isActive && (
                          <span className="mi-outlined" style={{ marginLeft: 'auto', fontSize: '1rem', color: cfg.color }}>check</span>
                        )}
                        {locked && !isActive && (
                          <span className="mi-outlined" style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text3)' }}>lock</span>
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
              <div className={styles.infoGridLabel}>Priority</div>
              <div className={styles.infoGridValue} style={{ color: pc.text }}>
                {PRIORITY_LABELS[task.priority] ?? 'Normal'}
              </div>
            </div>
            <div className={styles.infoGridCell}>
              <div className={styles.infoGridLabel}>Category</div>
              <div className={styles.infoGridValue} style={{ textTransform: 'capitalize' }}>
                {task.category || 'General'}
              </div>
            </div>
            {task.dueDate && (
              <div className={styles.infoGridCell}>
                <div className={styles.infoGridLabel}>Due Date</div>
                <div className={`${styles.infoGridValue} ${isOverdue ? styles.overdueText : ''}`}>
                  {formatDate(task.dueDate)}
                </div>
              </div>
            )}
            {task.dueTime && (
              <div className={styles.infoGridCell}>
                <div className={styles.infoGridLabel}>Due Time</div>
                <div className={`${styles.infoGridValue} ${isOverdue ? styles.overdueText : ''}`}>
                  {formatTime(task.dueTime)}
                </div>
              </div>
            )}
          </div>

          {task.customerName && (
            onGoToCustomer && task.customerId ? (
              <button
                type="button"
                className={styles.sectionCardBtn}
                onClick={() => { onClose(); onGoToCustomer(task.customerId) }}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.sectionCardLabel}>Customer</span>
                  <span className={`mi-outlined ${styles.chevronIcon}`} style={{ fontSize: '1.05rem', color: 'var(--text3)' }}>chevron_right</span>
                </div>
                <div className={styles.detailLinkedRow}>
                  <CustomerLinkIcon customer={customer} />
                  <span>{task.customerName}</span>
                </div>
              </button>
            ) : (
              <div className={styles.detailSectionCard}>
                <div className={styles.detailSectionLabel}>Customer</div>
                <div className={styles.detailLinkedRow}>
                  <CustomerLinkIcon customer={customer} />
                  <span>{task.customerName}</span>
                </div>
              </div>
            )
          )}

          {task.orderDesc && (
            <div className={styles.detailSectionCard}>
              <div className={styles.detailSectionLabel}>Order</div>
              <div className={styles.detailLinkedRow}>
                <OrderLinkIcon order={order} />
                <span>{task.orderDesc}</span>
              </div>
            </div>
          )}

          {task.notes && (
            <div className={styles.detailSectionCard}>
              <div className={styles.detailSectionLabel}>Notes</div>
              <p className={styles.detailNoteText}>{task.notes}</p>
            </div>
          )}

        </div>
      </div>

      <ConfirmSheet
        open={confirmDelete}
        title="Delete this task?"
        message={`"${task.desc}" will be permanently deleted. This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
