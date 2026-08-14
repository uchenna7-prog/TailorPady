import styles from './GoalReachedModal.module.css'

function formatAmount(amount, symbol, position, decimals, numberFormat) {
  const fixed      = Number(amount).toFixed(decimals)
  const parts      = fixed.split('.')
  const locale     = numberFormat === 'anglophone' ? 'en-US' : 'de-DE'
  parts[0]         = Number(parts[0]).toLocaleString(locale)
  const formatted  = decimals > 0 ? parts.join('.') : parts[0]
  return position === 'prefix' ? `${symbol}${formatted}` : `${formatted}${symbol}`
}

function resolveCurrencySymbol(raw) {
  if (!raw) return '₦'
  if (typeof raw === 'string') return raw
  return raw.symbol ?? '₦'
}

export function GoalReachedModal({ goal, derived, isFirstTime, generalSettings, onClose }) {
  const symbol       = resolveCurrencySymbol(generalSettings.currency)
  const position     = generalSettings.currencySymbolPosition ?? 'prefix'
  const decimals     = generalSettings.currencyDecimals       ?? 0
  const numberFormat = generalSettings.currencyNumberFormat   ?? 'anglophone'

  const fmt        = (n) => formatAmount(n, symbol, position, decimals, numberFormat)
  const periodName = goal.period === 'weekly' ? 'week' : goal.period === 'monthly' ? 'month' : 'year'

  const title   = isFirstTime ? 'First goal reached' : 'Goal reached'
  const message = isFirstTime
    ? `You hit your ${periodName}ly revenue goal of ${fmt(goal.goal)} for the first time. Nice work.`
    : `You hit your ${periodName}ly revenue goal of ${fmt(goal.goal)} again. Keep it up.`

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        </button>

        <div className={styles.iconWrap}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
            <path d="M7 12.5l3 3 7-7" stroke="var(--surface)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button className={styles.doneBtn} onClick={onClose}>Keep going</button>
        </div>
      </div>
    </div>
  )
}
