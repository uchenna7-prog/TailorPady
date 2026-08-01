import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import { useTour } from '../../contexts/TourContext'
import styles from './OnboardingTour.module.css'

const PAD = 8
const CARD_GAP = 16
const CARD_WIDTH = 280
const CARD_HEIGHT_FALLBACK = 170
const TARGET_TIMEOUT_MS = 2500
const RESIZE_SETTLE_MS = 200
const DESKTOP_BREAKPOINT = 769

function resolveTarget(step) {
  if (!step) return null
  if (step.desktopTarget && window.innerWidth >= DESKTOP_BREAKPOINT) return step.desktopTarget
  return step.target
}

export default function OnboardingTour() {
  const {
    isActive, currentStep, stepIndex, totalSteps,
    skipTour, finishTour, advanceManual, resolveConfirm, resolveBranch, skipCurrentStep,
  } = useTour()
  const [rect, setRect] = useState(null)
  const [isResizing, setIsResizing] = useState(false)
  const [cardSize, setCardSize] = useState({ width: CARD_WIDTH, height: CARD_HEIGHT_FALLBACK })
  const rafRef = useRef(null)
  const scrolledStepIdRef = useRef(null)
  const lockScrollYRef = useRef(0)
  const resizeTimerRef = useRef(null)
  const cardRef = useRef(null)

  const measure = useCallback(() => {
    const target = resolveTarget(currentStep)
    if (!target) {
      setRect(prev => (prev === null ? prev : null))
      return
    }
    const el = document.querySelector(target)
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

  useEffect(() => {
    if (!isActive || !currentStep) return
    const target = resolveTarget(currentStep)
    if (!target) return
    let cancelled = false
    const timer = setTimeout(() => {
      if (cancelled) return
      const el = document.querySelector(target)
      if (!el) skipCurrentStep()
    }, TARGET_TIMEOUT_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [currentStep, isActive, skipCurrentStep])

  useLayoutEffect(() => {
    if (!isActive || !cardRef.current) return

    const measureCard = () => {
      if (!cardRef.current) return
      const box = cardRef.current.getBoundingClientRect()
      if (box.width > 0 && box.height > 0) {
        setCardSize(prev => (
          Math.abs(prev.width - box.width) < 0.5 && Math.abs(prev.height - box.height) < 0.5
            ? prev
            : { width: box.width, height: box.height }
        ))
      }
    }

    measureCard()

    const observer = new ResizeObserver(measureCard)
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [isActive, currentStep])

  if (!isActive || !currentStep) return null

  const isLastStep = stepIndex === totalSteps - 1
  const hasTarget = !!rect
  const isConfirm = currentStep.type === 'confirm'
  const isBranch = currentStep.type === 'branch'
  const isDesktopViewport = window.innerWidth >= DESKTOP_BREAKPOINT
  const displayTitle = (isDesktopViewport && currentStep.desktopTitle) || currentStep.title
  const displayMessage = (isDesktopViewport && currentStep.desktopMessage) || currentStep.message

  let tooltipPos = null
  let placeBelow = true
  let arrowLeft = null

  if (hasTarget) {
    const spaceBelow = window.innerHeight - (rect.top + rect.height)
    placeBelow = spaceBelow > cardSize.height + CARD_GAP
    const top = placeBelow
      ? rect.top + rect.height + CARD_GAP
      : Math.max(12, rect.top - cardSize.height - CARD_GAP)
    const targetCenter = rect.left + rect.width / 2
    const idealLeft = targetCenter - cardSize.width / 2
    const rawLeft = Math.min(Math.max(12, idealLeft), window.innerWidth - cardSize.width - 12)
    tooltipPos = { top, left: rawLeft }
    arrowLeft = Math.min(Math.max(targetCenter - rawLeft, 20), cardSize.width - 20)
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
        ref={cardRef}
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

        <h3 className={styles.title}>{displayTitle}</h3>
        <p className={styles.message}>{displayMessage}</p>

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