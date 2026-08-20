import { useEffect } from "react"
import styles from "./StatCard.module.css"


export function StatCard({ card, navigate, isInfoOpen, onToggleInfo, onCloseInfo }) {

  const isEmpty = card.value === 0

  useEffect(() => {
    if (!isInfoOpen) return
    const timer = setTimeout(() => onCloseInfo(), 4000)
    return () => clearTimeout(timer)
  }, [isInfoOpen, onCloseInfo])

  return (

    <div className={styles.statCard} onClick={() => navigate(card.route)}>

      {card.tooltip && (
        <>
          <button
            type="button"
            className={styles.statInfoBtn}
            onClick={e => { e.stopPropagation(); onToggleInfo() }}
            aria-label="More info"
          >
            <span className="mi-outlined" style={{ fontSize: '0.8rem' }}>info</span>
          </button>

          {isInfoOpen && (
            <>
              <div
                className={styles.statInfoBackdrop}
                onClick={e => { e.stopPropagation(); onCloseInfo() }}
              />
              <div
                className={styles.statInfoPopover}
                onClick={e => e.stopPropagation()}
              >
                {card.tooltip}
              </div>
            </>
          )}
        </>
      )}

      <div className={styles.statIconWrap}>
        <span className="mi-outlined" style={{ fontSize: '1.75rem', color: 'var(--accent)' }}>
          {card.desktopIcon}
        </span>
      </div>

      <div className={styles.statValue} style={{ color: isEmpty ? 'var(--text3)' : 'var(--text)', opacity: isEmpty ? 0.45 : 1 }}>
        {card.value}
      </div>

      <div className={styles.statLabel}>{card.label}</div>
      {card.sub && <div className={styles.statSub} style={{ color: card.subColor }}>{card.sub}</div>}

    </div>
  )
}