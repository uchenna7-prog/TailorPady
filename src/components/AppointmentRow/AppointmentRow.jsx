import OrderMosaic from '../OrderMosaic/OrderMosaic'
import styles from './AppointmentRow.module.css'


const TYPE_ICONS = {
  fitting:      'checkroom',
  consultation: 'forum',
  pickup:       'inventory_2',
  measurement:  'straighten',
  delivery:     'local_shipping',
  other:        'calendar_today',
}

export const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.4)'  },
  done:      { label: 'Done',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.4)'   },
  missed:    { label: 'Missed',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)'   },
  cancelled: { label: 'Cancelled', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)' },
}

export function isApptOverdue(appt) {
  if (!appt.date || appt.status === 'done' || appt.status === 'cancelled') return false
  const apptDateTime = appt.time
    ? new Date(`${appt.date}T${appt.time}`)
    : new Date(appt.date + 'T23:59:59')
  return apptDateTime < new Date()
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour   = parseInt(h, 10)
  const ampm   = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${m} ${ampm}`
}

function timeUntil(dateStr, timeStr) {
  if (!dateStr) return null
  const now      = new Date()
  const appt     = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr + 'T00:00:00')
  const diffMins = Math.round((appt - now) / 60000)

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


export function AppointmentRow({ appt, isLast, allOrders, onOpen }) {
  const overdue     = isApptOverdue(appt) && appt.status === 'upcoming'
  const icon        = TYPE_ICONS[appt.type] || 'calendar_today'
  const until       = timeUntil(appt.date, appt.time)
  const effectiveSc = STATUS_CONFIG[overdue ? 'missed' : appt.status] ?? STATUS_CONFIG.upcoming
  const dateIsOverdue = overdue || appt.status === 'missed'

  const linkedOrder      = appt.orderId ? allOrders.find(o => String(o.id) === String(appt.orderId)) : null
  const linkedOrderItems = linkedOrder?.items ?? []

  return (
    <div
      className={`${styles.apptRow} ${isLast ? styles.apptRow_last : ''}`}
      onClick={onOpen}
    >
      {linkedOrder ? (
        <OrderMosaic items={linkedOrderItems} size="md" overdue={overdue} />
      ) : (
        <div className={styles.apptRowIcon}>
          <span className="mi" style={{ fontSize: '1.3rem', color: effectiveSc.color }}>{icon}</span>
        </div>
      )}

      <div className={styles.apptRowInfo}>
        <div className={styles.apptRowTitle}>{appt.title}</div>
        {appt.customerName && (
          <div className={styles.apptRowMeta}>
            <span className="mi" style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>person</span>
            <span className={styles.apptRowMetaText}>{appt.customerName}</span>
          </div>
        )}
        <div className={styles.apptRowMeta}>
          <span className="mi" style={{ fontSize: '0.75rem', color: dateIsOverdue ? '#ef4444' : 'var(--text3)' }}>schedule</span>
          <span className={`${styles.apptRowMetaText} ${dateIsOverdue ? styles.apptRowMetaOverdue : ''}`}>
            {formatShortDate(appt.date)}{appt.time ? ` · ${formatTime(appt.time)}` : ''}
          </span>
        </div>
      </div>

      <div className={styles.apptRowRight}>
        <span
          className={styles.apptRowStatus}
          style={{ background: effectiveSc.bg, color: effectiveSc.color, borderColor: effectiveSc.border }}
        >
          {overdue ? 'Missed' : effectiveSc.label}
        </span>
        {appt.location && (
          <div className={styles.apptRowLocation}>
            <span className="mi" style={{ fontSize: '0.65rem' }}>place</span>
            {appt.location}
          </div>
        )}
        {until && appt.status === 'upcoming' && (
          <div className={styles.apptRowUntil}>{until}</div>
        )}
      </div>
    </div>
  )
}