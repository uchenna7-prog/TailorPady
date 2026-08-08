import styles from './LimitBanner.module.css'

export function LimitBanner({
  atLimit,
  icon,
  message,
  onUpgradeClick,
  compact,
  current,
  max,
  meter = 'fraction',
  divider = false,
}) {
  if (compact) {
    const hasCounts = typeof current === 'number' && typeof max === 'number' && max > 0
    const pct = hasCounts ? Math.min(100, (current / max) * 100) : null

    return (
      <div className={`${styles.compactBanner} ${divider ? styles.compactBannerDivider : ''} ${atLimit ? styles.compactBannerAtLimit : ''}`}>
        <div className={styles.compactTop}>
          <span className="mi" style={{ fontSize: '0.95rem' }}>{icon || 'info'}</span>
          <span className={styles.compactMessage}>{message}</span>
          {hasCounts && meter === 'fraction' && (
            <span className={styles.compactFraction}>{current}/{max}</span>
          )}
          <button className={styles.compactUpgradeLink} onClick={onUpgradeClick}>
            Upgrade
          </button>
        </div>
        {hasCounts && meter === 'bar' && (
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
