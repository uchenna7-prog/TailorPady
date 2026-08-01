import { useEffect, useState } from 'react'
import { useInstall } from '../../../../contexts/InstallContext'
import { useTour } from '../../../../contexts/TourContext'
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
  if (state.permanent) return false
  if (state.dismissedAt) {
    const elapsed = Date.now() - state.dismissedAt
    return elapsed >= SEVEN_DAYS_MS
  }
  return true
}

export function InstallBanner() {
  const { installPrompt, triggerInstall } = useInstall()
  const { completeStep, currentStep } = useTour()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (installPrompt && shouldShowBanner()) {
      setVisible(true)
    }
  }, [installPrompt])

  useEffect(() => {
    if (currentStep?.id !== 'install-app') return
    if (visible) return
    if (!installPrompt || !shouldShowBanner()) {
      completeStep('install-app')
    }
  }, [currentStep, visible, installPrompt, completeStep])

  const handleInstall = () => {
    triggerInstall().catch(() => {})
    completeStep('install-app')
    setVisible(false)
  }

  const handleDismiss = () => {
    const state = getBannerState()

    if (state.dismissedAt) {
      saveBannerState({ permanent: true })
    } else {
      saveBannerState({ dismissedAt: Date.now() })
    }

    completeStep('install-app')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.banner}>
      <span className="mi" style={{ fontSize: '1.3rem', color: 'var(--accent)', flexShrink: 0 }}>
        install_mobile
      </span>

      <div className={styles.text}>
        <div className={styles.title}>Install TailorPady</div>
        <div className={styles.sub}>Fast access from your home screen, works offline</div>
      </div>

      <div className={styles.actions}>
        <button className={styles.install} onClick={handleInstall} data-tour="install-app-btn">Install</button>
        <button className={styles.dismiss} onClick={handleDismiss}>Not now</button>
      </div>
    </div>
  )
}