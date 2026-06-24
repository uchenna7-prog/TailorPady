import Header from '../../components/Header/Header'
import styles from './PrivacyPolicy.module.css'


const LAST_UPDATED = 'June 2026'

const SECTIONS = [
  {
    id: 'who-we-are',
    title: 'Who We Are',
    body: `TailorPady is a business management application for tailors and fashion professionals. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use the app.`,
  },
  {
    id: 'data-we-collect',
    title: 'Data We Collect',
    body: `We collect the following categories of data:`,
    bullets: [
      'Account data: your name, email address, and password when you register.',
      'Business data: customer records, orders, invoices, payments, measurements, photos, appointments, and tasks that you create within the app.',
      'Profile photos and gallery images you upload.',
      'Device and usage data: your device type, browser, IP address, and how you interact with the app, collected automatically for performance and security purposes.',
    ],
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Data',
    body: `We use your data to:`,
    bullets: [
      'Provide and maintain the TailorPady service.',
      'Sync your business data across your devices.',
      'Send important account notifications and service updates.',
      'Improve the performance and features of the app.',
      'Respond to your support requests.',
    ],
    footer: 'We do not use your data for advertising, and we do not sell your data to any third party.',
  },
  {
    id: 'third-party',
    title: 'Third-Party Services',
    body: `TailorPady uses the following trusted third-party services to deliver its functionality:`,
    bullets: [
      'Firebase (Google): used for authentication, database storage, and hosting.',
      'Cloudinary: used for storing and serving profile photos and gallery images.',
    ],
    footer: 'These services process your data on our behalf and are bound by their own privacy policies. We encourage you to review the privacy policies of Firebase and Cloudinary if you have concerns about how they handle data.',
  },
  {
    id: 'storage-security',
    title: 'Data Storage and Security',
    body: `Your data is stored securely on Firebase servers. Images are stored on Cloudinary. We implement reasonable technical measures to protect your data from unauthorised access, loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    body: `We retain your data for as long as your account is active. If you delete your account, your data will be removed from our systems within a reasonable period, except where we are required to retain it by law.`,
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    body: `You have the right to:`,
    bullets: [
      'Access the data we hold about you.',
      'Request correction of inaccurate data.',
      'Request deletion of your account and associated data.',
      'Export your business data.',
    ],
    footer: 'To exercise any of these rights, please contact us using the details below.',
  },
  {
    id: 'childrens-privacy',
    title: "Children's Privacy",
    body: `TailorPady is not intended for use by anyone under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with their data, please contact us and we will delete it promptly.`,
  },
  {
    id: 'international',
    title: 'International Users',
    body: `TailorPady is available globally. If you are accessing the app from outside Nigeria, please be aware that your data may be transferred to and processed in servers located in other countries, including those operated by Firebase and Cloudinary. By using the app, you consent to this transfer.`,
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes through the app or by email. Your continued use of TailorPady after changes are posted means you accept the updated policy.`,
  },
]

const CONTACT = {
  id: 'contact',
  title: 'Contact Us',
  body: 'If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact us:',
  email: 'uchenduuchenna7@gmail.com',
  phone: '+234 907 911 6980',
}

function renderBody(section, idx) {
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
      <Header onMenuClick={onMenuClick} title="Privacy Policy" showNotifications = {false} showAgentButton = {false} />

      <div className={styles.scrollArea}>
        <div className={styles.hero}>
          <div className={styles.heroIcon}>
            <span className="mi">shield</span>
          </div>
          <p className={styles.heroSub}>Last updated: {LAST_UPDATED}</p>
          <div className={styles.heroDivider} />
        </div>

        <div className={styles.intro}>
          Your privacy matters to us. This policy explains exactly what data TailorPady collects, why we collect it, and how we keep it safe.
        </div>
        <div className={styles.sections}>
          {SECTIONS.map((section, index) => (
            <div key={section.id} id={section.id} className={styles.section}>
              <div className={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</div>
              {renderBody(section, index)}
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
