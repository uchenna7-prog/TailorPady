import styles from './MoreOptionsSheet.module.css'

export function MoreOptionsSheet({
  onClose,
  onDelete,
  onChangeCurrency,
  currencyLocked = false,
  currencyLockedReason = "Locked because a payment has already been recorded",
  docType = 'invoice',
}) {
  const label = docType === 'receipt' ? 'Receipt' : 'Invoice'

  const handleDelete = () => {
    onClose()
    onDelete()
  }

  const handleCurrency = () => {
    if (currencyLocked) return
    onClose()
    onChangeCurrency()
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <p className={styles.title}>More Options</p>
        <div className={styles.options}>

          <button
            className={`${styles.option} ${currencyLocked ? styles.optionDisabled : ''}`}
            onClick={handleCurrency}
            disabled={currencyLocked}
          >
            <div className={styles.optionIcon}>
              <span className="mi-outlined" style={{ fontSize: '1.3rem' }}>currency_exchange</span>
            </div>
            <div className={styles.optionText}>
              <span className={styles.optionLabel}>Change Currency</span>
              <span className={styles.optionDesc}>
                {currencyLocked ? currencyLockedReason : 'Fixes the symbol shown. Amounts stay the same.'}
              </span>
            </div>
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
