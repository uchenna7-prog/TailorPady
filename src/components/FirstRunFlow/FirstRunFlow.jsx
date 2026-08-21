import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../firebase'
import { getOnboardingStatus, skipOnboarding } from '../../services/profileService'
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
    // best-effort cache, Firestore remains the source of truth
  }
}

export function useFirstRunStatus() {
  const { user } = useAuth()
  const [checking, setChecking] = useState(true)
  const [shouldShow, setShouldShow] = useState(false)
  const [debugError, setDebugError] = useState(null)

  useEffect(() => {
    if (!user?.uid) {
      setChecking(false)
      return
    }

    const forceShow = new URLSearchParams(window.location.search).get('resetOnboarding') === '1'

    if (!forceShow && readCachedCompleted(user.uid)) {
      setShouldShow(false)
      setChecking(false)
      return
    }

    let cancelled = false

    getOnboardingStatus(db, user.uid)
      .then(status => {
        if (cancelled) return
        const show = forceShow || !status.onboardingCompleted
        setShouldShow(show)
        if (!show) writeCachedCompleted(user.uid)
      })
      .catch(err => {
        if (cancelled) return
        setDebugError(err?.message || String(err))
        setShouldShow(false)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => { cancelled = true }
  }, [user?.uid])

  function markCompleted() {
    if (user?.uid) writeCachedCompleted(user.uid)
    setShouldShow(false)
  }

  return { checking, shouldShow, markCompleted, debugError }
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
        transform: fading ? 'translateY(6px)' : 'translateY(0)',
        transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
      }}
    >
      {renderStep(displayStep, advance, handleSkip)}
    </div>
  )
}
