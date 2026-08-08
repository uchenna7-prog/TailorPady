import styles from './LimitBanner.module.css'

export function LimitBanner({ atLimit, icon, message, onUpgradeClick, compact, current, max }) {
  if (compact) {
    const pct = typeof current === 'number' && typeof max === 'number' && max > 0
      ? Math.min(100, (current / max) * 100)
      : null

    return (
      <div className={`${styles.compactBanner} ${atLimit ? styles.compactBannerAtLimit : ''}`}>
        <div className={styles.compactTop}>
          <span className="mi" style={{ fontSize: '0.95rem' }}>{icon || 'info'}</span>
          <span className={styles.compactMessage}>{message}</span>
          <button className={styles.compactUpgradeLink} onClick={onUpgradeClick}>
            Upgrade
          </button>
        </div>
        {pct !== null && (
          <div className={styles.compactTrack}>
            <div className={styles.compactFill} style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`${styles.banner} ${atLimit ? styles.bannerAtLimit : ''}`}>
      <div className={styles.iconBadge}>
        <span className="mi" style={{ fontSize: '1rem' }}>{icon || 'info'}</span>
      </div>
      <span className={styles.message}>{message}</span>
      <button className={styles.upgradeButton} onClick={onUpgradeClick}>
        Upgrade
      </button>
    </div>
  )
}
