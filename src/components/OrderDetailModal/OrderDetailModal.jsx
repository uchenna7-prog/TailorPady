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

function formatStageTimestamp(ts) {
  if (!ts) return null
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts)
  if (isNaN(date.getTime())) return null
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatFullTimestamp(ts) {
  if (!ts) return null
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts)
  if (isNaN(date.getTime())) return null
  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${datePart} • ${timePart}`
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

function formatOrderNumber(num) {
  if (num === null || num === undefined) return null
  return `Order #${String(num).padStart(4, '0')}`
}

function getProgressColor(percent) {
  const clamped = Math.max(0, Math.min(100, percent))
  const hue = 38 + (142 - 38) * (clamped / 100)
  return `hsl(${hue}, 72%, 45%)`
}

const STATUS_HINTS = {
  pending: 'Move the stage to Measurement Taken or Fabric Ready to unlock this status.',
  in_progress: 'Move the stage to a work stage like Cutting, Sewing, or Fitting to unlock this status.',
  completed: 'Move the stage to Ready to unlock this status.',
  delivered: 'Move the stage to Ready to unlock this status.',
}

const STATUS_CHIP = {
  pending: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.4)' },
  in_progress: { color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.4)' },
  completed: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.4)' },
  delivered: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.4)' },
  cancelled: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)' },
}

const PRIORITY_CHIP = {
  normal: { label: 'Normal', color: 'var(--text2)', bg: 'var(--surface2)', border: 'var(--border2)', icon: null },
  urgent: { label: 'Urgent', color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.4)', icon: 'priority_high' },
  vip: { label: 'VIP', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.4)', icon: 'star' },
}

