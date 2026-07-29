import { useEffect, useRef, useState, useCallback } from 'react'
import { useTour } from '../../contexts/TourContext'
import styles from './OnboardingTour.module.css'

const PAD = 8

export default function OnboardingTour() {
  const { isActive, currentStep, stepIndex, totalSteps, skipTour, finishTour } = useTour()
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

  if (!isActive || !currentStep) return null

  const isLastStep = stepIndex === totalSteps - 1
  const hasTarget  = !!rect

  const tooltipPos = hasTarget
    ? (() => {
        const spaceBelow = window.innerHeight - (rect.top + rect.height)
        const placeBelow = spaceBelow > 170
        const top  = placeBelow ? rect.top + rect.height + 12 : Math.max(12, rect.top - 160)
        const left = Math.min(Math.max(12, rect.left), window.innerWidth - 272)
        return { top, left }
      })()
    : null

  return (
    <div className={styles.overlayRoot}>
      <div
        className={styles.dimLayer}
        style={hasTarget ? {
          top: rect.top, left: rect.left, width: rect.width, height: rect.height,
          borderRadius: 14,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
        } : {
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.65)',
        }}
      />

      <div
        className={`${styles.card} ${!hasTarget ? styles.cardCentered : ''}`}
        style={hasTarget ? { top: tooltipPos.top, left: tooltipPos.left } : undefined}
      >
        <div className={styles.progress}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === stepIndex ? styles.dotActive : ''}`} />
          ))}
        </div>

        <h3 className={styles.title}>{currentStep.title}</h3>
        <p className={styles.message}>{currentStep.message}</p>

        <div className={styles.actions}>
          {!isLastStep ? (
            <button className={styles.skipBtn} onClick={skipTour}>Skip tour</button>
          ) : (
            <button className={styles.doneBtn} onClick={finishTour}>Got it</button>
          )}
        </div>
      </div>
    </div>
  )
}
