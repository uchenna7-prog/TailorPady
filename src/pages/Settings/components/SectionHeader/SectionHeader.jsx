import styles from "./SectionHeader.module.css"

export function SectionHeader({ icon, label, premium = false }) {
  const isComponent = typeof icon === 'function'

  return (
    <div className={styles.sectionHeader}>

      {isComponent ? (
        <span className={styles.iconWrap}>
          {icon({ size: 18, color: 'var(--accent)' })}
        </span>
      ) : (
        <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>{icon}</span>
      )}

      <span className={styles.sectionLabel}>{label}</span>
      {premium && (
        <span className={styles.premiumBadge}>

          <span className="mi" style={{ fontSize: '0.7rem' }}>workspace_premium</span>PRO

        </span>
      )}

    </div>
  )
}