import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import PremiumSuccessModal from '../components/PremiumSuccessModal/PremiumSuccessModal'

const PremiumSuccessContext = createContext(null)

export function PremiumSuccessProvider({ children }) {
  const { user } = useAuth()
  const [queue, setQueue] = useState([])
  const idRef = useRef(0)
  const uidRef = useRef(user?.uid ?? null)

  useEffect(() => {
    if (uidRef.current !== (user?.uid ?? null)) {
      uidRef.current = user?.uid ?? null
      setQueue([])
    }
  }, [user?.uid])

  const triggerPremiumSuccess = useCallback((info, onClose) => {
    idRef.current += 1
    const entry = { id: idRef.current, billingCycle: info?.billingCycle, nextRenewal: info?.nextRenewal, onClose }
    setQueue(prev => [...prev, entry])
  }, [])

  const handleClose = useCallback(() => {
    setQueue(prev => {
      const [current, ...rest] = prev
      current?.onClose?.()
      return rest
    })
  }, [])

  const current = queue[0] || null

  return (
    <PremiumSuccessContext.Provider value={{ triggerPremiumSuccess }}>
      {children}
      {current && (
        <PremiumSuccessModal
          billingCycle={current.billingCycle}
          nextRenewal={current.nextRenewal}
          onClose={handleClose}
        />
      )}
    </PremiumSuccessContext.Provider>
  )
}

export function usePremiumSuccess() {
  const ctx = useContext(PremiumSuccessContext)
  if (!ctx) throw new Error('usePremiumSuccess must be used inside PremiumSuccessProvider')
  return ctx
}