const STATUS_ICON = {
  pending: 'schedule',
  in_progress: 'autorenew',
  completed: 'check_circle',
  delivered: 'local_shipping',
  cancelled: 'cancel',
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
  const [statusHint, setStatusHint] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showStageSheet, setShowStageSheet] = useState(false)
  const [showStatusSheet, setShowStatusSheet] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(false)
  const [pendingStage, setPendingStage] = useState(false)
  const [pendingPriority, setPendingPriority] = useState(false)
  const [brokenImages, setBrokenImages] = useState(() => new Set())
  const priorityRef = useRef(null)

  useEffect(() => {
    setLocal(order)
    setHint(null)
    setStatusHint(null)
    setConfirmDelete(false)
    setShowStageSheet(false)
    setShowStatusSheet(false)
    setShowPriorityMenu(false)
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
    if (!showPriorityMenu) return
    function handleClickOutside(e) {
      if (priorityRef.current && !priorityRef.current.contains(e.target)) {
        setShowPriorityMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showPriorityMenu])

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
  const stageHistory = local.stageHistory || {}
  const stageIndex = ORDER_STAGES.findIndex(s => s.value === local.stage)
  const stageObj = ORDER_STAGES.find(s => s.value === local.stage)
  const progressPercent = stageIndex >= 0 ? Math.round(((stageIndex + 1) / ORDER_STAGES.length) * 100) : 0
  const progressColor = getProgressColor(progressPercent)
  const stageUpdatedLabel = formatFullTimestamp(local.updatedAt)
  const statusMeta = STATUS_CHIP[local.status] || STATUS_CHIP.pending
  const stageBadgeStyle = stageObj
    ? { background: 'var(--surface2)', color: 'var(--accent)', border: '1px solid var(--border2)' }
    : { background: 'var(--surface2)', color: 'var(--text3)', border: '1px solid var(--border2)' }
  const priorityValue = local.priority ?? 'normal'
  const priorityMeta = PRIORITY_CHIP[priorityValue]
  const showCustomer = local.customerName && !hideCustomerName
  const orderTitle = local.desc || local.name || 'Order'
  const orderNumberLabel = formatOrderNumber(local.orderNumber)

  const statusTimestampLabel = formatFullTimestamp(local.updatedAt)
  const statusVerb = local.status === 'completed' ? 'Completed on'
    : local.status === 'delivered' ? 'Delivered on'
    : local.status === 'cancelled' ? 'Cancelled on'
    : local.status === 'in_progress' ? 'Started on'
    : 'Updated on'

  async function handleStatusClick(value) {
    if (pendingStatus) return

    if (local.status === value) {
      setStatusHint(null)
      setShowStatusSheet(false)
      return
    }

    if (!isStatusAllowed(value, local.stage)) {
      setStatusHint(STATUS_HINTS[value] ?? null)
      return
    }

    setStatusHint(null)
    const prevStatus = local.status
    setLocal(p => ({ ...p, status: value }))
    setPendingStatus(true)
    setShowStatusSheet(false)

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
    const prevHistory = local.stageHistory

    setLocal(p => ({
      ...p,
      stage: stageValue,
      stageHistory: { ...(p.stageHistory || {}), [stageValue]: new Date() },
      ...(autoStatus ? { status: autoStatus } : {}),
    }))
    setPendingStage(true)
    setShowStageSheet(false)

    try {
      await updateOrderStage(local.customerId, local.id, stageValue)
      if (autoStatus) {
        await updateOrderStatus(local.customerId, local.id, autoStatus)
      }
      showToast?.('Stage updated')
    } catch {
      setLocal(p => ({ ...p, stage: prevStage, status: prevStatus, stageHistory: prevHistory }))
      showToast?.('Failed to update stage')
    } finally {
      setPendingStage(false)
    }
  }

  async function handlePriority(priority) {
    if (pendingPriority || priorityValue === priority) {
      setShowPriorityMenu(false)
      return
    }
    const prev = local.priority
    setLocal(p => ({ ...p, priority }))
    setPendingPriority(true)
    setShowPriorityMenu(false)
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

  function openStageSheet() {
    setShowStageSheet(true)
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
        title="Order Details"
        onBackClick={close}
        backIcon={fullHeight ? 'arrow_back_ios' : 'close'}
        customActions={[
          { icon: 'delete', onClick: () => setConfirmDelete(true), color: 'var(--danger)', outlined: true },
        ]}
      />

      <div className={styles.body}>

        <div className={styles.detailTitle}>{orderTitle}</div>

        <div className={styles.dualColumnRow}>
          <div className={styles.dualColumn}>
            <div className={styles.chipLabel}>Priority</div>
            <div className={styles.priorityDropdown} ref={priorityRef}>
          <button
            type="button"
            className={styles.priorityTrigger}
            disabled={pendingPriority}
            onClick={() => setShowPriorityMenu(v => !v)}
            style={{ background: priorityMeta.bg, borderColor: priorityMeta.border }}
          >
            <span className={styles.priorityTriggerLeft}>
              {priorityMeta.icon && (
                <span className="mi" style={{ fontSize: '0.9rem', color: priorityMeta.color }}>{priorityMeta.icon}</span>
              )}
              <span style={{ color: priorityMeta.color }}>{priorityMeta.label}</span>
            </span>
            <span
              className="mi"
              style={{
                fontSize: '1.1rem',
                color: priorityMeta.color,
                opacity: 0.7,
                transform: showPriorityMenu ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            >
              expand_more
            </span>
          </button>

          {showPriorityMenu && (
            <div className={styles.priorityMenu}>
              {['normal', 'urgent', 'vip'].map(p => {
                const meta = PRIORITY_CHIP[p]
                const isActive = priorityValue === p
                return (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.priorityMenuItem} ${isActive ? styles.priorityMenuItemActive : ''}`}
                    onClick={() => handlePriority(p)}
                  >
                    {meta.icon
                      ? <span className="mi" style={{ fontSize: '0.9rem', color: meta.color }}>{meta.icon}</span>
                      : <span className={styles.priorityMenuItemDot} />}
                    <span style={{ color: isActive ? meta.color : 'var(--text)' }}>{meta.label}</span>
                    {isActive && <span className="mi" style={{ marginLeft: 'auto', fontSize: '1rem', color: meta.color }}>check</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        </div>

        {orderNumberLabel && (
          <div className={`${styles.dualColumn} ${styles.dualColumnRight}`}>
            <div className={styles.chipLabel}>Order No.</div>
            <div className={styles.orderNumberBold}>{orderNumberLabel}</div>
          </div>
        )}
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Placed</div>
            <div className={styles.infoGridValue}>{placedOn || '—'}</div>
          </div>
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Due</div>
            <div className={`${styles.infoGridValue} ${styles.overdueText}`}>
              {local.due || '—'}
            </div>
            {dueTag && <div className={styles.infoGridSub}>{dueTag}</div>}
          </div>
        </div>

        <div className={styles.stateGroup}>
          <button
            type="button"
            className={styles.premiumCard}
            onClick={() => { setStatusHint(null); setShowStatusSheet(true) }}
            disabled={pendingStatus}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Status</span>
              {pendingStatus
                ? <span className={`mi ${styles.spinIcon}`} style={{ fontSize: '1.05rem', color: 'var(--text3)' }}>progress_activity</span>
                : <span className={`mi ${styles.chevronIcon}`} style={{ fontSize: '1.05rem', color: 'var(--text3)' }}>chevron_right</span>
              }
            </div>
            <div className={styles.cardMainRow}>
              <div className={styles.cardIconBadge} style={{ background: statusMeta.bg, color: statusMeta.color, border: `1px solid ${statusMeta.border}` }}>
                <span className="mi" style={{ fontSize: '1.15rem' }}>{STATUS_ICON[local.status] || 'schedule'}</span>
              </div>
              <div className={styles.cardValue} style={{ color: statusMeta.color }}>
                {ORDER_STATUS_LABELS[local.status] || 'Pending'}
              </div>
            </div>
            {statusTimestampLabel && (
              <div className={styles.cardFooter}>
                <span className="mi" style={{ fontSize: '0.82rem' }}>schedule</span>
                <span>{statusVerb} {statusTimestampLabel}</span>
              </div>
            )}
          </button>

          <button
            type="button"
            className={styles.premiumCard}
            onClick={openStageSheet}
            disabled={pendingStage}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Production Progress</span>
              <div className={styles.cardHeaderRight}>
                <span className={styles.cardPercent} style={{ color: progressColor }}>{progressPercent}%</span>
                {pendingStage
                  ? <span className={`mi ${styles.spinIcon}`} style={{ fontSize: '1.05rem', color: 'var(--text3)' }}>progress_activity</span>
                  : <span className={`mi ${styles.chevronIcon}`} style={{ fontSize: '1.05rem', color: 'var(--text3)' }}>chevron_right</span>
                }
              </div>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progressPercent}%`, backgroundColor: progressColor }} />
            </div>
            <div className={styles.cardMainRow}>
              <div className={styles.cardIconBadge} style={stageBadgeStyle}>
                <span className="mi" style={{ fontSize: '1.15rem' }}>{stageObj?.icon || 'timeline'}</span>
              </div>
              <div className={styles.cardValue}>{stageObj ? stageObj.label : 'Not started'}</div>
            </div>
            {stageUpdatedLabel && (
              <div className={styles.cardFooter}>
                <span className="mi" style={{ fontSize: '0.82rem' }}>schedule</span>
                <span>Updated on {stageUpdatedLabel}</span>
              </div>
            )}
          </button>
        </div>

        {showCustomer && (
          <button
            type="button"
            className={styles.sectionCardBtn}
            onClick={() => { onGoToCustomer && (close(), onGoToCustomer(local.customerId)) }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Customer</span>
              <span className={`mi ${styles.chevronIcon}`} style={{ fontSize: '1.05rem', color: 'var(--text3)' }}>chevron_right</span>
            </div>
            <div className={styles.linkedRow}>
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
            </div>
          </button>
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
            <div className={styles.sectionCardLabel}>
              <span className={`mi ${styles.sectionIcon}`}>sticky_note_2</span>
              Notes
            </div>
            <p className={styles.notesText}>{local.notes}</p>
          </div>
        )}

        {hint === 'review' && (
          <div className={styles.footerHintCard}>
            <span className="mi" style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>info</span>
            Review links can only be sent once the order is Completed or Delivered.
          </div>
        )}

        <div className={styles.footerButtons}>
          <button
            className={`${styles.btnSecondary} ${!canReview ? styles.btnSecondary_disabled : ''}`}
            onClick={handleReviewClick}
          >
            <span className="mi" style={{ fontSize: '1rem' }}>share</span>
            Share review link via WhatsApp
          </button>
          {onGenerateInvoice && (
            <button className={styles.btnPrimary} onClick={() => { close(); onGenerateInvoice(local.id) }}>
              <span className="mi" style={{ fontSize: '1.05rem' }}>receipt_long</span>
              Generate invoice
            </button>
          )}
        </div>

      </div>

      {showStatusSheet && (
        <div className={styles.stageSheetOverlay} onClick={() => { setShowStatusSheet(false); setStatusHint(null) }}>
          <div className={styles.stageSheetPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.handle} />
            <div className={styles.stageSheetTitle}>Change status</div>
            <div className={`${styles.statusHintBanner} ${statusHint ? styles.statusHintBannerOpen : ''}`}>
              <span className="mi" style={{ fontSize: '0.95rem', flexShrink: 0, marginTop: 1 }}>info</span>
              <span>{statusHint}</span>
            </div>
            <div className={styles.stageSheetList}>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => {
                const isActive = local.status === value
                const locked = !isStatusAllowed(value, local.stage)
                const meta = STATUS_CHIP[value]
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={pendingStatus}
                    className={`${styles.stageSheetRow} ${isActive ? styles.stageSheetRowActive : ''}`}
                    onClick={() => handleStatusClick(value)}
                  >
                    <div className={styles.sheetRowLeft}>
                      <div
                        className={styles.rowIconSmall}
                        style={locked && !isActive
                          ? { background: 'var(--surface2)', color: 'var(--text3)' }
                          : { background: meta.bg, color: meta.color }}
                      >
                        <span className="mi" style={{ fontSize: '0.92rem' }}>{STATUS_ICON[value]}</span>
                      </div>
                      <span
                        className={styles.stageSheetRowLabel}
                        style={locked && !isActive ? { color: 'var(--text3)' } : {}}
                      >
                        {label}
                      </span>
                    </div>
                    {isActive
                      ? <span className={styles.stageSheetCurrent}>Current</span>
                      : locked
                        ? <span className={`mi ${styles.lockIcon}`}>lock</span>
                        : null}
                  </button>
                )
              })}
            </div>
            <div className={styles.stageSheetFootnote}>
              <span className="mi" style={{ fontSize: '0.85rem', flexShrink: 0 }}>sync</span>
              Status updates automatically as you move through order stages
            </div>
          </div>
        </div>
      )}

      {showStageSheet && (
        <div className={styles.stageSheetOverlay} onClick={() => setShowStageSheet(false)}>
          <div className={styles.stageSheetPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.handle} />
            <div className={styles.stageSheetTitle}>Update Stage</div>
            <div className={styles.stageSheetSubtitle}>Tap a stage to update instantly</div>
            <div className={`${styles.stageSheetList} ${styles.timelineList}`}>
              {ORDER_STAGES.map((s, idx) => {
                const isDone = stageIndex >= 0 && idx < stageIndex
                const isCurrent = s.value === local.stage
                const timestamp = formatStageTimestamp(stageHistory[s.value])
                const isLast = idx === ORDER_STAGES.length - 1
                return (
                  <button
                    key={s.value}
                    type="button"
                    disabled={pendingStage}
                    className={styles.timelineRow}
                    onClick={() => handleStageChange(s.value)}
                  >
                    <div className={styles.timelineIndicatorCol}>
                      <span
                        className="mi"
                        style={{
                          fontSize: '1.2rem',
                          color: isDone ? '#22c55e' : isCurrent ? 'var(--accent)' : 'var(--text3)',
                        }}
                      >
                        {isDone ? 'check_circle' : isCurrent ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      {!isLast && <span className={styles.timelineLine} />}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineLabel}>{s.label}</div>
                      <div className={styles.timelineMeta}>
                        {timestamp ? timestamp : isCurrent ? 'Current stage' : 'Upcoming'}
                      </div>
                    </div>
                    {isCurrent && <span className={styles.stageSheetCurrent}>Current</span>}
                    {!isCurrent && isDone && <span className={styles.timelineBadgeDone}>Completed</span>}
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