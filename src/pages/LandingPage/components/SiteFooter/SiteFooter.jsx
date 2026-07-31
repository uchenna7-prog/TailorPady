import { Link } from 'react-router-dom'
import logoLightMode from '../../../../assets/logoLightMode.png'
import styles from './SiteFooter.module.css'

const CONTACT = {
  whatsapp: '+234 7079645766',
  phone: '+234 7079645766',
  email: 'support@TailorPady.app',
  address: 'Choba, Uniport, Port Harcourt, Nigeria',
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M14.5 8.5H16.5V5.5H14.2C12 5.5 10.5 7 10.5 9.3V11.2H8.5V14.2H10.5V21H13.7V14.2H15.8L16.3 11.2H13.7V9.6C13.7 8.9 14 8.5 14.5 8.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M16.6 3C16.9 5.1 18.2 6.6 20.2 6.8V9.6C19 9.6 17.9 9.2 16.9 8.5V15C16.9 18 14.5 20.2 11.7 20.2C8.9 20.2 6.6 18 6.6 15C6.6 12.1 8.9 9.9 11.7 9.9C12 9.9 12.3 9.9 12.6 10V12.8C12.3 12.7 12 12.6 11.7 12.6C10.4 12.6 9.4 13.6 9.4 15C9.4 16.3 10.4 17.4 11.7 17.4C13 17.4 14.1 16.4 14.1 15V3H16.6Z"
        fill="currentColor"
      />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { key: 'tiktok', label: 'TikTok', Icon: TiktokIcon },
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
            <div className={styles.footerLogo}>
              <img src={logoLightMode} alt="TailorPady" className={styles.footerLogoIcon} />
              <span className={`${styles.logoMark} `}>
                TailorPady
              </span>
            </div>
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
              {SOCIAL_LINKS.map(({ key, label, Icon }) => (
                <span key={key} className={styles.footerSocialLink} aria-label={label}>
                  <Icon />
                </span>
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