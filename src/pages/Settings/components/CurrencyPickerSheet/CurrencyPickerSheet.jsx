import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './CurrencyPickerSheet.module.css'

const DEFAULT_CURRENCY = {
  country:      'Nigeria',
  countryCode:  'NG',
  currencyCode: 'NGN',
  currencyName: 'Nigerian Naira',
  symbol:       '₦',
}

function resolveSelected(value) {
  if (!value) return DEFAULT_CURRENCY
  if (typeof value === 'string') {
    return { ...DEFAULT_CURRENCY, symbol: value, currencyCode: value, countryCode: '' }
  }
  return value
}

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🏳'
  return countryCode
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('')
}


function PortaledDropdown({ anchorRef, onClose, children }) {
  const dropdownRef        = useRef(null)
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    function position() {
      if (!anchorRef.current) return
      const rect = anchorRef.current.getBoundingClientRect()
      setCoords({
        top:   rect.bottom + 6,
        left:  rect.left,
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
      if (anchorRef.current?.contains(e.target))   return
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
  const [search,  setSearch]  = useState('')
  const [list,    setList]    = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)

    fetch('https://restcountries.com/v3.1/all?fields=name,currencies,cca2')
      .then(r => r.json())
      .then(data => {
        const parsed = data
          .filter(c => c.currencies && Object.keys(c.currencies).length > 0)
          .map(c => {
            const [code, info] = Object.entries(c.currencies)[0]
            return {
              country:      c.name.common,
              countryCode:  c.cca2,
              currencyCode: code,
              currencyName: info.name ?? code,
              symbol:       info.symbol ?? code,
            }
          })
          .sort((a, b) => a.country.localeCompare(b.country))

        setList([DEFAULT_CURRENCY, ...parsed.filter(c => c.currencyCode !== 'NGN')])
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const filtered = search.trim()
    ? list.filter(c =>
        c.country.toLowerCase().includes(search.toLowerCase())      ||
        c.currencyCode.toLowerCase().includes(search.toLowerCase()) ||
        c.currencyName.toLowerCase().includes(search.toLowerCase())
      )
    : list

  function handleSelect(currency) {
    onSelect(currency)
    onClose()
  }

  return (
    <>
      <div className={styles.searchWrap}>
        <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>search</span>
        <input
          autoFocus
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
        {loading && (
          <div className={styles.stateWrap}>
            <span className={`mi ${styles.spinIcon}`}>progress_activity</span>
            <span>Loading currencies…</span>
          </div>
        )}

        {error && (
          <div className={styles.stateWrap}>
            <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--danger)' }}>wifi_off</span>
            <span>Couldn't load. Check your connection.</span>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className={styles.stateWrap}>
            <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--text3)' }}>search_off</span>
            <span>No results for "{search}"</span>
          </div>
        )}

        {!loading && !error && filtered.map(c => {
          const isSelected = c.currencyCode === selected.currencyCode
          return (
            <button
              key={`${c.countryCode}-${c.currencyCode}`}
              type="button"
              className={`${styles.option} ${isSelected ? styles.optionActive : ''}`}
              onClick={() => handleSelect(c)}
            >
              <span className={styles.flag}>{getFlagEmoji(c.countryCode)}</span>
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


/**
 * Three usage modes:
 *
 * 1. Standalone — component owns its own compact trigger button.
 *    <CurrencyPickerSheet selected={currency} onSelect={setCurrency} />
 *
 * 2. Anchored — parent owns the trigger UI, component renders a portaled
 *    dropdown anchored below a ref the parent passes in.
 *    <CurrencyPickerSheet anchorRef={ref} isOpen={open} onClose={close} selected={currency} onSelect={setCurrency} />
 *
 * 3. Bottom sheet — parent drives open/close, no anchorRef.
 *    <CurrencyPickerSheet isOpen={open} onClose={close} selected={currency} onSelect={setCurrency} />
 */
export function CurrencyPickerSheet({ anchorRef, isOpen, onClose, selected: selectedProp, onSelect }) {
  const selected     = resolveSelected(selectedProp)
  const isAnchored   = anchorRef !== undefined
  const isControlled = isOpen !== undefined

  const [internalOpen, setInternalOpen] = useState(false)
  const internalRef                     = useRef(null)

  const open  = isControlled ? isOpen  : internalOpen
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
        <span className={styles.triggerFlag}>{getFlagEmoji(selected.countryCode)}</span>
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