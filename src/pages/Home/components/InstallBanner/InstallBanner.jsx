import { useEffect, useState } from 'react'
import { useInstall } from '../../../../contexts/InstallContext'
import styles from './InstallBanner.module.css'

const STORAGE_KEY   = 'TailorPady_install_banner'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function getBannerState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

function saveBannerState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function shouldShowBanner() {
  const state = getBannerState()

  // Permanently dismissed after second dismissal — never show again
  if (state.permanent) return false

  // First dismissal — only show again after 7 days
  if (state.dismissedAt) {
    const elapsed = Date.now() - state.dismissedAt
    return elapsed >= SEVEN_DAYS_MS
  }

  // Never been dismissed — show it
  return true
}

export function InstallBanner() {
  const { installPrompt, triggerInstall } = useInstall()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (installPrompt && shouldShowBanner()) {
      setVisible(true)
    }
  }, [installPrompt])

  const handleInstall = async () => {
    const accepted = await triggerInstall()
    if (accepted) setVisible(false)
  }

  const handleDismiss = () => {
    const state = getBannerState()

    if (state.dismissedAt) {
      // Second dismissal — permanently hide
      saveBannerState({ permanent: true })
    } else {
      // First dismissal — hide for 7 days
      saveBannerState({ dismissedAt: Date.now() })
    }

    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.banner}>
      <span className="mi" style={{ fontSize: '1.3rem', color: 'var(--accent)', flexShrink: 0 }}>
        install_mobile
      </span>

      <div className={styles.text}>
        <div className={styles.title}>Install Tailor Pady</div>
        <div className={styles.sub}>Fast access from your home screen, works offline</div>
      </div>

      <div className={styles.actions}>
        <button className={styles.install} onClick={handleInstall}>Install</button>
        <button className={styles.dismiss} onClick={handleDismiss}>Not now</button>
      </div>
    </div>
  )
}