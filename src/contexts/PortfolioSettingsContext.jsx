import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  savePortfolioSettings,
  subscribeToPortfolioSettings,
} from '../services/portfolioSettingsService'

const PortfolioSettingsContext = createContext(null)

const DEFAULTS = {
  heroBgImage:         null,
  heroAvatarImage:     null,
  footerBgImage:       null,
  footerLogoImage:     null,
  brandMilestone:      '',
  brandSignatureStyle: '',
  brandStyleStatement: '',
  brandAvailability:   'open',
  brandAvailableUntil: '',
  brandTurnaround:     '1 weeks',
  brandServiceArea:    [],
  brandBookingNote:    '',
}

export function PortfolioSettingsProvider({ children }) {
  const { user } = useAuth()
  const [portfolioSettings, setPortfolioSettings] = useState(DEFAULTS)
  const [settled, setSettled]                     = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeToPortfolioSettings(
      user.uid,
      data => {
        setPortfolioSettings(data)
        setSettled(true)
      },
      () => setSettled(true)
    )
    return unsub
  }, [user?.uid])

  const updateManyPortfolioSettings = useCallback(async (patch) => {
    if (!user?.uid) return
    setPortfolioSettings(prev => ({ ...prev, ...patch }))
    await savePortfolioSettings(user.uid, patch)
  }, [user?.uid])

  return (
    <PortfolioSettingsContext.Provider value={{
      portfolioSettings,
      updateManyPortfolioSettings,
      portfolioSettingsSettled: settled,
    }}>
      {children}
    </PortfolioSettingsContext.Provider>
  )
}

export function usePortfolioSettings() {
  const ctx = useContext(PortfolioSettingsContext)
  if (!ctx) throw new Error('usePortfolioSettings must be used within PortfolioSettingsProvider')
  return ctx
}