import styles from './UpgradeSheet.module.css'

export function UpgradeSheet({ isOpen, onClose, onUpgrade, icon, title, message }) {
  if (!isOpen) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <span className="mi" style={{ fontSize: '1.6rem' }}>{icon || 'workspace_premium'}</span>
        </div>
        <p className={styles.title}>{title || 'Upgrade to Premium'}</p>
        <p className={styles.message}>{message}</p>
        <button className={styles.upgradeBtn} onClick={onUpgrade}>
          Upgrade Now
        </button>
        <button className={styles.cancelBtn} onClick={onClose}>
          Not Now
        </button>
      </div>
    </div>
  )
}
