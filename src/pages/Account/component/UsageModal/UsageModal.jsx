import { useMemo } from 'react'
import { useUsage } from '../../../../contexts/UsageContext'
import { usePremium } from '../../../../contexts/PremiumContext'
import styles from './UsageModal.module.css'

const LIMIT_META = {
  customers:    { label: 'Customers',    icon: 'group' },
  orders:       { label: 'Orders',       icon: 'shopping_bag' },
  invoices:     { label: 'Invoices',     icon: 'receipt_long' },
  appointments: { label: 'Appointments', icon: 'event' },
  tasks:        { label: 'Tasks',        icon: 'task_alt' },
}

function metaFor(field) {
  if (LIMIT_META[field]) return LIMIT_META[field]
  const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()
  return { label, icon: 'bar_chart' }
}

function getResetLabel() {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function UsageModal({ onClose, onUpgrade }) {
  const { usage, limits, loading } = useUsage()
  const { isPremium } = usePremium()

  const rows = useMemo(() => {
    return Object.keys(limits || {}).map(field => {
      const cap = limits[field]
      const used = usage[field] || 0
      const pct = cap ? Math.min(used / cap, 1) : 0
      return { field, cap, used, pct, ...metaFor(field) }
    })
  }, [usage, limits])

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
                        <div className={styles.usageLabel}>{row.label}</div>
                        <div className={styles.usageCount}>{row.used} of {row.cap} used</div>
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
            <span className={styles.footerText}>Usage resets {getResetLabel()}</span>
          </div>

        </div>

      </div>
    </div>
  )
}
