import OrderMosaic from '../OrderMosaic/OrderMosaic'
import styles from './OrderRow.module.css'

const STATUS_COLORS = {
  pending:       { color: '#a16207', bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.3)'   },
  'in-progress': { color: '#2563eb', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
  completed:     { color: '#15803d', bg: 'rgba(21,128,61,0.12)',   border: 'rgba(21,128,61,0.3)'   },
  delivered:     { color: '#4f46e5', bg: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.3)' },
  cancelled:     { color: '#dc2626', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
}

const STAGES = [
  { value: 'measurement_taken', label: 'Measurement Taken', icon: 'straighten'    },
  { value: 'fabric_ready',      label: 'Fabric Ready',      icon: 'checkroom'     },
  { value: 'cutting',           label: 'Cutting',           icon: 'content_cut'   },
  { value: 'weaving',           label: 'Weaving',           icon: 'texture'       },
  { value: 'sewing',            label: 'Sewing',            icon: 'construction'  },
  { value: 'embroidery',        label: 'Embroidery',        icon: 'auto_awesome'  },
  { value: 'fitting',           label: 'Fitting',           icon: 'accessibility' },
  { value: 'adjustments',       label: 'Adjustments',       icon: 'tune'          },
  { value: 'finishing',         label: 'Finishing',         icon: 'dry_cleaning'  },
  { value: 'quality_check',     label: 'Quality Check',     icon: 'fact_check'    },
  { value: 'ready',             label: 'Ready',             icon: 'check_circle'  },
]

export function isOrderOverdue(order) {
  const raw = order.dueRaw || order.dueDate
  if (!raw) return false
  if (['completed', 'delivered', 'cancelled'].includes(order.status)) return false
  return new Date(raw + 'T23:59:59') < new Date()
}

function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function OrderRow({ order, isLast, onTap }) {
  
  const overdue     = isOrderOverdue(order)
  const dueDateRaw  = order.dueRaw || order.dueDate
  const stageObj    = STAGES.find(s => s.value === order.stage)
  const sc          = overdue
    ? { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' }
    : STATUS_COLORS[order.status] ?? STATUS_COLORS.pending
  const statusLabel = overdue
    ? 'Overdue'
    : order.status
      ? order.status === 'in-progress' ? 'In Progress' : order.status.charAt(0).toUpperCase() + order.status.slice(1)
      : 'Pending'
  const priceStr    = order.price != null ? `₦${Number(order.price).toLocaleString()}` : '—'
  const totalQty    = (order.items || []).reduce((s, i) => s + (parseInt(i.qty, 10) || 0), 0) || order.qty || 0

  return (
    <div
      className={`${styles.orderRow} ${isLast ? styles.orderRowLast : ''} ${overdue ? styles.orderRowOverdue : ''}`}
      onClick={onTap}
    >
      <OrderMosaic items={order.items || []} overdue={overdue} />

      <div className={styles.orderRowInfo}>
        <div className={styles.orderRowDesc}>{order.desc || order.name || 'Order'}</div>
        <div className={styles.orderRowMeta}>
          <span className="mi" style={{ fontSize: '0.78rem', color: 'var(--text3)', verticalAlign: 'middle' }}>person</span>
          <span className={styles.orderRowMetaText}>{order.customerName || '—'}</span>
        </div>
        {stageObj && (
          <div className={styles.orderRowStageLine}>
            <span className="mi" style={{ fontSize: '0.78rem' }}>{stageObj.icon}</span>
            {stageObj.label}
          </div>
        )}
      </div>

      <div className={styles.orderRowRight}>
        <div className={styles.orderRowPrice}>{priceStr}</div>
        {totalQty > 1 && <div className={styles.orderRowQty}>{totalQty} items</div>}
        <span
          className={styles.orderRowStatusBadge}
          style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}
        >
          {statusLabel}
        </span>
        {dueDateRaw && (
          <div className={styles.orderRowDueRight}>
            Due {formatDateShort(dueDateRaw)}
          </div>
        )}
      </div>
    </div>
  )
}