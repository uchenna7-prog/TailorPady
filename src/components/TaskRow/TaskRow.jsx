import OrderMosaic from '../OrderMosaic/OrderMosaic'
import styles from './TaskRow.module.css'

const PRIORITY_COLORS = {
  low:    { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)', text: '#94a3b8' },
  normal: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.4)',  text: '#818cf8' },
  high:   { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.4)',  text: '#fb923c' },
  urgent: { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444' },
}

const TASK_STATUS_STYLES = {
  completed: { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', border: 'rgba(34,197,94,0.3)'  },
  overdue:   { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)'  },
  pending:   { bg: 'rgba(234,179,8,0.12)',  color: '#a16207', border: 'rgba(234,179,8,0.3)'  },
}

const CATEGORY_ICONS = {
  general:  'assignment',
  sewing:   'content_cut',
  delivery: 'local_shipping',
  payment:  'payments',
  fitting:  'checkroom',
  shopping: 'shopping_cart',
}

export function isTaskOverdue(task) {
  if (!task.dueDate || task.done) return false
  return new Date(task.dueDate + 'T23:59:59') < new Date()
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
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

function timeUntil(dateStr, timeStr) {
  if (!dateStr) return null
  const now      = new Date()
  const due      = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr + 'T23:59:59')
  const diffMins = Math.round((due - now) / 60000)

  if (diffMins < 0) {
    const abs = Math.abs(diffMins)
    if (abs < 60)   return `${abs}m ago`
    if (abs < 1440) return `${Math.round(abs / 60)}h ago`
    return `${Math.round(abs / 1440)}d ago`
  }
  if (diffMins < 60)   return `In ${diffMins}m`
  if (diffMins < 1440) return `In ${Math.round(diffMins / 60)}h`
  const days = Math.round(diffMins / 1440)
  if (days === 1) return 'Tomorrow'
  return `In ${days}d`
}

export function TaskRow({ task, isLast, allOrders, onOpen }) {
  const overdue   = isTaskOverdue(task)
  const statusKey = overdue ? 'overdue' : task.done ? 'completed' : 'pending'
  const statusSty = TASK_STATUS_STYLES[statusKey]
  const catIcon   = CATEGORY_ICONS[task.category] || 'assignment'
  const pc        = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.normal
  const until     = timeUntil(task.dueDate, task.dueTime)
  const dateIsOverdue = overdue

  const linkedOrder      = task.orderId ? allOrders.find(o => String(o.id) === String(task.orderId)) : null
  const linkedOrderItems = linkedOrder?.items ?? []

  return (
    <div
      className={`${styles.taskRow} ${isLast ? styles.taskRowLast : ''} ${task.done ? styles.taskRowDone : ''}`}
      onClick={onOpen}
    >
      {linkedOrder ? (
        <OrderMosaic items={linkedOrderItems} size="md" overdue={overdue} />
      ) : (
        <div className={styles.taskRowIcon}>
          <span
            className="mi"
            style={{
              fontSize: '1.3rem',
              color: overdue ? '#ef4444' : task.done ? '#22c55e' : pc.text,
            }}
          >
            {catIcon}
          </span>
        </div>
      )}

      <div className={styles.taskRowInfo}>
        <div className={`${styles.taskRowDesc} ${task.done ? styles.taskRowDescDone : ''}`}>
          {task.desc}
        </div>
        {task.customerName && (
          <div className={styles.taskRowMeta}>
            <span className="mi" style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>person</span>
            <span className={styles.taskRowMetaText}>{task.customerName}</span>
          </div>
        )}
        {task.orderDesc && (
          <div className={styles.taskRowMeta}>
            <span className="mi" style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>content_cut</span>
            <span className={styles.taskRowMetaText}>{task.orderDesc}</span>
          </div>
        )}
        <div className={styles.taskRowMeta}>
          <span className="mi" style={{ fontSize: '0.75rem', color: dateIsOverdue ? '#ef4444' : 'var(--text3)' }}>schedule</span>
          <span className={`${styles.taskRowMetaText} ${dateIsOverdue ? styles.taskRowMetaOverdue : ''}`}>
            {formatShortDate(task.dueDate)}{task.dueTime ? ` · ${formatTime(task.dueTime)}` : ''}
          </span>
        </div>
      </div>

      <div className={styles.taskRowRight}>
        <span
          className={styles.taskRowStatus}
          style={{ background: statusSty.bg, color: statusSty.color, borderColor: statusSty.border }}
        >
          {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
        </span>
        {task.category && (
          <div className={styles.taskRowCategory}>
            <span className="mi" style={{ fontSize: '0.65rem' }}>{catIcon}</span>
            {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
          </div>
        )}
        {until && !task.done && (
          <div className={styles.taskRowUntil}>{until}</div>
        )}
      </div>
    </div>
  )
}