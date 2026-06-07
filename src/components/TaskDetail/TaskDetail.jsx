import styles from './TaskDetail.module.css'

const PRIORITY_LABELS = { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' }
const PRIORITY_COLORS = {
  low:    { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)', text: '#94a3b8' },
  normal: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.4)',  text: '#818cf8' },
  high:   { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.4)',  text: '#fb923c' },
  urgent: { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444' },
}

function isOverdue(task) {
  if (!task.dueDate || task.done) return false
  return new Date(task.dueDate + 'T23:59:59') < new Date()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function TaskDetail({ task, onClose, onToggle, onDelete }) {
  if (!task) return null
  const overdue = isOverdue(task)
  const pc      = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.normal

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
          <div className={styles.detailHeaderTitle}>Task Details</div>
          <button className={styles.detailHeaderDelete} onClick={() => onDelete(task)}>
            <span className="mi" style={{ fontSize: '1.1rem' }}>delete_outline</span>
          </button>
        </div>

        <div className={styles.detailBody}>

          <div className={styles.detailStatusRow}>
            <button
              className={`${styles.detailStatusBtn} ${!task.done ? styles.detailStatusBtn_pending : ''}`}
              onClick={() => onToggle(task.id, true)}
            >
              Pending
            </button>
            <button
              className={`${styles.detailStatusBtn} ${task.done ? styles.detailStatusBtn_done : ''}`}
              onClick={() => onToggle(task.id, false)}
            >
              Completed
            </button>
          </div>

          <div className={styles.detailTitle}>{task.desc}</div>

          <div className={styles.detailGrid}>
            <div className={styles.detailCell}>
              <div className={styles.detailCellLabel}>Priority</div>
              <span style={{ color: pc.text, fontWeight: 700, fontSize: '0.9rem' }}>
                {PRIORITY_LABELS[task.priority] ?? 'Normal'}
              </span>
            </div>
            <div className={styles.detailCell}>
              <div className={styles.detailCellLabel}>Category</div>
              <div className={styles.detailCellVal} style={{ textTransform: 'capitalize' }}>
                {task.category || 'General'}
              </div>
            </div>
            {task.dueDate && (
              <div className={styles.detailCell}>
                <div className={styles.detailCellLabel}>Due Date</div>
                <div className={`${styles.detailCellVal} ${overdue ? styles.overdueText : ''}`}>
                  {formatDate(task.dueDate)}{task.dueTime ? ` · ${task.dueTime}` : ''}
                </div>
              </div>
            )}
            <div className={styles.detailCell}>
              <div className={styles.detailCellLabel}>Status</div>
              <div
                className={styles.detailCellVal}
                style={{ color: overdue ? '#ef4444' : task.done ? '#22c55e' : '#a16207', textTransform: 'capitalize' }}
              >
                {overdue ? 'Overdue' : task.done ? 'Completed' : 'Pending'}
              </div>
            </div>
          </div>

          {(task.customerName || task.orderDesc) && (
            <div className={styles.detailSectionCard}>
              <div className={styles.detailSectionLabel}>Linked To</div>
              {task.customerName && (
                <div className={styles.detailLinkedRow}>
                  <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>person</span>
                  <span>{task.customerName}</span>
                </div>
              )}
              {task.orderDesc && (
                <div className={styles.detailLinkedRow}>
                  <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>content_cut</span>
                  <span>{task.orderDesc}</span>
                </div>
              )}
            </div>
          )}

          {task.notes && (
            <div className={styles.detailSectionCard}>
              <div className={styles.detailSectionLabel}>Notes</div>
              <p className={styles.detailNoteText}>{task.notes}</p>
            </div>
          )}

          <button className={styles.detailDeleteBtn} onClick={() => onDelete(task)}>
            <span className="mi" style={{ fontSize: '1rem' }}>delete_outline</span>
            Delete Task
          </button>

        </div>
      </div>
    </div>
  )
}