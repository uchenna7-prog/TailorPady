import { useState } from 'react'
import styles from './FirstRunFlow.module.css'

function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export default function NotificationPermission({ onDone }) {
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
      <div className={styles.card}>
        <div className={styles.permissionIconWrap}>
          <div className={styles.permissionIcon}>
            <span className="mi-outlined">notifications</span>
          </div>
        </div>

        <h1 className={styles.title}>Keep a pulse on your business</h1>
        <p className={styles.sub}>
          Get notified about tasks due, upcoming appointments, and unpaid invoices so you are always on top of things.
        </p>

        <button className={styles.primaryBtn} onClick={handleAllow} disabled={requesting}>
          {requesting ? 'Requesting…' : 'Allow Notifications'}
        </button>
        <button className={styles.secondaryBtn} onClick={onDone} disabled={requesting}>
          Not Right Now
        </button>
      </div>
    </div>
  )
}
