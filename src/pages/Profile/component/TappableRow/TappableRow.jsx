import styles from  "./TappableRow.module.css"


export function TappableRow({ 
    icon, 
    label, 
    sub, 
    value, 
    onClick, 
    chevron = true, 
    divider = true, 
    danger = false 
}) {

  const isEdit = icon === 'edit'

  return (
    <div
      className={`${styles.row} ${styles.rowTappable} ${!divider ? styles.noDivider : ''}`}
      onClick={onClick}
    >
      <div className={styles.rowIcon} style={isEdit ? { background: 'var(--text)', color: 'var(--bg)' } : undefined}>
        <span className="mi" style={{ fontSize: '1.15rem', color: danger ? '#ef4444' : undefined }}>{icon}</span>
      </div>
      <div className={styles.rowText}>
        <div className={`${styles.rowLabel} ${danger ? styles.rowLabelDanger : ''}`}>{label}</div>
        {sub && <div className={styles.rowSub}>{sub}</div>}
      </div>
      <div className={styles.rowRight}>
        {value && <span className={styles.rowBadge}>{value}</span>}
        {chevron && <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>chevron_right</span>}
      </div>
    </div>
  )
}
