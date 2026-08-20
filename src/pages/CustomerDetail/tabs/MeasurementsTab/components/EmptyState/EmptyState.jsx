import styles from './EmptyState.module.css'

export function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <span className="mi-outlined" style={{ fontSize: '2.5rem', color: 'var(--text3)' }}>straighten</span>
      <p className={styles.emptyStateTitle}>No measurements yet</p>
      <p className={styles.emptyStateSubtitle}>
        Tap the <strong>+</strong> button to add the first garment measurement.
      </p>
    </div>
  )
}
