import styles from './ApplyScopeSheet.module.css'

export function ApplyScopeSheet({ icon, title, description, thisLabel, defaultLabel, onApplyToThis, onApplyToDefault, onCancel }) {
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />

        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <span className="mi" style={{ fontSize: '1.4rem' }}>{icon}</span>
          </div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{description}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={onApplyToThis}>
            {thisLabel}
          </button>
          <button className={styles.secondaryButton} onClick={onApplyToDefault}>
            {defaultLabel || 'Set as default'}
          </button>
          <button className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}