import styles from './SectionHeader.module.css'

export function SectionHeader({ icon, title, description }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>
        <span className="mi" style={{ fontSize: '1.1rem' }}>{icon}</span>
      </span>
      <div className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
    </div>
  )
}
