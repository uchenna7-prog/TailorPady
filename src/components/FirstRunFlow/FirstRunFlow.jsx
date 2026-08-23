import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../firebase'
import { skipOnboarding } from '../../services/profileService'
import RoleSelection from './RoleSelection'
import WelcomeCarousel from './WelcomeCarousel'
import NotificationPermission from './NotificationPermission'

const STEPS = ['welcome', 'notifications', 'role']
const TRANSITION_MS = 200
const CACHE_KEY_PREFIX = 'tp_onboarding_completed_'

function readCachedCompleted(uid) {
  try {
    return localStorage.getItem(CACHE_KEY_PREFIX + uid) === 'true'
  } catch {
    return false
  }
}

function writeCachedCompleted(uid) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + uid, 'true')
  } catch {
    // best-effort cache, safe to skip if storage is unavailable
  }
}

export function useFirstRunStatus() {
  const { user } = useAuth()
  const [sessionCompleted, setSessionCompleted] = useState(false)

  const forceShow = new URLSearchParams(window.location.search).get('resetOnboarding') === '1'
  const cachedCompleted = user?.uid ? readCachedCompleted(user.uid) : false
  const shouldShow = !!user?.uid && (forceShow || (!cachedCompleted && !sessionCompleted))

  function markCompleted() {
    if (user?.uid) writeCachedCompleted(user.uid)
    setSessionCompleted(true)
  }

  return { checking: false, shouldShow, markCompleted }
}

function renderStep(step, onDone, onSkip) {
  if (step === 'welcome') return <WelcomeCarousel onDone={onDone} onSkip={onSkip} />
  if (step === 'notifications') return <NotificationPermission onDone={onDone} onSkip={onSkip} />
  return <RoleSelection onDone={onDone} onSkip={onSkip} />
}

export default function FirstRunFlow({ onComplete }) {
  const { user } = useAuth()
  const [stepIndex, setStepIndex] = useState(0)
  const [displayStep, setDisplayStep] = useState(STEPS[0])
  const [fading, setFading] = useState(false)
  const [skipping, setSkipping] = useState(false)

  const step = STEPS[stepIndex]

  useEffect(() => {
    if (step === displayStep) return
    setFading(true)
    const timer = setTimeout(() => {
      setDisplayStep(step)
      setFading(false)
    }, TRANSITION_MS)
    return () => clearTimeout(timer)
  }, [step, displayStep])

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

  return (
    <div
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${TRANSITION_MS}ms ease`,
      }}
    >
      {renderStep(displayStep, advance, handleSkip)}
    </div>
  )
}
