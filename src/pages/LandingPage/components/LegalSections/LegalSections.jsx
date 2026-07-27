import styles from './LegalSections.module.css'

export default function LegalSections({ sections }) {
  return (
    <div className={styles.sections}>
      {sections.map((section, index) => (
        <div key={section.id} id={section.id} className={styles.section}>
          <div className={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</div>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            {section.body && <p className={styles.sectionBody}>{section.body}</p>}
            {section.bullets && (
              <ul className={styles.bulletList}>
                {section.bullets.map((bullet, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <span className={styles.bulletDot} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
            {section.footer && <p className={styles.sectionFooter}>{section.footer}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}