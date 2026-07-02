import { useState, useEffect } from 'react'
import { useOrders } from '../../contexts/OrdersContext'
import { useAuth } from '../../contexts/AuthContext'
import {
  ORDER_STAGE_AUTO_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STAGES,
  ORDER_STATUS_CORRESPONDING_STAGES,
} from '../../datas/orderDatas'
import Header from '../Header/Header'
import ConfirmSheet from '../ConfirmSheet/ConfirmSheet'
import styles from './OrderDetailModal.module.css'

function formatFirestoreDate(ts) {
  if (!ts) return ''
  if (typeof ts.toDate === 'function')
    return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (typeof ts === 'string') return ts
  return ''
}

function isOverdue(order) {
  const raw = order.dueRaw || order.dueDate
  if (!raw) return false
  if (['completed', 'delivered', 'cancelled'].includes(order.status)) return false
  return new Date(raw + 'T23:59:59') < new Date()
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((due - today) / 86400000)
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  return `${diff}d left`
}

const STATUS_HINTS = {
  pending: 'Set the stage to Measurement Taken or Fabric Ready to mark as Pending.',
  in_progress: 'Move the order to a work stage (Cutting, Sewing, Fitting, etc.) to mark as In Progress.',
  completed: 'The stage must be Ready before marking this order as Completed.',
  delivered: 'The stage must be Ready before marking this order as Delivered.',
}

const STATUS_META = {
  pending: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.4)' },
  in_progress: { color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.4)' },
  completed: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.4)' },
  delivered: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.4)' },
  cancelled: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)' },
}

const PRIORITY_META = {
  normal: { label: 'Normal', color: 'var(--text2)', bg: 'var(--surface2)', border: 'var(--border2)' },
  urgent: { label: 'Urgent', color: '#fb923c', bg: 'rgba(251,146,60,0.14)', border: 'rgba(251,146,60,0.4)' },
  vip: { label: 'VIP', color: '#a855f7', bg: 'rgba(168,85,247,0.14)', border: 'rgba(168,85,247,0.4)' },
}

function isStatusAllowed(status, stage) {
  if (status === 'cancelled') return true
  const allowed = ORDER_STATUS_CORRESPONDING_STAGES[status]
  if (!allowed) return true
  if (!stage) return status === 'pending'
  return Array.isArray(allowed) ? allowed.includes(stage) : allowed === stage
}

