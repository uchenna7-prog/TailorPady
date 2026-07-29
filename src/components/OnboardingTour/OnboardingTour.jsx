import { useEffect, useRef, useState, useCallback } from 'react'
import { useTour } from '../../contexts/TourContext'
import styles from './OnboardingTour.module.css'

const PAD = 8
const TARGET_TIMEOUT_MS = 2500
const CARD_WIDTH = 260

export default function OnboardingTour() {
  const {
    isActive, currentStep, stepIndex, totalSteps,
    skipTour, finishTour, advanceManual, resolveConfirm, skipCurrentStep,
  } = useTour()
  const [rect, setRect] = useState(null)
  const rafRef = useRef(null)

  const measure = useCallback(() => {
    if (!currentStep?.target) {
      setRect(null)
      return
    }
    const el = document.querySelector(currentStep.target)
    if (!el) {
      setRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    setRect({
      top:    r.top - PAD,
      left:   r.left - PAD,
      width:  r.width + PAD * 2,
      height: r.height + PAD * 2,
    })
  }, [currentStep])

  useEffect(() => {
    if (!isActive) return
    function loop() {
      measure()
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive, measure])

  useEffect(() => {
    if (!isActive || !currentStep?.target) return
    let cancelled = false
    const timer = setTimeout(() => {
      if (cancelled) return
      const el = document.querySelector(currentStep.target)
      if (!el) skipCurrentStep()
    }, TARGET_TIMEOUT_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [currentStep?.id, isActive, skipCurrentStep])

  if (!isActive || !currentStep) return null

  const isLastStep = stepIndex === totalSteps - 1
  const hasTarget   = !!rect
  const isConfirm   = currentStep.type === 'confirm'

  let tooltipPos = null
  let placeBelow = true
  let arrowLeft = null

  if (hasTarget) {
    const spaceBelow = window.innerHeight - (rect.top + rect.height)
    placeBelow = spaceBelow > 170
    const top  = placeBelow ? rect.top + rect.height + 14 : Math.max(12, rect.top - 162)
    const rawLeft = Math.min(Math.max(12, rect.left), window.innerWidth - CARD_WIDTH - 12)
    tooltipPos = { top, left: rawLeft }

    // Arrow points at the horizontal center of the target, clamped inside the card
    const targetCenter = rect.left + rect.width / 2
    arrowLeft = Math.min(Math.max(targetCenter - rawLeft, 20), CARD_WIDTH - 20)
  }

  return (
    <div className={styles.overlayRoot}>
      {hasTarget ? (
        <>
          <div className={styles.blockStrip} style={{ top: 0, left: 0, right: 0, height: rect.top }} />
          <div className={styles.blockStrip} style={{ top: rect.top + rect.height, left: 0, right: 0, bottom: 0 }} />
          <div className={styles.blockStrip} style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }} />
          <div className={styles.blockStrip} style={{ top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height }} />
          <div
            className={styles.spotlightRing}
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
        </>
      ) : (
        <div className={styles.blockStrip} style={{ top: 0, left: 0, right: 0, bottom: 0 }} />
      )}

      <div
        className={`${styles.card} ${!hasTarget ? styles.cardCentered : ''}`}
        style={hasTarget ? { top: tooltipPos.top, left: tooltipPos.left } : undefined}
      >
        {hasTarget && (
          <div
            className={placeBelow ? styles.arrowUp : styles.arrowDown}
            style={{ left: arrowLeft }}
          />
        )}

        <div className={styles.progress}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === stepIndex ? styles.dotActive : ''}`} />
          ))}
        </div>

        <h3 className={styles.title}>{currentStep.title}</h3>
        <p className={styles.message}>{currentStep.message}</p>

        <div className={styles.actions}>
          {isConfirm ? (
            <>
              <button className={styles.skipBtn} onClick={() => resolveConfirm(currentStep.id, 'no')}>
                {currentStep.noLabel || 'Not now'}
              </button>
              <button className={styles.doneBtn} onClick={() => resolveConfirm(currentStep.id, 'yes')}>
                {currentStep.yesLabel || 'Yes'}
              </button>
            </>
          ) : currentStep.manual ? (
            <>
              <button className={styles.skipBtn} onClick={skipTour}>Skip</button>
              <button className={styles.doneBtn} onClick={advanceManual}>{currentStep.ctaLabel || 'Next'}</button>
            </>
          ) : isLastStep ? (
            <button className={styles.doneBtn} onClick={finishTour}>Got it</button>
          ) : (
            <button className={styles.skipBtn} onClick={skipTour}>Skip tour</button>
          )}
        </div>
      </div>
    </div>
  )
}
