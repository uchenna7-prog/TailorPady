import { useState, useEffect, useRef } from 'react'
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

const STATUS_COLOR = {
  pending: '#eab308',
  in_progress: '#818cf8',
  completed: '#22c55e',
  delivered: '#0ea5e9',
  cancelled: '#94a3b8',
}

const PRIORITY_META = {
  normal: { label: 'Normal', color: 'var(--text2)' },
  urgent: { label: 'Urgent', color: '#fb923c' },
  vip: { label: 'VIP', color: '#a855f7' },
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
  const [showStageSheet, setShowStageSheet] = useState(false)
  const [showStatusOptions, setShowStatusOptions] = useState(false)
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
    setShowStageSheet(false)
    setShowStatusOptions(false)
    setBrokenImages(new Set())
  }, [order?.id])

  useEffect(() => {
    if (!fullHeight) return
    window.history.pushState({ orderDetail: true }, '')
    const handlePopState = () => onClose()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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

  function close() {
    if (fullHeight) window.history.back()
    else onClose()
  }

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
  const currentStatusLabel = ORDER_STATUS_LABELS[local.status]
  const statusColor = STATUS_COLOR[local.status] ?? 'var(--text2)'

  async function handleStatusClick(value) {
    if (local.status === value || pendingStatus) return

    if (!isStatusAllowed(value, local.stage)) {
      setHint(STATUS_HINTS[value] ?? null)
      return
    }

    setHint(null)
    setShowStatusOptions(false)
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
    if (pendingStage || local.stage === stageValue) {
      setShowStageSheet(false)
      return
    }

    setHint(null)
    const autoStatus = ORDER_STAGE_AUTO_STATUS[stageValue] ?? null

    const prevStage = local.stage
    const prevStatus = local.status

    setLocal(p => ({ ...p, stage: stageValue, ...(autoStatus ? { status: autoStatus } : {}) }))
    setPendingStage(true)
    setShowStageSheet(false)

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
      close()
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
        onBackClick={close}
        backIcon={fullHeight ? 'arrow_back_ios' : 'close'}
        showBorderBottom={false}
        customActions={[
          { icon: 'delete_outline', onClick: () => setConfirmDelete(true), color: 'var(--text2)', outlined: false },
        ]}
      />

      <div className={styles.body}>

        <div className={styles.pageHeader}>
          <div className={styles.orderTitle}>{orderTitle}</div>

          {showCustomer && (
            <button
              type="button"
              className={styles.customerLink}
              onClick={() => { onGoToCustomer && (close(), onGoToCustomer(local.customerId)) }}
            >
              {local.customerName}
              <span className="mi" style={{ fontSize: '0.85rem' }}>chevron_right</span>
            </button>
          )}
        </div>

        <div className={styles.detailsList}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Placed</span>
            <span className={styles.detailValue}>{placedOn || '—'}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Due</span>
            <span className={`${styles.detailValue} ${overdue ? styles.detailValueOverdue : ''}`}>
              {local.due || '—'}{dueTag ? ` · ${dueTag}` : ''}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Priority</span>
            <div className={styles.detailControl} ref={priorityRef}>
              <span className={styles.detailValue} style={{ color: currentPriority.color }}>{currentPriority.label}</span>
              <button
                type="button"
                className={styles.changeLink}
                onClick={() => setShowPriorityPicker(p => !p)}
                disabled={pendingPriority}
              >
                {showPriorityPicker ? 'Close' : 'Change'}
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
                        <span className={styles.priorityDot} style={{ background: meta.color }} />
                        <span className={styles.priorityOptionLabel}>{meta.label}</span>
                        {active && <span className="mi" style={{ fontSize: '0.9rem', marginLeft: 'auto', color: meta.color }}>check</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Stage</span>
            <div className={styles.detailControl}>
              <span className={styles.detailValue}>
                {stageObj ? stageObj.label : 'Not started'}
                {stageObj && <span className={styles.detailValueMuted}> · {stageIndex + 1}/{ORDER_STAGES.length}</span>}
              </span>
              <button
                type="button"
                className={styles.changeLink}
                onClick={() => setShowStageSheet(true)}
                disabled={pendingStage}
              >
                Change
              </button>
            </div>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status</span>
            <div className={styles.detailControl}>
              <span className={styles.detailValue} style={{ color: statusColor }}>{currentStatusLabel}</span>
              <button
                type="button"
                className={styles.changeLink}
                onClick={() => setShowStatusOptions(p => !p)}
                disabled={pendingStatus}
              >
                {showStatusOptions ? 'Close' : 'Change'}
              </button>
            </div>
          </div>

          {showStatusOptions && (
            <div className={styles.statusOptions}>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => {
                const allowed = isStatusAllowed(value, local.stage)
                const isActive = local.status === value
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!allowed || pendingStatus}
                    className={styles.statusOptionRow}
                    onClick={() => handleStatusClick(value)}
                  >
                    <span style={{ color: isActive ? STATUS_COLOR[value] : 'var(--text2)', fontWeight: isActive ? 800 : 600 }}>
                      {label}
                    </span>
                    {isActive && <span className="mi" style={{ fontSize: '0.85rem', color: STATUS_COLOR[value] }}>check</span>}
                  </button>
                )
              })}
            </div>
          )}

          {hint && hint !== 'review' && (
            <div className={styles.hintText}>{hint}</div>
          )}
        </div>

        {(items.length > 0 || hasCharges) && (
          <div className={styles.financeSection}>
            <span className={styles.sectionLabel}>Order</span>

            {items.map((item, i) => {
              const lineTotal = (parseInt(item.qty, 10) || 1) * (Number(item.price) || 0)
              const imgFailed = brokenImages.has(i)
              return (
                <div key={i} className={styles.lineItem}>
                  <div className={styles.lineItemLeft}>
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
                        : <span className="mi" style={{ fontSize: '0.95rem', color: 'var(--text3)' }}>checkroom</span>
                      }
                    </div>
                    <div>
                      <div className={styles.lineItemName}>{item.name || 'Item'}</div>
                      {(parseInt(item.qty, 10) || 1) > 1 && (
                        <div className={styles.lineItemSub}>{item.qty} pcs × ₦{Number(item.price || 0).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                  <div className={styles.lineItemVal}>₦{lineTotal.toLocaleString()}</div>
                </div>
              )
            })}

            {items.length > 0 && (
              <div className={styles.chargeRow}>
                <span className={styles.chargeLabel}>Subtotal ({totalQty} pcs)</span>
                <span className={styles.chargeVal}>₦{subtotal.toLocaleString()}</span>
              </div>
            )}

            {discount > 0 && (
              <div className={styles.chargeRow}>
                <span className={styles.chargeLabel}>Discount{discountLabel ? ` (${discountLabel})` : ''}</span>
                <span className={`${styles.chargeVal} ${styles.chargeValDiscount}`}>−₦{discount.toLocaleString()}</span>
              </div>
            )}

            {shipping > 0 && (
              <div className={styles.chargeRow}>
                <span className={styles.chargeLabel}>Shipping</span>
                <span className={styles.chargeVal}>₦{shipping.toLocaleString()}</span>
              </div>
            )}

            {tax > 0 && (
              <div className={styles.chargeRow}>
                <span className={styles.chargeLabel}>Tax{taxRate > 0 ? ` (${taxRate}% VAT)` : ''}</span>
                <span className={styles.chargeVal}>₦{tax.toLocaleString()}</span>
              </div>
            )}

            <div className={styles.totalRow}>
              <span>Grand Total</span>
              <span>₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        )}

        {local.notes && (
          <div className={styles.notesBlock}>
            <span className={styles.sectionLabel}>Notes</span>
            <p className={styles.notesText}>{local.notes}</p>
          </div>
        )}

      </div>

      <div className={styles.footer}>
        {hint === 'review' && (
          <div className={styles.footerHint}>Review links can only be sent once the order is Completed or Delivered.</div>
        )}
        <div className={styles.footerButtons}>
          {onGenerateInvoice && (
            <button className={styles.btnPrimary} onClick={() => { close(); onGenerateInvoice(local.id) }}>
              <span className="mi" style={{ fontSize: '1.05rem' }}>receipt_long</span>
              Generate invoice
            </button>
          )}
          <button
            className={`${styles.btnSecondary} ${!canReview ? styles.btnSecondaryDisabled : ''}`}
            onClick={handleReviewClick}
          >
            <span className="mi" style={{ fontSize: '1rem' }}>rate_review</span>
            Share review link
          </button>
        </div>
      </div>

      {showStageSheet && (
        <div className={styles.stageSheetOverlay} onClick={() => setShowStageSheet(false)}>
          <div className={styles.stageSheetPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.handle} />
            <div className={styles.stageSheetTitle}>Change stage</div>
            <div className={styles.stageSheetList}>
              {ORDER_STAGES.map((s, idx) => {
                const isActive = local.stage === s.value
                const isDone = stageIndex >= 0 && idx < stageIndex
                return (
                  <button
                    key={s.value}
                    type="button"
                    disabled={pendingStage}
                    className={`${styles.stageSheetRow} ${isActive ? styles.stageSheetRowActive : ''}`}
                    onClick={() => handleStageChange(s.value)}
                  >
                    <span className={styles.stageSheetRowLabel}>{s.label}</span>
                    {isDone && <span className="mi" style={{ fontSize: '0.9rem', color: '#22c55e' }}>check</span>}
                    {isActive && <span className={styles.stageSheetCurrent}>Current</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <ConfirmSheet
        open={confirmDelete}
        title="Delete this order?"
        message={`"${orderTitle}" will be permanently deleted. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )

  if (fullHeight) return panel

  return (
    <div
      className={`${styles.overlay} ${noBlur ? styles.overlayNoBlur : ''}`}
      onClick={e => e.target === e.currentTarget && close()}
    >
      {panel}
    </div>
  )
}