export default function OrderDetailModal({
  order,
  onClose,
  onGoToCustomer,
  onGenerateInvoice,
  fullHeight = false,
  noBlur = false,
  hideCustomerName = false,
  showToast,
}) {
  const { updateOrderStatus, updateOrderStage, updateOrder, deleteOrder } = useOrders()
  const { user } = useAuth()

  const [local, setLocal] = useState(order)
  const [hint, setHint] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)

  useEffect(() => {
    setLocal(order)
    setHint(null)
    setConfirmDelete(false)
    setShowPriorityPicker(false)
  }, [order?.id])

  if (!order) return null

  const overdue = isOverdue(local)
  const dueTag = daysUntil(local.dueRaw || local.dueDate)
  const placedOn = local.takenAt || local.date || formatFirestoreDate(local.createdAt)

  const subtotal = Number(local.price || 0)
  const shipping = Number(local.shippingFee || 0)
  const discount = Number(local.discountAmount || 0)
  const tax = Number(local.taxAmount || 0)
  const taxRate = Number(local.taxRate || 0)
  const grandTotal = Number(local.totalAmount || subtotal)
  const hasCharges = shipping > 0 || discount > 0 || tax > 0
  const discountLabel = local.discountType === 'percent' && local.discountValue > 0
    ? `${local.discountValue}% off` : null

  const items = local.items || []
  const totalQty = items.reduce((s, i) => s + (parseInt(i.qty, 10) || 1), 0) || local.qty || 1

  const canReview = local.status === 'completed' || local.status === 'delivered'
  const stageIndex = ORDER_STAGES.findIndex(s => s.value === local.stage)
  const stageObj = ORDER_STAGES.find(s => s.value === local.stage)
  const showCustomer = local.customerName && !hideCustomerName
  const currentPriority = PRIORITY_META[local.priority ?? 'normal']

  async function handleStatusClick(value) {
    if (local.status === value) return

    if (!isStatusAllowed(value, local.stage)) {
      setHint(STATUS_HINTS[value] ?? null)
      return
    }

    setHint(null)
    const prevStatus = local.status
    setLocal(p => ({ ...p, status: value }))

    try {
      await updateOrderStatus(local.customerId, local.id, value)
    } catch {
      setLocal(p => ({ ...p, status: prevStatus }))
      showToast?.('Failed to update status')
    }
  }

  async function handleStageChange(stageValue) {
    setHint(null)
    const newStage = local.stage === stageValue ? null : stageValue
    const autoStatus = newStage ? ORDER_STAGE_AUTO_STATUS[newStage] : null

    const prevStage = local.stage
    const prevStatus = local.status

    setLocal(p => ({ ...p, stage: newStage, ...(autoStatus ? { status: autoStatus } : {}) }))

    try {
      await updateOrderStage(local.customerId, local.id, newStage)
      if (autoStatus) {
        await updateOrderStatus(local.customerId, local.id, autoStatus)
      }
    } catch {
      setLocal(p => ({ ...p, stage: prevStage, status: prevStatus }))
      showToast?.('Failed to update stage')
    }
  }

  async function handlePriority(priority) {
    const prev = local.priority
    setLocal(p => ({ ...p, priority }))
    setShowPriorityPicker(false)
    try {
      await updateOrder(local.customerId, local.id, { priority })
    } catch {
      setLocal(p => ({ ...p, priority: prev }))
      showToast?.('Failed to update priority')
    }
  }

  async function handleDelete() {
    try {
      await deleteOrder(local.customerId, local.id)
      onClose()
    } catch {
      showToast?.('Failed to delete order')
      setConfirmDelete(false)
    }
  }

  function handleReviewClick() {
    if (!canReview) {
      setHint('review')
      return
    }
    setHint(null)
    const token = local.reviewToken || crypto.randomUUID()
    const url = `https://TailorPady.web.app/review/${user?.uid}/${token}`
    const name = local.customerName || 'there'
    const msg = encodeURIComponent(
      `Hi ${name}! 🙏 Thank you for your order.\n\nWe'd love your feedback — it only takes a minute:\n${url}\n\nYour review means a lot! ⭐`
    )
    const raw = (local.customerPhone || '').replace(/[\s\-()]/g, '')
    const wa = raw.startsWith('+') ? raw.slice(1)
      : raw.startsWith('0') ? `234${raw.slice(1)}` : raw
    window.open(wa ? `https://wa.me/${wa}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer')
  }

  const panel = (
    <div className={`${styles.panel} ${fullHeight ? styles.panelFullHeight : ''}`}>
      {!fullHeight && <div className={styles.handle} />}

      <Header
        type="back"
        title={fullHeight ? (local.desc || local.name || 'Order') : 'Order Details'}
        onBackClick={onClose}
        backIcon={fullHeight ? 'arrow_back_ios' : 'close'}
        showBorderBottom={false}
        customActions={[
          { icon: 'delete_outline', onClick: () => setConfirmDelete(true), color: 'var(--danger)', outlined: true },
        ]}
      />

      <div className={styles.body}>

        {overdue && (
          <div className={styles.alertBanner}>
            <span className="mi" style={{ fontSize: '1rem', flexShrink: 0 }}>warning</span>
            This order is overdue{dueTag ? ` — ${dueTag}` : ''}.
          </div>
        )}

        <div className={styles.sectionCard}>
          <div className={styles.sectionLabel}>Status</div>
          <div className={styles.statusRow}>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => {
              const allowed = isStatusAllowed(value, local.stage)
              const isActive = local.status === value
              const meta = STATUS_META[value] ?? STATUS_META.pending
              return (
                <button
                  key={value}
                  disabled={!allowed}
                  className={`${styles.statusBtn} ${isActive ? styles.statusBtn_active : ''} ${!allowed ? styles.statusBtn_locked : ''}`}
                  style={isActive ? { background: meta.bg, borderColor: meta.border, color: meta.color } : {}}
                  onClick={() => handleStatusClick(value)}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {hint && hint !== 'review' && (
            <div className={styles.hintBox}>
              <span className="mi" style={{ fontSize: '0.9rem', flexShrink: 0 }}>info</span>
              {hint}
            </div>
          )}
        </div>

        <div className={styles.sectionCard}>
          {showCustomer && (
            <>
              <button
                type="button"
                className={styles.customerRow}
                onClick={() => { onGoToCustomer && (onClose(), onGoToCustomer(local.customerId)) }}
              >
                <span className="mi" style={{ fontSize: '1.05rem', color: 'var(--text3)' }}>person</span>
                <div className={styles.customerInfo}>
                  <div className={styles.customerName}>{local.customerName}</div>
                  {local.customerPhone && <div className={styles.customerPhone}>{local.customerPhone}</div>}
                </div>
                <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>arrow_forward_ios</span>
              </button>
              <div className={styles.rowDivider} />
            </>
          )}

          <div className={styles.titleRow}>
            <div className={styles.detailTitle}>{local.desc || local.name || 'Order'}</div>
            <button
              type="button"
              className={styles.priorityBadge}
              style={{ background: currentPriority.bg, borderColor: currentPriority.border, color: currentPriority.color }}
              onClick={() => setShowPriorityPicker(p => !p)}
            >
              {currentPriority.label}
              <span className="mi" style={{ fontSize: '0.85rem' }}>
                {showPriorityPicker ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {showPriorityPicker && (
            <div className={styles.priorityPicker}>
              {['normal', 'urgent', 'vip'].map(p => (
                <button
                  key={p}
                  className={`${styles.priorityChip} ${(local.priority ?? 'normal') === p ? styles[`priorityChip_${p}`] : ''}`}
                  onClick={() => handlePriority(p)}
                >
                  {PRIORITY_META[p].label}
                </button>
              ))}
            </div>
          )}

          <div className={styles.orderGrid} style={{ marginTop: 12 }}>
            <div className={styles.orderCell}>
              <div className={styles.orderCellLabel}>Placed</div>
              <div className={styles.orderCellVal}>{placedOn || '—'}</div>
            </div>
            <div className={styles.orderCell}>
              <div className={styles.orderCellLabel}>Due</div>
              <div className={`${styles.orderCellVal} ${overdue ? styles.overdueText : ''}`}>
                {local.due || '—'}
              </div>
              {dueTag && (
                <span className={`${styles.dueTag} ${overdue ? styles.dueTag_overdue : ''}`}>{dueTag}</span>
              )}
            </div>
          </div>

          {!hasCharges && (
            <>
              <div className={styles.rowDivider} />
              <div className={styles.grandTotalRow}>
                <span className={styles.orderCellLabel}>Grand Total</span>
                <span className={styles.grandTotalVal}>₦{grandTotal.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.stepperHeader}>
            <span className={styles.sectionLabel} style={{ marginBottom: 0 }}>Order Stage</span>
            <span className={styles.stepperCount}>
              {stageObj ? `${stageIndex + 1} of ${ORDER_STAGES.length} · ${stageObj.label}` : 'Not started'}
            </span>
          </div>
          <div className={styles.stepperScroll}>
        <div className={styles.stepperTrack} />
          {ORDER_STAGES.map((s, idx) => {
            const isActive = local.stage === s.value
            const isDone = stageIndex >= 0 && idx < stageIndex
            return (
              <button
                key={s.value}
                className={`${styles.stepperItem} ${isActive ? styles.stepperItem_active : ''} ${isDone ? styles.stepperItem_done : ''}`}
                onClick={() => handleStageChange(s.value)}
              >
                <span className={styles.stepperCircle}>
                  <span className="mi" style={{ fontSize: '0.95rem' }}>
                    {isDone ? 'check' : s.icon}
                  </span>
                </span>
                <span className={styles.stepperLabel}>{s.label}</span>
              </button>
            )
          })}
        </div>
        </div>

        {items.length > 0 && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionLabel}>Selected Garments</div>
            {items.map((item, i) => {
              const lineTotal = (parseInt(item.qty, 10) || 1) * (Number(item.price) || 0)
              return (
                <div key={i} className={`${styles.garmentRow} ${i < items.length - 1 ? styles.garmentRowBorder : ''}`}>
                  <div className={styles.garmentLeft}>
                    <div className={styles.garmentThumb}>
                      {item.imgSrc
                        ? <img src={item.imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>checkroom</span>
                      }
                    </div>
                    <div>
                      <div className={styles.garmentName}>{item.name || 'Item'}</div>
                      {(parseInt(item.qty, 10) || 1) > 1 && (
                        <div className={styles.garmentQty}>
                          {item.qty} pcs × ₦{Number(item.price || 0).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.garmentPrice}>₦{lineTotal.toLocaleString()}</div>
                </div>
              )
            })}
            <div className={styles.garmentSubtotal}>
              <span>Subtotal (Qty: {totalQty})</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
          </div>
        )}

        {hasCharges && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionLabel}>Discount &amp; Charges</div>
            <div className={styles.chargeRow}>
              <span className={styles.chargeLabel}>Subtotal</span>
              <span className={styles.chargeVal}>₦{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className={styles.chargeRow}>
                <span className={styles.chargeLabel}>
                  <span className="mi" style={{ fontSize: '0.85rem', verticalAlign: 'middle', marginRight: 4 }}>sell</span>
                  Discount{discountLabel ? ` (${discountLabel})` : ''}
                </span>
                <span className={`${styles.chargeVal} ${styles.chargeVal_discount}`}>
                  −₦{discount.toLocaleString()}
                </span>
              </div>
            )}
            {shipping > 0 && (
              <div className={styles.chargeRow}>
                <span className={styles.chargeLabel}>
                  <span className="mi" style={{ fontSize: '0.85rem', verticalAlign: 'middle', marginRight: 4 }}>local_shipping</span>
                  Shipping
                </span>
                <span className={styles.chargeVal}>₦{shipping.toLocaleString()}</span>
              </div>
            )}
            {tax > 0 && (
              <div className={styles.chargeRow}>
                <span className={styles.chargeLabel}>
                  <span className="mi" style={{ fontSize: '0.85rem', verticalAlign: 'middle', marginRight: 4 }}>receipt</span>
                  Tax{taxRate > 0 ? ` (${taxRate}% VAT)` : ''}
                </span>
                <span className={styles.chargeVal}>₦{tax.toLocaleString()}</span>
              </div>
            )}
            <div className={styles.chargeDivider} />
            <div className={styles.chargeTotal}>
              <span>Grand Total</span>
              <span>₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        )}

        {local.notes && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionLabel}>Notes</div>
            <p className={styles.notesText}>{local.notes}</p>
          </div>
        )}

      </div>

      <div className={styles.footer}>
        {hint === 'review' && (
          <div className={styles.footerHint}>
            <span className="mi" style={{ fontSize: '0.85rem', flexShrink: 0 }}>info</span>
            Review links can only be sent once the order is Completed or Delivered.
          </div>
        )}
        <div className={styles.footerButtons}>
          {onGenerateInvoice && (
            <button
              className={styles.btnPrimary}
              onClick={() => { onClose(); onGenerateInvoice(local.id) }}
            >
              <span className="mi" style={{ fontSize: '1.1rem',textTransform: 'lowercase' }}>receipt_long</span>
              Generate Invoice
            </button>
          )}
          <button
            className={`${styles.btnSecondary} ${!canReview ? styles.btnSecondary_disabled : ''}`}
            onClick={handleReviewClick}
          >
            <span className="mi" style={{ fontSize: '1.05rem',textTransform: 'lowercase' }}>rate_review</span>
            Share Review Link
          </button>
        </div>
      </div>

      <ConfirmSheet
        open={confirmDelete}
        title="Delete this order?"
        message={`"${local.desc || local.name || 'This order'}" will be permanently deleted. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )

  return (
    <div
      className={`${styles.overlay} ${noBlur ? styles.overlayNoBlur : ''}`}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {panel}
    </div>
  )
}