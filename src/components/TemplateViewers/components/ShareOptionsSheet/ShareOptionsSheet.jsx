import styles from './ShareOptionsSheet.module.css'

export function ShareOptionsSheet({ onClose, onShare, onDownload, docType = 'invoice' }) {
  const label = docType === 'receipt' ? 'Receipt' : 'Invoice'

  const handleShare = () => {
    onClose()
    onShare()
  }

  const handleDownload = () => {
    onClose()
    onDownload()
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <p className={styles.title}>Export {label}</p>
        <div className={styles.options}>
          <button className={styles.option} onClick={handleShare}>
            <div className={styles.optionIcon}>
              <span className="mi" style={{ fontSize: '1.3rem' }}>share</span>
            </div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Share {label}</span>
              <span className={styles.optionDesc}>Send via WhatsApp or other apps</span>
            </div>
          </button>
          <button className={styles.option} onClick={handleDownload}>
            <div className={styles.optionIcon}>
              <span className="mi" style={{ fontSize: '1.3rem' }}>download</span>
            </div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Download {label}</span>
              <span className={styles.optionDesc}>Save as PDF to your device</span>
            </div>
          </button>
        </div>
        <button className={styles.cancel} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}