import { useState, useEffect, useRef } from 'react'
import { useOrders } from '../../contexts/OrdersContext'
import { useAuth } from '../../contexts/AuthContext'
import {
  ORDER_STAGE_AUTO_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STAGES,
  ORDER_STATUS_CORRESPONDING_STAGES,
} from '../../datas/orderDatas'
import {getInitials} from '../../utils/nameUtils'
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

const STATUS_CLASS = {
  pending: 'statusPending',
  in_progress: 'statusInProgress',
  completed: 'statusCompleted',
  delivered: 'statusDelivered',
  cancelled: 'statusCancelled',
}

const PRIORITY_META = {
  normal: { label: 'Normal', color: 'var(--text2)', icon: 'horizontal_rule' },
  urgent: { label: 'Urgent', color: '#fb923c', icon: 'bolt' },
  vip: { label: 'VIP', color: '#a855f7', icon: 'star' },
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
  const [pendingStatus, setPendingStatus] = useState(false)
  const [pendingStage, setPendingStage] = useState(false)
  const [pendingPriority, setPendingPriority] = useState(false)
  const [brokenImages, setBrokenImages] = useState(() => new Set())

  const priorityRef = useRef(null)

  useEffect(() => {
    setLocal(order)
    setHint(null)
    setConfirmDelete(false)
    setShowPriorityPicker(false)
    setBrokenImages(new Set())
  }, [order?.id])

  useEffect(() => {
    if (!showPriorityPicker) return
    function handleOutside(e) {
      if (priorityRef.current && !priorityRef.current.contains(e.target)) {
        setShowPriorityPicker(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [showPriorityPicker])

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
  const orderTitle = local.desc || local.name || 'Order'
  const customerInitial = getInitials(local.customerName)

  async function handleStatusClick(value) {
    if (local.status === value || pendingStatus) return

    if (!isStatusAllowed(value, local.stage)) {
      setHint(STATUS_HINTS[value] ?? null)
      return
    }

    setHint(null)
    const prevStatus = local.status
    setLocal(p => ({ ...p, status: value }))
    setPendingStatus(true)

    try {
      await updateOrderStatus(local.customerId, local.id, value)
      showToast?.('Status updated')
    } catch {
      setLocal(p => ({ ...p, status: prevStatus }))
      showToast?.('Failed to update status')
    } finally {
      setPendingStatus(false)
    }
  }

  async function handleStageChange(stageValue) {
    if (pendingStage || local.stage === stageValue) return

    setHint(null)
    const autoStatus = ORDER_STAGE_AUTO_STATUS[stageValue] ?? null

    const prevStage = local.stage
    const prevStatus = local.status

    setLocal(p => ({ ...p, stage: stageValue, ...(autoStatus ? { status: autoStatus } : {}) }))
    setPendingStage(true)

    try {
      await updateOrderStage(local.customerId, local.id, stageValue)
      if (autoStatus) {
        await updateOrderStatus(local.customerId, local.id, autoStatus)
      }
      showToast?.('Stage updated')
    } catch {
      setLocal(p => ({ ...p, stage: prevStage, status: prevStatus }))
      showToast?.('Failed to update stage')
    } finally {
      setPendingStage(false)
    }
  }

  async function handlePriority(priority) {
    if (pendingPriority || (local.priority ?? 'normal') === priority) {
      setShowPriorityPicker(false)
      return
    }
    const prev = local.priority
    setLocal(p => ({ ...p, priority }))
    setShowPriorityPicker(false)
    setPendingPriority(true)
    try {
      await updateOrder(local.customerId, local.id, { priority })
      showToast?.('Priority updated')
    } catch {
      setLocal(p => ({ ...p, priority: prev }))
      showToast?.('Failed to update priority')
    } finally {
      setPendingPriority(false)
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

  async function handleReviewClick() {
    if (!canReview) {
      setHint('review')
      return
    }
    setHint(null)

    let token = local.reviewToken
    if (!token) {
      token = crypto.randomUUID()
      setLocal(p => ({ ...p, reviewToken: token }))
      try {
        await updateOrder(local.customerId, local.id, { reviewToken: token })
      } catch {
        showToast?.('Failed to create review link')
        return
      }
    }

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
    <div
      className={`${styles.panel} ${fullHeight ? styles.panelFullHeight : ''}`}
      onTouchStart={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      {!fullHeight && <div className={styles.handle} />}

      <Header
        type="back"
        title="Order Details"
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

        <div className={styles.orderInfoCard}>
          <div className={styles.titleRow}>
            <div className={styles.detailTitle}>{orderTitle}</div>
            <div className={styles.priorityWrap} ref={priorityRef}>
              <button
                type="button"
                className={styles.priorityTrigger}
                onClick={() => setShowPriorityPicker(p => !p)}
                disabled={pendingPriority}
              >
                <span className={styles.priorityDot} style={{ background: currentPriority.color }} />
                {currentPriority.label}
                <span className="mi" style={{ fontSize: '0.9rem' }}>
                  {showPriorityPicker ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showPriorityPicker && (
                <div className={styles.priorityDropdown}>
                  {['normal', 'urgent', 'vip'].map(p => {
                    const meta = PRIORITY_META[p]
                    const active = (local.priority ?? 'normal') === p
                    return (
                      <button
                        key={p}
                        type="button"
                        className={`${styles.priorityOption} ${active ? styles.priorityOptionActive : ''}`}
                        onClick={() => handlePriority(p)}
                      >
                        <span className="mi" style={{ fontSize: '1rem', color: meta.color }}>{meta.icon}</span>
                        <span className={styles.priorityOptionLabel}>{meta.label}</span>
                        {active && <span className="mi" style={{ fontSize: '0.95rem', marginLeft: 'auto', color: meta.color }}>check</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {showCustomer && (
            <button
              type="button"
              className={styles.customerRow}
              onClick={() => { onGoToCustomer && (onClose(), onGoToCustomer(local.customerId)) }}
            >
              <span className={styles.customerAvatar}>{customerInitial}</span>
              <span className={styles.customerInfo}>
                <span className={styles.customerName}>{local.customerName}</span>
                {local.customerPhone && <span className={styles.customerPhone}>{local.customerPhone}</span>}
              </span>
              <span className="mi" style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>chevron_right</span>
            </button>
          )}

          <div className={styles.orderGrid} style={{ marginTop: 12 }}>
            <div className={styles.orderCell}>
              <div className={styles.orderCellLabel}>Placed</div>
              <div className={styles.orderCellVal}>{placedOn || '—'}</div>
            </div>
            <div className={styles.orderCell}>
              <div className={styles.orderCellLabel}>Due</div>
              <div className={`${styles.orderCellVal} ${overdue ? styles.orderCellVal_overdue : ''}`}>{local.due || '—'}</div>
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
          <div className={styles.sectionLabel}>Status</div>
          <div className={styles.statusRow}>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => {
              const allowed = isStatusAllowed(value, local.stage)
              const isActive = local.status === value
              return (
                <button
                  key={value}
                  disabled={!allowed || pendingStatus}
                  className={`${styles.statusBtn} ${isActive ? `${styles.statusBtn_active} ${styles[STATUS_CLASS[value]] ?? ''}` : ''} ${!allowed ? styles.statusBtn_locked : ''} ${pendingStatus && isActive ? styles.statusBtn_pending : ''}`}
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
          <div className={styles.stepperHeader}>
            <span className={styles.sectionLabel} style={{ marginBottom: 0 }}>Order Stage</span>
            <span className={styles.stepperCount}>
              {stageObj ? `${stageIndex + 1} of ${ORDER_STAGES.length} · ${stageObj.label}` : 'Not started'}
            </span>
          </div>
          <div className={styles.stepperScroll}>
          {ORDER_STAGES.map((s, idx) => {
            const isActive = local.stage === s.value
            const isDone = stageIndex >= 0 && idx < stageIndex
            const isLast = idx === ORDER_STAGES.length - 1
            return (
              <button
                key={s.value}
                disabled={pendingStage}
                className={`${styles.stepperItem} ${isActive ? styles.stepperItem_active : ''} ${isDone ? styles.stepperItem_done : ''} ${isLast ? styles.stepperItem_last : ''} ${isDone ? styles.stepperItem_lineDone : ''}`}
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
              const imgFailed = brokenImages.has(i)
              return (
                <div key={i} className={`${styles.garmentRow} ${i < items.length - 1 ? styles.garmentRowBorder : ''}`}>
                  <div className={styles.garmentLeft}>
                    <div className={styles.garmentThumb}>
                      {item.imgSrc && !imgFailed
                        ? (
                          <img
                            src={item.imgSrc}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={() => setBrokenImages(prev => new Set(prev).add(i))}
                          />
                        )
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
            Share Review Link Via WhatsApp
          </button>
        </div>
      </div>

      <ConfirmSheet
        open={confirmDelete}
        title="Delete this order?"
        message={`"${orderTitle}" will be permanently deleted. This cannot be undone.`}
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
