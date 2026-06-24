import styles from './OrderDetailsModal.module.css'
import { useState } from 'react'
import {
  ORDER_STAGES,
  ORDER_STATUS_LABELS,
  ORDER_STAGE_AUTO_STATUS,
  PRIORITY_BANNER_CONFIG,
  ORDER_STATUS_CORRESPONDING_STAGES,
} from '../../../../../../datas/orderDatas'
import { formatFirestoreDate } from '../../utils'
import Header from '../../../../../../components/Header/Header'


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


export function OrderDetailsModal({
  order,
  measurements,
  onClose,
  onDelete,
  onStatusChange,
  onStageChange,
  onGenerateInvoice,
  onShareReviewLink,
  showToast,
}) {
  const [hint,        setHint]        = useState(null)
  const [localStage,  setLocalStage]  = useState(order?.stage  ?? null)
  const [localStatus, setLocalStatus] = useState(order?.status ?? 'pending')

  if (!order) return null

  const priorityBanner = PRIORITY_BANNER_CONFIG[order.priority] ?? PRIORITY_BANNER_CONFIG.normal
  const placedOnDate   = order.takenAt || order.date || formatFirestoreDate(order.createdAt)
  const currentStage   = ORDER_STAGES.find(s => s.value === localStage)

  const subtotal       = Number(order.price          || 0)
  const shippingFee    = Number(order.shippingFee    || 0)
  const discountAmount = Number(order.discountAmount || 0)
  const taxAmount      = Number(order.taxAmount      || 0)
  const taxRate        = Number(order.taxRate        || 0)
  const totalAmount    = Number(order.totalAmount    || subtotal)

  const hasCharges      = shippingFee > 0 || discountAmount > 0 || taxAmount > 0
  const taxPercentLabel = taxRate > 0 ? `${taxRate}%` : null
  const discountLabel   = order.discountType === 'percent' && order.discountValue > 0
    ? `${order.discountValue}% off`
    : null

  const statusLabel   = ORDER_STATUS_LABELS[localStatus] ?? ORDER_STATUS_LABELS.pending
  const canReview     = localStatus === 'completed' || localStatus === 'delivered'
  const stageIndex    = ORDER_STAGES.findIndex(s => s.value === localStage)
  const stageProgress = localStage ? ((stageIndex + 1) / ORDER_STAGES.length) * 100 : 0


  async function handleStatusClick(value) {
    if (localStatus === value) return

    if (!isStatusAllowed(value, localStage)) {
      setHint(STATUS_HINTS[value] ?? null)
      return
    }

    setHint(null)
    const prevStatus = localStatus
    setLocalStatus(value)

    try {
      await onStatusChange(order.id, value)
    } catch {
      setLocalStatus(prevStatus)
      showToast?.('Failed to update status')
    }
  }

  async function handleStageChange(value) {
    setHint(null)
    const newStage   = localStage === value ? null : value
    const autoStatus = newStage ? ORDER_STAGE_AUTO_STATUS[newStage] : null

    const prevStage  = localStage
    const prevStatus = localStatus

    setLocalStage(newStage)
    if (autoStatus) setLocalStatus(autoStatus)

    try {
      await onStageChange(order.id, newStage)
    } catch {
      setLocalStage(prevStage)
      setLocalStatus(prevStatus)
      showToast?.('Failed to update stage')
    }
  }

  function handleReviewClick() {
    if (!canReview) {
      setHint('review')
      return
    }
    setHint(null)
    onShareReviewLink({ ...order, stage: localStage, status: localStatus })
  }

  return (
    <div
      className={`${styles.detailPanel} ${styles.detailPanel_open}`}
      onTouchStart={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
      <Header
        type="back"
        title={order.desc}
        onBackClick={onClose}
        customActions={[
          { icon: 'delete_outline', onClick: onDelete, color: 'var(--danger)' },
        ]}
      />

      <div className={styles.detailScrollBody}>

        <span className={`${styles.priorityBanner} ${styles[priorityBanner.className]}`}>
          {priorityBanner.label}
        </span>

        <div className={styles.infoGrid}>
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Grand Total</div>
            <div className={styles.infoGridValue}>₦{totalAmount.toLocaleString()}</div>
          </div>
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Status</div>
            <div className={styles.infoGridValue} style={{ textTransform: 'capitalize' }}>
              {statusLabel}
            </div>
          </div>
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Current Stage</div>
            <div className={styles.infoGridValue} style={{ fontSize: '0.85rem' }}>
              {currentStage ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="mi" style={{ fontSize: '1rem' }}>{currentStage.icon}</span>
                  {currentStage.label}
                </span>
              ) : (
                <span style={{ color: 'var(--text3)', fontWeight: 500, fontSize: '0.8rem' }}>Not set</span>
              )}
            </div>
          </div>
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Due</div>
            <div
              className={styles.infoGridValue}
              style={{ fontSize: '0.85rem', color: order.due ? 'var(--danger)' : 'var(--text3)' }}
            >
              {order.due || '—'}
            </div>
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionCardLabel}>Selected Garments</div>
            {order.items.map((item, index) => (
              <div key={index} className={styles.garmentRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className={styles.garmentThumb}>
                    {item.imgSrc
                      ? <img src={item.imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span className="mi">checkroom</span>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.name}</div>
                    {item.qty > 1 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 600 }}>
                        {item.qty} pcs × ₦{Number(item.price || 0).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent)' }}>
                  ₦{((item.qty ?? 1) * Number(item.price || 0)).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasCharges && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionCardLabel}>Discount &amp; Charges</div>

            <div className={styles.detailChargeRow}>
              <span className={styles.detailChargeLabel}>Subtotal</span>
              <span className={styles.detailChargeValue}>₦{subtotal.toLocaleString()}</span>
            </div>

            {discountAmount > 0 && (
              <div className={styles.detailChargeRow}>
                <span className={styles.detailChargeLabel}>
                  <span className="mi" style={{ fontSize: '0.85rem', verticalAlign: 'middle', marginRight: 4 }}>sell</span>
                  Discount{discountLabel ? ` (${discountLabel})` : ''}
                </span>
                <span className={`${styles.detailChargeValue} ${styles.detailChargeValue_discount}`}>
                  −₦{discountAmount.toLocaleString()}
                </span>
              </div>
            )}

            {shippingFee > 0 && (
              <div className={styles.detailChargeRow}>
                <span className={styles.detailChargeLabel}>
                  <span className="mi" style={{ fontSize: '0.85rem', verticalAlign: 'middle', marginRight: 4 }}>local_shipping</span>
                  Shipping
                </span>
                <span className={styles.detailChargeValue}>₦{shippingFee.toLocaleString()}</span>
              </div>
            )}

            {taxAmount > 0 && (
              <div className={styles.detailChargeRow}>
                <span className={styles.detailChargeLabel}>
                  <span className="mi" style={{ fontSize: '0.85rem', verticalAlign: 'middle', marginRight: 4 }}>receipt</span>
                  Tax{taxPercentLabel ? ` (${taxPercentLabel} VAT)` : ''}
                </span>
                <span className={styles.detailChargeValue}>₦{taxAmount.toLocaleString()}</span>
              </div>
            )}

            <div className={styles.detailChargeDivider} />

            <div className={styles.detailChargeTotalRow}>
              <span>Grand Total</span>
              <span>₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {order.notes && (
          <div className={styles.notesCard}>
            <div className={styles.sectionCardLabel}>Notes</div>
            <p>{order.notes}</p>
          </div>
        )}

        <div className={styles.sectionCard} style={{ marginTop: 16 }}>
          <div className={styles.sectionCardLabel}>
            Change Stage
            {localStage && (
              <span style={{ float: 'right', color: 'var(--text2)', fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
                {stageIndex + 1} / {ORDER_STAGES.length}
              </span>
            )}
          </div>

          <div className={styles.stageProgressTrack}>
            <div
              className={styles.stageProgressFill}
              style={{ width: `${stageProgress}%` }}
            />
          </div>

          <div className={styles.stageChipRow}>
            {ORDER_STAGES.map((stageItem, idx) => (
              <button
                key={stageItem.value}
                className={`${styles.stageChip} ${localStage === stageItem.value ? styles.stageChip_active : ''} ${idx < stageIndex ? styles.stageChip_done : ''}`}
                onClick={() => handleStageChange(stageItem.value)}
              >
                <span className="mi" style={{ fontSize: '0.85rem' }}>{stageItem.icon}</span>
                {stageItem.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionCardLabel}>Change Status</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => {
              const allowed  = isStatusAllowed(value, localStage)
              const isActive = localStatus === value
              return (
                <button
                  key={value}
                  className={`${styles.statusButton} ${isActive ? styles.statusButton_active : ''} ${!allowed ? styles.statusButton_disabled : ''}`}
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

        <button
          className={`${styles.shareReviewButton} ${!canReview ? styles.shareReviewButton_disabled : ''}`}
          onClick={handleReviewClick}
        >
          <span className="mi" style={{ fontSize: '1.15rem',textTransform: "lowercase"}}>rate_review</span>
          Share Review Link via WhatsApp
          <span className="mi" style={{ fontSize: '1rem', marginLeft: 'auto',textTransform: "lowercase" }}>open_in_new</span>
        </button>

        {hint === 'review' && (
          <div className={styles.hintBox} style={{ marginTop: -8, marginBottom: 16 }}>
            <span className="mi" style={{ fontSize: '0.9rem', flexShrink: 0 }}>info</span>
            Review links can only be sent once the order is marked as Completed or Delivered.
          </div>
        )}

        <button
          className={styles.generateInvoiceButton}
          onClick={() => onGenerateInvoice(order.id)}
          style={{ marginTop: 4 }}
        >
          <span className="mi" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: 6,textTransform: "lowercase" }}>receipt_long</span>
          Generate Invoice
        </button>

        <div className={styles.detailFooterDates}>
          Order Taken: {placedOnDate}
          {order.due && <> &nbsp;•&nbsp; Due: {order.due}</>}
          &nbsp;•&nbsp; Qty: {order.qty}
        </div>

      </div>
    </div>
  )
}
