import { useState, useRef, useEffect } from 'react'
import styles from './CountryCodePicker.module.css'
import { COUNTRIES } from '../../datas/dialCodes'

function FlagIcon({ cca2 }) {
  if (!cca2) return <span className={styles.flagFallback}>🏳</span>
  return (
    <img
      src={`https://flagcdn.com/24x18/${cca2.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/48x36/${cca2.toLowerCase()}.png 2x`}
      alt=""
      width={24}
      height={18}
      className={styles.flagImg}
      loading="lazy"
    />
  )
}

export function CountryCodePicker({ selected, onSelect }) {

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = search.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial_code.includes(search)
      )
    : COUNTRIES

  const handleSelect = (country) => {
    onSelect(country)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className={styles.ccPickerWrap} ref={dropdownRef}>
      <button
        type="button"
        className={styles.ccBtn}
        onClick={() => setOpen(v => !v)}
      >
        <span className={styles.ccFlag}>
          <FlagIcon cca2={selected.cca2} />
        </span>
        <span className={styles.ccCode}>{selected.dial_code}</span>
        <span className="mi" style={{ fontSize: '0.9rem', color: 'var(--text3)' }}>expand_more</span>
      </button>

      {open && (
        <div className={styles.ccDropdown}>
          <div className={styles.ccSearchWrap}>
            <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>search</span>
            <input
              type="text"
              placeholder="Search country or code…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.ccSearchInput}
            />
          </div>
          <div className={styles.ccList}>
            {filtered.length === 0 && (
              <div className={styles.ccListEmpty}>No results</div>
            )}
            {filtered.map((c, i) => (
              <button
                key={`${c.cca2}-${c.dial_code}-${i}`}
                type="button"
                className={`${styles.ccOption} ${selected.dial_code === c.dial_code && selected.name === c.name ? styles.ccOptionActive : ''}`}
                onClick={() => handleSelect(c)}
              >
                <span className={styles.ccFlag}>
                  <FlagIcon cca2={c.cca2} />
                </span>
                <span className={styles.ccOptionName}>{c.name}</span>
                <span className={styles.ccOptionCode}>{c.dial_code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}