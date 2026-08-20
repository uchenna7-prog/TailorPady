import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useInstall } from '../../../../contexts/InstallContext'
import logoLightMode from '../../../../assets/logoLightMode.png'
import logoDarkMode from '../../../../assets/logoDarkMode.png'
import styles from './SiteNav.module.css'

const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#product', label: 'Product' },
  { href: '/#how', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
]

const SECTION_IDS = NAV_LINKS.map(link => link.href.split('#')[1])

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || navigator.vendor || ''
  const isAppleHandheld = /iPad|iPhone|iPod/.test(ua)
  const isIPadOnMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isAppleHandheld || isIPadOnMac
}

function useActiveSection(ids, enabled) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!enabled) return
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [ids, enabled])

  return active
}

function useScrollCollapse() {
  const [scrolled, setScrolled] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    let ticking = false

    const update = () => {
      const y = window.scrollY
      const delta = y - lastY.current

      setScrolled(y > 12)

      if (y < 80) {
        setCollapsed(false)
      } else if (delta > 4) {
        setCollapsed(true)
      } else if (delta < -4) {
        setCollapsed(false)
      }

      lastY.current = y
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { scrolled, collapsed }
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="mi-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
    </button>
  )
}

function InstallButton({ className, fullWidth }) {
  const install = useInstall()
  const [showIOSHint, setShowIOSHint] = useState(false)

  if (!install || install.isInstalled) return null

  const iOS = isIOSDevice()
  if (!install.installPrompt && !iOS) return null

  const handleClick = async () => {
    if (install.installPrompt) {
      await install.triggerInstall()
      return
    }
    setShowIOSHint(prev => !prev)
  }

  return (
    <div className={`${styles.installWrap} ${fullWidth ? styles.installWrapFull : ''}`}>
      <button type="button" className={`${styles.installButton} ${className || ''}`} onClick={handleClick}>
        <span className="mi-outlined" style={{ fontSize: '1.05rem' }}>install_mobile</span>
        Install app
      </button>
      {showIOSHint && (
        <div className={styles.installHint}>
          <span className={styles.installHintTitle}>Install on iPhone or iPad</span>
          <ol className={styles.installHintList}>
            <li>Tap the Share icon in Safari</li>
            <li>Scroll down and tap Add to Home Screen</li>
            <li>Tap Add to confirm</li>
          </ol>
          <button type="button" className={styles.installHintClose} onClick={() => setShowIOSHint(false)}>
            Got it
          </button>
        </div>
      )}
    </div>
  )
}

export default function SiteNav({
  theme,
  onToggleTheme,
  showLinks = true,
  showInstall = true,
  showAuth = true,
  showThemeToggle = true,
}) {
  const [open, setOpen] = useState(false)
  const { scrolled, collapsed } = useScrollCollapse()
  const activeSection = useActiveSection(SECTION_IDS, showLinks)

  const goTo = path => {
    window.location.href = path
  }

  const hasMobilePanel = showLinks || showInstall || showAuth
  const logoSrc = theme === 'dark' ? logoLightMode : logoDarkMode
  const isCollapsed = collapsed && !open

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
      <div className={styles.navInner}>
        <Link to="/" className={styles.logo}>
          <img src={logoSrc} alt="TailorPady" className={styles.logoIcon} />
          <span className={`${styles.logoMark} ${isCollapsed ? styles.logoMarkCollapsed : ''}`}>
            TailorPady
          </span>
        </Link>

        {showLinks && (
          <nav className={styles.navLinks}>
            {NAV_LINKS.map(link => {
              const id = link.href.split('#')[1]
              const isActive = id === activeSection
              return (
                <a key={link.href} href={link.href} className={isActive ? styles.navLinkActive : ''}>
                  <span className={styles.navLinkIndicator} />
                  {link.label}
                </a>
              )
            })}
          </nav>
        )}

        <div className={styles.navActions}>
          {(showThemeToggle || showInstall) && (
            <div className={styles.navUtility}>
              {showThemeToggle && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
              {showInstall && <InstallButton />}
            </div>
          )}
          {showAuth && (
            <div className={styles.navButtonGroup}>
              <a href="/login" className={styles.navLogin}>
                Log in
              </a>
              <button type="button" className={styles.navCta} onClick={() => goTo('/signup')}>
                Start free
              </button>
            </div>
          )}
        </div>

        <div className={styles.navMobileTrigger}>
          {showThemeToggle && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
          {hasMobilePanel ? (
            <button
              type="button"
              className={styles.navMenuButton}
              onClick={() => setOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              <span className="mi-outlined">{open ? 'close' : 'menu'}</span>
            </button>
          ) : null}
        </div>
      </div>

      {open && hasMobilePanel && (
        <div className={styles.navMobilePanel}>
          {showLinks &&
            NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
          {(showInstall || showAuth) && (
            <div className={styles.navMobileActions}>
              {showInstall && <InstallButton className={styles.navMobileFullButton} fullWidth />}
              {showAuth && (
                <>
                  <a href="/login" className={styles.navLoginMobile} onClick={() => setOpen(false)}>
                    Log in
                  </a>
                  <button type="button" className={styles.navCta} onClick={() => goTo('/signup')}>
                    Start free
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  )
}