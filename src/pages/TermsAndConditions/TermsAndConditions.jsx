import { useRef } from 'react'
import Header from '../../components/Header/Header'
import styles from './TermsAndConditions.module.css'
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_CONTACT_PHONE,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
} from '../../datas/legalDatas'

const CONTACT = {
  id: 'contact',
  title: 'Contact Us',
  body: 'If you have any questions about these Terms and Conditions, please contact us:',
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

export default function TermsAndConditions({ onMenuClick }) {
  const scrollRef = useRef(null)

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="Terms And Conditions" showNotifications={false} showAgentButton={false} />

      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.hero}>
          <div className={styles.heroIcon}>
            <span className="mi">gavel</span>
          </div>
          <p className={styles.heroSub}>Last updated: {TERMS_LAST_UPDATED}</p>
          <div className={styles.heroDivider} />
        </div>

        <div className={styles.intro}>
          Please read these Terms and Conditions carefully before using TailorPady. These terms govern your access to and use of the application.
        </div>

        <div className={styles.sections}>
          {TERMS_SECTIONS.map((section, index) => (
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