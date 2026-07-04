import { useState } from 'react'
import ConfirmSheet from '../ConfirmSheet/ConfirmSheet'
import styles from './TaskDetail.module.css'

const PRIORITY_LABELS = { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' }

const PRIORITY_COLORS = {
  low:    { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)', text: '#94a3b8' },
  normal: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.4)',  text: '#818cf8' },
  high:   { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.4)',  text: '#fb923c' },
  urgent: { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444' },
}

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#a16207' },
  overdue:   { label: 'Overdue',   color: '#ef4444' },
  completed: { label: 'Completed', color: '#15803d' },
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

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}


export default function TaskDetail({ task, onClose, onToggle, onDelete, onGoToCustomer }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!task) return null

  const effectiveStatus = getEffectiveStatus(task)
  const isOverdue        = effectiveStatus === 'overdue'
  const statusMeta       = STATUS_CONFIG[effectiveStatus]
  const pc                = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.normal

  function handleToggleComplete() {
    onToggle(task.id, !task.done)
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
            <span className="mi" style={{ fontSize: '1.35rem' }}>close</span>
          </button>
          <div className={styles.detailHeaderTitle}>Task Details</div>
          <button className={styles.detailHeaderDelete} onClick={() => setConfirmDelete(true)}>
            <span className="mi" style={{ fontSize: '1.1rem' }}>delete_outline</span>
          </button>
        </div>

        <div className={styles.detailBody}>

          <div className={styles.detailTitle}>{task.desc}</div>

          <div className={styles.infoGrid}>
            <div className={styles.infoGridCell}>
              <div className={styles.infoGridLabel}>Priority</div>
              <div className={styles.infoGridValue} style={{ color: pc.text }}>
                {PRIORITY_LABELS[task.priority] ?? 'Normal'}
              </div>
            </div>
            <div className={styles.infoGridCell}>
              <div className={styles.infoGridLabel}>Status</div>
              <div className={styles.infoGridValue} style={{ color: statusMeta.color }}>
                {statusMeta.label}
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
                  {formatDate(task.dueDate)}{task.dueTime ? ` · ${task.dueTime}` : ''}
                </div>
              </div>
            )}
          </div>

          {(task.customerName || task.orderDesc) && (
            onGoToCustomer && task.customerId ? (
              <button
                type="button"
                className={styles.sectionCardBtn}
                onClick={() => { onClose(); onGoToCustomer(task.customerId) }}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.sectionCardLabel}>Linked To</span>
                  <span className={`mi ${styles.chevronIcon}`} style={{ fontSize: '1.05rem', color: 'var(--text3)' }}>chevron_right</span>
                </div>
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
              </button>
            ) : (
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
            )
          )}

          {task.notes && (
            <div className={styles.detailSectionCard}>
              <div className={styles.detailSectionLabel}>Notes</div>
              <p className={styles.detailNoteText}>{task.notes}</p>
            </div>
          )}

          <div className={styles.footerButtons}>
            <button
              className={task.done ? styles.btnRestore : styles.btnPrimary}
              onClick={handleToggleComplete}
            >
              <span className="mi" style={{ fontSize: '1.05rem' }}>
                {task.done ? 'undo' : 'check_circle'}
              </span>
              {task.done ? 'Mark as pending' : 'Mark as complete'}
            </button>
          </div>

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