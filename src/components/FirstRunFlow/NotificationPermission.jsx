import { useState } from 'react'
import logoLightMode from '../../assets/logoLightMode.png'
import logoDarkMode from '../../assets/logoDarkMode.png'
import notificationsImage from '../../assets/onboarding/onboarding-notifications.png'
import styles from './FirstRunFlow.module.css'

function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

function getTheme() {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export default function NotificationPermission({ onDone, onSkip }) {
  const [requesting, setRequesting] = useState(false)
  const theme = getTheme()
  const logoSrc = theme === 'dark' ? logoLightMode : logoDarkMode

  async function handleAllow() {
    if (!isNotificationSupported()) {
      onDone()
      return
    }
    setRequesting(true)
    try {
      await Notification.requestPermission()
    } catch {
      setRequesting(false)
      onDone()
      return
    }
    setRequesting(false)
    onDone()
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

      <div className={styles.slideTrack}>
        <h1 className={styles.title}>Keep a pulse on your business</h1>
        <p className={styles.sub}>
          Get notified about tasks due, upcoming appointments, and unpaid invoices so you are always on top of things.
        </p>

        <div className={styles.backdrop}>
          <img src={notificationsImage} alt="Notifications preview" className={styles.image} draggable={false} />
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.primaryBtn} onClick={handleAllow} disabled={requesting}>
          {requesting ? 'Requesting…' : 'Allow Notifications'}
        </button>
        <button className={styles.secondaryBtn} onClick={onDone} disabled={requesting}>
          Not Now
        </button>
      </div>
    </div>
  )
}
