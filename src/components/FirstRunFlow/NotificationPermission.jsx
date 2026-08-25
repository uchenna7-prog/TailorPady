import { useState } from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import notificationsImage from '../../assets/onboarding/onboarding-notifications.webp'
import styles from './FirstRunFlow.module.css'

export default function NotificationPermission({ onDone, onSkip }) {
  const { requestPushPermission } = useNotifications()
  const [requesting, setRequesting] = useState(false)

  async function handleAllow() {
    setRequesting(true)
    try {
      await requestPushPermission()
    } catch {
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
        <div className={styles.textBlock}>
          <h1 className={styles.title}>Stay Updated</h1>
          <p className={styles.sub}>
            Get timely reminders for appointments, unpaid bills, tasks, and important updates.
          </p>
        </div>

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
