import { useState, useEffect, useRef } from 'react'

const PROBE_URL      = 'https://www.gstatic.com/generate_204'
const PROBE_INTERVAL = 30000

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const probeTimer              = useRef(null)

  async function probe() {
    try {
      await fetch(PROBE_URL, { method: 'HEAD', cache: 'no-store', mode: 'no-cors' })
      setIsOnline(true)
    } catch {
      setIsOnline(false)
    }
  }

  function startProbing() {
    probe()
    probeTimer.current = setInterval(probe, PROBE_INTERVAL)
  }

  function stopProbing() {
    clearInterval(probeTimer.current)
  }

  function handleOnline() {
    probe()
    startProbing()
  }

  function handleOffline() {
    setIsOnline(false)
    stopProbing()
  }

  useEffect(() => {
    startProbing()
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      stopProbing()
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}