import { useEffect, useRef, useCallback } from 'react'
import Header from '../../../../../components/Header/Header'
import styles from './ZoomOverlay.module.css'

export function ZoomOverlay({
  template,
  index,
  total,
  isSelected,
  sampleProps,
  onClose,
  onSelect,
  onNav,
  canNavPrev,
  canNavNext,
  slideClass,
  slideKey,
}) {
  const innerRef    = useRef(null)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'ArrowRight') onNav(1)
      if (e.key === 'ArrowLeft')  onNav(-1)
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onNav, onClose])

  useEffect(() => {
    if (innerRef.current) innerRef.current.scrollTop = 0
  }, [slideKey])

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
      onNav(dx < 0 ? 1 : -1)
    }
    touchStartX.current = null
    touchStartY.current = null
  }, [onNav])

  const selectAction = {
    label:    isSelected ? 'Selected' : 'Select',
    onClick:  () => !isSelected && onSelect(template),
    disabled: isSelected,
  }

  return (
    <div
      className={styles.overlay}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Header
        type="back"
        title={template.label}
        onBackClick={onClose}
        showBorderBottom={true}
        customActions={[selectAction]}
      />

      <p className={styles.counter}>{index + 1} of {total}</p>

      <div className={styles.scrollArea}>
        <div className={styles.paperWrap}>
          <div
            key={slideKey}
            className={`${styles.paperInner} ${slideClass}`}
            ref={innerRef}
          >
            <template.Component {...sampleProps} />
          </div>
        </div>
      </div>

      {canNavPrev && (
        <button
          className={`${styles.navButton} ${styles.navPrev}`}
          onClick={() => onNav(-1)}
          aria-label="Previous template"
        >
          <span className="mi" style={{ fontSize: '1.25rem' }}>chevron_left</span>
        </button>
      )}

      {canNavNext && (
        <button
          className={`${styles.navButton} ${styles.navNext}`}
          onClick={() => onNav(1)}
          aria-label="Next template"
        >
          <span className="mi" style={{ fontSize: '1.25rem' }}>chevron_right</span>
        </button>
      )}
    </div>
  )
}