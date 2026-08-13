import { useState, useMemo } from 'react'
import Header from '../../../Header/Header'
import { CURRENCIES } from '../../../../datas/currencies'
import styles from './CurrencySheet.module.css'

function resolveCurrentCode(currency) {
  if (!currency) return null
  if (typeof currency === 'string') {
    const match = CURRENCIES.find(c => c.symbol === currency)
    return match?.currencyCode || null
  }
  return currency.currencyCode || null
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

export function CurrencySheet({ currentCurrency, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const currentCode = resolveCurrentCode(currentCurrency)
  const [selected, setSelected] = useState(
    () => CURRENCIES.find(c => c.currencyCode === currentCode) || null
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CURRENCIES
    return CURRENCIES.filter(c =>
      c.country.toLowerCase().includes(q) ||
      c.currencyCode.toLowerCase().includes(q) ||
      c.currencyName.toLowerCase().includes(q)
    )
  }, [query])

  const handleSave = () => {
    if (!selected) return
    onSelect(selected)
  }

  return (
    <div className={styles.container}>
      <Header
        type="back"
        title="Currency"
        onBackClick={onClose}
        showBorderBottom={false}
        customActions={[{
          label:    'Save',
          onClick:  handleSave,
          disabled: !selected || selected.currencyCode === currentCode,
        }]}
      />
      <div className={styles.body}>
        <p className={styles.notice}>
          This fixes the symbol shown on this document. Amounts already entered stay the same.
        </p>

        <input
          className={styles.search}
          type="text"
          inputMode="search"
          placeholder="Search country or currency"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        <div className={styles.list}>
          {filtered.map(c => {
            const isSelected = selected?.currencyCode === c.currencyCode && selected?.country === c.country
            return (
              <button
                key={`${c.countryCode}-${c.currencyCode}`}
                className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
                onClick={() => setSelected(c)}
              >
                <span className={styles.itemFlag}>
                  <FlagIcon countryCode={c.countryCode} />
                </span>
                <span className={styles.itemText}>
                  <span className={styles.itemCountry}>{c.country}</span>
                  <span className={styles.itemMeta}>{c.currencyCode} · {c.currencyName}</span>
                </span>
                <span className={styles.itemSymbol}>{c.symbol}</span>
                {isSelected && (
                  <span className="mi" style={{ fontSize: '1.2rem' }}>check_circle</span>
                )}
              </button>
            )
          })}

          {filtered.length === 0 && (
            <p className={styles.empty}>No currencies match "{query}"</p>
          )}
        </div>
      </div>
    </div>
  )
}
