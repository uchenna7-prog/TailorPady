import { useEffect, useRef, useState, useCallback } from 'react'
import { useTour } from '../../contexts/TourContext'
import styles from './OnboardingTour.module.css'

const PAD = 8
const CARD_GAP = 30
const CARD_WIDTH = 260
const CARD_HEIGHT_ESTIMATE = 170
const TARGET_TIMEOUT_MS = 2500

export default function OnboardingTour() {
  const {
    isActive, currentStep, stepIndex, totalSteps,
    skipTour, finishTour, advanceManual, resolveConfirm, resolveBranch, skipCurrentStep,
  } = useTour()
  const [rect, setRect] = useState(null)
  const rafRef = useRef(null)

  const measure = useCallback(() => {
    if (!currentStep?.target) {
      setRect(prev => (prev === null ? prev : null))
      return
    }
    const el = document.querySelector(currentStep.target)
    if (!el) {
      setRect(prev => (prev === null ? prev : null))
      return
    }
    const r = el.getBoundingClientRect()
    const next = {
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    }
    setRect(prev => {
      if (
        prev &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.width === next.width &&
        prev.height === next.height
      ) {
        return prev
      }
      return next
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
    if (!isActive) return
    const scrollY = window.scrollY
    const { body } = document
    const prevPosition = body.style.position
    const prevTop = body.style.top
    const prevWidth = body.style.width
    const prevOverflow = body.style.overflow

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    return () => {
      body.style.position = prevPosition
      body.style.top = prevTop
      body.style.width = prevWidth
      body.style.overflow = prevOverflow
      window.scrollTo(0, scrollY)
    }
  }, [isActive])

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
  const hasTarget = !!rect
  const isConfirm = currentStep.type === 'confirm'
  const isBranch = currentStep.type === 'branch'

  let tooltipPos = null
  let placeBelow = true
  let arrowLeft = null

  if (hasTarget) {
    const spaceBelow = window.innerHeight - (rect.top + rect.height)
    placeBelow = spaceBelow > CARD_HEIGHT_ESTIMATE + CARD_GAP
    const top = placeBelow
      ? rect.top + rect.height + CARD_GAP
      : Math.max(12, rect.top - CARD_HEIGHT_ESTIMATE - CARD_GAP)
    const rawLeft = Math.min(Math.max(12, rect.left), window.innerWidth - CARD_WIDTH - 12)
    tooltipPos = { top, left: rawLeft }

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
          <div
            className={styles.pulseRing}
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
        </>
      ) : (
        <div
          className={`${styles.blockStrip} ${styles.blockStripHeavy}`}
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        />
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

        <button
          type="button"
          className={styles.closeBtn}
          onClick={skipTour}
          aria-label="Skip tour"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        </button>

        {currentStep.count && (
          <div className={styles.dots}>
            {Array.from({ length: currentStep.count.total }).map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === currentStep.count.current - 1 ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        )}

        {currentStep.phase && (
          <div className={styles.phaseLabel}>{currentStep.phase}</div>
        )}

        <h3 className={styles.title}>{currentStep.title}</h3>
        <p className={styles.message}>{currentStep.message}</p>

        {isBranch ? (
          <div className={styles.branchButtons}>
            <button className={styles.skipBtn} onClick={() => resolveBranch(currentStep.id, 'view')}>
              {currentStep.viewLabel}
            </button>
            <button className={styles.doneBtn} onClick={() => resolveBranch(currentStep.id, 'continue')}>
              {currentStep.continueLabel}
            </button>
          </div>
        ) : isConfirm ? (
          <div className={styles.actions}>
            <button className={styles.skipBtn} onClick={() => resolveConfirm(currentStep.id, 'no')}>
              {currentStep.noLabel || 'Not now'}
            </button>
            <button className={styles.doneBtn} onClick={() => resolveConfirm(currentStep.id, 'yes')}>
              {currentStep.yesLabel || 'Yes'}
            </button>
          </div>
        ) : currentStep.manual ? (
          <div className={styles.actions}>
            <button className={styles.doneBtn} onClick={advanceManual}>{currentStep.ctaLabel || 'Next'}</button>
          </div>
        ) : isLastStep ? (
          <div className={styles.actions}>
            <button className={styles.doneBtn} onClick={finishTour}>Got it</button>
          </div>
        ) : null}
      </div>
    </div>
  )
}