import styles from './ReferralRewardModal.module.css'

export default function ReferralRewardModal({ referredName, onContinue }) {
  const displayName = referredName || 'a fellow tailor'

  return (
    <div className={styles.overlay} onClick={onContinue}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.scrollArea}>
          <div className={styles.handle} />

          <div className={styles.iconWrap}>
            <span className="mi" style={{ fontSize: '2.2rem' }}>redeem</span>
          </div>

          <div className={styles.title}>You unlocked a free month! 🎉</div>
          <div className={styles.subtitle}>
            {displayName} joined TailorPady using your referral code. As a thank you, a free month of Pro has been added to your account.
          </div>

          <div className={styles.rewardCard}>
            <span className="mi" style={{ fontSize: '1rem', color: 'var(--accent)' }}>bolt</span>
            <span className={styles.rewardText}>+30 days of Pro, on us</span>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.doneBtn} onClick={onContinue}>
            See what's included
          </button>
        </div>
      </div>
    </div>
  )
}
