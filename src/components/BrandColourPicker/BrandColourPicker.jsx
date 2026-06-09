import { useRef, useState, useEffect } from 'react'
import { STYLE_GROUPS, getPalettesByStyle, getPaletteById, DEFAULT_COLOUR_ID } from '../../config/brandPalette'
import styles from './BrandColourPicker.module.css'

export default function BrandColourPicker({ value, onChange }) {

  const selected   = getPaletteById(value) || getPaletteById(DEFAULT_COLOUR_ID)
  const [activeStyle, setActiveStyle] = useState(selected?.style || 'Classic')
  const swatches   = getPalettesByStyle(activeStyle)

  const tabsRef    = useRef(null)
  const tabRefs    = useRef({})
  const touchStart = useRef(null)

  const scrollActiveTabIntoView = (style) => {
    tabRefs.current[style]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  useEffect(() => {
    scrollActiveTabIntoView(activeStyle)
  }, [activeStyle])

  const handleTabClick = (style) => {
    setActiveStyle(style)
  }

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return

    const touch = e.changedTouches[0]
    const dx    = touch.clientX - touchStart.current.x
    const dy    = touch.clientY - touchStart.current.y
    touchStart.current = null

    const isHorizontalSwipe = Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5
    if (!isHorizontalSwipe) return

    const curIndex = STYLE_GROUPS.indexOf(activeStyle)

    if (dx < 0 && curIndex < STYLE_GROUPS.length - 1) {
      setActiveStyle(STYLE_GROUPS[curIndex + 1])
    } else if (dx > 0 && curIndex > 0) {
      setActiveStyle(STYLE_GROUPS[curIndex - 1])
    }
  }

  return (
    <div className={styles.picker}>

      <div ref={tabsRef} className={styles.tabs}>
        {STYLE_GROUPS.map(style => (
          <button
            key={style}
            type="button"
            ref={el => tabRefs.current[style] = el}
            className={`${styles.tab} ${activeStyle === style ? styles.tabActive : ''}`}
            onClick={() => handleTabClick(style)}
          >
            {style}
          </button>
        ))}
      </div>

      <div
        className={styles.swatches}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {swatches.map(colour => {
          const isSelected = value === colour.id
          return (
            <button
              key={colour.id}
              type="button"
              className={`${styles.swatch} ${isSelected ? styles.swatchSelected : ''}`}
              onClick={() => onChange(colour.id)}
              aria-label={colour.label}
              title={colour.label}
            >
              <span
                className={styles.swatchCircle}
                style={{ background: colour.tokens.primary }}
              >
                {isSelected && (
                  <span className={styles.swatchCheck}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke={colour.tokens.onPrimary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </span>
              <span className={`${styles.swatchLabel} ${isSelected ? styles.swatchLabelSelected : ''}`}>
                {colour.label}
              </span>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={styles.selectedBar}>
          <span className={styles.selectedDot} style={{ background: selected.tokens.primary }} />
          <span className={styles.selectedName}>{selected.style} · {selected.label}</span>
          <span className={styles.selectedHex}>{selected.tokens.primary}</span>
        </div>
      )}

    </div>
  )
}