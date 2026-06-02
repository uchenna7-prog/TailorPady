import styles from "./SectionHeader.module.css"


export function SectionHeader({ icon, label }) {

  return (
    <div className={styles.sectionHeader}>
      <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>{icon}</span>
      <span className={styles.sectionLabel}>{label}</span>
    </div>
  )
}