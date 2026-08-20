import { useState, useRef, useLayoutEffect, useEffect, useCallback, useMemo } from "react"
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [closing, setClosing] = useState(false)

  const wrapRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const listRef = useRef(null)
  const searchInputRef = useRef(null)
  const optionRefs = useRef([])
  const closeTimerRef = useRef(null)

  const computePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight
    const margin = 8

    const naturalWidth = menuMinWidth ? Math.max(rect.width, menuMinWidth) : rect.width
    const width = Math.min(naturalWidth, viewportW - margin * 2)

    let left = rect.left
    if (left + width > viewportW - margin) left = viewportW - margin - width
    if (left < margin) left = margin

    const spaceBelow = viewportH - rect.bottom - margin
    const spaceAbove = rect.top - margin
    const preferredMaxHeight = 300
    const minUsableHeight = 160

    let top, bottom, maxHeight, placement
    if (spaceBelow >= minUsableHeight || spaceBelow >= spaceAbove) {
      placement = "down"
      maxHeight = Math.max(Math.min(preferredMaxHeight, spaceBelow - 6), minUsableHeight)
      top = rect.bottom + 8
    } else {
      placement = "up"
      maxHeight = Math.max(Math.min(preferredMaxHeight, spaceAbove - 6), minUsableHeight)
      bottom = viewportH - rect.top + 8
    }

    setMenuPos({ top, bottom, left, width, maxHeight, placement, triggerHeight: rect.height })
  }, [menuMinWidth])

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

  const closeMenu = useCallback(() => {
    setClosing(true)
    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setOpen(false)
      setClosing(false)
      setSearch("")
      setHighlightedIndex(-1)
    }, 140)
  }, [])

  useEffect(() => () => clearTimeout(closeTimerRef.current), [])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      const clickedWrap = wrapRef.current && wrapRef.current.contains(e.target)
      const clickedMenu = menuRef.current && menuRef.current.contains(e.target)
      if (!clickedWrap && !clickedMenu) closeMenu()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, closeMenu])

  const defaultIsSelected = (option) => getOptionValue(option) === value
  const checkSelected = isOptionSelected || defaultIsSelected

  const defaultFilter = (option, query) =>
    getOptionLabel(option).toLowerCase().includes(query.toLowerCase())
  const checkFilter = filterOption || defaultFilter

  const filtered = useMemo(() => {
    return searchable && search.trim()
      ? options.filter((option) => checkFilter(option, search))
      : options
  }, [options, search, searchable])

  const selectedOption = options.find((option) => checkSelected(option))

  useEffect(() => {
    optionRefs.current = optionRefs.current.slice(0, filtered.length)
  }, [filtered.length])

  useEffect(() => {
    if (!open) return
    const selectedIdx = filtered.findIndex((option) => checkSelected(option))
    setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : filtered.length > 0 ? 0 : -1)
    if (searchable) {
      requestAnimationFrame(() => searchInputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (highlightedIndex < 0) return
    const el = optionRefs.current[highlightedIndex]
    if (el) el.scrollIntoView({ block: "nearest" })
  }, [highlightedIndex])

  function handleSelect(option) {
    onChange(getOptionValue(option), option)
    closeMenu()
  }

  function toggleOpen() {
    if (disabled) return
    if (open) closeMenu()
    else setOpen(true)
  }

  function handleTriggerKeyDown(e) {
    if (disabled) return
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
    }
  }

  function handleMenuKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault()
      closeMenu()
      triggerRef.current?.focus()
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1 >= filtered.length ? 0 : prev + 1))
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev - 1 < 0 ? filtered.length - 1 : prev - 1))
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      const option = filtered[highlightedIndex]
      if (option) handleSelect(option)
      return
    }
    if (e.key === "Tab") {
      closeMenu()
    }
  }

  return (
    <div className={`${styles.ddWrap} ${className}`} style={wrapStyle} ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.ddTrigger} ${disabled ? styles.ddTriggerDisabled : ""} ${open ? styles.ddTriggerOpen : ""}`}
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {renderTrigger ? (
          renderTrigger(selectedOption)
        ) : (
          <span className={`${styles.ddTriggerText} ${!selectedOption ? styles.ddTriggerPlaceholder : ""}`}>
            {selectedOption ? getOptionLabel(selectedOption) : placeholder}
          </span>
        )}
        <span className={`mi ${styles.ddArrow} ${open ? styles.ddArrowOpen : ""}`}>expand_more</span>
      </button>

      {open && menuPos && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          className={`${styles.ddMenu} ${menuPos.placement === "up" ? styles.ddMenuUp : styles.ddMenuDown} ${closing ? styles.ddMenuClosing : ""}`}
          style={{
            ...menuStyle,
            position: "fixed",
            ...(menuPos.placement === "down" ? { top: menuPos.top } : { bottom: menuPos.bottom }),
            left: menuPos.left,
            width: menuPos.width,
            maxHeight: menuPos.maxHeight,
          }}
        >
          {searchable && (
            <div className={styles.ddSearchWrap}>
              <span className={`mi ${styles.ddSearchIcon}`}>search</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setHighlightedIndex(0)
                }}
                className={styles.ddSearchInput}
              />
              {search && (
                <button
                  type="button"
                  className={styles.ddSearchClear}
                  onClick={() => {
                    setSearch("")
                    searchInputRef.current?.focus()
                  }}
                  aria-label="Clear search"
                >
                  <span className="mi-outlined">close</span>
                </button>
              )}
            </div>
          )}
          <div className={styles.ddList} ref={listRef}>
            {filtered.length === 0 && (
              <div className={styles.ddListEmpty}>
                <span className={`mi ${styles.ddListEmptyIcon}`}>search_off</span>
                <span>No results found</span>
              </div>
            )}
            {filtered.map((option, i) => {
              const active = checkSelected(option)
              const highlighted = i === highlightedIndex
              return (
                <button
                  key={i}
                  ref={(el) => (optionRefs.current[i] = el)}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`${styles.ddOption} ${active ? styles.ddOptionActive : ""} ${highlighted ? styles.ddOptionHighlighted : ""}`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                >
                  {renderOption ? (
                    renderOption(option, active)
                  ) : (
                    <>
                      <span className={styles.ddOptionLabel}>{getOptionLabel(option)}</span>
                      {active && <span className={`mi ${styles.ddOptionCheck}`}>check</span>}
                    </>
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
