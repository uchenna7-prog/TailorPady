import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../firebase'
import { getOnboardingStatus } from '../../services/profileService'
import RoleSelection from './RoleSelection'
import WelcomeCarousel from './WelcomeCarousel'
import NotificationPermission from './NotificationPermission'

const STEPS = ['role', 'welcome', 'notifications']

export default function FirstRunFlow() {
  const { user } = useAuth()
  const [checking, setChecking] = useState(true)
  const [shouldShow, setShouldShow] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

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

  function advance() {
    setStepIndex(prev => {
      if (prev + 1 >= STEPS.length) {
        setShouldShow(false)
        return prev
      }
      return prev + 1
    })
  }

  if (checking || !shouldShow) return null

  const step = STEPS[stepIndex]

  if (step === 'role') return <RoleSelection onDone={advance} />
  if (step === 'welcome') return <WelcomeCarousel onDone={advance} />
  return <NotificationPermission onDone={advance} />
}
