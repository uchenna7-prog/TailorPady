import { useState } from 'react'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import logoLightMode from '../../assets/logoLightMode.png'
import logoDarkMode from '../../assets/logoDarkMode.png'
import styles from './FirstRunFlow.module.css'

function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export default function NotificationPermission({ onDone, onSkip }) {
  const { generalSettings } = useGeneralSettings()
  const [requesting, setRequesting] = useState(false)
  const theme = generalSettings.theme
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
          <div className={styles.pulseWrap}>
            <span className={styles.pulseRing} />
            <div className={styles.permissionIcon}>
              <span className="mi-outlined">notifications</span>
            </div>
          </div>
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
