import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { usePremium } from './PremiumContext'
import { db } from '../firebase'
import { subscribeToUsage, incrementUsage } from '../services/usageService'
import { USAGE_LIMITS } from '../datas/usageLimits'

const UsageContext = createContext(null)

export function UsageProvider({ children }) {
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const [usage, setUsage] = useState({})

  useEffect(() => {
    if (!user) {
      setUsage({})
      return
    }
    return subscribeToUsage(db, user.uid, setUsage)
  }, [user])

  const recordUsage = useCallback(async (field) => {
    if (!user) return
    await incrementUsage(db, user.uid, field)
  }, [user])

  const getRemaining = useCallback((field) => {
    const limit = USAGE_LIMITS[field]
    if (limit === undefined) return Infinity
    const used = usage[field] || 0
    return Math.max(0, limit - used)
  }, [usage])

  const isAtLimit = useCallback((field) => {
    if (isPremium) return false
    return getRemaining(field) <= 0
  }, [isPremium, getRemaining])

  const value = useMemo(() => ({
    usage,
    limits: USAGE_LIMITS,
    isPremium,
    recordUsage,
    getRemaining,
    isAtLimit,
  }), [usage, isPremium, recordUsage, getRemaining, isAtLimit])

  return (
    <UsageContext.Provider value={value}>
      {children}
    </UsageContext.Provider>
  )
}

export function useUsage() {
  return useContext(UsageContext)
}
