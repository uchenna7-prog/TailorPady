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

  const [activeTourId, setActiveTourId] = useState(null)
  const [stepIndex, setStepIndex]       = useState(0)
  const [completedTours, setCompletedTours] = useState(loadCompletedTours)
  const pendingCustomerIdRef = useRef(null)

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
    pendingCustomerIdRef.current = null
  }, [activeTourId])

  const startTour = useCallback((tourId) => {
    const tourSteps = TOURS[tourId]
    if (!tourSteps) return
    setActiveTourId(tourId)
    setStepIndex(0)
    pendingCustomerIdRef.current = null
    if (tourSteps[0].route && tourSteps[0].route !== 'CUSTOMER_DETAIL') {
      navigate(tourSteps[0].route)
    }
  }, [navigate])

  const skipTour = useCallback(() => {
    finishTour()
  }, [finishTour])

  const advanceTo = useCallback((nextIndex, customerId) => {
    if (!steps) return
    if (nextIndex >= steps.length) {
      finishTour()
      return
    }
    const nextStep = steps[nextIndex]
    setStepIndex(nextIndex)

    if (nextStep.route === 'CUSTOMER_DETAIL' && customerId) {
      navigate(`/customers/${customerId}`)
    } else if (nextStep.route) {
      navigate(nextStep.route)
    }
  }, [steps, navigate, finishTour])

  const completeStep = useCallback((stepId, payload) => {
    if (!steps || !currentStep) return
    if (currentStep.id !== stepId) return
    if (payload?.customerId) pendingCustomerIdRef.current = payload.customerId
    advanceTo(stepIndex + 1, pendingCustomerIdRef.current)
  }, [steps, currentStep, stepIndex, advanceTo])

  const value = {
    activeTourId,
    currentStep,
    stepIndex,
    totalSteps: steps?.length ?? 0,
    isActive: !!activeTourId,
    hasCompletedTour: (tourId) => !!completedTours[tourId],
    startTour,
    skipTour,
    finishTour,
    completeStep,
  }

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within a TourProvider')
  return ctx
}
