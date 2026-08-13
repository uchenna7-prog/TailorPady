import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../../contexts/OrdersContext'
import { useInvoices } from '../../contexts/InvoiceContext'
import { useUsage } from '../../contexts/UsageContext'
import { useAuth } from '../../contexts/AuthContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { useTour } from '../../contexts/TourContext'
import { db } from '../../firebase'
import { saveReviewOrderSnapshot } from '../../services/reviewService'
import {
  ORDER_STATUS_LABELS,
  ORDER_STAGES,
  ORDER_STAGE_AUTO_STATUS,
} from '../../datas/orderDatas'
import Header from '../Header/Header'
import ConfirmSheet from '../ConfirmSheet/ConfirmSheet'
import { UpgradeSheet } from '../UpgradeSheet/UpgradeSheet'
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
  return `ORD-${String(num).padStart(4, '0')}`
}

function buildReviewMessage({ customerName, orderTitle, brandName, url }) {
  const name = customerName || 'there'
  const isGenericOrder = !orderTitle || orderTitle === 'Order' || orderTitle === 'New Order'
  const orderPart = isGenericOrder ? 'your recent order' : `your order "${orderTitle}"`
  const fromPart = brandName ? `from ${brandName}` : 'from us'

  return (
    `Hi ${name}! ${orderPart} ${fromPart} is complete 🎉\n\n` +
    `Would you mind leaving a quick review? It really helps us out and takes less than a minute.\n\n` +
    `Tap the link below to leave your review:\n${url}\n\n` +
    `Thanks so much for trusting us with your outfit 🙏`
  )
}

const DONUT_CIRCUMFERENCE = 2 * Math.PI * 26

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

const CANCELLABLE_STATUSES = ['pending', 'in_progress']

