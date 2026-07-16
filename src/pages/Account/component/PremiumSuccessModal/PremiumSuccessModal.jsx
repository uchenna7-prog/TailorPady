import { PRO_FEATURES } from '../../../../config/planFeatures'
import styles from './PremiumSuccessModal.module.css'

function formatRenewal(billingCycle, nextRenewal) {
  if (nextRenewal) {
    const date = new Date(nextRenewal)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }
  const fallback = new Date()
  fallback.setDate(fallback.getDate() + (billingCycle === 'annual' ? 365 : 30))
  return fallback.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PremiumSuccessModal({ billingCycle, nextRenewal, onClose }) {
  const planLabel = billingCycle === 'annual' ? 'Pro Annual' : 'Pro Monthly'
  const renewalLabel = formatRenewal(billingCycle, nextRenewal)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />

        <div className={styles.iconWrap}>
          <span className="mi" style={{ fontSize: '2.2rem' }}>workspace_premium</span>
        </div>

        <div className={styles.title}>You're on Pro!</div>
        <div className={styles.subtitle}>Your {planLabel} plan is active. Here's everything you've unlocked:</div>

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

        <div className={styles.renewalCard}>
          <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>event</span>
          <span className={styles.renewalText}>Renews {renewalLabel}</span>
        </div>

        <button className={styles.doneBtn} onClick={onClose}>
          Awesome, let's go
        </button>
      </div>
    </div>
  )
}