import { useRef } from 'react'
import Header from '../../components/Header/Header'
import BottomNav from '../../components/BottomNav/BottomNav'
import styles from './RefundPolicy.module.css'

const LAST_UPDATED = 'June 2026'

const SECTIONS = [
  {
    id: 'free-plan',
    title: 'Free Plan',
    body: `The free plan for TailorPady carries no charges. There is nothing to refund or cancel. You may stop using the app at any time without any financial obligation.`,
  },
  {
    id: 'paid-plans',
    title: 'Paid Subscription Plans',
    body: `TailorPady offers monthly and annual subscription plans. By subscribing to a paid plan, you authorise us to charge your selected payment method at the beginning of each billing period. All subscription fees are charged in advance.`,
  },
  {
    id: 'cancellation',
    title: 'Cancellation',
    body: `You may cancel your paid subscription at any time through the app settings or by contacting us directly.`,
    bullets: [
      'Once cancelled, your subscription will remain active until the end of the current billing period.',
      'You will not be charged for the next billing cycle.',
      'Cancellation does not entitle you to a refund for the current or any past billing period.',
    ],
  },
  {
    id: 'refunds',
    title: 'Refunds',
    body: `All payments made to TailorPady are non-refundable. We do not offer partial refunds for unused portions of a billing period.`,
    footer: 'If you believe you were charged in error, please contact us within 7 days of the charge and we will investigate and resolve the issue promptly.',
  },
  {
    id: 'annual-plans',
    title: 'Annual Plans',
    body: `Annual subscriptions are billed as a single upfront payment.`,
    bullets: [
      'If you cancel an annual plan, you will retain access to the paid features until the end of the 12-month period.',
      'No refund will be issued for the remaining months, except in cases of verified billing errors on our part.',
    ],
  },
  {
    id: 'exceptional',
    title: 'Exceptional Circumstances',
    body: `In exceptional circumstances — such as extended service unavailability caused by our end — we may at our discretion offer account credits or partial refunds. These will be evaluated on a case-by-case basis. Please contact us to discuss your situation.`,
  },
  {
    id: 'account-deletion',
    title: 'Account Deletion',
    body: `Deleting your account does not automatically cancel an active subscription. Please cancel your subscription first before deleting your account to avoid future charges.`,
  },
]

const CONTACT = {
  id: 'contact',
  title: 'Contact Us',
  body: 'For any refund or cancellation enquiries, please reach out to us:',
  email: 'uchenduuchenna7@gmail.com',
  phone: '+234 907 911 6980',
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

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el && scrollRef.current) {
      const top = el.offsetTop - 16
      scrollRef.current.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const allSections = [...SECTIONS, { ...CONTACT }]

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="Refund Policy" showNotifications = {false} showAgentButton = {false} />

      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.hero}>
          <div className={styles.heroIcon}>
            <span className="mi">receipt_long</span>
          </div>
          <p className={styles.heroSub}>Last updated: {LAST_UPDATED}</p>
          <div className={styles.heroDivider} />
        </div>

        <div className={styles.intro}>
          This policy explains how cancellations and refunds work for TailorPady subscriptions. We aim to be fair and transparent about our billing practices.
        </div>


        <div className={styles.sections}>
          {SECTIONS.map((section, index) => (
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

      <BottomNav />
    </div>
  )
}
