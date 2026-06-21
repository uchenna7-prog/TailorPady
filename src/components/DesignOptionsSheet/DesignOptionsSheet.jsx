import { createPortal } from 'react-dom'
import styles from './DesignOptionsSheet.module.css'

export function DesignOptionsSheet({ onClose, onSelectTemplate, onSelectColour }) {
  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.handle} />
        <p className={styles.title}>Design</p>

        <div className={styles.optionList}>
          <button className={styles.option} onClick={onSelectTemplate}>
            <div className={styles.optionIcon}>
              <span className="mi">style</span>
            </div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Template</span>
              <span className={styles.optionSub}>Choose a layout for this document</span>
            </div>
            <span className={`mi ${styles.optionChevron}`}>chevron_right</span>
          </button>

          <button className={styles.option} onClick={onSelectColour}>
            <div className={styles.optionIcon}>
              <span className="mi">palette</span>
            </div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Brand Colour</span>
              <span className={styles.optionSub}>Set the accent colour for this document</span>
            </div>
            <span className={`mi ${styles.optionChevron}`}>chevron_right</span>
          </button>
        </div>

        <button className={styles.cancelButton} onClick={onClose}>
          Cancel
        </button>

      </div>
    </div>,
    document.body
  )
}