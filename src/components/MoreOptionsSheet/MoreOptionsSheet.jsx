import styles from './MoreOptionsSheet.module.css'

export function MoreOptionsSheet({ onClose, onDelete, docType = 'invoice' }) {
  const label = docType === 'receipt' ? 'Receipt' : 'Invoice'

  const handleDelete = () => {
    onClose()
    onDelete()
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <p className={styles.title}>More Options</p>
        <div className={styles.options}>
          <button className={`${styles.option} ${styles.optionMuted}`} disabled>
            <div className={`${styles.optionIcon} ${styles.optionIconMuted}`}>
              <span className="mi-outlined" style={{ fontSize: '1.3rem' }}>edit</span>
            </div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Edit {label}</span>
              <span className={styles.optionDesc}>Modify {label.toLowerCase()} details</span>
            </div>
            <span className={styles.soonBadge}>Soon</span>
          </button>
          <button className={`${styles.option} ${styles.optionDanger}`} onClick={handleDelete}>
            <div className={`${styles.optionIcon} ${styles.optionIconDanger}`}>
              <span className="mi-outlined" style={{ fontSize: '1.3rem' }}>delete</span>
            </div>
            <div className={styles.optionText}>
              <span className={`${styles.optionLabel} ${styles.optionLabelDanger}`}>Delete {label}</span>
              <span className={styles.optionDesc}>This action cannot be undone</span>
            </div>
          </button>
        </div>
        <button className={styles.cancel} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}