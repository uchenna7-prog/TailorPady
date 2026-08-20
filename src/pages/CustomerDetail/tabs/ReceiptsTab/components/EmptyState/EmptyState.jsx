import styles from './EmptyState.module.css'

export function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <span className="mi-outlined" style={{ fontSize: '2.5rem', color: 'var(--text3)' }}>receipt</span>
      <p className={styles.emptyStateTitle}>No receipts yet</p>
      <p className={styles.emptyStateSubtitle}>
        Tap the <strong>+</strong> button to generate a receipt from a recorded payment.
      </p>
    </div>
  )
}
