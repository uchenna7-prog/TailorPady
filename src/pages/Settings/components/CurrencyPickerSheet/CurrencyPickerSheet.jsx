import { useState, useEffect, useRef } from 'react'
import styles from './CurrencyPickerSheet.module.css'

const DEFAULT_CURRENCY = {
  country: 'Nigeria',
  countryCode: 'NG',
  currencyCode: 'NGN',
  currencyName: 'Nigerian Naira',
  symbol: '₦',
}

export function CurrencyPickerSheet({ isOpen, currentSymbol, onSelect, onClose }) {

  const [list, setList] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    if (list.length > 0) return

    fetch('https://restcountries.com/v3.1/all?fields=name,currencies,cca2')
      .then(r => r.json())
      .then(data => {
        const parsed = data
          .filter(c => c.currencies && Object.keys(c.currencies).length > 0)
          .map(c => {
            const [code, info] = Object.entries(c.currencies)[0]
            return {
              country: c.name.common,
              countryCode: c.cca2,
              currencyCode: code,
              currencyName: info.name ?? code,
              symbol: info.symbol ?? code,
            }
          })
          .sort((a, b) => a.country.localeCompare(b.country))

        const withDefault = [
          DEFAULT_CURRENCY,
          ...parsed.filter(c => c.currencyCode !== 'NGN'),
        ]

        setList(withDefault)
        setFiltered(withDefault)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [isOpen])

  useEffect(() => {
    const q = search.toLowerCase().trim()
    if (!q) { setFiltered(list); return }
    setFiltered(list.filter(c =>
      c.country.toLowerCase().includes(q) ||
      c.currencyCode.toLowerCase().includes(q) ||
      c.currencyName.toLowerCase().includes(q)
    ))
  }, [search, list])

  useEffect(() => {
    if (isOpen && !loading) setTimeout(() => searchRef.current?.focus(), 100)
  }, [isOpen, loading])

  useEffect(() => {
    if (!isOpen) setSearch('')
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.handle} />

        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>Select Currency</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="mi">close</span>
          </button>
        </div>

        <div className={styles.searchWrap}>
          <span className={`mi ${styles.searchIcon}`}>search</span>
          <input
            ref={searchRef}
            className={styles.searchInput}
            type="text"
            placeholder="Search country or currency…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search.length > 0 && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>
              <span className="mi">close</span>
            </button>
          )}
        </div>

        <div className={styles.list}>
          {loading && (
            <div className={styles.state}>
              <span className={`mi ${styles.spinIcon}`}>progress_activity</span>
              <span>Loading currencies…</span>
            </div>
          )}

          {error && (
            <div className={styles.state}>
              <span className="mi" style={{ fontSize: '1.4rem', color: 'var(--danger)' }}>wifi_off</span>
              <span>Couldn't load currencies. Check your connection.</span>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className={styles.state}>
              <span className="mi" style={{ fontSize: '1.4rem', color: 'var(--text-sub)' }}>search_off</span>
              <span>No results for "{search}"</span>
            </div>
          )}

          {!loading && !error && filtered.map(c => {
            const isSelected = c.symbol === currentSymbol
            return (
              <button
                key={`${c.countryCode}-${c.currencyCode}`}
                className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
                onClick={() => { onSelect(c.symbol); onClose() }}
              >
                <span className={styles.flag}>{getFlagEmoji(c.countryCode)}</span>
                <div className={styles.rowText}>
                  <span className={styles.rowCountry}>{c.country}</span>
                  <span className={styles.rowCurrency}>{c.currencyName}</span>
                </div>
                <div className={styles.rowRight}>
                  <span className={styles.rowCode}>{c.currencyCode}</span>
                  <span className={styles.rowSymbol}>{c.symbol}</span>
                </div>
                {isSelected && <span className={`mi ${styles.checkIcon}`}>check</span>}
              </button>
            )
          })}

          <div style={{ height: 32 }} />
        </div>

      </div>
    </div>
  )
}

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🏳'
  return countryCode.toUpperCase().split('')
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('')
}