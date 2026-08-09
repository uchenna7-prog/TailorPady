import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsage } from '../../../../contexts/UsageContext'
import { usePremium } from '../../../../contexts/PremiumContext'
import { useCustomers } from '../../../../contexts/CustomerContext'
import styles from './UsageLimitBanner.module.css'

const STORAGE_KEY = 'TailorPady_usage_limit_banner'
const APPROACHING_THRESHOLD = 0.7
const DISMISS_JUMP_THRESHOLD = 0.15

const TITLE_LABELS = {
  customers: 'Customers',
  measurementsPerMonth: 'Measurements',
  ordersPerMonth: 'Orders',
  invoicesPerMonth: 'Invoices',
  receiptsPerMonth: 'Receipts',
  portfolioUploadsPerMonth: 'Portfolio Uploads',
  reviewLinksPerMonth: 'Review Links',
  aiActionsPerMonth: 'AI Actions',
}

const LIFETIME_FIELDS = new Set(['customers'])

function titleFor(field) {
  if (TITLE_LABELS[field]) return TITLE_LABELS[field]
  const stripped = field.replace(/PerMonth$/, '')
  return stripped.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()
}

function getMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getBannerState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

function saveBannerState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function UsageLimitBanner() {
  const navigate = useNavigate()
  const { usage, limits, loading: usageLoading } = useUsage()
  const { isPremium, loading: premiumLoading } = usePremium()
  const { customers } = useCustomers()
  const [dismissed, setDismissed] = useState(false)

  const topField = useMemo(() => {
    const keys = Object.keys(limits || {})
    let best = null
    keys.forEach(key => {
      const cap = limits[key]
      if (!cap) return
      const used = key === 'customers' ? customers.length : (usage[key] || 0)
      const pct = used / cap
      if (!best || pct > best.pct) {
        best = { field: key, used, cap, pct: Math.min(pct, 1) }
      }
    })
    return best
  }, [usage, limits, customers])

  useEffect(() => {
    setDismissed(false)
  }, [topField?.field, topField?.pct])

  if (usageLoading || premiumLoading || isPremium || !topField) return null
  if (topField.pct < APPROACHING_THRESHOLD) return null

  const monthKey = getMonthKey()
  const state = getBannerState()
  const alreadyDismissed =
    state.monthKey === monthKey &&
    state.field === topField.field &&
    topField.pct - (state.dismissedAtPct || 0) < DISMISS_JUMP_THRESHOLD &&
    topField.pct < 1

  if ((dismissed || alreadyDismissed)) return null

  const isAtLimit = topField.pct >= 1
  const titleLabel = titleFor(topField.field)
  const isLifetime = LIFETIME_FIELDS.has(topField.field)
  const title = isAtLimit ? `${titleLabel} Limit Reached` : `Nearing ${titleLabel} Limit`

  function handleDismiss() {
    saveBannerState({ monthKey, field: topField.field, dismissedAtPct: topField.pct })
    setDismissed(true)
  }

  function handleUpgrade() {
    navigate('/upgrade')
  }

  function handleViewUsage() {
    navigate('/account', { state: { autoOpenModal: 'usage' } })
  }

  return (
    <div className={`${styles.banner} ${isAtLimit ? styles.bannerCritical : styles.bannerWarning}`}>
      {!isAtLimit && (
        <button className={styles.dismiss} onClick={handleDismiss} aria-label="Dismiss">
          <span className="mi" style={{ fontSize: '1rem' }}>close</span>
        </button>
      )}

      <div className={styles.row}>
        <div className={styles.iconBadge}>
          <span className="mi" style={{ fontSize: '1.15rem' }}>
            {isAtLimit ? 'lock' : 'bolt'}
          </span>
        </div>

        <div className={styles.text}>
          <div className={styles.title}>{title}</div>
          <div className={styles.sub}>
            <span className={styles.stat}>{topField.used}/{topField.cap}</span>
            {' '}used{isLifetime ? ' · lifetime limit' : ' this month'}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.upgrade} onClick={handleUpgrade}>Upgrade</button>
          <button className={styles.viewUsage} onClick={handleViewUsage}>View Usage</button>
        </div>
      </div>
    </div>
  )
}
