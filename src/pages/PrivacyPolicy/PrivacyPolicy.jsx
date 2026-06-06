import styles from './PrivacyPolicy.module.css'

const LAST_UPDATED = 'June 2026'

const SECTIONS = [
  {
    title: 'Who We Are',
    body: `TailorPady is a business management application for tailors and fashion professionals. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use the app.`,
  },
  {
    title: 'Data We Collect',
    body: `We collect the following categories of data:\n\n• Account data: your name, email address, and password when you register.\n• Business data: customer records, orders, invoices, payments, measurements, photos, appointments, and tasks that you create within the app.\n• Profile photos and gallery images you upload.\n• Device and usage data: your device type, browser, IP address, and how you interact with the app, collected automatically for performance and security purposes.`,
  },
  {
    title: 'How We Use Your Data',
    body: `We use your data to:\n\n• Provide and maintain the TailorPady service.\n• Sync your business data across your devices.\n• Send important account notifications and service updates.\n• Improve the performance and features of the app.\n• Respond to your support requests.\n\nWe do not use your data for advertising, and we do not sell your data to any third party.`,
  },
  {
    title: 'Third-Party Services',
    body: `TailorPady uses the following trusted third-party services to deliver its functionality:\n\n• Firebase (Google): used for authentication, database storage, and hosting.\n• Cloudinary: used for storing and serving profile photos and gallery images.\n\nThese services process your data on our behalf and are bound by their own privacy policies. We encourage you to review the privacy policies of Firebase and Cloudinary if you have concerns about how they handle data.`,
  },
  {
    title: 'Data Storage and Security',
    body: `Your data is stored securely on Firebase servers. Images are stored on Cloudinary. We implement reasonable technical measures to protect your data from unauthorised access, loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    title: 'Data Retention',
    body: `We retain your data for as long as your account is active. If you delete your account, your data will be removed from our systems within a reasonable period, except where we are required to retain it by law.`,
  },
  {
    title: 'Your Rights',
    body: `You have the right to:\n\n• Access the data we hold about you.\n• Request correction of inaccurate data.\n• Request deletion of your account and associated data.\n• Export your business data.\n\nTo exercise any of these rights, please contact us using the details below.`,
  },
  {
    title: 'Children\'s Privacy',
    body: `TailorPady is not intended for use by anyone under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with their data, please contact us and we will delete it promptly.`,
  },
  {
    title: 'International Users',
    body: `TailorPady is available globally. If you are accessing the app from outside Nigeria, please be aware that your data may be transferred to and processed in servers located in other countries, including those operated by Firebase and Cloudinary. By using the app, you consent to this transfer.`,
  },
  {
    title: 'Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes through the app or by email. Your continued use of TailorPady after changes are posted means you accept the updated policy.`,
  },
  {
    title: 'Contact Us',
    body: `If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact us:\n\nEmail: uchenduuchenna7@gmail.com\nPhone: +234 907 911 6980`,
  },
]

export default function PrivacyPolicy() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <span className="mi">shield</span>
        </div>
        <h1 className={styles.heroTitle}>Privacy Policy</h1>
        <p className={styles.heroSub}>Last updated: {LAST_UPDATED}</p>
      </div>

      <div className={styles.intro}>
        Your privacy matters to us. This policy explains exactly what data TailorPady collects, why we collect it, and how we keep it safe.
      </div>

      <div className={styles.sections}>
        {SECTIONS.map((section, index) => (
          <div key={index} className={styles.section}>
            <div className={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.sectionBody}>{section.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}