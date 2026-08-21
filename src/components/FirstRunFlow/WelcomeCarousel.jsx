import { useState, useRef } from 'react'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import logoLightMode from '../../assets/logoLightMode.png'
import logoDarkMode from '../../assets/logoDarkMode.png'
import dashboardSlide from '../../assets/onboarding/onboarding-dashboard.png'
import ordersSlide from '../../assets/onboarding/onboarding-orders.png'
import notificationsSlide from '../../assets/onboarding/onboarding-notifications.png'
import styles from './FirstRunFlow.module.css'

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
const DRAG_DAMPING = 0.55

export default function WelcomeCarousel({ onDone, onSkip }) {
  const { generalSettings } = useGeneralSettings()
  const [index, setIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
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
    setDragging(true)
  }

  function handleTouchMove(e) {
    if (touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    setDragX(delta * DRAG_DAMPING)
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    setDragging(false)
    setDragX(0)
    if (deltaX <= -SWIPE_THRESHOLD) goToNext()
    else if (deltaX >= SWIPE_THRESHOLD) goToPrev()
    touchStartX.current = null
  }

  return (
    <div className={styles.page}>
      <button type="button" className={styles.skipBtn} onClick={onSkip}>
        Skip
      </button>

      <div className={styles.header}>
        <div className={styles.logoWrap}>
          <img src={logoSrc} alt="TailorPady" className={styles.logoIcon} />
        </div>
      </div>

      <div
        key={index}
        className={styles.slideTrack}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <h1 className={styles.title}>{slide.title}</h1>
        <p className={styles.sub}>{slide.sub}</p>

        <div className={styles.backdrop}>
          <img src={slide.image} alt={slide.title} className={styles.image} draggable={false} />
        </div>
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
            <span className={`${styles.dot} ${i === index ? styles.dotActive : ''}`} />
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.primaryBtn} onClick={goToNext}>
          {isLast ? 'Continue' : 'Next'}
        </button>
      </div>
    </div>
  )
}
