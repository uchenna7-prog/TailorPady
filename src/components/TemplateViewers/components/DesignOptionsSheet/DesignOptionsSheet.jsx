import styles from './DesignOptionsSheet.module.css'

export function DesignOptionsSheet({ onClose, onSelectTemplate, onSelectColour }) {
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <p className={styles.title}>Design</p>

        <div className={styles.options}>
          <button className={styles.option} onClick={onSelectTemplate}>
            <div className={styles.optionIcon}>
              <span className="mi" style={{ fontSize: '1.3rem' }}>style</span>
            </div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Template</span>
              <span className={styles.optionDesc}>Choose a layout for this document</span>
            </div>
            <span className={`mi ${styles.optionChevron}`}>chevron_right</span>
          </button>

          <button className={styles.option} onClick={onSelectColour}>
            <div className={styles.optionIcon}>
              <span className="mi" style={{ fontSize: '1.3rem' }}>palette</span>
            </div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Brand Colour</span>
              <span className={styles.optionDesc}>Set the accent colour for this document</span>
            </div>
            <span className={`mi ${styles.optionChevron}`}>chevron_right</span>
          </button>
        </div>

        <button className={styles.cancel} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}