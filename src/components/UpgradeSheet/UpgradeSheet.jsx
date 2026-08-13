import { useEffect } from 'react'
import styles from './UpgradeSheet.module.css'

export function UpgradeSheet({
  isOpen,
  onClose,
  onUpgrade,
  icon,
  title,
  message,
  features,
  price,
  period,
  confirmText,
  dismissText
}) {
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.sheet}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgradeSheetTitle"
      >
        <div className={styles.handle} />

        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <span className="mi" style={{ fontSize: '1.1rem' }}>close</span>
        </button>

        <div className={styles.iconWrap}>
          <span className="mi" style={{ fontSize: '1.7rem' }}>{icon || 'workspace_premium'}</span>
        </div>

        <h3 id="upgradeSheetTitle" className={styles.title}>{title || 'Upgrade to Premium'}</h3>
        <p className={styles.message}>{message}</p>

        {features?.length > 0 && (
          <ul className={styles.features}>
            {features.map((feature, i) => (
              <li key={i} className={styles.feature}>
                <span className={styles.featureCheck}>
                  <span className="mi" style={{ fontSize: '0.95rem' }}>check</span>
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {price && (
          <div className={styles.priceRow}>
            <span className={styles.priceValue}>{price}</span>
            {period && <span className={styles.pricePeriod}>/{period}</span>}
          </div>
        )}

        <button className={styles.upgradeBtn} onClick={onUpgrade}>
          <span>{confirmText || 'Subscribe to Pro'}</span>
          <span className="mi" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
        </button>
        <button className={styles.cancelBtn} onClick={onClose}>
          {dismissText || 'Not Now'}
        </button>
      </div>
    </div>
  )
}
