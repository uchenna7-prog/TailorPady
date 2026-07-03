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

const STATUS_CHIP = {
  pending: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.4)' },
  in_progress: { color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.4)' },
  completed: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.4)' },
  delivered: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.4)' },
  cancelled: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)' },
}

const PRIORITY_CHIP = {
  normal: { label: 'Normal', color: 'var(--text2)', bg: 'var(--surface2)', border: 'var(--border2)' },
  urgent: { label: 'Urgent', color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.4)' },
  vip: { label: 'VIP', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.4)' },
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
  const [showStageSheet, setShowStageSheet] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(false)
  const [pendingStage, setPendingStage] = useState(false)
  const [pendingPriority, setPendingPriority] = useState(false)
  const [brokenImages, setBrokenImages] = useState(() => new Set())

  useEffect(() => {
    setLocal(order)
    setHint(null)
    setConfirmDelete(false)
    setShowStageSheet(false)
    setBrokenImages(new Set())
  }, [order?.id])

  useEffect(() => {
    if (!fullHeight) return
    window.history.pushState({ orderDetail: true }, '')
    const handlePopState = () => onClose()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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
  const orderTitle = local.desc || local.name || 'Order'

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
    if (pendingPriority || (local.priority ?? 'normal') === priority) return
    const prev = local.priority
    setLocal(p => ({ ...p, priority }))
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
        showBorderBottom={false}
        title={fullHeight ? orderTitle : 'Order Details'}
        onBackClick={close}
        backIcon={fullHeight ? 'arrow_back_ios' : 'close'}
        customActions={[
          { icon: 'delete', onClick: () => setConfirmDelete(true), color: 'var(--danger)', outlined: true },
        ]}
      />

      <div className={styles.body}>

        {!fullHeight && <div className={styles.detailTitle}>{orderTitle}</div>}

        <div className={styles.chipLabel}>Priority</div>
        <div className={styles.chipRow}>
          {['normal', 'urgent', 'vip'].map(p => {
            const meta = PRIORITY_CHIP[p]
            const isActive = (local.priority ?? 'normal') === p
            return (
              <button
                key={p}
                disabled={pendingPriority}
                className={`${styles.chipBtn} ${isActive ? styles.chipBtn_active : ''}`}
                style={isActive ? { background: meta.bg, borderColor: meta.border, color: meta.color } : {}}
                onClick={() => handlePriority(p)}
              >
                {meta.label}
              </button>
            )
          })}
        </div>

        <div className={styles.chipLabel} style={{ marginTop: 16 }}>Status</div>
        <div className={styles.chipRow}>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => {
            const meta = STATUS_CHIP[value]
            const isActive = local.status === value
            const locked = !isStatusAllowed(value, local.stage)
            return (
              <button
                key={value}
                disabled={pendingStatus || (locked && !isActive)}
                className={[
                  styles.chipBtn,
                  isActive ? styles.chipBtn_active : '',
                  locked && !isActive ? styles.chipBtn_locked : '',
                ].join(' ')}
                style={isActive ? { background: meta.bg, borderColor: meta.border, color: meta.color } : {}}
                onClick={() => handleStatusClick(value)}
              >
                {label}
              </button>
            )
          })}
        </div>

        {hint && hint !== 'review' && <div className={styles.hintText}>{hint}</div>}

        <div className={styles.infoGrid}>
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Placed</div>
            <div className={styles.infoGridValue}>{placedOn || '—'}</div>
          </div>
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Due</div>
            <div className={`${styles.infoGridValue} ${overdue ? styles.overdueText : ''}`}>
              {local.due || '—'}
            </div>
            {dueTag && <div className={styles.infoGridSub}>{dueTag}</div>}
          </div>
        </div>

        <button type="button" className={styles.stageCard} onClick={() => setShowStageSheet(true)} disabled={pendingStage}>
          <div>
            <div className={styles.stageCardLabel}>Stage</div>
            <div className={styles.stageCardValue}>
              {stageObj ? stageObj.label : 'Not started'}
              {stageObj && <span className={styles.stageCardCount}> · {stageIndex + 1} of {ORDER_STAGES.length}</span>}
            </div>
          </div>
          <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--text3)' }}>chevron_right</span>
        </button>

        {showCustomer && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionCardLabel}>Customer</div>
            <button type="button" className={styles.linkedRow} onClick={() => { onGoToCustomer && (close(), onGoToCustomer(local.customerId)) }}>
              <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>person</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{local.customerName}</div>
                {local.customerPhone && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{local.customerPhone}</div>
                )}
              </div>
              {local.customerPhone && (
                <a
                  href={`tel:${local.customerPhone}`}
                  className={styles.callBtn}
                  onClick={e => e.stopPropagation()}
                >
                  <span className="mi" style={{ fontSize: '1rem' }}>call</span>
                </a>
              )}
            </button>
          </div>
        )}

        {(items.length > 0 || hasCharges) && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionCardLabel}>Order Summary</div>

            {items.map((item, i) => {
              const lineTotal = (parseInt(item.qty, 10) || 1) * (Number(item.price) || 0)
              const imgFailed = brokenImages.has(i)
              return (
                <div key={i} className={styles.financeRow}>
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
                <span className={`${styles.chargeVal} ${styles.chargeVal_discount}`}>−₦{discount.toLocaleString()}</span>
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
          <div className={styles.sectionCard}>
            <div className={styles.sectionCardLabel}>Notes</div>
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
            className={`${styles.btnSecondary} ${!canReview ? styles.btnSecondary_disabled : ''}`}
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
