import { useEffect, useState } from 'react'
import styles from './FirstItemHint.module.css'

const AUTO_DISMISS_MS = 4500

export function FirstItemHint({ targetRef, message, onDismiss }) {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    function measure() {
      const el = targetRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [targetRef])

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!rect) return null

  const top  = rect.top + rect.height + 8
  const left = Math.min(Math.max(12, rect.left), window.innerWidth - 220)

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div
        className={styles.tooltip}
        style={{ top, left }}
        onClick={e => e.stopPropagation()}
      >
        <span className={styles.arrow} />
        <p className={styles.text}>{message}</p>
        <button className={styles.gotIt} onClick={onDismiss}>Got it</button>
      </div>
    </div>
  )
}