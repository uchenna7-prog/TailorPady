import styles from './EmptyState.module.css'

export function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <span className="mi" style={{ fontSize: '2.5rem', color: 'var(--text3)' }}>shopping_basket</span>
      <p className={styles.emptyStateTitle}>No orders yet</p>
      <p className={styles.emptyStateSubtitle}>
        Tap the <strong>+</strong> button to create your first order from an existing garment measurement.
      </p>
    </div>
  )
}
