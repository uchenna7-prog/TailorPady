import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { usePayments } from './PaymentContext'
import { fetchRevenueGoal, saveRevenueGoal, deleteRevenueGoal } from '../services/revenueGoalService'
import { getWindowStart, getPrevWindowStart } from '../pages/Home/utils'

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

function buildHistory(existingGoal, newData) {
  const prev        = existingGoal?.history || []
  const isNewPeriod = !existingGoal ||
    existingGoal.period !== newData.period ||
    existingGoal.goal   !== newData.goal

  if (!isNewPeriod || !existingGoal) return prev

  const entry = {
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
    const percent       = goal.goal > 0
      ? Math.min(Math.round((earnedThis / goal.goal) * 100), 100)
      : 0
    const delta         = earnedThis - earnedLast
    const isUp          = delta >= 0

    return { earnedThis, earnedLast, percent, delta, isUp }
  }, [goal, allPayments])

  const saveGoal = useCallback(async (data) => {
    if (!user) return

    const previousGoal   = goal
    const optimisticGoal = { ...data, history: buildHistory(goal, data) }

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

  return (
    <RevenueGoalContext.Provider value={{ goal, derived, loading, saveGoal, removeGoal }}>
      {children}
    </RevenueGoalContext.Provider>
  )
}

export function useRevenueGoal() {
  const ctx = useContext(RevenueGoalContext)
  if (!ctx) throw new Error('useRevenueGoal must be used inside RevenueGoalProvider')
  return ctx
}