import { useState, useRef, useLayoutEffect, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import styles from "./Dropdown.module.css"

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select",
  searchable = false,
  searchPlaceholder = "Search…",
  getOptionLabel = (option) => (typeof option === "object" && option !== null ? option.label : option),
  getOptionValue = (option) => (typeof option === "object" && option !== null ? option.value : option),
  isOptionSelected,
  filterOption,
  renderOption,
  renderTrigger,
  className = "",
  wrapStyle,
  menuStyle,
  menuMinWidth,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [menuPos, setMenuPos] = useState(null)

  const wrapRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const computePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight
    const margin = 8

    const requestedWidth = menuStyle?.width ? parseFloat(menuStyle.width) : rect.width
    const width = Math.min(requestedWidth || rect.width, viewportW - margin * 2)

    let left = rect.left
    if (left + width > viewportW - margin) left = viewportW - margin - width
    if (left < margin) left = margin

    const spaceBelow = viewportH - rect.bottom - margin
    const spaceAbove = rect.top - margin
    const preferredMaxHeight = 280
    const minUsableHeight = 160

    let top, maxHeight, placement
    if (spaceBelow >= minUsableHeight || spaceBelow >= spaceAbove) {
      placement = "down"
      maxHeight = Math.max(Math.min(preferredMaxHeight, spaceBelow - 6), minUsableHeight)
      top = rect.bottom + 6
    } else {
      placement = "up"
      maxHeight = Math.max(Math.min(preferredMaxHeight, spaceAbove - 6), minUsableHeight)
      top = rect.top - 6 - maxHeight
    }

    setMenuPos({ top, left, width, maxHeight, placement })
  }, [menuStyle])

  useLayoutEffect(() => {
    if (!open) return
    computePosition()
  }, [open, computePosition])

  useEffect(() => {
    if (!open) return
    const reposition = () => computePosition()
    window.addEventListener("resize", reposition)
    window.addEventListener("scroll", reposition, true)
    return () => {
      window.removeEventListener("resize", reposition)
      window.removeEventListener("scroll", reposition, true)
    }
  }, [open, computePosition])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      const clickedWrap = wrapRef.current && wrapRef.current.contains(e.target)
      const clickedMenu = menuRef.current && menuRef.current.contains(e.target)
      if (!clickedWrap && !clickedMenu) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === "Escape") {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  const defaultIsSelected = (option) => getOptionValue(option) === value
  const checkSelected = isOptionSelected || defaultIsSelected

  const defaultFilter = (option, query) =>
    getOptionLabel(option).toLowerCase().includes(query.toLowerCase())
  const checkFilter = filterOption || defaultFilter

  const filtered = searchable && search.trim()
    ? options.filter((option) => checkFilter(option, search))
    : options

  const selectedOption = options.find((option) => checkSelected(option))

  function handleSelect(option) {
    onChange(getOptionValue(option), option)
    setOpen(false)
    setSearch("")
  }

  function toggleOpen() {
    if (disabled) return
    setOpen((v) => !v)
  }

  return (
    <div className={`${styles.ddWrap} ${className}`} style={wrapStyle} ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.ddTrigger} ${disabled ? styles.ddTriggerDisabled : ""}`}
        onClick={toggleOpen}
        disabled={disabled}
      >
        {renderTrigger ? (
          renderTrigger(selectedOption)
        ) : (
          <span className={styles.ddTriggerText}>
            {selectedOption ? getOptionLabel(selectedOption) : placeholder}
          </span>
        )}
        <span className={`mi ${styles.ddArrow} ${open ? styles.ddArrowOpen : ""}`}>expand_more</span>
      </button>

      {open && menuPos && createPortal(
        <div
          ref={menuRef}
          className={`${styles.ddMenu} ${menuPos.placement === "up" ? styles.ddMenuUp : styles.ddMenuDown}`}
          style={{
            ...menuStyle,
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            maxHeight: menuPos.maxHeight,
          }}
        >
          {searchable && (
            <div className={styles.ddSearchWrap}>
              <span className="mi" style={{ fontSize: "1rem", color: "var(--text3)" }}>search</span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.ddSearchInput}
                autoFocus
              />
            </div>
          )}
          <div className={styles.ddList}>
            {filtered.length === 0 && (
              <div className={styles.ddListEmpty}>No results</div>
            )}
            {filtered.map((option, i) => {
              const active = checkSelected(option)
              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.ddOption} ${active ? styles.ddOptionActive : ""}`}
                  onClick={() => handleSelect(option)}
                >
                  {renderOption ? (
                    renderOption(option, active)
                  ) : (
                    <span className={styles.ddOptionLabel}>{getOptionLabel(option)}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}