export default function OrderDetailModal({
  order,
  onClose,
  onGoToCustomer,
  onGenerateInvoice,
  onViewInvoice,
  fullHeight = false,
  noBlur = false,
  hideCustomerName = false,
  showToast,
}) {
  const navigate = useNavigate()
  const { updateOrderStatus, updateOrder, deleteOrder } = useOrders()
  const { allInvoices } = useInvoices()
  const { limits, hasReachedLimit, recordUsage } = useUsage()
  const { user } = useAuth()
  const { profileSettings } = useProfileSettings()
  const { suppressNextPopState } = useTour()

  const [local, setLocal] = useState(order)
  const [hint, setHint] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showStageSheet, setShowStageSheet] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('invoice')
  const [pendingCancel, setPendingCancel] = useState(false)
  const [pendingPriority, setPendingPriority] = useState(false)
  const [brokenImages, setBrokenImages] = useState(() => new Set())
  const priorityRef = useRef(null)

  useEffect(() => {
    setLocal(order)
    setHint(null)
    setConfirmDelete(false)
    setShowStageSheet(false)
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
    if (fullHeight) {
      suppressNextPopState()
      window.history.back()
    } else {
      onClose()
    }
  }

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
  const reviewSharedLabel = formatFullTimestamp(local.reviewSharedAt)
  const linkedInvoice = allInvoices?.find(inv => String(inv.orderId) === String(local.id))
  const hasInvoice = Boolean(linkedInvoice)
  const isCancelled = local.status === 'cancelled'
  const canCancel = CANCELLABLE_STATUSES.includes(local.status) || isCancelled
  const stageHistory = local.stageHistory || {}
  const stageIndex = ORDER_STAGES.findIndex(s => s.value === local.stage)
  const stageObj = ORDER_STAGES.find(s => s.value === local.stage)
  const progressPercent = stageIndex >= 0 ? Math.round(((stageIndex + 1) / ORDER_STAGES.length) * 100) : 0
  const stageUpdatedLabel = formatFullTimestamp(local.updatedAt)
  const statusMeta = STATUS_CHIP[local.status] || STATUS_CHIP.pending
  const progressColor = statusMeta.color
  const priorityValue = local.priority ?? 'normal'
  const priorityMeta = PRIORITY_CHIP[priorityValue]
  const showCustomer = local.customerName && !hideCustomerName
  const orderTitle = local.desc || local.name || 'Order'
  const orderNumberLabel = formatOrderNumber(local.orderNumber)

  function buildStageHistoryPatch(prevHistory, stageValue) {
    const targetIndex = ORDER_STAGES.findIndex(s => s.value === stageValue)
    const now = new Date()
    const patch = {}
    const nextHistory = { ...(prevHistory || {}) }
    ORDER_STAGES.forEach((s, idx) => {
      if (idx <= targetIndex && !nextHistory[s.value]) {
        nextHistory[s.value] = now
        patch[`stageHistory.${s.value}`] = now
      }
    })
    nextHistory[stageValue] = now
    patch[`stageHistory.${stageValue}`] = now
    return { nextHistory, patch }
  }

  function handleStageChange(stageValue) {
    if (local.stage === stageValue) {
      setShowStageSheet(false)
      return
    }

    setHint(null)
    const autoStatus = ORDER_STAGE_AUTO_STATUS[stageValue] ?? null

    const prevStage = local.stage
    const prevStatus = local.status
    const prevHistory = local.stageHistory
    const { nextHistory, patch } = buildStageHistoryPatch(prevHistory, stageValue)

    setLocal(p => ({
      ...p,
      stage: stageValue,
      stageHistory: nextHistory,
      ...(autoStatus ? { status: autoStatus } : {}),
    }))
    setShowStageSheet(false)

    updateOrder(local.customerId, local.id, {
      stage: stageValue,
      ...(autoStatus ? { status: autoStatus } : {}),
      ...patch,
    })
      .then(() => showToast?.('Stage updated'))
      .catch(() => {
        setLocal(p => ({ ...p, stage: prevStage, status: prevStatus, stageHistory: prevHistory }))
        showToast?.('Failed to update stage')
      })
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

  async function handleCancelOrder() {
    if (pendingCancel) return
    const prevStatus = local.status
    const nextStatus = isCancelled ? (ORDER_STAGE_AUTO_STATUS[local.stage] || 'pending') : 'cancelled'
    setLocal(p => ({ ...p, status: nextStatus }))
    setPendingCancel(true)
    try {
      await updateOrderStatus(local.customerId, local.id, nextStatus)
      showToast?.(isCancelled ? 'Order restored' : 'Order cancelled')
    } catch {
      setLocal(p => ({ ...p, status: prevStatus }))
      showToast?.(isCancelled ? 'Failed to restore order' : 'Failed to cancel order')
    } finally {
      setPendingCancel(false)
    }
  }

  function handleDelete() {
    close()
    deleteOrder(local.customerId, local.id).catch(() => {
      showToast?.('Failed to delete order')
    })
  }

  async function handleReviewClick() {
    if (!canReview) {
      setHint('review')
      return
    }
    setHint(null)

    let token = local.reviewToken

    if (!token) {
      if (hasReachedLimit('reviewLinksPerMonth', 'reviewLinksPerMonth')) {
        setUpgradeReason('review')
        setUpgradeOpen(true)
        return
      }

      token = crypto.randomUUID()
      setLocal(p => ({ ...p, reviewToken: token }))
      try {
        await updateOrder(local.customerId, local.id, { reviewToken: token })
        recordUsage('reviewLinksPerMonth').catch(() => {})
      } catch {
        showToast?.('Failed to create review link')
        return
      }
    }

    const snapshotItems = items.filter(i => i.imgSrc).map(i => ({ imgSrc: i.imgSrc }))
    saveReviewOrderSnapshot(db, user.uid, token, { items: snapshotItems, orderDesc: orderTitle }).catch(() => {})

    const url = `https://TailorPady.web.app/review/${user?.uid}/${token}`
    const message = buildReviewMessage({
      customerName: local.customerName,
      orderTitle,
      brandName: profileSettings?.brandName?.trim(),
      url,
    })
    const msg = encodeURIComponent(message)
    const raw = (local.customerPhone || '').replace(/[\s\-()]/g, '')
    const wa = raw.startsWith('+') ? raw.slice(1)
      : raw.startsWith('0') ? `234${raw.slice(1)}` : raw
    window.open(wa ? `https://wa.me/${wa}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer')

    const sharedAt = new Date()
    setLocal(p => ({ ...p, reviewSharedAt: sharedAt }))
    updateOrder(local.customerId, local.id, { reviewSharedAt: sharedAt }).catch(() => {})
  }

  function openStageSheet() {
    setShowStageSheet(true)
  }

  function handleGenerateInvoiceClick() {
    if (hasInvoice) {
      close()
      onViewInvoice?.(linkedInvoice.id)
      return
    }
    try {
      onGenerateInvoice?.(local.id)
      close()
    } catch (err) {
      if (err?.code === 'limit-reached') {
        setUpgradeReason('invoice')
        setUpgradeOpen(true)
      } else {
        showToast?.('Failed to generate invoice')
      }
    }
  }

  function handleUpgrade() {
    setUpgradeOpen(false)
    navigate('/account', { state: { autoOpenModal: 'upgrade', upgradeTab: 'monthly' } })
  }

  const upgradeSheetContent = upgradeReason === 'review'
    ? {
        icon: 'star_rate',
        title: 'Review link limit reached',
        message: `You've hit the free plan limit of ${limits.reviewLinksPerMonth} review links this month. Upgrade to Premium for unlimited review links.`,
      }
    : {
        icon: 'description',
        title: 'Invoice limit reached',
        message: `You've hit the free plan limit of ${limits.invoicesPerMonth} invoices this month. Upgrade to Premium for unlimited invoices.`,
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

      {fullHeight ? (
        <Header
          type="back"
          showBorderBottom={false}
          title={orderNumberLabel || 'Order Details'}
          onBackClick={close}
          backIcon="arrow_back_ios"
          customActions={[
            { icon: 'delete', onClick: () => setConfirmDelete(true), color: 'var(--danger)', outlined: true },
          ]}
        />
      ) : (
        <div className={styles.header}>
          <button className={styles.headerCloseBtn} onClick={close}>
            <span className="mi" style={{ fontSize: '1.35rem' }}>close</span>
          </button>
          <div className={styles.headerTitle}>Order Details</div>
          <button className={styles.headerDelete} onClick={() => setConfirmDelete(true)}>
            <span className="mi" style={{ fontSize: '1.1rem' }}>delete_outline</span>
          </button>
        </div>
      )}

      <div className={styles.body}>

        <div className={styles.detailTitle}>{orderTitle}</div>

        <div className={styles.priorityRow}>
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

        <div className={styles.infoGrid}>
          {orderNumberLabel && (
            <div className={styles.infoGridCell}>
              <div className={styles.infoGridLabel}>Order No</div>
              <div className={styles.infoGridValue}>{orderNumberLabel}</div>
            </div>
          )}
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Status</div>
            <div className={styles.infoGridValue} style={{ color: statusMeta.color }}>
              {ORDER_STATUS_LABELS[local.status] || 'Pending'}
            </div>
          </div>
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
            onClick={openStageSheet}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Production Progress</span>
              <span className={`mi ${styles.chevronIcon}`} style={{ fontSize: '1.05rem', color: 'var(--text3)' }}>chevron_right</span>
            </div>
            <div className={styles.donutRow}>
              <div className={styles.donutContent}>
                <div className={styles.cardValueRow}>
                  {stageObj?.icon && (
                    <span className="mi" style={{ fontSize: '1.05rem', color: 'var(--text)' }}>{stageObj.icon}</span>
                  )}
                  <div className={styles.cardValue}>{stageObj ? stageObj.label : 'Not started'}</div>
                </div>
                {stageUpdatedLabel && (
                  <div className={styles.donutMeta}>
                    <span className="mi" style={{ fontSize: '0.82rem' }}>schedule</span>
                    <span>Updated on {stageUpdatedLabel}</span>
                  </div>
                )}
              </div>
              <div className={styles.donutWrap}>
                <svg viewBox="0 0 64 64" className={styles.donutSvg}>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface2)" strokeWidth="7" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke={progressColor}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={DONUT_CIRCUMFERENCE}
                    strokeDashoffset={DONUT_CIRCUMFERENCE - (progressPercent / 100) * DONUT_CIRCUMFERENCE}
                    transform="rotate(-90 32 32)"
                    className={styles.donutProgress}
                  />
                </svg>
                <span className={styles.donutLabel} style={{ color: progressColor }}>{progressPercent}%</span>
              </div>
            </div>
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
            {reviewSharedLabel ? 'Share review link again' : 'Share review link via WhatsApp'}
          </button>
          {reviewSharedLabel && (
            <div className={styles.footerMetaText}>Last shared {reviewSharedLabel}</div>
          )}
          {canCancel && (
            <button
              className={isCancelled ? styles.btnRestore : styles.btnDanger}
              disabled={pendingCancel}
              onClick={handleCancelOrder}
            >
              <span className="mi" style={{ fontSize: '1.05rem' }}>{isCancelled ? 'undo' : 'cancel'}</span>
              {isCancelled ? 'Restore order' : 'Cancel order'}
            </button>
          )}
          {(onGenerateInvoice || onViewInvoice) && (
            <button
              className={styles.btnPrimary}
              onClick={handleGenerateInvoiceClick}
            >
              <span className="mi" style={{ fontSize: '1.05rem' }}>receipt_long</span>
              {hasInvoice ? 'View invoice' : 'Generate invoice'}
            </button>
          )}
        </div>

      </div>

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

      <UpgradeSheet
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgrade}
        icon={upgradeSheetContent.icon}
        title={upgradeSheetContent.title}
        message={upgradeSheetContent.message}
      />
    </div>
  )

  if (fullHeight) {
    return (
      <div
        className={styles.fullHeightBackdrop}
        onClick={e => e.target === e.currentTarget && close()}
      >
        {panel}
      </div>
    )
  }

  return (
    <div
      className={`${styles.overlay} ${noBlur ? styles.overlayNoBlur : ''}`}
      onClick={e => e.target === e.currentTarget && close()}
    >
      {panel}
    </div>
  )
}
