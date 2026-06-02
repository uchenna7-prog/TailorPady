import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useInstall }         from '../../contexts/InstallContext'
import { useBadges }          from '../../contexts/BadgeContext'
import logoLightMode          from '../../assets/logoLightMode.png'
import logoDarkMode           from '../../assets/logoDarkMode.png'
import styles                 from './SideBar.module.css'

const NAV_SECTIONS = [
  {
    key: 'workspace',
    label: 'Workspace',
    items: [
      { path: '/',          label: 'Dashboard', icon: 'dashboard'                            },
      { path: '/customers', label: 'Customers', icon: 'groups'                               },
      { path: '/orders',    label: 'Orders',    icon: 'shopping_cart', badgeKey: 'orders'    },
      { path: '/inventory', label: 'Inventory', icon: 'inventory_2'                          },
      { path: '/gallery',   label: 'Gallery',   icon: 'photo_library'                        },
    ],
  },
  {
    key: 'schedule',
    label: 'Schedule',
    items: [
      { path: '/appointments', label: 'Appointments', icon: 'event',      badgeKey: 'appointments' },
      { path: '/tasks',        label: 'Tasks',        icon: 'assignment', badgeKey: 'tasks'        },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    items: [
      { path: '/payments', label: 'Payments', icon: 'payments'                              },
      { path: '/invoices', label: 'Invoices', icon: 'receipt_long', badgeKey: 'invoices'    },
      { path: '/receipts', label: 'Receipts', icon: 'receipt'                               },
    ],
  },
  {
    key: 'insights',
    label: 'Insights',
    items: [
      { path: '/reports', label: 'Reports', icon: 'bar_chart'                           },
      { path: '/reviews', label: 'Reviews', icon: 'rate_review', badgeKey: 'reviews'   },
    ],
  },
  {
    key: 'help',
    label: 'Help',
    items: [
      { path: '/contact', label: 'Contact Us', icon: 'call'         },
      { path: '/faq',     label: 'FAQs',       icon: 'help_outline' },
    ],
  },
  {
    key: 'more',
    label: 'More',
    items: [
      { action: 'share',   label: 'Share App',   icon: 'share'          },
      { action: 'install', label: 'Install App', icon: 'install_mobile' },
    ],
  },
  {
    key: 'account',
    label: 'Account',
    items: [
      { path: '/settings', label: 'Settings', icon: 'settings' },
      { path: '/profile',  label: 'Account',  icon: 'person'   },
      { path: '/login',    label: 'Log out',  icon: 'logout',  danger: true },
    ],
  },
]

function NavBadge({ count, variant = 'neutral' }) {
  if (!count || count === 0) return null
  return (
    <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

function SideBar({ isOpen, onClose }) {
  const location            = useLocation()
  const navigate            = useNavigate()
  const { generalSettings } = useGeneralSettings()
  const { triggerInstall }  = useInstall()
  const badges              = useBadges()

  const [scrolled, setScrolled] = useState(false)
  const scrollRef = useRef(null)

  const badgeMap = {
    orders:       { count: badges.orders,       variant: 'pending' },
    appointments: { count: badges.appointments, variant: 'info'    },
    tasks:        { count: badges.tasks,        variant: 'pending' },
    invoices:     { count: badges.invoices,     variant: 'pending' },
    reviews:      { count: badges.reviews,      variant: 'pending' },
  }

  const handleScroll = () => {
    setScrolled(scrollRef.current?.scrollTop > 0)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tailor Pady',
          text:  'For tailors who mean business — check out Tailor Pady!',
          url:   window.location.origin,
        })
      } catch {}
    }
  }

  const handleAction = (action) => {
    if (action === 'share')   handleShare()
    if (action === 'install') triggerInstall()
    onClose()
  }

  const handleNav = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}
      />

      <nav className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>

        <div className={`${styles.top} ${scrolled ? styles.topScrolled : ''}`}>
          <div className={styles.brand}>
            <img
              src={generalSettings.theme === 'light' ? logoLightMode : logoDarkMode}
              alt="Tailor Pady"
              className={styles.brandIcon}
            />
            <div className={styles.brandText}>
              <span className={styles.brandName}>Tailor Pady</span>
              <span className={styles.tagline}>For tailors who mean business</span>
            </div>
          </div>
        </div>

        <div
          className={styles.scrollArea}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <div className={styles.nav}>
            {NAV_SECTIONS.map((section, i) => (
              <div
                key={section.key}
                className={`${styles.section} ${i > 0 ? styles.sectionBordered : ''}`}
              >
                <div className={styles.sectionLabel}>{section.label}</div>

                {section.items.map((item) => {
                  const badge    = item.badgeKey ? badgeMap[item.badgeKey] : null
                  const isActive = item.path && location.pathname === item.path

                  return (
                    <button
                      key={item.action ?? item.path}
                      className={`
                        ${styles.navItem}
                        ${isActive    ? styles.active : ''}
                        ${item.danger ? styles.danger : ''}
                      `}
                      onClick={() =>
                        item.action ? handleAction(item.action) : handleNav(item.path)
                      }
                    >
                      <span className="mi">{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                      {badge && <NavBadge count={badge.count} variant={badge.variant} />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <button className={styles.footerLink}>Terms &amp; Conditions</button>
            <button className={styles.footerLink}>Refund / Cancellation Policy</button>
            <button className={styles.footerLink}>Privacy Policy</button>
          </div>
        </div>

      </nav>
    </>
  )
}

export default SideBar