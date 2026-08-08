import { useEffect, useRef, useState } from 'react'
import { useFeatureHints } from '../../contexts/FeatureHintContext'
import { FEATURE_HINTS } from '../../datas/featureHints'
import styles from './FeatureHintLayer.module.css'

function FeatureHint({ hint }) {
  const { activeHintId, dismissHint } = useFeatureHints()
  const [rect, setRect] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const rafRef = useRef(null)

  const isVisible = activeHintId === hint.id

  useEffect(() => {
    if (!isVisible) {
      setRect(null)
      setExpanded(false)
      return
    }

    let cancelled = false

    function locate() {
      if (cancelled) return
      const el = document.querySelector(hint.target)
      if (!el) {
        rafRef.current = requestAnimationFrame(locate)
        return
      }
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) {
        rafRef.current = requestAnimationFrame(locate)
        return
      }
      setRect({
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      })
    }

    locate()

    function handleResize() { locate() }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [isVisible, hint.target])

  if (!isVisible || !rect) return null

  function handleDismiss() {
    dismissHint(hint.id)
  }

  return (
    <div
      className={styles.hintWrap}
      style={{ top: rect.top - 4, left: rect.left + rect.width - 4 }}
    >
      <button
        type="button"
        className={styles.hintDot}
        onClick={() => setExpanded(e => !e)}
        aria-label="Tip"
      >
        <span className={styles.pulse} />
      </button>

      {expanded && (
        <div className={styles.hintBubble}>
          <p className={styles.hintMessage}>{hint.message}</p>
          <div className={styles.hintActions}>
            <button type="button" className={styles.hintDismissBtn} onClick={handleDismiss}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FeatureHintLayer() {
  return (
    <>
      {FEATURE_HINTS.map(hint => (
        <FeatureHint key={hint.id} hint={hint} />
      ))}
    </>
  )
}
