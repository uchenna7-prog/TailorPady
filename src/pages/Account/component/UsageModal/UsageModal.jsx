import { useMemo } from 'react'
import { useUsage } from '../../../../contexts/UsageContext'
import { usePremium } from '../../../../contexts/PremiumContext'
import { useCustomers } from '../../../../contexts/CustomerContext'
import styles from './UsageModal.module.css'

const LIMIT_META = {
  customers:                { label: 'Customers',         icon: 'group',          period: 'lifetime' },
  measurementsPerMonth:     { label: 'Measurements',      icon: 'straighten',     period: 'monthly' },
  ordersPerMonth:           { label: 'Orders',            icon: 'shopping_bag',   period: 'monthly' },
  invoicesPerMonth:         { label: 'Invoices',          icon: 'receipt_long',   period: 'monthly' },
  receiptsPerMonth:         { label: 'Receipts',          icon: 'receipt',        period: 'monthly' },
  portfolioUploadsPerMonth: { label: 'Portfolio Uploads', icon: 'photo_library',  period: 'monthly' },
  reviewLinksPerMonth:      { label: 'Review Links',      icon: 'reviews',        period: 'monthly' },
  aiActionsPerMonth:        { label: 'AI Actions',        icon: 'auto_awesome',   period: 'monthly' },
}

const LIMIT_ORDER = Object.keys(LIMIT_META)

function metaFor(field) {
  if (LIMIT_META[field]) return LIMIT_META[field]
  const stripped = field.replace(/PerMonth$/, '')
  const label = stripped.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()
  const period = field.endsWith('PerMonth') ? 'monthly' : 'lifetime'
  return { label, icon: 'bar_chart', period }
}

function getResetLabel() {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function UsageModal({ onClose, onUpgrade }) {
  const { usage, limits, loading } = useUsage()
  const { isPremium } = usePremium()
  const { customers } = useCustomers()

  const rows = useMemo(() => {
    const fields = Object.keys(limits || {})
    const ordered = [...fields].sort((a, b) => {
      const ai = LIMIT_ORDER.indexOf(a)
      const bi = LIMIT_ORDER.indexOf(b)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    return ordered.map(field => {
      const cap = limits[field]
      const used = field === 'customers' ? customers.length : (usage[field] || 0)
      const pct = cap ? Math.min(used / cap, 1) : 0
      return { field, cap, used, pct, ...metaFor(field) }
    })
  }, [usage, limits, customers])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.handle} />

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={`mi ${styles.headerIcon}`}>speed</span>
            <div>
              <div className={styles.headerTitle}>Usage</div>
              <div className={styles.headerSub}>Your monthly plan limits</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="mi">close</span>
          </button>
        </div>

        <div className={styles.body}>

          {isPremium && (
            <div className={styles.statusCard}>
              <div className={styles.statusCardLeft}>
                <span className={`mi ${styles.statusIcon}`}>workspace_premium</span>
                <div>
                  <div className={styles.statusPlan}>Unlimited usage</div>
                  <div className={styles.statusRenewal}>No limits on Pro — use TailorPady freely</div>
                </div>
              </div>
              <div className={styles.activePill}>Pro</div>
            </div>
          )}

          {!isPremium && loading && (
            <div className={styles.freeBanner}>
              <span className={styles.freeBannerText}>Loading usage…</span>
            </div>
          )}

          {!isPremium && !loading && rows.length === 0 && (
            <div className={styles.freeBanner}>
              <span className="mi" style={{ fontSize: '1.2rem', color: 'var(--text3)' }}>info</span>
              <span className={styles.freeBannerText}>No usage tracked yet this month.</span>
            </div>
          )}

          {!isPremium && !loading && rows.length > 0 && (
            <div className={styles.list}>
              {rows.map((row, i) => {
                const atLimit = row.pct >= 1
                const near = row.pct >= 0.7
                const barColor = atLimit ? '#ef4444' : near ? '#fb923c' : 'var(--accent)'
                return (
                  <div key={row.field} className={`${styles.usageRow} ${i === rows.length - 1 ? styles.noDivider : ''}`}>
                    <div className={styles.usageTop}>
                      <div className={styles.usageIcon}>
                        <span className="mi" style={{ fontSize: '1rem', color: atLimit ? '#ef4444' : 'var(--text2)' }}>
                          {row.icon}
                        </span>
                      </div>
                      <div className={styles.usageText}>
                        <div className={styles.usageLabelRow}>
                          <div className={styles.usageLabel}>{row.label}</div>
                          <div className={row.period === 'lifetime' ? styles.periodPillAllTime : styles.periodPillMonthly}>
                            {row.period === 'lifetime' ? 'All-Time' : 'Monthly'}
                          </div>
                        </div>
                        <div className={styles.usageCount}>
                          {row.used} of {row.cap} used{row.period === 'monthly' ? ' this month' : ''}
                        </div>
                      </div>
                      {atLimit && <div className={styles.limitPill}>Limit reached</div>}
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${row.pct * 100}%`, background: barColor }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!isPremium && !loading && rows.length > 0 && (
            <button className={styles.upgradeBtn} onClick={onUpgrade}>
              <span className="mi" style={{ fontSize: '1rem' }}>bolt</span>
              Upgrade for unlimited usage
            </button>
          )}

          <div className={styles.footer}>
            <span className="mi" style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>event_repeat</span>
            <span className={styles.footerText}>Monthly limits reset {getResetLabel()} · Customer limit is all-time</span>
          </div>

        </div>

      </div>
    </div>
  )
}
