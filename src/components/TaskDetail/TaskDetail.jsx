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


export default function TaskDetail({ task, onClose, onToggle, onDelete }) {
  if (!task) return null

  const effectiveStatus = getEffectiveStatus(task)
  const isOverdue       = effectiveStatus === 'overdue'
  const pc              = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.normal

  function handleChipClick(key) {
    if (key === 'completed' && !task.done)  onToggle(task.id, false)
    if (key === 'pending'   && task.done)   onToggle(task.id, true)
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
          <div className={styles.detailHeaderTitle}>Task Details</div>
          <button className={styles.detailHeaderDelete} onClick={() => onDelete(task)}>
            <span className="mi" style={{ fontSize: '1.1rem' }}>delete_outline</span>
          </button>
        </div>

        <div className={styles.detailBody}>

          <div className={styles.detailStatusRow}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const isActive = effectiveStatus === key
              const locked   = isChipLocked(key, task)

              return (
                <button
                  key={key}
                  disabled={locked}
                  className={[
                    styles.detailStatusBtn,
                    isActive ? styles.detailStatusBtn_active : '',
                    locked   ? styles.detailStatusBtn_locked : '',
                  ].join(' ')}
                  style={isActive ? {
                    background:  cfg.bg,
                    borderColor: cfg.border,
                    color:       cfg.color,
                  } : {}}
                  onClick={() => handleChipClick(key)}
                >
                  {cfg.label}
                </button>
              )
            })}
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
                <div className={`${styles.detailCellVal} ${isOverdue ? styles.overdueText : ''}`}>
                  {formatDate(task.dueDate)}{task.dueTime ? ` · ${task.dueTime}` : ''}
                </div>
              </div>
            )}
            <div className={styles.detailCell}>
              <div className={styles.detailCellLabel}>Status</div>
              <div
                className={styles.detailCellVal}
                style={{
                  color: effectiveStatus === 'overdue'   ? '#ef4444'
                       : effectiveStatus === 'completed' ? '#22c55e'
                       : '#a16207',
                  textTransform: 'capitalize',
                }}
              >
                {STATUS_CONFIG[effectiveStatus].label}
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