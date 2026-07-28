import { Link } from 'react-router-dom'
import styles from './SiteFooter.module.css'

const CONTACT = {
  whatsapp: '+234 7079645766',
  phone: '+234 7079645766',
  email: 'support@TailorPady.app',
  address: 'Choba, Uniport, Port Harcourt, Nigeria',
}

const CONTACT_LINKS = [
  {
    key: 'phone',
    icon: 'call',
    label: 'Phone',
    href: `tel:${CONTACT.phone.replace(/\s/g, '')}`,
  },
  {
    key: 'email',
    icon: 'mail',
    label: 'Email',
    href: `mailto:${CONTACT.email}`,
  },
]

const FOOTER_COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/#features', internal: false },
      { label: 'Pricing', href: '/#pricing', internal: false },
      { label: 'FAQ', href: '/faq', internal: true },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Meet the founder', href: '/founder', internal: true },
      { label: 'Contact', href: '/contact', internal: true },
      { label: 'Privacy policy', href: '/privacy', internal: true },
      { label: 'Terms & conditions', href: '/terms', internal: true },
      { label: 'Refund policy', href: '/refund', internal: true },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerCurve} aria-hidden="true">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,100 C480,0 960,0 1440,100 L1440,100 L0,100 Z" />
        </svg>
      </div>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogoMark}>TailorPady</span>
            <div className={styles.footerContactDetails}>
              <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className={styles.footerContactLine}>
                <span className="mi" style={{ fontSize: '1rem' }}>call</span>
                {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className={styles.footerContactLine}>
                <span className="mi" style={{ fontSize: '1rem' }}>mail</span>
                {CONTACT.email}
              </a>
              <span className={styles.footerContactLine}>
                <span className="mi" style={{ fontSize: '1rem' }}>location_on</span>
                {CONTACT.address}
              </span>
            </div>
            <div className={styles.footerSocial}>
              {CONTACT_LINKS.map(link => (
                <a
                  key={link.key}
                  href={link.href}
                  className={styles.footerSocialLink}
                  aria-label={link.label}
                >
                  <span className="mi" style={{ fontSize: '1rem' }}>{link.icon}</span>
                </a>
              ))}
            </div>
          </div>
          <div className={styles.footerColumns}>
            {FOOTER_COLUMNS.map(col => (
              <div key={col.heading} className={styles.footerColumn}>
                <span className={styles.footerColumnHeading}>{col.heading}</span>
                {col.links.map(link =>
                  link.internal ? (
                    <Link key={link.label} to={link.href}>
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.label} href={link.href}>
                      {link.label}
                    </a>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} TailorPady. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
