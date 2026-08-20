import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../firebase'
import { getOnboardingStatus } from '../../services/profileService'
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
  const [stepIndex, setStepIndex] = useState(0)

  function advance() {
    setStepIndex(prev => {
      if (prev + 1 >= STEPS.length) {
        onComplete()
        return prev
      }
      return prev + 1
    })
  }

  const step = STEPS[stepIndex]

  if (step === 'welcome') return <WelcomeCarousel onDone={advance} />
  if (step === 'notifications') return <NotificationPermission onDone={advance} />
  return <RoleSelection onDone={advance} />
}
