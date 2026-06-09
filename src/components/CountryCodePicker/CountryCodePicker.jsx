import { useState, useRef, useEffect } from 'react'
import styles from './CountryCodePicker.module.css'


export function CountryCodePicker({ selected, onSelect }) {

  const [open,      setOpen]      = useState(false)
  const [search,    setSearch]    = useState('')
  const [countries, setCountries] = useState([])
  const [loading,   setLoading]   = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!open || countries.length > 0) return
    setLoading(true)
    fetch('https://restcountries.com/v3.1/all?fields=name,idd,flag,cca2')
      .then(r => r.json())
      .then(data => {
        const list = []
        data.forEach(c => {
          const root     = c.idd?.root || ''
          const suffix   = c.idd?.suffixes
          if (!root) return
          const suffixes = Array.isArray(suffix) && suffix.length === 1 ? suffix : (suffix || [''])
          suffixes.forEach(s => {
            const dial_code = root + s
            list.push({ name: c.name?.common || '', dial_code, flag: c.flag || '', cca2: c.cca2 || '' })
          })
        })
        list.sort((a, b) => a.name.localeCompare(b.name))
        setCountries(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, countries.length])

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
    ? countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial_code.includes(search)
      )
    : countries

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
        <span className={styles.ccFlag}>{selected.flag}</span>
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
            {loading && (
              <div className={styles.ccListEmpty}>Loading countries…</div>
            )}
            {!loading && filtered.length === 0 && (
              <div className={styles.ccListEmpty}>No results</div>
            )}
            {!loading && filtered.map((c, i) => (
              <button
                key={`${c.cca2}-${c.dial_code}-${i}`}
                type="button"
                className={`${styles.ccOption} ${selected.dial_code === c.dial_code && selected.name === c.name ? styles.ccOptionActive : ''}`}
                onClick={() => handleSelect(c)}
              >
                <span className={styles.ccFlag}>{c.flag}</span>
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