import styles from './ReferralRewardModal.module.css'

function joinNames(names) {
  if (!names || names.length === 0) return null
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export default function ReferralRewardModal({ contributingNames, rewardDays, onContinue }) {
  const namesList = joinNames(contributingNames)
  const days = rewardDays || 30

  const subtitle = namesList
    ? `${namesList} joined TailorPady using your referral code. As a thank you, ${days} days of Pro have been added to your account.`
    : `5 tailors joined TailorPady using your referral code. As a thank you, ${days} days of Pro have been added to your account.`

  return (
    <div className={styles.overlay} onClick={onContinue}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.scrollArea}>
          <div className={styles.handle} />

          <div className={styles.iconWrap}>
            <span className="mi" style={{ fontSize: '2.2rem' }}>redeem</span>
          </div>

          <div className={styles.title}>You unlocked {days} days of Pro! 🎉</div>
          <div className={styles.subtitle}>{subtitle}</div>

          <div className={styles.rewardCard}>
            <span className="mi" style={{ fontSize: '1rem', color: 'var(--accent)' }}>bolt</span>
            <span className={styles.rewardText}>+{days} days of Pro, on us</span>
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
