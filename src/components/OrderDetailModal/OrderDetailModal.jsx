import { useState } from 'react'
import { useOrders } from '../../contexts/OrdersContext'
import { useAuth }   from '../../contexts/AuthContext'
import {
  PRIORITY_BANNER_CONFIG,
  ORDER_STAGE_AUTO_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STAGES,
  ORDER_STATUS_CORRESPONDING_STAGES,
} from '../../datas/orderDatas'
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
  const due   = new Date(dateStr + 'T00:00:00')
  const diff  = Math.round((due - today) / 86400000)
  if (diff < 0)   return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  return `${diff}d left`
}

const STATUS_HINTS = {
  pending:     'Set the stage to Measurement Taken or Fabric Ready to mark as Pending.',
  in_progress: 'Move the order to a work stage (Cutting, Sewing, Fitting, etc.) to mark as In Progress.',
  completed:   'The stage must be Ready before marking this order as Completed.',
  delivered:   'The stage must be Ready before marking this order as Delivered.',
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
  noBlur = false,
  showToast,
}) {
  const { updateOrderStatus, updateOrderStage, updateOrder, deleteOrder } = useOrders()
  const { user } = useAuth()

  const [local,         setLocal]         = useState(order)
  const [hint,          setHint]          = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!order) return null

  const overdue     = isOverdue(local)
  const dueTag      = daysUntil(local.dueRaw || local.dueDate)
  const placedOn    = local.takenAt || local.date || formatFirestoreDate(local.createdAt)
  const stageObj    = ORDER_STAGES.find(s => s.value === local.stage)
  const priorityCfg = PRIORITY_BANNER_CONFIG[local.priority] ?? PRIORITY_BANNER_CONFIG.normal

  const subtotal      = Number(local.price          || 0)
  const shipping      = Number(local.shippingFee    || 0)
  const discount      = Number(local.discountAmount || 0)
  const tax           = Number(local.taxAmount      || 0)
  const taxRate       = Number(local.taxRate        || 0)
  const grandTotal    = Number(local.totalAmount    || subtotal)
  const hasCharges    = shipping > 0 || discount > 0 || tax > 0
  const discountLabel = local.discountType === 'percent' && local.discountValue > 0
    ? `${local.discountValue}% off` : null

  const items      = local.items || []
  const totalQty   = items.reduce((s, i) => s + (parseInt(i.qty, 10) || 1), 0) || local.qty || 1

  const canReview     = local.status === 'completed' || local.status === 'delivered'
  const stageIndex    = ORDER_STAGES.findIndex(s => s.value === local.stage)
  const stageProgress = local.stage ? ((stageIndex + 1) / ORDER_STAGES.length) * 100 : 0


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
    const newStage   = local.stage === stageValue ? null : stageValue
    const autoStatus = newStage ? ORDER_STAGE_AUTO_STATUS[newStage] : null

    const prevStage  = local.stage
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
    const url   = `https://TailorPady.web.app/review/${user?.uid}/${token}`
    const name  = local.customerName || 'there'
    const msg   = encodeURIComponent(
      `Hi ${name}! 🙏 Thank you for your order.\n\nWe'd love your feedback — it only takes a minute:\n${url}\n\nYour review means a lot! ⭐`
    )
    const raw = (local.customerPhone || '').replace(/[\s\-()]/g, '')
    const wa  = raw.startsWith('+') ? raw.slice(1)
              : raw.startsWith('0') ? `234${raw.slice(1)}` : raw
    window.open(wa ? `https://wa.me/${wa}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer')
  }


  return (
    <div
      className={`${styles.overlay} ${noBlur ? styles.overlayNoBlur : ''}`}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.panel}>

        <div className={styles.handle} />

        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="mi">close</span>
          </button>
          <div className={styles.headerTitle}>Order Details</div>
          <div className={styles.headerActions}>
            {!confirmDelete ? (
              <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
                <span className="mi" style={{ fontSize: '1.1rem' }}>delete_outline</span>
              </button>
            ) : (
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Delete?</span>
                <button className={styles.confirmYes} onClick={handleDelete}>Yes</button>
                <button className={styles.confirmNo} onClick={() => setConfirmDelete(false)}>No</button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.body}>

          <span className={`${styles.priorityBanner} ${styles[priorityCfg.className]}`}>
            {priorityCfg.label}
          </span>

          <div className={styles.title}>{local.desc || local.name || 'Order'}</div>
          {local.customerName && (
            <div className={styles.customer}>
              <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>person</span>
              {local.customerName}
            </div>
          )}

          <div className={styles.infoGrid}>
            <div className={styles.infoCell}>
              <div className={styles.infoCellLabel}>Grand Total</div>
              <div className={styles.infoCellVal}>₦{grandTotal.toLocaleString()}</div>
            </div>
            <div className={styles.infoCell}>
              <div className={styles.infoCellLabel}>Status</div>
              <div
                className={`${styles.infoCellVal} ${styles.infoCellVal_status}`}
                style={{ color: overdue ? '#ef4444' : undefined }}
              >
                {overdue ? 'Overdue' : (ORDER_STATUS_LABELS[local.status] ?? 'Pending')}
              </div>
            </div>
            <div className={styles.infoCell}>
              <div className={styles.infoCellLabel}>Stage</div>
              <div className={styles.infoCellVal} style={{ fontSize: '0.82rem' }}>
                {stageObj ? (
                  <span className={styles.stageVal}>
                    <span className="mi" style={{ fontSize: '0.9rem' }}>{stageObj.icon}</span>
                    {stageObj.label}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text3)', fontWeight: 500, fontSize: '0.78rem' }}>Not set</span>
                )}
              </div>
            </div>
            <div className={styles.infoCell}>
              <div className={styles.infoCellLabel}>Due</div>
              <div
                className={styles.infoCellVal}
                style={{ fontSize: '0.85rem', color: local.due ? '#ef4444' : 'var(--text3)' }}
              >
                {local.due || '—'}
                {dueTag && <span className={styles.dueTag}>{dueTag}</span>}
              </div>
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

          <div className={styles.metaRow}>
            {placedOn   && <span>Placed: {placedOn}</span>}
            {local.due  && <><span className={styles.metaDot}>•</span><span>Due: {local.due}</span></>}
            {totalQty   && <><span className={styles.metaDot}>•</span><span>Qty: {totalQty}</span></>}
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionLabel}>
              Change Stage
              {local.stage && (
                <span style={{ float: 'right', color: 'var(--text2)', fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
                  {stageIndex + 1} / {ORDER_STAGES.length}
                </span>
              )}
            </div>

            <div className={styles.stageProgressTrack}>
              <div className={styles.stageProgressFill} style={{ width: `${stageProgress}%` }} />
            </div>

            <div className={styles.chipWrap}>
              {ORDER_STAGES.map((s, idx) => (
                <button
                  key={s.value}
                  className={`${styles.stageChip} ${local.stage === s.value ? styles.stageChip_active : ''} ${idx < stageIndex ? styles.stageChip_done : ''}`}
                  onClick={() => handleStageChange(s.value)}
                >
                  <span className="mi" style={{ fontSize: '0.85rem' }}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionLabel}>Change Status</div>
            <div className={styles.statusRow}>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => {
                const allowed  = isStatusAllowed(value, local.stage)
                const isActive = local.status === value
                return (
                  <button
                    key={value}
                    className={`${styles.statusBtn} ${isActive ? styles.statusBtn_active : ''} ${!allowed ? styles.statusBtn_disabled : ''}`}
                    onClick={() => handleStatusClick(value)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {hint && hint !== 'review' && (
              <div className={styles.hintBox} style={{ marginTop: 12 }}>
                <span className="mi" style={{ fontSize: '0.9rem', flexShrink: 0 }}>info</span>
                {hint}
              </div>
            )}
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionLabel}>Priority</div>
            <div className={styles.priorityRow}>
              {['normal', 'urgent', 'vip'].map(p => (
                <button
                  key={p}
                  className={`${styles.priorityBtn} ${(local.priority ?? 'normal') === p ? styles[`priorityBtn_${p}`] : ''}`}
                  onClick={() => handlePriority(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {local.customerId && onGoToCustomer && (
            <button
              className={styles.customerBtn}
              onClick={() => { onClose(); onGoToCustomer(local.customerId) }}
            >
              <span className="mi" style={{ fontSize: '1.1rem' }}>account_circle</span>
              Go to {local.customerName || 'Customer'}'s Profile
              <span className="mi" style={{ marginLeft: 'auto', fontSize: '1rem' }}>arrow_forward_ios</span>
            </button>
          )}

          <button
            className={`${styles.reviewBtn} ${!canReview ? styles.reviewBtn_disabled : ''}`}
            onClick={handleReviewClick}
          >
            <span className="mi" style={{ fontSize: '1.15rem' }}>rate_review</span>
            Share Review Link via WhatsApp
            <span className="mi" style={{ fontSize: '1rem', marginLeft: 'auto' }}>open_in_new</span>
          </button>

          {hint === 'review' && (
            <div className={styles.hintBox} style={{ marginTop: -6, marginBottom: 12 }}>
              <span className="mi" style={{ fontSize: '0.9rem', flexShrink: 0 }}>info</span>
              Review links can only be sent once the order is marked as Completed or Delivered.
            </div>
          )}

          {onGenerateInvoice && (
            <button
              className={styles.invoiceBtn}
              onClick={() => { onClose(); onGenerateInvoice(local.id) }}
            >
              <span className="mi" style={{ fontSize: '1.2rem' }}>receipt_long</span>
              Generate Invoice
            </button>
          )}

        </div>
      </div>
    </div>
  )
}