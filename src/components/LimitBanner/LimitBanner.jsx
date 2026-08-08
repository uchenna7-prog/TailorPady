import styles from './LimitBanner.module.css'

export function LimitBanner({ atLimit, icon, message, onUpgradeClick }) {
  return (
    <div className={`${styles.banner} ${atLimit ? styles.bannerAtLimit : ''}`}>
      <span className="mi" style={{ fontSize: '1.1rem' }}>{icon || 'info'}</span>
      <span className={styles.message}>{message}</span>
      <button className={styles.upgradeLink} onClick={onUpgradeClick}>
        Upgrade
      </button>
    </div>
  )
}
