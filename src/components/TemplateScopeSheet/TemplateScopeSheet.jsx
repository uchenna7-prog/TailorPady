import { createPortal } from 'react-dom'
import styles from './TemplateScopeSheet.module.css'

export function TemplateScopeSheet({ documentLabel, onApplyToThis, onApplyToDefault, onCancel }) {
  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.header}>
          <span className="mi" style={{ fontSize: '1.5rem' }}>palette</span>
          <h3 className={styles.title}>Apply new template</h3>
          <p className={styles.subtitle}>
            Use this template for just this {documentLabel}, or set it as the default for all future ones?
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={onApplyToThis}>
            Just this {documentLabel}
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