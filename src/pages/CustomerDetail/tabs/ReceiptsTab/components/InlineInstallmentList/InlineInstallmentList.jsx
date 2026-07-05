import { formatMoney, getCurrency } from "../../../../../../utils/moneyUtils"
import { capitalise, getTotalPaid } from "../../utils"
import styles from "./InlineInstallmentList.module.css"

const DONUT_CIRCUMFERENCE = 2 * Math.PI * 26


export function InlineInstallmentList({ order, payment, receipts, generating, onSelectPayment }) {

  const currency = getCurrency()
  const installments = payment?.installments || []
  const fullPrice = parseFloat(payment?.orderPrice) || 0
  const totalPaid = getTotalPaid(installments)
  const isFullyPaid = fullPrice > 0 && totalPaid >= fullPrice
  const balance = fullPrice > 0 ? Math.max(0, fullPrice - totalPaid) : 0
  const progressPercent = fullPrice > 0 ? Math.round(Math.min(100, (totalPaid / fullPrice) * 100)) : 0

  const receiptedInstallmentIds = new Set(
    receipts
      .filter(r => String(r.paymentId) === String(payment?.id))
      .flatMap(r => r.installmentIds || [])
  )

  if (!payment) {
    return (
      <div className={styles.inlineEmptyNotice}>
        <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>error_outline</span>
        <span>No payment record found for this order.</span>
      </div>
    )
  }

  return (
    <div className={styles.inlineFormCard}>

      <div className={styles.premiumCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Payment Overview</span>
        </div>

        {fullPrice > 0 && (
          <div className={styles.orderValueRow}>
            <span>Order Value</span>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>{formatMoney(currency, fullPrice)}</span>
          </div>
        )}

        {fullPrice > 0 ? (
          <div className={styles.donutRow}>
            <div className={styles.donutContent}>
              <div className={styles.cardValue}>{formatMoney(currency, totalPaid)} received</div>
              <div className={styles.donutMeta}>
                <span className="mi" style={{ fontSize: '0.82rem' }}>account_balance_wallet</span>
                <span>{isFullyPaid ? 'Fully settled' : `${formatMoney(currency, balance)} balance left`}</span>
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
      </div>

      <p className={styles.stepHeading}>2. Select Payment</p>

      <div className={styles.installmentPickerList}>
        {installments.map((inst, index) => {
          const isReceipted = receiptedInstallmentIds.has(String(inst.id))
          const isGenerating = generating === inst.id

          const paidBefore = getTotalPaid(installments.slice(0, index))
          const paidAfter = paidBefore + (parseFloat(inst.amount) || 0)
          const balBefore = fullPrice > 0 ? Math.max(0, fullPrice - paidBefore) : null
          const balAfter = fullPrice > 0 ? Math.max(0, fullPrice - paidAfter) : null

          return (
            <div
              key={inst.id ?? index}
              className={`
                ${styles.installmentPickerCard}
                ${isReceipted ? styles.installmentPickerCard_receipted : ''}
                ${isGenerating ? styles.installmentPickerCard_generating : ''}
              `}
            >
              <div className={styles.installmentHeader}>
                {installments.length > 1 ? `Installment ${index + 1}` : 'Payment'}
              </div>

              <div className={styles.installmentTopRow}>
                <div className={styles.installmentLineLeft}>
                  <div className={styles.installmentLineIcon}>
                    <span className="mi" style={{ fontSize: '0.95rem', color: '#22c55e' }}>payments</span>
                  </div>
                  <div>
                    <div className={styles.installmentLineAmount}>{formatMoney(currency, inst.amount)}</div>
                    <div className={styles.installmentLineSub}>
                      {[inst.method ? capitalise(inst.method) : null, inst.date].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
              </div>

              {fullPrice > 0 && (
                <div className={styles.balanceLines}>
                  {index > 0 && (
                    <div className={styles.balanceLine}>
                      <span>Balance before</span>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatMoney(currency, balBefore)}</span>
                    </div>
                  )}
                  <div className={styles.balanceLine}>
                    <span>Balance after</span>
                    <span style={{ color: balAfter > 0 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                      {formatMoney(currency, balAfter)}
                    </span>
                  </div>
                </div>
              )}

              {isGenerating ? (
                <div className={styles.actionTagGenerating}>
                  <div className={styles.actionSpinner} />
                  <span>Generating</span>
                </div>
              ) : isReceipted ? (
                <div className={styles.actionTagReceipted}>
                  <span className="mi" style={{ fontSize: '0.9rem' }}>receipt_long</span>
                  <span>Receipted</span>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.installmentActionBtn}
                  onClick={() => onSelectPayment(payment, inst)}
                >
                  Generate receipt
                  <span className="mi" style={{ fontSize: '1rem' }}>chevron_right</span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}