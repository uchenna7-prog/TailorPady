import { useState } from 'react'
import notificationsImage from '../../assets/onboarding/onboarding-notifications.png'
import styles from './FirstRunFlow.module.css'

function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export default function NotificationPermission({ onDone, onSkip }) {
  const [requesting, setRequesting] = useState(false)

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

      <div className={styles.slideTrack}>
        <div className={styles.backdrop}>
          <img src={notificationsImage} alt="Notifications preview" className={styles.image} draggable={false} />
        </div>

        <h1 className={styles.title}>Never Miss An Important Update</h1>
        <p className={styles.sub}>
          Get reminders about appointments, unpaid bills, tasks, and important updates.
        </p>
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
