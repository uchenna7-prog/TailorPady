import { useCallback, useState } from 'react'

const PREFIX = 'tp_hint_seen_'

export function useFirstItemHint(key) {
  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(PREFIX + key) === '1'
    } catch {
      return true
    }
  })

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(PREFIX + key, '1')
    } catch {}
    setSeen(true)
  }, [key])

  return [seen, markSeen]
}