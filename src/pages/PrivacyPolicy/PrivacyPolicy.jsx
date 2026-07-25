import Header from '../../components/Header/Header'
import styles from './PrivacyPolicy.module.css'
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_CONTACT_PHONE,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
} from '../../datas/legalDatas'

const CONTACT = {
  id: 'contact',
  title: 'Contact Us',
  body: 'If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact us:',
  email: LEGAL_CONTACT_EMAIL,
  phone: LEGAL_CONTACT_PHONE,
}

function renderBody(section) {
  return (
    <div className={styles.sectionContent}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
      {section.body && <p className={styles.sectionBody}>{section.body}</p>}
      {section.bullets && (
        <ul className={styles.bulletList}>
          {section.bullets.map((b, i) => (
            <li key={i} className={styles.bulletItem}>
              <span className={styles.bulletDot} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {section.footer && <p className={styles.sectionFooter}>{section.footer}</p>}
    </div>
  )
}

export default function PrivacyPolicy({ onMenuClick }) {
  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="Privacy Policy" showNotifications={false} showAgentButton={false} />

      <div className={styles.scrollArea}>
        <div className={styles.hero}>
          <div className={styles.heroIcon}>
            <span className="mi">shield</span>
          </div>
          <p className={styles.heroSub}>Last updated: {PRIVACY_LAST_UPDATED}</p>
          <div className={styles.heroDivider} />
        </div>

        <div className={styles.intro}>
          Your privacy matters to us. This policy explains exactly what data TailorPady collects, why we collect it, and how we keep it safe.
        </div>

        <div className={styles.sections}>
          {PRIVACY_SECTIONS.map((section, index) => (
            <div key={section.id} id={section.id} className={styles.section}>
              <div className={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</div>
              {renderBody(section)}
            </div>
          ))}
        </div>

        <div id={CONTACT.id} className={styles.contactCard}>
          <div className={styles.contactHeader}>
            <div className={styles.contactIconWrap}>
              <span className="mi" style={{ fontSize: '1.1rem' }}>mail_outline</span>
            </div>
            <div>
              <div className={styles.contactTitle}>{CONTACT.title}</div>
              <div className={styles.contactBody}>{CONTACT.body}</div>
            </div>
          </div>
          <div className={styles.contactLinks}>
            <a href={`mailto:${CONTACT.email}`} className={styles.contactLink}>
              <span className="mi" style={{ fontSize: '1rem' }}>email</span>
              <span>{CONTACT.email}</span>
            </a>
            <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className={styles.contactLink}>
              <span className="mi" style={{ fontSize: '1rem' }}>phone</span>
              <span>{CONTACT.phone}</span>
            </a>
          </div>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}