import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ProfileSetupCard.module.css'

const STEP_DESTINATIONS = {
  brandName:    { route: '/account', modal: 'brand' },
  brandLogo:    { route: '/account', modal: 'brand' },
  brandColour:  { route: '/account', modal: 'brand' },
  contactInfo:  { route: '/account', modal: 'businessContact' },
  brandAddress: { route: '/account', modal: 'businessContact' },
}

export function ProfileSetupCard({ completedCount, totalCount, nextItem, nextItemKey }) {
  const navigate  = useNavigate()
  const [hidden, setHidden] = useState(
    () => sessionStorage.getItem('profileSetupDismissed') === 'true'
  )

  if (hidden) return null

  function dismiss(e) {
    e.stopPropagation()
    sessionStorage.setItem('profileSetupDismissed', 'true')
    setHidden(true)
  }

  const isDone = completedCount >= totalCount

  function handleClick() {
    const destination = STEP_DESTINATIONS[nextItemKey]
    if (destination) {
      navigate(destination.route, { state: { autoOpenModal: destination.modal } })
      return
    }
    navigate('/account')
  }

  return (
    <div className={styles.card} onClick={handleClick} role="button" tabIndex={0}>
      <div className={styles.inner}>

        <div className={styles.iconWrap}>
          <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>storefront</span>
        </div>

        <div className={styles.body}>
          <div className={styles.topRow}>
            <span className={styles.title}>Complete your profile</span>
            <span className={styles.badge}>{completedCount}/{totalCount}</span>
          </div>
          <span className={styles.sub}>
            {isDone
              ? 'Your profile is all set — looking good!'
              : nextItem
                ? `Next up: ${nextItem}`
                : 'Finish setting up to brand your invoices and receipts.'}
          </span>
        </div>

        <button className={styles.dismiss} onClick={dismiss} aria-label="Dismiss">
          <span className="mi" style={{ fontSize: '1rem' }}>close</span>
        </button>

      </div>
    </div>
  )
}