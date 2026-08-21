import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../firebase'
import { getOnboardingStatus, skipOnboarding } from '../../services/profileService'
import RoleSelection from './RoleSelection'
import WelcomeCarousel from './WelcomeCarousel'
import NotificationPermission from './NotificationPermission'

const STEPS = ['welcome', 'notifications', 'role']

export function useFirstRunStatus() {
  const { user } = useAuth()
  const [checking, setChecking] = useState(true)
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (!user?.uid) {
      setChecking(false)
      return
    }

    let cancelled = false

    getOnboardingStatus(db, user.uid)
      .then(status => {
        if (cancelled) return
        setShouldShow(!status.onboardingCompleted)
      })
      .catch(() => {
        if (!cancelled) setShouldShow(false)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => { cancelled = true }
  }, [user?.uid])

  return { checking, shouldShow, setShouldShow }
}

export default function FirstRunFlow({ onComplete }) {
  const { user } = useAuth()
  const [stepIndex, setStepIndex] = useState(0)
  const [skipping, setSkipping] = useState(false)

  function advance() {
    setStepIndex(prev => {
      if (prev + 1 >= STEPS.length) {
        onComplete()
        return prev
      }
      return prev + 1
    })
  }

  async function handleSkip() {
    if (skipping || !user?.uid) {
      onComplete()
      return
    }
    setSkipping(true)
    try {
      await skipOnboarding(db, user.uid)
    } catch {
      // non-blocking: user should not get stuck in onboarding over a network hiccup
    } finally {
      setSkipping(false)
      onComplete()
    }
  }

  const step = STEPS[stepIndex]

  if (step === 'welcome') return <WelcomeCarousel onDone={advance} onSkip={handleSkip} />
  if (step === 'notifications') return <NotificationPermission onDone={advance} onSkip={handleSkip} />
  return <RoleSelection onDone={advance} onSkip={handleSkip} />
}
