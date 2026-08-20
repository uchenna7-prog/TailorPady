import { useState } from 'react'
import styles from './FirstRunFlow.module.css'

const SLIDES = [
  {
    title: 'All your business, one screen',
    sub: 'Revenue, active orders, and unpaid invoices at a glance, updated the moment something changes.',
    mockup: 'dashboard',
  },
  {
    title: 'Never miss a deadline',
    sub: 'Every order shows its status and due date, so nothing slips through on delivery day.',
    mockup: 'orders',
  },
  {
    title: 'Get notified before it matters',
    sub: 'Tasks due today, appointments, and unpaid invoices come to you, so you never have to go looking.',
    mockup: 'notifications',
  },
]

function DashboardMockup() {
  return (
    <div className={styles.phoneScreen}>
      <div className={styles.mockStatGrid}>
        <div className={styles.mockStatCard}>
          <span className="mi-outlined" style={{ fontSize: '1rem', color: 'var(--text3)' }}>work_outline</span>
          <div className={styles.mockStatValue}>2</div>
          <div className={styles.mockStatLabel}>Active orders</div>
        </div>
        <div className={styles.mockStatCard}>
          <span className="mi-outlined" style={{ fontSize: '1rem', color: 'var(--text3)' }}>receipt_long</span>
          <div className={styles.mockStatValue}>1</div>
          <div className={styles.mockStatLabel}>Unpaid invoice</div>
        </div>
      </div>
      <div className={styles.mockRevenueCard}>
        <div className={styles.mockRevenueLabel}>This month · Revenue</div>
        <div className={styles.mockRevenueValue}>₦80,000.00</div>
      </div>
    </div>
  )
}

function OrdersMockup() {
  return (
    <div className={styles.phoneScreen}>
      <div className={styles.mockListCard}>
        <div className={styles.mockThumb} />
        <div className={styles.mockListBody}>
          <p className={styles.mockListTitle}>Kaftan</p>
          <p className={styles.mockListSub}>Ready for pickup</p>
        </div>
        <span className={`${styles.mockTag} ${styles.mockTagDone}`}>Completed</span>
      </div>
      <div className={styles.mockListCard}>
        <div className={styles.mockThumb} />
        <div className={styles.mockListBody}>
          <p className={styles.mockListTitle}>Two ankara gowns</p>
          <p className={styles.mockListSub}>In progress</p>
        </div>
        <span className={`${styles.mockTag} ${styles.mockTagWait}`}>Due in 3 days</span>
      </div>
    </div>
  )
}

function NotificationsMockup() {
  return (
    <div className={styles.phoneScreen}>
      <div className={styles.mockNoticeCard}>
        <div className={styles.mockNoticeIcon}>
          <span className="mi-outlined">check_circle</span>
        </div>
        <div>
          <p className={styles.mockNoticeTitle}>Task due today</p>
          <p className={styles.mockNoticeBody}>Cut fabrics for Mrs. Briggs' gown</p>
        </div>
      </div>
      <div className={styles.mockNoticeCard}>
        <div className={styles.mockNoticeIcon}>
          <span className="mi-outlined">event</span>
        </div>
        <div>
          <p className={styles.mockNoticeTitle}>Appointment today</p>
          <p className={styles.mockNoticeBody}>Take Mr. Okonkwo's measurement</p>
        </div>
      </div>
      <div className={styles.mockNoticeCard}>
        <div className={styles.mockNoticeIcon}>
          <span className="mi-outlined">description</span>
        </div>
        <div>
          <p className={styles.mockNoticeTitle}>Unpaid invoice</p>
          <p className={styles.mockNoticeBody}>Kaftan order awaiting payment</p>
        </div>
      </div>
    </div>
  )
}

function renderMockup(kind) {
  if (kind === 'dashboard') return <DashboardMockup />
  if (kind === 'orders') return <OrdersMockup />
  return <NotificationsMockup />
}

export default function WelcomeCarousel({ onDone }) {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  function handleNext() {
    if (isLast) {
      onDone()
      return
    }
    setIndex(prev => prev + 1)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <div key={i} className={`${styles.dot} ${i === index ? styles.dotActive : ''}`} />
          ))}
        </div>

        <h1 className={styles.title}>{slide.title}</h1>
        <p className={styles.sub}>{slide.sub}</p>

        <div className={styles.phoneFrame}>
          <div className={styles.phone}>
            <div className={styles.phoneNotch} />
            {renderMockup(slide.mockup)}
          </div>
        </div>

        <button className={styles.primaryBtn} onClick={handleNext}>
          {isLast ? 'Continue' : 'Next'}
        </button>
      </div>
    </div>
  )
}
