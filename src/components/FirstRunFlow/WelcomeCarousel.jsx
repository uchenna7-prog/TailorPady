import { useState, useRef } from 'react'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import logoLightMode from '../../assets/logoLightMode.png'
import logoDarkMode from '../../assets/logoDarkMode.png'
import dashboardSlide from '../../assets/onboarding/onboarding-dashboard.png'
import ordersSlide from '../../assets/onboarding/onboarding-orders.png'
import notificationsSlide from '../../assets/onboarding/onboarding-notifications.png'
import styles from './WelcomeCarousel.module.css'

const SLIDES = [
  {
    title: 'All your business, one screen',
    sub: 'Revenue, active orders, and unpaid invoices at a glance, updated the moment something changes.',
    image: dashboardSlide,
  },
  {
    title: 'Never miss a deadline',
    sub: 'Every order shows its status and due date, so nothing slips through on delivery day.',
    image: ordersSlide,
  },
  {
    title: 'Get notified before it matters',
    sub: 'Tasks due today, appointments, and unpaid invoices come to you, so you never have to go looking.',
    image: notificationsSlide,
  },
]

const SWIPE_THRESHOLD = 50

export default function WelcomeCarousel({ onDone }) {
  const { generalSettings } = useGeneralSettings()
  const [index, setIndex] = useState(0)
  const touchStartX = useRef(null)

  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1
  const theme = generalSettings.theme
  const logoSrc = theme === 'dark' ? logoLightMode : logoDarkMode

  function goToNext() {
    if (isLast) {
      onDone()
      return
    }
    setIndex(prev => prev + 1)
  }

  function goToPrev() {
    setIndex(prev => (prev > 0 ? prev - 1 : prev))
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (deltaX <= -SWIPE_THRESHOLD) goToNext()
    else if (deltaX >= SWIPE_THRESHOLD) goToPrev()
    touchStartX.current = null
  }

  return (
    <div className={styles.page} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className={styles.header}>
        <img
          src={logoSrc}
          alt="TailorPady"
          className={styles.logoIcon}
          style={{ background: theme === 'dark' ? '#ffffff' : '#000000' }}
        />
        <div className={styles.logoText}>
          <span className={styles.logoName}>TailorPady</span>
          <span className={styles.logoTagline}>The business side of tailoring, simplified.</span>
        </div>
      </div>

      <h1 className={styles.title}>{slide.title}</h1>
      <p className={styles.sub}>{slide.sub}</p>

      <div className={styles.imageBackdrop}>
        <img src={slide.image} alt={slide.title} className={styles.image} />
      </div>

      <div className={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            className={styles.dotBtn}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          >
            <span
              className={`mi-outlined ${styles.dotIcon} ${i === index ? styles.dotIconActive : ''}`}
            >
              content_cut
            </span>
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.button} onClick={goToNext}>
          {isLast ? 'Continue' : 'Next'}
        </button>
      </div>
    </div>
  )
}
