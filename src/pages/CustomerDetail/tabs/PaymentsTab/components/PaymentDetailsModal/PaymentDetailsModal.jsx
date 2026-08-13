import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AddInstallmentModal } from "../AddInstallmentModal/AddInstallmentModal"
import { getTotalPaid, getProgressPercent, capitalise } from "../../utils"
import { formatMoney, getCurrency } from "../../../../../../utils/moneyUtils"
import { PAYMENT_STATUSES } from "../../../../../../datas/paymentDatas"
import { useUsage } from "../../../../../../contexts/UsageContext"
import Header from "../../../../../../components/Header/Header"
import ConfirmSheet from "../../../../../../components/ConfirmSheet/ConfirmSheet"
import { UpgradeSheet } from "../../../../../../components/UpgradeSheet/UpgradeSheet"
import styles from "./PaymentDetailsModal.module.css"

const DONUT_CIRCUMFERENCE = 2 * Math.PI * 26


export function PaymentDetailsModal({
  payment,
  onClose,
  onDelete,
  onStatusChange,
  onAddInstallment,
  onGenerateReceipt,
  onViewReceipt,
  receipts = [],
}) {
  const navigate = useNavigate()
  const { limits } = useUsage()
  const [showInstallmentModal, setShowInstallmentModal] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const statusRef = useRef(null)

  useEffect(() => {
    if (!showStatusMenu) return
    function handleClickOutside(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setShowStatusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showStatusMenu])

  const installments = payment.installments || []
  const fullPrice = parseFloat(payment.orderPrice) || 0
  const totalPaid = getTotalPaid(installments)
  const isPaid = payment.status === 'paid'
  const isNowFullyPaid = fullPrice > 0 && totalPaid >= fullPrice
  const hasInstallments = installments.length > 0
  const progressPercent = Math.round(getProgressPercent(totalPaid, fullPrice, payment.status))
  const currency = getCurrency()
  const balanceLeft = Math.max(0, fullPrice - totalPaid)

  const receiptedInstallmentIds = new Set(
    receipts
      .filter(r => String(r.paymentId) === String(payment.id))
      .flatMap(r => r.installmentIds || [])
  )

  const effectiveStatusValue = isNowFullyPaid ? 'paid' : payment.status
  const activeStatusMeta = PAYMENT_STATUSES.find(s => s.value === effectiveStatusValue) || PAYMENT_STATUSES[0]

  function isStatusLocked(value) {
    if (!hasInstallments) return false
    return isNowFullyPaid ? value !== 'paid' : value !== 'part'
  }

  function handleStatusPick(value) {
    if (isStatusLocked(value) || value === effectiveStatusValue) {
      setShowStatusMenu(false)
      return
    }
    onStatusChange(payment.id, value)
    setShowStatusMenu(false)
  }

  function handleDeleteConfirm() {
    setConfirmDelete(false)
    onDelete(payment)
  }

  function handleGenerateReceiptClick(inst) {
    const result = onGenerateReceipt?.(payment, inst)
    if (result && !result.ok && result.reason === 'limit') {
      setUpgradeOpen(true)
    }
  }

  function handleUpgrade() {
    setUpgradeOpen(false)
    navigate('/account', { state: { autoOpenModal: 'upgrade', upgradeTab: 'monthly' } })
  }

  return (
    <div
      className={styles.backdrop}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className={styles.fullScreenModal}
        onTouchStart={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}
      >
        <Header
          type="back"
          title="Payment Details"
          onBackClick={onClose}
          backIcon="arrow_back_ios"
          customActions={[
            { icon: 'delete_outline', onClick: () => setConfirmDelete(true), color: 'var(--danger)' }
          ]}
        />

        <div className={styles.modalBody}>

          <div className={styles.statusRow}>
            <div className={styles.chipLabel}>Payment Status</div>
            <div className={styles.statusDropdown} ref={statusRef}>
              <button
                type="button"
                className={styles.statusTrigger}
                onClick={() => setShowStatusMenu(v => !v)}
                style={{ background: activeStatusMeta.background, borderColor: activeStatusMeta.borderColor }}
              >
                <span className={styles.statusTriggerLeft}>
                  <span className={styles.statusDot} style={{ background: activeStatusMeta.color }} />
                  <span style={{ color: activeStatusMeta.color }}>{activeStatusMeta.label}</span>
                </span>
                <span
                  className="mi"
                  style={{
                    fontSize: '1.1rem',
                    color: activeStatusMeta.color,
                    opacity: 0.7,
                    transform: showStatusMenu ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s',
                  }}
                >
                  expand_more
                </span>
              </button>

              {showStatusMenu && (
                <div className={styles.statusMenu}>
                  {PAYMENT_STATUSES.map(s => {
                    const isActive = effectiveStatusValue === s.value
                    const locked = isStatusLocked(s.value)
                    return (
                      <button
                        key={s.value}
                        type="button"
                        disabled={locked}
                        className={`${styles.statusMenuItem} ${isActive ? styles.statusMenuItemActive : ''} ${locked ? styles.statusMenuItemLocked : ''}`}
                        onClick={() => handleStatusPick(s.value)}
                      >
                        <span className={styles.statusDot} style={{ background: locked && !isActive ? 'var(--text3)' : s.color }} />
                        <span style={{ color: isActive ? s.color : locked ? 'var(--text3)' : 'var(--text)' }}>
                          {s.label}
                        </span>
                        {isActive && (
                          <span className="mi" style={{ marginLeft: 'auto', fontSize: '1rem', color: s.color }}>check</span>
                        )}
                        {locked && !isActive && (
                          <span className="mi" style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text3)' }}>lock</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoGridCell}>
              <div className={styles.infoGridLabel}>Order</div>
              <div className={styles.infoGridValue}>{payment.orderDesc || '—'}</div>
            </div>
            {fullPrice > 0 && (
              <div className={styles.infoGridCell}>
                <div className={styles.infoGridLabel}>Order Value</div>
                <div className={styles.infoGridValue}>{formatMoney(currency, fullPrice)}</div>
              </div>
            )}
            <div className={styles.infoGridCell}>
              <div className={styles.infoGridLabel}>Date Created</div>
              <div className={styles.infoGridValue}>{payment.date}</div>
            </div>
          </div>

          {payment.notes && (
            <div className={styles.detailSectionCard}>
              <div className={styles.detailSectionLabel}>Notes</div>
              <p className={styles.detailNoteText}>{payment.notes}</p>
            </div>
          )}

          {hasInstallments && (
            <div className={styles.premiumCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Payment Breakdown</span>
              </div>

              {fullPrice > 0 ? (
                <div className={styles.donutRow}>
                  <div className={styles.donutContent}>
                    <div className={styles.cardValue}>{formatMoney(currency, totalPaid)} received</div>
                    <div className={styles.donutMeta}>
                      <span className="mi" style={{ fontSize: '0.82rem' }}>account_balance_wallet</span>
                      <span style={{ color: balanceLeft > 0 ? '#ef4444' : '#22c55e' }}>
                        {balanceLeft > 0 ? `${formatMoney(currency, balanceLeft)} balance left` : 'Fully settled'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.donutWrap}>
                    <svg viewBox="0 0 64 64" className={styles.donutSvg}>
                      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface2)" strokeWidth="7" />
                      <circle
                        cx="32" cy="32" r="26" fill="none"
                        stroke="#22c55e"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={DONUT_CIRCUMFERENCE}
                        strokeDashoffset={DONUT_CIRCUMFERENCE - (progressPercent / 100) * DONUT_CIRCUMFERENCE}
                        transform="rotate(-90 32 32)"
                        className={styles.donutProgress}
                      />
                    </svg>
                    <span className={styles.donutLabel} style={{ color: '#22c55e' }}>{progressPercent}%</span>
                  </div>
                </div>
              ) : (
                <div className={styles.cardValue}>{formatMoney(currency, totalPaid)} received</div>
              )}

              <div className={styles.installmentDivider} />

              {installments.map((inst, idx) => {
                const hasReceipt = receiptedInstallmentIds.has(String(inst.id))
                const matchedReceipt = hasReceipt
                  ? receipts.find(r =>
                      String(r.paymentId) === String(payment.id) &&
                      (r.installmentIds || []).includes(String(inst.id))
                    )
                  : null
                const methodLabel = inst.method ? capitalise(inst.method) : ''
                const paidBefore = getTotalPaid(installments.slice(0, idx))
                const paidAfter = paidBefore + (parseFloat(inst.amount) || 0)
                const balanceBefore = fullPrice > 0 ? Math.max(0, fullPrice - paidBefore) : null
                const balanceAfter = fullPrice > 0 ? Math.max(0, fullPrice - paidAfter) : null
                return (
                  <div key={inst.id ?? idx} className={styles.installmentBlock}>
                    <div className={styles.installmentHeader}>
                      {installments.length > 1 ? `Installment ${idx + 1}` : 'Payment'}
                    </div>
                    <div className={styles.installmentLineLeft}>
                      <div className={styles.installmentLineIcon}>
                        <span className="mi" style={{ fontSize: '0.95rem', color: '#22c55e' }}>payments</span>
                      </div>
                      <div>
                        <div className={styles.installmentLineAmount}>{formatMoney(currency, inst.amount)}</div>
                        <div className={styles.installmentLineSub}>
                          {[methodLabel, inst.date, inst.time].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </div>

                    {fullPrice > 0 && (
                      <div className={styles.balanceLines}>
                        {idx > 0 && (
                          <div className={styles.balanceLine}>
                            <span>Balance before</span>
                            <span style={{ fontWeight: 700 }}>{formatMoney(currency, balanceBefore)}</span>
                          </div>
                        )}
                        <div className={styles.balanceLine}>
                          <span>Balance after</span>
                          <span style={{ color: balanceAfter > 0 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                            {formatMoney(currency, balanceAfter)}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className={styles.installmentActionBtn}
                      onClick={() => hasReceipt ? onViewReceipt?.(matchedReceipt?.id) : handleGenerateReceiptClick(inst)}
                    >
                      <span className="mi" style={{ fontSize: '1rem' }}>receipt</span>
                      {hasReceipt ? 'View receipt' : 'Generate receipt'}
                      {hasReceipt && (<span className="mi" style={{ fontSize: '1rem' }}>chevron_right</span>)}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {!isPaid && (
            <div className={styles.footerButtons}>
              <button className={styles.btnPrimary} onClick={() => setShowInstallmentModal(true)}>
                <span className="mi" style={{ fontSize: '1.1rem' }}>add_circle_outline</span>
                Record Another Payment
              </button>
            </div>
          )}

        </div>

        {showInstallmentModal && (
          <AddInstallmentModal
            payment={payment}
            onClose={() => setShowInstallmentModal(false)}
            onSave={(amt, meth) => onAddInstallment(payment.id, amt, meth)}
          />
        )}
      </div>

      <ConfirmSheet
        open={confirmDelete}
        title="Delete this payment?"
        message="This payment record will be permanently deleted. This cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
      />

      <UpgradeSheet
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgrade}
        icon="receipt"
        title="Receipt limit reached"
        message={`You've hit the free plan limit of ${limits.receiptsPerMonth} receipts this month. Upgrade to Premium for unlimited receipts.`}
      />
    </div>
  )
}
