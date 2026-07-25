import { useRef } from 'react'
import Header from '../../components/Header/Header'
import styles from './RefundPolicy.module.css'
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_CONTACT_PHONE,
  REFUND_LAST_UPDATED,
  REFUND_SECTIONS,
} from '../../datas/legalDatas'

const CONTACT = {
  id: 'contact',
  title: 'Contact Us',
  body: 'For any refund or cancellation enquiries, please reach out to us:',
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

export default function RefundPolicy({ onMenuClick }) {
  const scrollRef = useRef(null)

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="Refund Policy" showNotifications={false} showAgentButton={false} />

      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.hero}>
          <div className={styles.heroIcon}>
            <span className="mi">receipt_long</span>
          </div>
          <p className={styles.heroSub}>Last updated: {REFUND_LAST_UPDATED}</p>
          <div className={styles.heroDivider} />
        </div>

        <div className={styles.intro}>
          This policy explains how cancellations and refunds work for TailorPady subscriptions. We aim to be fair and transparent about our billing practices.
        </div>

        <div className={styles.sections}>
          {REFUND_SECTIONS.map((section, index) => (
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