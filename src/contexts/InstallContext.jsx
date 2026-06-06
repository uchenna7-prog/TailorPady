import { createContext, useContext, useEffect, useState } from 'react'

const InstallContext = createContext(null)

export function InstallProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled,   setIsInstalled]   = useState(false)

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')

    setIsInstalled(standaloneQuery.matches || navigator.standalone === true)

    const onDisplayModeChange = (e) => setIsInstalled(e.matches)
    standaloneQuery.addEventListener('change', onDisplayModeChange)

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    const onAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      standaloneQuery.removeEventListener('change', onDisplayModeChange)
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
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
    <InstallContext.Provider value={{ installPrompt, isInstalled, triggerInstall }}>
      {children}
    </InstallContext.Provider>
  )
}

export function useInstall() {
  return useContext(InstallContext)
}