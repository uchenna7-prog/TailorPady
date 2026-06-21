import { createPortal } from 'react-dom'
import styles from './ApplyScopeSheet.module.css'

export function ApplyScopeSheet({ icon, title, description, thisLabel, onApplyToThis, onApplyToDefault, onCancel }) {
  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.header}>
          <span className="mi" style={{ fontSize: '1.5rem' }}>{icon}</span>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{description}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={onApplyToThis}>
            {thisLabel}
          </button>
          <button className={styles.secondaryButton} onClick={onApplyToDefault}>
            Set as default
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}