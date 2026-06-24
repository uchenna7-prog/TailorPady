import { getEffectiveStatus } from '../../contexts/AppointmentContext'
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

function isChipLocked(key, effectiveStatus) {
  if (key === 'missed')   return true
  if (key === 'upcoming') return effectiveStatus === 'missed'
  return false
}


export function AppointmentDetail({ appt, onClose, onStatusChange, onDelete }) {
  if (!appt) return null

  const effectiveStatus = getEffectiveStatus(appt)
  const isMissed        = effectiveStatus === 'missed'

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
          <button className={styles.detailHeaderDelete} onClick={() => onDelete(appt)}>
            <span className="mi" style={{ fontSize: '1.1rem' }}>delete_outline</span>
          </button>
        </div>

        <div className={styles.detailBody}>

          <div className={styles.detailStatusRow}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const isActive  = effectiveStatus === key
              const locked    = isChipLocked(key, effectiveStatus)

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
                  onClick={locked ? undefined : () => onStatusChange(appt.id, key)}
                >
                  {cfg.label}
                </button>
              )
            })}
          </div>

          {isMissed && (
            <button
              className={styles.markDoneBtn}
              onClick={() => onStatusChange(appt.id, 'done')}
            >
              <span className="mi" style={{ fontSize: '1rem' }}>check_circle</span>
              Mark as Done
            </button>
          )}

          <div className={styles.detailTitle}>{appt.title}</div>

          <div className={styles.detailGrid}>
            <div className={styles.detailCell}>
              <div className={styles.detailCellLabel}>Type</div>
              <div className={styles.detailCellVal} style={{ textTransform: 'capitalize' }}>
                {APPT_TYPES.find(t => t.id === appt.type)?.label || appt.type}
              </div>
            </div>
            <div className={styles.detailCell}>
              <div className={styles.detailCellLabel}>Date</div>
              <div className={`${styles.detailCellVal} ${isMissed ? styles.overdueText : ''}`}>
                {formatDate(appt.date)}
              </div>
            </div>
            {appt.time && (
              <div className={styles.detailCell}>
                <div className={styles.detailCellLabel}>Time</div>
                <div className={styles.detailCellVal}>{formatTime(appt.time)}</div>
              </div>
            )}
            {appt.location && (
              <div className={styles.detailCell}>
                <div className={styles.detailCellLabel}>Location</div>
                <div className={styles.detailCellVal}>{appt.location}</div>
              </div>
            )}
          </div>

          {(appt.customerName || appt.orderDesc) && (
            <div className={styles.detailSectionCard}>
              <div className={styles.detailSectionLabel}>Linked To</div>
              {appt.customerName && (
                <div className={styles.detailLinkedRow}>
                  <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>person</span>
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
              )}
              {appt.orderDesc && (
                <div className={styles.detailLinkedRow}>
                  <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>content_cut</span>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{appt.orderDesc}</span>
                </div>
              )}
            </div>
          )}

          {appt.notes && (
            <div className={styles.detailSectionCard}>
              <div className={styles.detailSectionLabel}>Notes</div>
              <p className={styles.detailNoteText}>{appt.notes}</p>
            </div>
          )}

          <button className={styles.detailDeleteBtn} onClick={() => onDelete(appt)}>
            <span className="mi" style={{ fontSize: '1rem' }}>delete_outline</span>
            Delete Appointment
          </button>

        </div>
      </div>
    </div>
  )
}
