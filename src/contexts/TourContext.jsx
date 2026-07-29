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

  const finishTour = useCallback(() => {
    if (activeTourId) {
      setCompletedTours(prev => {
        const next = { ...prev, [activeTourId]: true }
        saveCompletedTours(next)
        return next
      })
    }
    setActiveTourId(null)
    setStepIndex(0)
    setPendingCustomerId(null)
    setPaused(false)
    pauseCountRef.current = 0
  }, [activeTourId])

  const startTour = useCallback((tourId) => {
    const tourSteps = TOURS[tourId]
    if (!tourSteps) return
    setActiveTourId(tourId)
    setStepIndex(0)
    setPendingCustomerId(null)
    setPaused(false)
    pauseCountRef.current = 0
  }, [])

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

  // Any modal can call pauseTour() on open / resumeTour() on close.
  // Counter-based so overlapping modals don't fight each other.
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
