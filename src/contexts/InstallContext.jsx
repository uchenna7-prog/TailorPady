import { createContext, useContext, useEffect, useState } from 'react'

const InstallContext = createContext(null)

export function InstallProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const triggerInstall = async () => {
    if (!installPrompt) return false
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
    return outcome === 'accepted'
  }

  return (
    <InstallContext.Provider value={{ installPrompt, triggerInstall }}>
      {children}
    </InstallContext.Provider>
  )
}

export function useInstall() {
  return useContext(InstallContext)
}