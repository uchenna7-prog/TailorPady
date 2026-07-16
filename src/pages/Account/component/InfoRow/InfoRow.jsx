import styles from "./InfoRow.module.css"


export function InfoRow({ icon, label, value, placeholder, divider = true }) {

  return (
    <div className={`${styles.row} ${!divider ? styles.noDivider : ''}`}>
      <div className={styles.rowIcon}>
        <span className="mi" style={{ fontSize: '1.15rem' }}>{icon}</span>
      </div>
      <div className={styles.rowText}>
        <div className={styles.rowLabel}>{label}</div>
        <div className={value ? styles.rowValue : styles.rowPlaceholder}>{value || placeholder}</div>
      </div>
    </div>
  )
}
