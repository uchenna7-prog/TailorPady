import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { usePremium } from './PremiumContext'
import { USAGE_LIMITS, subscribeToUsage, incrementUsage } from '../services/usageService'

const UsageContext = createContext(null)

export function UsageProvider({ children }) {
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const [usage, setUsage] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setUsage({})
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = subscribeToUsage(db, user.uid, data => {
      setUsage(data)
      setLoading(false)
    })
    return unsub
  }, [user])

  const recordUsage = useCallback(async field => {
    if (!user || isPremium) return
    await incrementUsage(db, user.uid, field)
  }, [user, isPremium])

  const hasReachedLimit = useCallback((field, limitKey) => {
    if (isPremium) return false
    return (usage[field] || 0) >= USAGE_LIMITS[limitKey]
  }, [isPremium, usage])

  const remaining = useCallback((field, limitKey) => {
    if (isPremium) return Infinity
    return Math.max(0, USAGE_LIMITS[limitKey] - (usage[field] || 0))
  }, [isPremium, usage])

  return (
    <UsageContext.Provider value={{ usage, loading, recordUsage, hasReachedLimit, remaining, limits: USAGE_LIMITS }}>
      {children}
    </UsageContext.Provider>
  )
}

export function useUsage() {
  const ctx = useContext(UsageContext)
  if (!ctx) throw new Error('useUsage must be used inside UsageProvider')
  return ctx
}
