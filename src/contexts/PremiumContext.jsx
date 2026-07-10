import { createContext, useContext, useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const PremiumContext = createContext(null)

export function PremiumProvider({ children }) {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [plan, setPlan] = useState(null)
  const [billingCycle, setBillingCycle] = useState(null)
  const [nextRenewal, setNextRenewal] = useState(null)
  const [paymentFailed, setPaymentFailed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsPremium(false)
      setPlan(null)
      setBillingCycle(null)
      setNextRenewal(null)
      setPaymentFailed(false)
      setLoading(false)
      return
    }

    const ref = doc(db, 'users', user.uid, 'settings', 'premium')
    const unsub = onSnapshot(ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setIsPremium(data.isPremium === true)
          setPlan(data.plan || null)
          setBillingCycle(data.billingCycle || null)
          setNextRenewal(data.nextRenewal || null)
          setPaymentFailed(data.paymentFailed === true)
        } else {
          setIsPremium(false)
          setPlan(null)
          setBillingCycle(null)
          setNextRenewal(null)
          setPaymentFailed(false)
        }
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )
    return unsub
  }, [user])

  return (
    <PremiumContext.Provider value={{ isPremium, plan, billingCycle, nextRenewal, paymentFailed, loading }}>
      {children}
    </PremiumContext.Provider>
  )
}

export function usePremium() {
  const ctx = useContext(PremiumContext)
  if (!ctx) throw new Error('usePremium must be used inside PremiumProvider')
  return ctx
}