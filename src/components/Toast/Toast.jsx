import styles from './Toast.module.css'

export default function Toast({ message, success = true }) {
  const isSuccess = success === true
  const isError = success === false

  const stateClass = isSuccess ? styles.success : isError ? styles.error : styles.warning
  const icon = isSuccess ? 'check_circle' : isError ? 'cancel' : 'warning'

  return (
    <div className={`${styles.toast} ${message ? styles.show : ''} ${stateClass}`}>
      <div className={styles.iconWrap}>
        <span className={`mi ${styles.icon}`}>{icon}</span>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  )
}
