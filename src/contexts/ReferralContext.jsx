import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { acknowledgeReferral } from '../services/referralService'

const ReferralContext = createContext(null)

export function ReferralProvider({ children }) {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingReferralReward, setPendingReferralReward] = useState(null)

  useEffect(() => {
    if (!user?.uid) {
      setReferralCode(null)
      setLoading(false)
      return
    }

    const ref = doc(db, 'users', user.uid)
    const unsub = onSnapshot(ref,
      (snap) => {
        setReferralCode(snap.exists() ? snap.data().referralCode || null : null)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) {
      setPendingReferralReward(null)
      return
    }

    const q = query(
      collection(db, 'referrals'),
      where('referrerUid', '==', user.uid),
      where('status', '==', 'activated'),
    )

    const unsub = onSnapshot(q,
      (snap) => {
        const unacked = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(r => r.referrerAcked !== true)
          .sort((a, b) => (a.activatedAt || '').localeCompare(b.activatedAt || ''))

        setPendingReferralReward(unacked[0] || null)
      },
      () => setPendingReferralReward(null)
    )
    return unsub
  }, [user?.uid])

  const acknowledgeReferralReward = useCallback(async (referralId) => {
    if (!user || !referralId) return
    setPendingReferralReward(prev => (prev?.id === referralId ? null : prev))
    try {
      await acknowledgeReferral(user, referralId)
    } catch {}
  }, [user])

  return (
    <ReferralContext.Provider value={{ referralCode, loading, pendingReferralReward, acknowledgeReferralReward }}>
      {children}
    </ReferralContext.Provider>
  )
}

export function useReferral() {
  const ctx = useContext(ReferralContext)
  if (!ctx) throw new Error('useReferral must be used inside ReferralProvider')
  return ctx
}
