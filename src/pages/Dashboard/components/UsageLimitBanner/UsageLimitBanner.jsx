import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsage } from '../../../../contexts/UsageContext'
import { usePremium } from '../../../../contexts/PremiumContext'
import styles from './UsageLimitBanner.module.css'

const STORAGE_KEY = 'TailorPady_usage_limit_banner'
const APPROACHING_THRESHOLD = 0.7
const DISMISS_JUMP_THRESHOLD = 0.15

const LIMIT_LABELS = {
  customers: 'customers',
  measurementsPerMonth: 'measurements',
  ordersPerMonth: 'orders',
  invoicesPerMonth: 'invoices',
  receiptsPerMonth: 'receipts',
  portfolioUploadsPerMonth: 'portfolio uploads',
  reviewLinksPerMonth: 'review links',
  aiActionsPerMonth: 'AI actions',
}

function labelFor(field) {
  if (LIMIT_LABELS[field]) return LIMIT_LABELS[field]
  const stripped = field.replace(/PerMonth$/, '')
  const spaced = stripped.replace(/([A-Z])/g, ' $1').toLowerCase()
  return spaced.trim()
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
  const [dismissed, setDismissed] = useState(false)

  const topField = useMemo(() => {
    const keys = Object.keys(limits || {})
    let best = null
    keys.forEach(key => {
      const cap = limits[key]
      if (!cap) return
      const used = usage[key] || 0
      const pct = used / cap
      if (!best || pct > best.pct) {
        best = { field: key, used, cap, pct: Math.min(pct, 1) }
      }
    })
    return best
  }, [usage, limits])

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
  const percentLabel = Math.round(topField.pct * 100)
  const metricLabel = labelFor(topField.field)

  function handleDismiss() {
    saveBannerState({ monthKey, field: topField.field, dismissedAtPct: topField.pct })
    setDismissed(true)
  }

  function handleUpgrade() {
    navigate('/upgrade')
  }

  return (
    <div className={`${styles.banner} ${isAtLimit ? styles.bannerCritical : styles.bannerWarning}`}>
      <div className={styles.top}>
        <span className={`mi ${styles.icon}`}>
          {isAtLimit ? 'error' : 'trending_up'}
        </span>

        <div className={styles.text}>
          <div className={styles.title}>
            {isAtLimit ? `You've hit your ${metricLabel} limit` : `Approaching your ${metricLabel} limit`}
          </div>
          <div className={styles.sub}>
            {topField.used} of {topField.cap} {metricLabel} used this month
          </div>
        </div>

        {!isAtLimit && (
          <button className={styles.dismiss} onClick={handleDismiss} aria-label="Dismiss">
            <span className="mi" style={{ fontSize: '1.1rem' }}>close</span>
          </button>
        )}
      </div>

      <div className={styles.barTrack}>
        <div
          className={`${styles.barFill} ${isAtLimit ? styles.barFillCritical : styles.barFillWarning}`}
          style={{ width: `${percentLabel}%` }}
        />
      </div>

      <button className={styles.upgrade} onClick={handleUpgrade}>
        <span className="mi" style={{ fontSize: '1rem' }}>bolt</span>
        Upgrade to Premium
      </button>
    </div>
  )
}
