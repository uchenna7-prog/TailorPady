import styles from './FirstRunFlow.module.css'

export default function Welcome({ onDone }) {
  return (
    <div className={styles.page}>
      <div className={styles.welcomeContent}>
        <span className={styles.brandMark}>T</span>
        <h1 className={styles.wordmark}>TailorPady</h1>
        <p className={styles.introTagline}>The business side of tailoring, simplified.</p>
      </div>

      <div className={styles.introFooter}>
        <button type="button" className={styles.primaryBtn} onClick={onDone}>
          Get Started
        </button>
      </div>
    </div>
  )
}
