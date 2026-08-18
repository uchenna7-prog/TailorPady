import styles from './EmptyState.module.css'

export function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <span className="mi" style={{ fontSize: '2.5rem', color: 'var(--text3)' }}>group</span>
      <p className={styles.emptyStateTitle}>No customers yet</p>
      <p className={styles.emptyStateSubtitle}>
        Tap the <strong>+</strong> button to add your first customer.
      </p>
    </div>
  )
}
