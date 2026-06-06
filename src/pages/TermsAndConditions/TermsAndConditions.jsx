import styles from './TermsAndConditions.module.css'

const LAST_UPDATED = 'June 2026'

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: `By accessing or using TailorPady, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the app. These terms apply to all users of TailorPady, whether on the free plan or any paid subscription plan.`,
  },
  {
    title: 'Description of Service',
    body: `TailorPady is a business management application designed for tailors and fashion professionals. The app provides tools for managing customers, orders, invoices, payments, appointments, tasks, gallery, and related business operations.`,
  },
  {
    title: 'User Accounts',
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate and complete information when creating your account. You must notify us immediately of any unauthorised use of your account.`,
  },
  {
    title: 'Acceptable Use',
    body: `You agree to use TailorPady only for lawful business purposes. You must not misuse the app, attempt to gain unauthorised access to any part of the service, upload malicious content, or use the app in any way that could damage, disable, or impair the service. You are solely responsible for the accuracy of data you enter into the app.`,
  },
  {
    title: 'Subscription Plans and Payments',
    body: `TailorPady offers both a free plan and paid subscription plans. Paid plans are billed on a monthly or annual basis as selected at the time of subscription. All fees are non-refundable except as described in our Refund and Cancellation Policy. We reserve the right to change pricing with reasonable notice. Continued use of the app after a price change constitutes your acceptance of the new pricing.`,
  },
  {
    title: 'Data and Privacy',
    body: `Your use of TailorPady is also governed by our Privacy Policy. By using the app, you consent to the collection and use of your data as described in that policy. You retain ownership of all business data you input into the app. We do not sell your data to third parties.`,
  },
  {
    title: 'Intellectual Property',
    body: `All content, design, code, and materials within TailorPady are the intellectual property of TailorPady and its creators. You may not reproduce, distribute, or create derivative works from any part of the app without our express written permission.`,
  },
  {
    title: 'Limitation of Liability',
    body: `TailorPady is provided on an "as is" basis. We do not guarantee uninterrupted or error-free operation. To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of or inability to use the app, including loss of business data.`,
  },
  {
    title: 'Termination',
    body: `We reserve the right to suspend or terminate your account at any time if you violate these terms or engage in conduct that we reasonably determine to be harmful to other users or to the service. You may also delete your account at any time through the app settings.`,
  },
  {
    title: 'Changes to These Terms',
    body: `We may update these Terms and Conditions from time to time. We will notify you of significant changes through the app or by email. Your continued use of TailorPady after changes are posted constitutes your acceptance of the updated terms.`,
  },
  {
    title: 'Contact Us',
    body: `If you have any questions about these Terms and Conditions, please contact us:\n\nEmail: uchenduuchenna7@gmail.com\nPhone: +234 907 911 6980`,
  },
]

export default function TermsAndConditions() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <span className="mi">gavel</span>
        </div>
        <h1 className={styles.heroTitle}>Terms &amp; Conditions</h1>
        <p className={styles.heroSub}>Last updated: {LAST_UPDATED}</p>
      </div>

      <div className={styles.intro}>
        Please read these Terms and Conditions carefully before using TailorPady. These terms govern your access to and use of the application.
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