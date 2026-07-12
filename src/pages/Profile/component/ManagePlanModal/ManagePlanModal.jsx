import { useState } from 'react'
import { PRO_FEATURES } from '../../../../config/planFeatures'
import { cancelSubscription } from '../../../../services/paystackService'
import styles from './ManagePlanModal.module.css'

function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ManagePlanModal({ uid, plan, nextRenewal, onClose, onCancelled, showToast }) {
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = () => {
    setCancelling(true)
    cancelSubscription({
      uid,
      onSuccess: () => {
        setCancelling(false)
        setConfirmingCancel(false)
        onCancelled?.()
      },
      onError: (err) => {
        setCancelling(false)
        showToast?.(err.message || 'Could not cancel subscription — please try again')
      },
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={`mi ${styles.crownIcon}`}>workspace_premium</span>
            <div>
              <div className={styles.title}>{plan || 'TailorPady Pro'}</div>
              <div className={styles.subtitle}>Renews {formatDate(nextRenewal)}</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="mi">close</span>
          </button>
        </div>

        <div className={styles.body}>

          <div className={styles.featureList}>
            {PRO_FEATURES.map((f, i) => (
              <div key={i} className={styles.featureRow}>
                <div className={styles.featureIconWrap}>
                  <span className="mi" style={{ fontSize: '0.85rem' }}>{f.icon}</span>
                </div>
                <span className={styles.featureLabel}>{f.label}</span>
              </div>
            ))}
          </div>

          {!confirmingCancel && (
            <button className={styles.cancelBtn} onClick={() => setConfirmingCancel(true)}>
              Cancel Subscription
            </button>
          )}

          {confirmingCancel && (
            <div className={styles.confirmBox}>
              <div className={styles.confirmText}>
                You'll keep Pro features until {formatDate(nextRenewal)}, then move to the Free plan.
              </div>
              <div className={styles.confirmActions}>
                <button className={styles.keepBtn} onClick={() => setConfirmingCancel(false)} disabled={cancelling}>
                  Keep Plan
                </button>
                <button className={styles.confirmCancelBtn} onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}