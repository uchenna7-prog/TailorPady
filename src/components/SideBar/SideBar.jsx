import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useInstall }         from '../../contexts/InstallContext'
import { useBadges }          from '../../contexts/BadgeContext'
import { useAuth }            from '../../contexts/AuthContext'
import { useTour }            from '../../contexts/TourContext'
import ConfirmSheet           from '../ConfirmSheet/ConfirmSheet'
import logoLightMode          from '../../assets/logoLightMode.png'
import logoDarkMode           from '../../assets/logoDarkMode.png'
import styles                 from './SideBar.module.css'

const NAV_SECTIONS = [
  {
    key: 'workspace',
    label: 'Workspace',
    items: [
      { path: '/dashboard',          label: 'Dashboard', icon: 'dashboard'                            },
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
      { path: '/app/contact',     label: 'Contact Us',   icon: 'call'         },
      { path: '/app/faq',         label: 'FAQs',         icon: 'help_outline' },
      { path: '/report-bug',  label: 'Report a Bug', icon: 'bug_report'  },
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
      { path: '/settings', label: 'Settings', icon: 'settings'              },
      { path: '/account',  label: 'Account',  icon: 'person'                },
      { action: 'logout',  label: 'Log out',  icon: 'logout', danger: true  },
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
  const { triggerInstall, isInstalled } = useInstall()
  const badges              = useBadges()
  const { logout }          = useAuth()
  const { currentStep, goToStep, completeStep } = useTour()

  const [scrolled, setScrolled]         = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const scrollRef = useRef(null)

  const theme   = generalSettings.theme
  const logoSrc = theme === 'dark' ? logoLightMode : logoDarkMode

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
          title: 'TailorPady',
          text:  'Check out TailorPady!',
          url:   window.location.origin,
        })
      } catch {}
    }
  }

  const handleAction = (action) => {
    if (action === 'share')   handleShare()
    if (action === 'install') triggerInstall()
    if (action === 'logout')  { setLogoutConfirm(true); return }
    onClose()
  }

  const handleNav = (path) => {
    if (path === '/account' && currentStep?.id === 'highlight-sidebar-account') {
      goToStep('highlight-edit-brand')
    }
    if (path === '/customers' && currentStep?.id === 'goto-customers-nav') {
      completeStep('goto-customers-nav')
    }
    if (path === '/gallery' && currentStep?.id === 'portfolio-goto-gallery') {
      completeStep('portfolio-goto-gallery')
    }
    if (path === '/gallery' && currentStep?.id === 'portfolio-goto-gallery-for-share') {
      completeStep('portfolio-goto-gallery-for-share')
    }
    if (path === '/settings' && currentStep?.id === 'portfolio-goto-settings') {
      completeStep('portfolio-goto-settings')
    }
    if (path === '/settings' && currentStep?.id === 'portfolio-goto-settings-2') {
      completeStep('portfolio-goto-settings-2')
    }
    if (path === '/settings' && currentStep?.id === 'ai-goto-settings') {
      completeStep('ai-goto-settings')
    }
    navigate(path)
    onClose()
  }

  const handleLogout = async () => {
    setLogoutConfirm(false)
    onClose()
    await logout()
    navigate('/login', { replace: true })
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
              src={logoSrc}
              alt="TailorPady"
              className={styles.brandIcon}
              style={{ background: theme === 'dark' ? '#ffffff' : '#000000' }}
            />
            <span className={styles.brandName}>TailorPady</span>
          </div>
        </div>

        <div
          className={styles.scrollArea}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <div className={styles.nav}>
            {NAV_SECTIONS.map((section, i) => {
              const visibleItems = section.items.filter(item => {
                if (item.action === 'install') return !isInstalled
                return true
              })

              if (visibleItems.length === 0) return null

              return (
                <div
                  key={section.key}
                  className={`${styles.section} ${i > 0 ? styles.sectionBordered : ''}`}
                >
                  <div className={styles.sectionLabel}>{section.label}</div>

                  {visibleItems.map((item) => {
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
                        data-tour={
                          item.path === '/account'   ? 'sidebar-account-nav'   :
                          item.path === '/customers' ? 'sidebar-customers-nav' :
                          item.path === '/gallery'   ? 'sidebar-gallery-nav'   :
                          item.path === '/settings'  ? 'sidebar-settings-nav'  :
                          undefined
                        }
                      >
                        <span className="mi">{item.icon}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                        {badge && <NavBadge count={badge.count} variant={badge.variant} />}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <div className={styles.footer}>
            <button className={styles.footerLink} onClick={() => handleNav('/app/terms')}>Terms & Conditions</button>
            <button className={styles.footerLink} onClick={() => handleNav('/app/refund')}>Refund / Cancellation Policy</button>
            <button className={styles.footerLink} onClick={() => handleNav('/app/privacy')}>Privacy Policy</button>
          </div>
        </div>

      </nav>

      <ConfirmSheet
        open={logoutConfirm}
        title="Log Out?"
        confirmText="Log Out"
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirm(false)}
      />
    </>
  )
}

export default SideBar
