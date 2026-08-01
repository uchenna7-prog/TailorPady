import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useTour } from '../../contexts/TourContext'
import styles from './OnboardingTour.module.css'

const PAD = 8
const CARD_GAP = 18
const CARD_WIDTH = 260
const CARD_HEIGHT_ESTIMATE = 170
const TARGET_TIMEOUT_MS = 2500
const RESIZE_SETTLE_MS = 200

export default function OnboardingTour() {
  const {
    isActive, currentStep, stepIndex, totalSteps,
    skipTour, finishTour, advanceManual, resolveConfirm, resolveBranch, skipCurrentStep,
  } = useTour()
  const location = useLocation()
  const [rect, setRect] = useState(null)
  const [isResizing, setIsResizing] = useState(false)
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT_ESTIMATE)
  const rafRef = useRef(null)
  const scrolledStepIdRef = useRef(null)
  const lockScrollYRef = useRef(0)
  const resizeTimerRef = useRef(null)
  const resizeObserverRef = useRef(null)

  const setCardRef = useCallback((node) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
      resizeObserverRef.current = null
    }
    if (node) {
      const ro = new ResizeObserver((entries) => {
        const h = entries[0]?.contentRect?.height
        if (h) setCardHeight(h)
      })
      ro.observe(node)
      resizeObserverRef.current = ro
    }
  }, [])

  useEffect(() => {
    setCardHeight(CARD_HEIGHT_ESTIMATE)
  }, [currentStep?.id])

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

    const r0 = el.getBoundingClientRect()
    const hasRealSize = r0.width > 0 && r0.height > 0

    if (hasRealSize && scrolledStepIdRef.current !== currentStep.id) {
      scrolledStepIdRef.current = currentStep.id
      const fullyVisible = r0.top >= 0 && r0.bottom <= window.innerHeight
      if (!fullyVisible) {
        const desiredOffset = r0.top - (window.innerHeight / 2 - r0.height / 2)
        const nextScrollY = Math.max(0, lockScrollYRef.current + desiredOffset)
        lockScrollYRef.current = nextScrollY
        document.body.style.top = `-${nextScrollY}px`
      }
    }

    const padX = currentStep.padX ?? PAD
    const padY = currentStep.padY ?? PAD
    const r = el.getBoundingClientRect()
    const next = {
      top: r.top - padY,
      left: r.left - padX,
      width: r.width + padX * 2,
      height: r.height + padY * 2,
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
    if (!isActive) {
      scrolledStepIdRef.current = null
    }
  }, [isActive])

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

    function handleResize() {
      setIsResizing(true)
      clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(() => setIsResizing(false), RESIZE_SETTLE_MS)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimerRef.current)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const scrollY = window.scrollY
    lockScrollYRef.current = scrollY
    const { body } = document
    const prevPosition = body.style.position
    const prevTop = body.style.top
    const prevWidth = body.style.width
    const prevOverflow = body.style.overflow
    const prevTransition = body.style.transition

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    body.style.transition = 'top 0.3s ease'

    return () => {
      body.style.position = prevPosition
      body.style.top = prevTop
      body.style.width = prevWidth
      body.style.overflow = prevOverflow
      body.style.transition = prevTransition
      window.scrollTo(0, lockScrollYRef.current)
    }
  }, [isActive])

  // A route change means a fresh page just mounted — it should always be
  // viewed from its own top, regardless of how far the previous page had
  // scrolled. Without this, leftover scroll offset from one page bleeds
  // into the next and can hide its content entirely.
  useEffect(() => {
    if (!isActive) return
    lockScrollYRef.current = 0
    document.body.style.top = '0px'
  }, [location.pathname, isActive])

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
    placeBelow = spaceBelow > cardHeight + CARD_GAP
    const top = placeBelow
      ? rect.top + rect.height + CARD_GAP
      : Math.max(12, rect.top - cardHeight - CARD_GAP)
    const rawLeft = Math.min(Math.max(12, rect.left), window.innerWidth - CARD_WIDTH - 12)
    tooltipPos = { top, left: rawLeft }

    const targetCenter = rect.left + rect.width / 2
    arrowLeft = Math.min(Math.max(targetCenter - rawLeft, 20), CARD_WIDTH - 20)
  }

  const noTransitionClass = isResizing ? styles.noTransition : ''

  return (
    <div className={styles.overlayRoot}>
      {hasTarget ? (
        <>
          <div className={`${styles.blockStrip} ${noTransitionClass}`} style={{ top: 0, left: 0, right: 0, height: rect.top }} />
          <div className={`${styles.blockStrip} ${noTransitionClass}`} style={{ top: rect.top + rect.height, left: 0, right: 0, bottom: 0 }} />
          <div className={`${styles.blockStrip} ${noTransitionClass}`} style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }} />
          <div className={`${styles.blockStrip} ${noTransitionClass}`} style={{ top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height }} />
          <div
            className={`${styles.spotlightRing} ${noTransitionClass}`}
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
          <div
            className={`${styles.pulseRing} ${noTransitionClass}`}
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
        ref={setCardRef}
        className={`${styles.card} ${!hasTarget ? styles.cardCentered : ''} ${noTransitionClass}`}
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