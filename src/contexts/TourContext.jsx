import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOURS } from '../datas/tourSteps'

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

  const [activeTourId, setActiveTourId]     = useState(null)
  const [stepIndex, setStepIndex]           = useState(0)
  const [pendingCustomerId, setPendingCustomerId] = useState(null)
  const [paused, setPaused]                 = useState(false)
  const [completedTours, setCompletedTours] = useState(loadCompletedTours)
  const pauseCountRef = useRef(0)

  const steps       = activeTourId ? TOURS[activeTourId] : null
  const currentStep = steps ? steps[stepIndex] : null

  const markCompleted = useCallback((tourId) => {
    setCompletedTours(prev => {
      const next = { ...prev, [tourId]: true }
      saveCompletedTours(next)
      return next
    })
  }, [])

  const resetTourState = useCallback((tourId, index = 0) => {
    setActiveTourId(tourId)
    setStepIndex(index)
    setPendingCustomerId(null)
    setPaused(false)
    pauseCountRef.current = 0
  }, [])

  const finishTour = useCallback(() => {
    if (activeTourId) markCompleted(activeTourId)
    resetTourState(null)
  }, [activeTourId, markCompleted, resetTourState])

  const startTour = useCallback((tourId) => {
    if (!TOURS[tourId]) return
    resetTourState(tourId, 0)
  }, [resetTourState])

  const skipTour = useCallback(() => {
    finishTour()
  }, [finishTour])

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
    advanceTo(stepIndex + 1)
  }, [steps, currentStep, stepIndex, advanceTo])

  const advanceManual = useCallback(() => {
    if (!currentStep?.manual) return
    advanceTo(stepIndex + 1)
  }, [currentStep, stepIndex, advanceTo])

  const resolveConfirm = useCallback((stepId, outcome) => {
    if (!currentStep || currentStep.id !== stepId || currentStep.type !== 'confirm') return
    const finishedTourId = activeTourId
    if (finishedTourId) markCompleted(finishedTourId)

    if (outcome === 'yes' && currentStep.onYesStartTour) {
      resetTourState(currentStep.onYesStartTour, 0)
    } else {
      resetTourState(null)
    }
  }, [currentStep, activeTourId, markCompleted, resetTourState])

  // Any modal can call pauseTour() on open / resumeTour() on close.
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
    hasCompletedTour: (tourId) => !!completedTours[tourId],
    startTour,
    skipTour,
    finishTour,
    completeStep,
    advanceManual,
    resolveConfirm,
    pauseTour,
    resumeTour,
  }

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within a TourProvider')
  return ctx
}
