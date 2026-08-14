import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { usePayments } from './PaymentContext'
import { fetchRevenueGoal, saveRevenueGoal, updateRevenueGoalFields, deleteRevenueGoal } from '../services/revenueGoalService'
import { getWindowStart, getPrevWindowStart } from '../pages/Dashboard/utils'

const RevenueGoalContext = createContext(null)

function sumPaymentsInRange(allPayments, fromDate, toDate = null) {
  return allPayments
    .flatMap(p => {
      const installments = p.installments || []
      if (installments.length > 0) return installments
      if (p.amount && p.date) return [{ amount: p.amount, date: p.date }]
      return []
    })
    .filter(inst => {
      const dateStr = inst.date
      if (!dateStr) return false
      const date = new Date(dateStr)
      if (isNaN(date)) return false
      if (date < fromDate) return false
      if (toDate && date >= toDate) return false
      return true
    })
    .reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0)
}

function periodKeyFor(period) {
  return getWindowStart(period).toISOString().slice(0, 10)
}

function buildHistory(existingGoal, newData) {
  const prev        = existingGoal?.history || []
  const isNewPeriod = !existingGoal ||
    existingGoal.period !== newData.period ||
    existingGoal.goal   !== newData.goal

  if (!isNewPeriod || !existingGoal) return prev

  const entry = {
    type:    'target_changed',
    period:  existingGoal.period,
    goal:    existingGoal.goal,
    savedAt: existingGoal.updatedAt ?? null,
  }

  return [entry, ...prev].slice(0, 12)
}

export function RevenueGoalProvider({ children }) {
  const { user }        = useAuth()
  const { allPayments } = usePayments()

  const [goal,    setGoal]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setGoal(null)
      setLoading(false)
      return
    }
    setLoading(true)
    fetchRevenueGoal(user.uid)
      .then(data => setGoal(data))
      .finally(() => setLoading(false))
  }, [user])

  const derived = useMemo(() => {
    if (!goal) return null

    const currentStart  = getWindowStart(goal.period)
    const previousStart = getPrevWindowStart(goal.period)
    const earnedThis    = sumPaymentsInRange(allPayments, currentStart)
    const earnedLast    = sumPaymentsInRange(allPayments, previousStart, currentStart)
    const rawPercent    = goal.goal > 0 ? Math.round((earnedThis / goal.goal) * 100) : 0
    const percent       = Math.min(rawPercent, 100)
    const delta         = earnedThis - earnedLast
    const isUp          = delta >= 0
    const met           = rawPercent >= 100
    const over          = Math.max(0, earnedThis - goal.goal)
    const periodKey         = currentStart.toISOString().slice(0, 10)
    const previousPeriodKey = previousStart.toISOString().slice(0, 10)

    return { earnedThis, earnedLast, percent, rawPercent, delta, isUp, met, over, periodKey, previousPeriodKey }
  }, [goal, allPayments])

  const saveGoal = useCallback(async (data) => {
    if (!user) return

    const previousGoal   = goal
    const optimisticGoal = {
      ...data,
      history: buildHistory(goal, data),
      hasCelebratedAnyGoal: goal?.hasCelebratedAnyGoal ?? false,
      currentPeriodKey: periodKeyFor(data.period),
      lastCelebratedPeriodKey: null,
    }

    setGoal(optimisticGoal)

    try {
      await saveRevenueGoal(user.uid, optimisticGoal)
    } catch {
      setGoal(previousGoal)
      throw new Error('Failed to save goal. Please try again.')
    }
  }, [user, goal])

  const removeGoal = useCallback(async () => {
    if (!user) return

    const previousGoal = goal

    setGoal(null)

    try {
      await deleteRevenueGoal(user.uid)
    } catch {
      setGoal(previousGoal)
      throw new Error('Failed to delete goal. Please try again.')
    }
  }, [user, goal])

  const markGoalCelebrated = useCallback(async (periodKey) => {
    if (!user || !goal) return

    const previousGoal = goal
    const updatedGoal  = {
      ...goal,
      lastCelebratedPeriodKey: periodKey,
      hasCelebratedAnyGoal: true,
    }

    setGoal(updatedGoal)

    try {
      await updateRevenueGoalFields(user.uid, {
        lastCelebratedPeriodKey: periodKey,
        hasCelebratedAnyGoal: true,
      })
    } catch {
      setGoal(previousGoal)
    }
  }, [user, goal])

  const initializePeriodKey = useCallback(async (periodKey) => {
    if (!user || !goal) return

    const previousGoal = goal
    const updatedGoal  = { ...goal, currentPeriodKey: periodKey }

    setGoal(updatedGoal)

    try {
      await updateRevenueGoalFields(user.uid, { currentPeriodKey: periodKey })
    } catch {
      setGoal(previousGoal)
    }
  }, [user, goal])

  const closePeriodAndAdvance = useCallback(async () => {
    if (!user || !goal || !derived) return

    const snapshot = {
      type:      'period_closed',
      period:    goal.period,
      goal:      goal.goal,
      earned:    derived.earnedLast,
      met:       derived.earnedLast >= goal.goal,
      periodKey: goal.currentPeriodKey,
      closedAt:  new Date().toISOString(),
    }

    const previousGoal = goal
    const updatedGoal  = {
      ...goal,
      history: [snapshot, ...(goal.history || [])].slice(0, 12),
      currentPeriodKey: derived.periodKey,
      lastCelebratedPeriodKey: null,
    }

    setGoal(updatedGoal)

    try {
      await updateRevenueGoalFields(user.uid, {
        history: updatedGoal.history,
        currentPeriodKey: updatedGoal.currentPeriodKey,
        lastCelebratedPeriodKey: null,
      })
    } catch {
      setGoal(previousGoal)
    }
  }, [user, goal, derived])

  useEffect(() => {
    if (!goal || !derived) return
    if (!goal.currentPeriodKey) {
      initializePeriodKey(derived.periodKey)
      return
    }
    if (goal.currentPeriodKey === derived.periodKey) return
    closePeriodAndAdvance()
  }, [goal, derived, initializePeriodKey, closePeriodAndAdvance])

  return (
    <RevenueGoalContext.Provider value={{ goal, derived, loading, saveGoal, removeGoal, markGoalCelebrated }}>
      {children}
    </RevenueGoalContext.Provider>
  )
}

export function useRevenueGoal() {
  const ctx = useContext(RevenueGoalContext)
  if (!ctx) throw new Error('useRevenueGoal must be used inside RevenueGoalProvider')
  return ctx
}
