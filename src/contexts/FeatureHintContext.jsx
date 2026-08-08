import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'tp_hints_dismissed'

const FeatureHintContext = createContext(null)

function loadDismissedHints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveDismissedHints(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function FeatureHintProvider({ children }) {
  const [dismissedHints, setDismissedHints] = useState(loadDismissedHints)
  const [queue, setQueue]                   = useState([])
  const [activeHintId, setActiveHintId]     = useState(null)

  const triggerHint = useCallback((id) => {
    setDismissedHints(prevDismissed => {
      if (prevDismissed[id]) return prevDismissed
      setQueue(prevQueue => {
        if (prevQueue.includes(id)) return prevQueue
        return [...prevQueue, id]
      })
      return prevDismissed
    })
  }, [])

  const dismissHint = useCallback((id) => {
    setDismissedHints(prev => {
      const next = { ...prev, [id]: true }
      saveDismissedHints(next)
      return next
    })
    setQueue(prev => prev.filter(qid => qid !== id))
    setActiveHintId(prev => (prev === id ? null : prev))
  }, [])

  useEffect(() => {
    if (activeHintId) return
    if (queue.length === 0) return
    const [next, ...rest] = queue
    setActiveHintId(next)
    setQueue(rest)
  }, [activeHintId, queue])

  const value = {
    activeHintId,
    isHintDismissed: (id) => !!dismissedHints[id],
    triggerHint,
    dismissHint,
  }

  return <FeatureHintContext.Provider value={value}>{children}</FeatureHintContext.Provider>
}

export function useFeatureHints() {
  const ctx = useContext(FeatureHintContext)
  if (!ctx) throw new Error('useFeatureHints must be used within a FeatureHintProvider')
  return ctx
}
