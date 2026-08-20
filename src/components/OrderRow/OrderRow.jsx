import OrderMosaic from '../OrderMosaic/OrderMosaic'
import styles from './OrderRow.module.css'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, ORDER_STAGES } from '../../datas/orderDatas'

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
  const overdue = isOrderOverdue(order)
  const dueDateRaw = order.dueRaw || order.dueDate
  const stageObj = ORDER_STAGES.find(s => s.value === order.stage)
  const sc = overdue
    ? { color: '#ef4444', background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)' }
    : ORDER_STATUS_STYLES[order.status] ?? ORDER_STATUS_STYLES.pending
  const statusLabel = overdue ? 'Overdue' : ORDER_STATUS_LABELS[order.status] ?? 'Pending'
  const priceStr = order.price != null ? `₦${Number(order.price).toLocaleString()}` : '—'
  const totalQty = (order.items || []).reduce((s, i) => s + (parseInt(i.qty, 10) || 0), 0) || order.qty || 0

  return (
    <div
      className={`${styles.orderRow} ${isLast ? styles.orderRowLast : ''} ${overdue ? styles.orderRowOverdue : ''}`}
      onClick={onTap}
    >
      <OrderMosaic items={order.items || []} overdue={overdue} />

      <div className={styles.orderRowInfo}>
        <div className={styles.orderRowDesc}>{order.desc || order.name || 'Order'}</div>
        <div className={styles.orderRowMeta}>
          <span className="mi-outlined" style={{ fontSize: '0.78rem', color: 'var(--text3)', verticalAlign: 'middle' }}>person</span>
          <span className={styles.orderRowMetaText}>{order.customerName || '—'}</span>
        </div>
        {stageObj && (
          <div className={styles.orderRowStageLine}>
            <span className="mi-outlined" style={{ fontSize: '0.78rem' }}>{stageObj.icon}</span>
            {stageObj.label}
          </div>
        )}
      </div>

      <div className={styles.orderRowRight}>
        <div className={styles.orderRowPrice}>{priceStr}</div>
        {totalQty > 1 && <div className={styles.orderRowQty}>{totalQty} items</div>}
        <span
          className={styles.orderRowStatusBadge}
          style={{ color: sc.color, background: sc.background, borderColor: sc.borderColor }}
        >
          {statusLabel}
        </span>
        {dueDateRaw && !['completed', 'delivered', 'cancelled'].includes(order.status) && (
          <div className={styles.orderRowDueRight}>
            Due {formatDateShort(dueDateRaw)}
          </div>
        )}
      </div>
    </div>
  )
}
