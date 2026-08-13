import styles from './EmptyState.module.css'

export function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <span className="mi" style={{ fontSize: '2.5rem', color: 'var(--text3)' }}>payments</span>
      <p className={styles.emptyStateTitle}>No payments yet</p>
      <p className={styles.emptyStateSubtitle}>
        Tap the <strong>+</strong> button to record your first payment.
      </p>
    </div>
  )
}
