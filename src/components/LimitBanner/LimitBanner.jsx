import styles from './LimitBanner.module.css'

export function LimitBanner({ atLimit, icon, message, onUpgradeClick }) {
  return (
    <div className={`${styles.banner} ${atLimit ? styles.bannerAtLimit : ''}`}>
      <div className={styles.iconBadge}>
        <span className="mi" style={{ fontSize: '1rem' }}>{icon || 'info'}</span>
      </div>
      <span className={styles.message}>{message}</span>
      <button className={styles.upgradeButton} onClick={onUpgradeClick}>
        Upgrade
        <span className="mi" style={{ fontSize: '1rem' }}>arrow_forward</span>
      </button>
    </div>
  )
}
