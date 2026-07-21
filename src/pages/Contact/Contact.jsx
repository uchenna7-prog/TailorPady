import styles from './Contact.module.css'
import Header from '../../components/Header/Header'
import BottomNav from '../../components/BottomNav/BottomNav'

const CONTACT = {
  whatsapp:     '+234 7079645766',
  phone:        '+234 7079645766',
  email:        'support@TailorPady.app',
  website:      'https://tailorpady.web.app',
  businessName: 'TailorPady',
  billingName:  'TailorPady Technologies',
  address:      'Choba Uniport',
}

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 448 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.5l-4.4-7c-18.5-29.4-28.3-63.3-28.3-98.1 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  )
}

function ContactRow({ icon, iconNode, label, value, href, divider = true }) {
  const inner = (
    <div
      className={`${styles.row} ${href ? styles.rowLink : ''} ${!divider ? styles.noDivider : ''}`}
    >
      <div className={styles.rowIcon}>
        {iconNode || <span className="mi" style={{ fontSize: '1.2rem' }}>{icon}</span>}
      </div>
      <div className={styles.rowText}>
        {label && <div className={styles.rowLabel}>{label}</div>}
        <div className={href ? styles.rowValueLink : styles.rowValue}>{value}</div>
      </div>
      {href && (
        <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>open_in_new</span>
      )}
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={styles.anchor}>
        {inner}
      </a>
    )
  }
  return inner
}

function InfoRow({ label, value, divider = true }) {
  return (
    <div className={`${styles.row} ${!divider ? styles.noDivider : ''}`}>
      <div className={styles.rowText}>
        <div className={styles.rowLabel}>{label}</div>
        <div className={styles.rowValue}>{value}</div>
      </div>
    </div>
  )
}

export default function Contact({ onMenuClick }) {
  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="Contact Us" />

      <div className={styles.scrollArea}>

        <p className={styles.pageSub}>
          Reach out for support, feedback, or any questions about TailorPady.
        </p>

        <ContactRow
          iconNode={<WhatsAppIcon size={20} />}
          label="WhatsApp"
          value={CONTACT.whatsapp}
          href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`}
        />
        <ContactRow
          icon="call"
          label="Phone"
          value={CONTACT.phone}
          href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
        />
        <ContactRow
          icon="mail"
          label="Email"
          value={CONTACT.email}
          href={`mailto:${CONTACT.email}`}
        />
        <ContactRow
          icon="language"
          label="Website"
          value={CONTACT.website}
          href={`https://${CONTACT.website}`}
          divider={false}
        />

        <div className={styles.sectionHeader}>
          <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>business</span>
          <span className={styles.sectionLabel}>Business Info</span>
        </div>

        <InfoRow label="Business name" value={CONTACT.businessName} />
        <InfoRow label="Billing name"  value={CONTACT.billingName} />
        <InfoRow label="Address"       value={CONTACT.address} divider={false} />

        <div style={{ height: 40 }} />
      </div>
      <BottomNav></BottomNav>
    </div>
  )
}