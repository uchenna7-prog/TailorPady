import { useState, useRef } from 'react'
import welcomeImage from '../../assets/onboarding/onboarding-welcome.webp'
import ordersSlide from '../../assets/onboarding/onboarding-orders.webp'
import customersSlide from '../../assets/onboarding/onboarding-customers.webp'
import styles from './FirstRunFlow.module.css'

const SLIDES = [
  {
    key: 'intro',
  },
  {
    key: 'orders',
    title: 'Track Every Order',
    sub: 'See what’s pending, in progress, completed, or ready for pickup.',
    image: ordersSlide,
  },
  {
    key: 'customers',
    title: 'Manage Customers',
    sub: 'Keep customer details, measurements, orders, payments and more together in one place.',
    image: customersSlide,
  },
]

const SWIPE_THRESHOLD = 50

export default function WelcomeCarousel({ onDone, onSkip }) {
  const [index, setIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const touchStartX = useRef(null)

  const isLast = index === SLIDES.length - 1

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

      {index > 0 && (
        <div className={styles.progressRow}>
          {SLIDES.slice(1).map((_, i) => (
            <span
              key={i}
              className={`${styles.progressSeg} ${i === index - 1 ? styles.progressSegActive : ''}`}
            />
          ))}
        </div>
      )}

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
          {SLIDES.map((item, i) => (
            <div key={item.key} className={styles.slideItem}>
              {i === 0 ? (
                <div className={styles.introSlide}>
                  <img
                    src={welcomeImage}
                    alt="Welcome to TailorPady"
                    className={styles.introImage}
                    draggable={false}
                  />
                  <div className={styles.introContent}>
                    <h1 className={styles.wordmark}>TailorPady</h1>
                    <p className={styles.introTagline}>The business side of tailoring, simplified.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.textBlock}>
                    <h1 className={styles.title}>{item.title}</h1>
                    <p className={styles.sub}>{item.sub}</p>
                  </div>
                  <div className={styles.backdrop}>
                    <img src={item.image} alt={item.title} className={styles.image} draggable={false} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {index === 0 ? (
        <div className={styles.introFooter}>
          <button type="button" className={styles.primaryBtn} onClick={goToNext}>
            Get Started
          </button>
        </div>
      ) : (
        <div className={styles.navFooter}>
          <button type="button" className={styles.backBtn} onClick={goToPrev}>
            Back
          </button>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={goToNext}
          >
            {isLast ? 'Continue' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
