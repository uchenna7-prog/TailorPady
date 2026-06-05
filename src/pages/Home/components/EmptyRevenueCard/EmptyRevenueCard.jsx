import styles from './EmptyRevenueCard.module.css'

export function EmptyRevenueCard({ onOpen }) {
  return (
    <div className={styles.card} onClick={onOpen}>
      <div className={styles.iconWrap}>
        <span className="mi" style={{ fontSize: '1.6rem', color: 'var(--accent)' }}>ads_click</span>
      </div>
      <div className={styles.textWrap}>
        <div className={styles.title}>Set your first goal</div>
        <div className={styles.sub}>Tap here to track your shop's revenue growth</div>
      </div>
    </div>
  )
}