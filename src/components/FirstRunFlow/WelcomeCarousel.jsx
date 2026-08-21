import { useState, useRef } from 'react'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import logoLightMode from '../../assets/logoLightMode.png'
import logoDarkMode from '../../assets/logoDarkMode.png'
import dashboardSlide from '../../assets/onboarding/onboarding-dashboard.png'
import ordersSlide from '../../assets/onboarding/onboarding-orders.png'
import customersSlide from '../../assets/onboarding/onboarding-customers.png'
import styles from './FirstRunFlow.module.css'

const SLIDES = [
  {
    title: 'Welcome to TailorPady',
    sub: 'Manage orders, customers, measurements, and payments, all in one simple app built for tailors.',
    image: dashboardSlide,
  },
  {
    title: 'Never miss a deadline',
    sub: 'Every order shows its status and due date, so nothing slips through on delivery day.',
    image: ordersSlide,
  },
  {
    title: 'Everything about your customer, in one place',
    sub: 'Contact info, measurements, orders, and payment history together, so you never lose track of a client.',
    image: customersSlide,
  },
]

const SWIPE_THRESHOLD = 50

export default function WelcomeCarousel({ onDone, onSkip }) {
  const { generalSettings } = useGeneralSettings()
  const [index, setIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const touchStartX = useRef(null)

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
    if ((index === 0 && delta > 0) || (index === SLIDES.length - 1 && delta < 0)) {
      setDragX(delta * 0.25)
    } else {
      setDragX(delta)
    }
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
        <img
          src={logoSrc}
          alt="TailorPady"
          className={styles.logoIcon}
          style={{ background: theme === 'dark' ? '#ffffff' : '#000000' }}
        />
      </div>

      <div
        className={styles.viewport}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles.strip}
          style={{
            transform: `translateX(calc(-${index * 100}vw + ${dragX}px))`,
            transition: dragging ? 'none' : 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {SLIDES.map(item => (
            <div key={item.title} className={styles.slideItem}>
              <h1 className={styles.title}>{item.title}</h1>
              <p className={styles.sub}>{item.sub}</p>
              <div className={styles.backdrop}>
                <img src={item.image} alt={item.title} className={styles.image} draggable={false} />
              </div>
            </div>
          ))}
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
