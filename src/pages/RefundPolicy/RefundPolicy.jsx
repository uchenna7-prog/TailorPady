import styles from './RefundPolicy.module.css'

const LAST_UPDATED = 'June 2026'

const SECTIONS = [
  {
    title: 'Free Plan',
    body: `The free plan for TailorPady carries no charges. There is nothing to refund or cancel. You may stop using the app at any time without any financial obligation.`,
  },
  {
    title: 'Paid Subscription Plans',
    body: `TailorPady offers monthly and annual subscription plans. By subscribing to a paid plan, you authorise us to charge your selected payment method at the beginning of each billing period. All subscription fees are charged in advance.`,
  },
  {
    title: 'Cancellation',
    body: `You may cancel your paid subscription at any time through the app settings or by contacting us directly. Once cancelled, your subscription will remain active until the end of the current billing period. You will not be charged for the next billing cycle. Cancellation does not entitle you to a refund for the current or any past billing period.`,
  },
  {
    title: 'Refunds',
    body: `All payments made to TailorPady are non-refundable. We do not offer partial refunds for unused portions of a billing period. If you believe you were charged in error, please contact us within 7 days of the charge and we will investigate and resolve the issue promptly.`,
  },
  {
    title: 'Annual Plans',
    body: `Annual subscriptions are billed as a single upfront payment. If you cancel an annual plan, you will retain access to the paid features until the end of the 12-month period. No refund will be issued for the remaining months, except in cases of verified billing errors on our part.`,
  },
  {
    title: 'Exceptional Circumstances',
    body: `In exceptional circumstances — such as extended service unavailability caused by our end — we may at our discretion offer account credits or partial refunds. These will be evaluated on a case-by-case basis. Please contact us to discuss your situation.`,
  },
  {
    title: 'Account Deletion',
    body: `Deleting your account does not automatically cancel an active subscription. Please cancel your subscription first before deleting your account to avoid future charges.`,
  },
  {
    title: 'Contact Us',
    body: `For any refund or cancellation enquiries, please reach out to us:\n\nEmail: uchenduuchenna7@gmail.com\nPhone: +234 907 911 6980`,
  },
]

export default function RefundPolicy() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <span className="mi">receipt_long</span>
        </div>
        <h1 className={styles.heroTitle}>Refund &amp; Cancellation Policy</h1>
        <p className={styles.heroSub}>Last updated: {LAST_UPDATED}</p>
      </div>

      <div className={styles.intro}>
        This policy explains how cancellations and refunds work for TailorPady subscriptions. We aim to be fair and transparent about our billing practices.
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