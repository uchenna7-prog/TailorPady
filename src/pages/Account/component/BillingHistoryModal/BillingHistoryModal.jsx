import { useState, useEffect } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { usePremium } from '../../../../contexts/PremiumContext'
import { subscribeToSubscriptionPayments } from '../../../../services/subscriptionPaymentsService'
import styles from './BillingHistoryModal.module.css'

const STATUS_META = {
  paid:    { label: 'Paid',    color: '#22c55e' },
  pending: { label: 'Pending', color: '#f59e0b' },
  failed:  { label: 'Failed',  color: '#ef4444' },
}

function formatNaira(amountInKobo) {
  if (amountInKobo == null) return '—'
  return `₦${(amountInKobo / 100).toLocaleString('en-NG')}`
}

function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BillingHistoryModal({ onClose }) {
  const { user } = useAuth()
  const { isPremium, plan, nextRenewal, paymentFailed } = usePremium()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeToSubscriptionPayments(user.uid, list => {
      setPayments(list)
      setLoading(false)
    })
    return unsub
  }, [user?.uid])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.handle} />

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={`mi-outlined ${styles.headerIcon}`}>receipt_long</span>
            <div>
              <div className={styles.headerTitle}>Billing History</div>
              <div className={styles.headerSub}>Payments, renewals and receipts</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="mi-outlined">close</span>
          </button>
        </div>

        <div className={styles.body}>

          {isPremium && (
            <div className={styles.statusCard}>
              <div className={styles.statusCardLeft}>
                <span className={`mi-outlined ${styles.statusIcon}`}>workspace_premium</span>
                <div>
                  <div className={styles.statusPlan}>{plan || 'TailorPady Pro'}</div>
                  <div className={styles.statusRenewal}>
                    {paymentFailed ? 'Payment failed, update your card' : `Renews ${formatDate(nextRenewal)}`}
                  </div>
                </div>
              </div>
              <div className={paymentFailed ? styles.failedPill : styles.activePill}>
                {paymentFailed ? 'Action needed' : 'Active'}
              </div>
            </div>
          )}

          {!isPremium && (
            <div className={styles.freeBanner}>
              <span className="mi-outlined" style={{ fontSize: '1.2rem', color: 'var(--text3)' }}>info</span>
              <span className={styles.freeBannerText}>You are on the Free plan, no billing history yet.</span>
            </div>
          )}

          {isPremium && loading && (
            <div className={styles.freeBanner}>
              <span className={styles.freeBannerText}>Loading payment history…</span>
            </div>
          )}

          {isPremium && !loading && payments.length === 0 && (
            <div className={styles.freeBanner}>
              <span className="mi-outlined" style={{ fontSize: '1.2rem', color: 'var(--text3)' }}>info</span>
              <span className={styles.freeBannerText}>No payments recorded yet.</span>
            </div>
          )}

          {isPremium && !loading && payments.length > 0 && (
            <div className={styles.list}>
              {payments.map((inv, i) => {
                const meta = STATUS_META[inv.status] || STATUS_META.pending
                return (
                  <div key={inv.id} className={`${styles.invoiceRow} ${i === payments.length - 1 ? styles.noDivider : ''}`}>
                    <div className={styles.invoiceIcon}>
                      <span className="mi-outlined" style={{ fontSize: '1rem', color: inv.status === 'failed' ? '#ef4444' : 'var(--text2)' }}>
                        {inv.status === 'failed' ? 'error_outline' : 'receipt'}
                      </span>
                    </div>
                    <div className={styles.invoiceText}>
                      <div className={styles.invoicePlan}>{inv.plan || 'Subscription payment'}</div>
                      <div className={styles.invoiceDate}>{formatDate(inv.paidAt)} · {inv.reference}</div>
                    </div>
                    <div className={styles.invoiceRight}>
                      <div className={styles.invoiceAmount}>{formatNaira(inv.amount)}</div>
                      <div className={styles.invoiceStatus} style={{ color: meta.color }}>{meta.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className={styles.footer}>
            <span className="mi-outlined" style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>lock</span>
            <span className={styles.footerText}>Payments secured by Paystack</span>
          </div>

        </div>

      </div>
    </div>
  )
}
