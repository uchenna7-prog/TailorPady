import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsage } from '../../../../contexts/UsageContext'
import { usePremium } from '../../../../contexts/PremiumContext'
import { useCustomers } from '../../../../contexts/CustomerContext'
import styles from './UsageLimitBanner.module.css'

const APPROACHING_THRESHOLD = 0.7

const TITLE_LABELS = {
  customers: 'Customer',
  measurementsPerMonth: 'Measurements',
  ordersPerMonth: 'Order',
  invoicesPerMonth: 'Invoice',
  receiptsPerMonth: 'Receipt',
  portfolioUploadsPerMonth: 'Portfolio Upload',
  reviewLinksPerMonth: 'Review Link',
  aiActionsPerMonth: 'AI Action',
}

const ITEM_LABELS = {
  customers: 'customers',
  measurementsPerMonth: 'measurements',
  ordersPerMonth: 'orders',
  invoicesPerMonth: 'invoices',
  receiptsPerMonth: 'receipts',
  portfolioUploadsPerMonth: 'portfolio uploads',
  reviewLinksPerMonth: 'review links',
  aiActionsPerMonth: 'AI actions',
}

function titleFor(field) {
  if (TITLE_LABELS[field]) return TITLE_LABELS[field]
  const stripped = field.replace(/PerMonth$/, '')
  return stripped.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()
}

function itemsFor(field) {
  if (ITEM_LABELS[field]) return ITEM_LABELS[field]
  return titleFor(field).toLowerCase()
}

export function UsageLimitBanner() {
  const navigate = useNavigate()
  const { usage, limits, loading: usageLoading } = useUsage()
  const { isPremium, loading: premiumLoading } = usePremium()
  const { customers } = useCustomers()

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

  if (usageLoading || premiumLoading || isPremium || !topField) return null
  if (topField.pct < APPROACHING_THRESHOLD) return null

  const isAtLimit = topField.pct >= 1
  const titleLabel = titleFor(topField.field)
  const itemsLabel = itemsFor(topField.field)
  const title = `Free ${titleLabel} Limit`

  function handleUpgrade() {
    navigate('/account', { state: { autoOpenModal: 'upgrade' } })
  }

  function handleViewUsage() {
    navigate('/account', { state: { autoOpenModal: 'usage' } })
  }

  return (
    <div className={`${styles.banner} ${isAtLimit ? styles.bannerCritical : styles.bannerWarning}`}>
      <div className={styles.row}>
        <div className={styles.iconBadge}>
          <span className="mi" style={{ fontSize: '1.15rem' }}>
            {isAtLimit ? 'lock' : 'bolt'}
          </span>
        </div>

        <div className={styles.text}>
          <div className={styles.title}>{title}</div>
          <div className={styles.sub}>
            <span className={styles.stat}>{topField.used} of {topField.cap}</span>
            {' '}{itemsLabel} used
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
