import { createContext, useContext, useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const ReferralContext = createContext(null)

export function ReferralProvider({ children }) {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <ReferralContext.Provider value={{ referralCode, loading }}>
      {children}
    </ReferralContext.Provider>
  )
}

export function useReferral() {
  const ctx = useContext(ReferralContext)
  if (!ctx) throw new Error('useReferral must be used inside ReferralProvider')
  return ctx
}
