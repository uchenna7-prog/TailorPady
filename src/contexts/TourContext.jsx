import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TOURS } from '../datas/tourSteps'
import { getSessionId } from '../utils/sessionId'

const ONBOARDING_SESSION_KEY = 'tp_onboarding_completed_session'
const REVENUE_GOAL_NUDGE_SESSION_KEY = 'tp_revenue_goal_nudge_completed_session'

const STORAGE_KEY = 'tp_tours_completed'

const TourContext = createContext(null)

function loadCompletedTours() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveCompletedTours(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function TourProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTourId, setActiveTourId]     = useState(null)
  const [stepIndex, setStepIndex]           = useState(0)
  const [pendingCustomerId, setPendingCustomerId] = useState(null)
  const [pendingViewItemId, setPendingViewItemId] = useState(null)
  const [paused, setPaused]                 = useState(false)
  const [completedTours, setCompletedTours] = useState(loadCompletedTours)
  const [quitPromptOpen, setQuitPromptOpen] = useState(false)
  const pendingNavRef = useRef(null)
  const pauseCountRef = useRef(0)
  const lastActivePathRef = useRef(null)
  const suppressPopStateRef = useRef(false)

  const steps       = activeTourId ? TOURS[activeTourId] : null
  const currentStep = steps ? steps[stepIndex] : null

  const findStepIndex = useCallback((stepId) => {
    if (!steps) return -1
    return steps.findIndex(s => s.id === stepId)
  }, [steps])

  const resetTourState = useCallback((tourId, index = 0) => {
    setActiveTourId(tourId)
    setStepIndex(index)
    setPendingCustomerId(null)
    setPendingViewItemId(null)
    setPaused(false)
    pauseCountRef.current = 0
    suppressPopStateRef.current = false
  }, [])

  const persistTourSeen = useCallback((tourId) => {
    setCompletedTours(prev => {
      if (prev[tourId]) return prev
      const next = { ...prev, [tourId]: true }
      saveCompletedTours(next)
      return next
    })
    if (tourId === 'onboarding') {
      try {
        localStorage.setItem(ONBOARDING_SESSION_KEY, getSessionId())
      } catch {}
    }
    if (tourId === 'revenue-goal-nudge') {
      try {
        localStorage.setItem(REVENUE_GOAL_NUDGE_SESSION_KEY, getSessionId())
      } catch {}
    }
  }, [])

  const finishTour = useCallback(() => {
    if (activeTourId) persistTourSeen(activeTourId)
    resetTourState(null)
  }, [activeTourId, resetTourState, persistTourSeen])

  const startTour = useCallback((tourId) => {
    if (!TOURS[tourId]) return
    resetTourState(tourId, 0)
    window.history.pushState({ tourGuard: true }, '')
  }, [resetTourState])

  const skipTour = useCallback(() => {
    if (activeTourId) persistTourSeen(activeTourId)
    resetTourState(null)
  }, [activeTourId, resetTourState, persistTourSeen])

  const guardNavigation = useCallback((navFn) => {
    if (!activeTourId) {
      navFn()
      return
    }
    pendingNavRef.current = navFn
    setQuitPromptOpen(true)
  }, [activeTourId])

  const confirmQuitTour = useCallback(() => {
    setQuitPromptOpen(false)
    skipTour()
    const fn = pendingNavRef.current
    pendingNavRef.current = null
    fn?.()
  }, [skipTour])

  const cancelQuitTour = useCallback(() => {
    setQuitPromptOpen(false)
    pendingNavRef.current = null
  }, [])

  const suppressNextPopState = useCallback(() => {
    suppressPopStateRef.current = true
    setTimeout(() => { suppressPopStateRef.current = false }, 500)
  }, [])

  useEffect(() => {
    if (activeTourId) {
      lastActivePathRef.current = location.pathname
    }
  }, [activeTourId, location.pathname])

  useEffect(() => {
    function handlePopState() {
      if (suppressPopStateRef.current) {
        suppressPopStateRef.current = false
        return
      }
      if (!activeTourId) return

      const restorePath = lastActivePathRef.current
      if (restorePath) {
        navigate(restorePath)
      }

      guardNavigation(() => {
        suppressPopStateRef.current = true
        navigate(-1)
        setTimeout(() => { suppressPopStateRef.current = false }, 500)
      })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeTourId, guardNavigation, navigate])

  const advanceTo = useCallback((nextIndex) => {
    if (!steps) return
    if (nextIndex >= steps.length) {
      finishTour()
      return
    }
    const nextStep = steps[nextIndex]
    setStepIndex(nextIndex)
    if (nextStep.route) navigate(nextStep.route)
  }, [steps, navigate, finishTour])

  const completeStep = useCallback((stepId, payload) => {
    if (!steps || !currentStep) return
    if (currentStep.id !== stepId) return
    if (payload?.customerId) setPendingCustomerId(payload.customerId)
    if (payload?.itemId) setPendingViewItemId(payload.itemId)
    advanceTo(stepIndex + 1)
  }, [steps, currentStep, stepIndex, advanceTo])

  const advanceManual = useCallback(() => {
    if (!currentStep?.manual) return
    advanceTo(stepIndex + 1)
  }, [currentStep, stepIndex, advanceTo])

  const resolveConfirm = useCallback((stepId, outcome) => {
    if (!currentStep || currentStep.id !== stepId || currentStep.type !== 'confirm') return
    if (outcome === 'yes') {
      const target = currentStep.yesTarget ? findStepIndex(currentStep.yesTarget) : stepIndex + 1
      if (target === -1) {
        finishTour()
        return
      }
      advanceTo(target)
    } else {
      const target = currentStep.noTarget ? findStepIndex(currentStep.noTarget) : -1
      if (target === -1) {
        finishTour()
        return
      }
      advanceTo(target)
    }
  }, [currentStep, stepIndex, advanceTo, findStepIndex, finishTour])

  const resolveBranch = useCallback((stepId, choice) => {
    if (!currentStep || currentStep.id !== stepId || currentStep.type !== 'branch') return
    const targetId = choice === 'view' ? currentStep.viewTarget : currentStep.nextTarget
    const target = findStepIndex(targetId)
    if (target === -1) {
      finishTour()
      return
    }
    advanceTo(target)
  }, [currentStep, findStepIndex, advanceTo, finishTour])

  const resolveShortcut = useCallback((phaseStepIds, nextStepId) => {
    if (!steps || !currentStep) return
    if (!phaseStepIds.includes(currentStep.id)) return
    const target = findStepIndex(nextStepId)
    if (target === -1) {
      finishTour()
      return
    }
    if (target <= stepIndex) return
    advanceTo(target)
  }, [steps, currentStep, stepIndex, findStepIndex, advanceTo, finishTour])

  const goToStep = useCallback((stepId) => {
    const idx = findStepIndex(stepId)
    if (idx === -1) return
    advanceTo(idx)
  }, [findStepIndex, advanceTo])

  const skipCurrentStep = useCallback(() => {
    advanceTo(stepIndex + 1)
  }, [stepIndex, advanceTo])

  const pauseTour = useCallback(() => {
    pauseCountRef.current += 1
    setPaused(true)
  }, [])

  const resumeTour = useCallback(() => {
    pauseCountRef.current = Math.max(0, pauseCountRef.current - 1)
    if (pauseCountRef.current === 0) setPaused(false)
  }, [])

  const value = {
    activeTourId,
    currentStep,
    stepIndex,
    totalSteps: steps?.length ?? 0,
    isActive: !!activeTourId && !paused,
    pendingCustomerId,
    pendingViewItemId,
    hasCompletedTour: (tourId) => !!completedTours[tourId],
    startTour,
    skipTour,
    finishTour,
    completeStep,
    advanceManual,
    resolveConfirm,
    resolveBranch,
    resolveShortcut,
    goToStep,
    skipCurrentStep,
    pauseTour,
    resumeTour,
    quitPromptOpen,
    guardNavigation,
    confirmQuitTour,
    cancelQuitTour,
    suppressNextPopState,
  }

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within a TourProvider')
  return ctx
}
