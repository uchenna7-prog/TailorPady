import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './CurrencyPickerSheet.module.css'
import { CURRENCIES, DEFAULT_CURRENCY } from '../../../../datas/currencies'

function resolveSelected(value) {
  if (!value) return DEFAULT_CURRENCY
  if (typeof value === 'string') {
    return { ...DEFAULT_CURRENCY, symbol: value, currencyCode: value, countryCode: '' }
  }
  return value
}

function FlagIcon({ countryCode }) {
  if (!countryCode) return <span className={styles.flagFallback}>🏳</span>
  return (
    <img
      src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png 2x`}
      alt=""
      width={24}
      height={18}
      className={styles.flagImg}
      loading="lazy"
    />
  )
}

function PortaledDropdown({ anchorRef, onClose, children }) {
  const dropdownRef = useRef(null)
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    function position() {
      if (!anchorRef.current) return
      const rect = anchorRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      })
    }

    position()
    window.addEventListener('scroll', position, true)
    window.addEventListener('resize', position)

    return () => {
      window.removeEventListener('scroll', position, true)
      window.removeEventListener('resize', position)
    }
  }, [anchorRef])

  useEffect(() => {
    function handleOutside(e) {
      if (anchorRef.current?.contains(e.target)) return
      if (dropdownRef.current?.contains(e.target)) return
      onClose()
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [anchorRef, onClose])

  if (!coords) return null

  return createPortal(
    <div
      ref={dropdownRef}
      className={styles.dropdown}
      style={{ top: coords.top, left: coords.left, width: Math.max(coords.width, 300) }}
    >
      {children}
    </div>,
    document.body
  )
}

function CurrencyList({ selected, onSelect, onClose }) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? CURRENCIES.filter(c =>
        c.country.toLowerCase().includes(search.toLowerCase()) ||
        c.currencyCode.toLowerCase().includes(search.toLowerCase()) ||
        c.currencyName.toLowerCase().includes(search.toLowerCase())
      )
    : CURRENCIES

  function handleSelect(currency) {
    onSelect(currency)
    onClose()
  }

  return (
    <>
      <div className={styles.searchWrap}>
        <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>search</span>
        <input
          type="text"
          placeholder="Search country or currency…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        {search.length > 0 && (
          <button type="button" className={styles.clearBtn} onClick={() => setSearch('')}>
            <span className="mi" style={{ fontSize: '1rem' }}>close</span>
          </button>
        )}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 && (
          <div className={styles.stateWrap}>
            <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--text3)' }}>search_off</span>
            <span>No results for "{search}"</span>
          </div>
        )}

        {filtered.map(c => {
          const isSelected = c.currencyCode === selected.currencyCode
          return (
            <button
              key={`${c.countryCode}-${c.currencyCode}`}
              type="button"
              className={`${styles.option} ${isSelected ? styles.optionActive : ''}`}
              onClick={() => handleSelect(c)}
            >
              <span className={styles.flag}>
                <FlagIcon countryCode={c.countryCode} />
              </span>
              <div className={styles.optionText}>
                <span className={styles.optionCountry}>{c.country}</span>
                <span className={styles.optionCurrencyName}>{c.currencyName}</span>
              </div>
              <div className={styles.optionRight}>
                <span className={styles.optionCode}>{c.currencyCode}</span>
                <span className={styles.optionSymbol}>{c.symbol}</span>
              </div>
              {isSelected && (
                <span className="mi" style={{ fontSize: '1rem', color: 'var(--accent)', flexShrink: 0 }}>check</span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

export function CurrencyPickerSheet({ anchorRef, isOpen, onClose, selected: selectedProp, onSelect }) {
  const selected = resolveSelected(selectedProp)
  const isAnchored = anchorRef !== undefined
  const isControlled = isOpen !== undefined

  const [internalOpen, setInternalOpen] = useState(false)
  const internalRef = useRef(null)

  const open = isControlled ? isOpen : internalOpen
  const close = isControlled ? onClose : () => setInternalOpen(false)

  function toggle() {
    setInternalOpen(v => !v)
  }

  if (isAnchored) {
    if (!open) return null
    return (
      <PortaledDropdown anchorRef={anchorRef} onClose={close}>
        <CurrencyList selected={selected} onSelect={onSelect} onClose={close} />
      </PortaledDropdown>
    )
  }

  if (isControlled) {
    if (!open) return null
    return createPortal(
      <div className={styles.backdrop} onClick={close}>
        <div className={styles.sheet} onClick={e => e.stopPropagation()}>
          <div className={styles.handle} />
          <div className={styles.sheetHeader}>
            <span className={styles.sheetTitle}>Select Currency</span>
            <button type="button" className={styles.closeBtn} onClick={close}>
              <span className="mi">close</span>
            </button>
          </div>
          <CurrencyList selected={selected} onSelect={onSelect} onClose={close} />
        </div>
      </div>,
      document.body
    )
  }

  return (
    <div className={styles.pickerWrap} ref={internalRef}>
      <button type="button" className={styles.triggerBtn} onClick={toggle}>
        <span className={styles.triggerFlag}>
          <FlagIcon countryCode={selected.countryCode} />
        </span>
        <span className={styles.triggerSymbol}>{selected.symbol}</span>
        <span className={styles.triggerCode}>{selected.currencyCode}</span>
        <span className="mi" style={{ fontSize: '0.9rem', color: 'var(--text3)' }}>expand_more</span>
      </button>

      {open && (
        <PortaledDropdown anchorRef={internalRef} onClose={close}>
          <CurrencyList selected={selected} onSelect={onSelect} onClose={close} />
        </PortaledDropdown>
      )}
    </div>
  )
}