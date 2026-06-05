import { useState, useRef, useEffect } from 'react'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { RevenueDonut } from '../RevenueDonut/RevenueDonut'
import styles from './RevenueGoalCard.module.css'

function formatAmount(amount, symbol, position, decimals, numberFormat) {
  const fixed      = Number(amount).toFixed(decimals)
  const parts      = fixed.split('.')
  const locale     = numberFormat === 'anglophone' ? 'en-US' : 'de-DE'
  parts[0]         = Number(parts[0]).toLocaleString(locale)
  const formatted  = decimals > 0 ? parts.join('.') : parts[0]
  return position === 'prefix' ? `${symbol}${formatted}` : `${formatted}${symbol}`
}

export function RevenueGoalCard({ goal, derived, onEdit, onDelete }) {
  const { generalSettings } = useGeneralSettings()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const symbol       = generalSettings.currency               ?? '₦'
  const position     = generalSettings.currencySymbolPosition  ?? 'prefix'
  const decimals     = generalSettings.currencyDecimals        ?? 0
  const numberFormat = generalSettings.currencyNumberFormat    ?? 'anglophone'

  const fmt        = (n) => formatAmount(n, symbol, position, decimals, numberFormat)
  const periodName = goal.period === 'weekly' ? 'week' : goal.period === 'monthly' ? 'month' : 'year'
  const deltaColor = derived.isUp ? '#15803d' : '#ef4444'
  const deltaIcon  = derived.isUp ? 'arrow_upward' : 'arrow_downward'

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setMenuOpen(prev => !prev)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    onEdit()
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    onDelete()
  }

  return (
    <div className={styles.card} onClick={onEdit}>

      <div className={styles.left}>
        <div className={styles.label}>
          {goal.period === 'weekly' ? 'This week' : goal.period === 'monthly' ? 'This month' : 'This year'} · Revenue
        </div>

        <div className={styles.amount}>{fmt(derived.earnedThis)}</div>
        <div className={styles.target}>Goal: {fmt(goal.goal)}</div>

        {derived.delta !== 0 && (
          <div className={styles.delta}>
            <span className="mi" style={{ fontSize: '0.7rem', color: deltaColor }}>{deltaIcon}</span>
            <span style={{ color: deltaColor, fontSize: '0.72rem', fontWeight: 700 }}>
              {fmt(Math.abs(derived.delta))}
            </span>
            <span style={{ color: 'var(--text3)', fontSize: '0.7rem' }}>
              vs last {periodName}
            </span>
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.donutWrap}>
          <RevenueDonut percentage={derived.percent} />
        </div>

        <div className={styles.menuWrap} ref={menuRef}>
          <button
            className={styles.menuBtn}
            onClick={handleMenuToggle}
            title="More options"
          >
            <span className="mi" style={{ fontSize: '1.1rem' }}>more_vert</span>
          </button>

          {menuOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={handleEdit}>
                <span className="mi-outlined" style={{ fontSize: '0.95rem' }}>edit</span>
                Edit goal
              </button>
              <div className={styles.dropdownDivider} />
              <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleDelete}>
                <span className="mi-outlined" style={{ fontSize: '0.95rem' }}>delete</span>
                Delete goal
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}