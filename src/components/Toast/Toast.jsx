import styles from './Toast.module.css'

export default function Toast({ message, success = true }) {
  if (!message) return null

  const variant =
    success === true
      ? styles.success
      : success === false
        ? styles.error
        : styles.warning

  const icon =
    success === true
      ? 'check_circle'
      : success === false
        ? 'error'
        : 'warning'

  return (
    <div className={`${styles.toast} ${variant}`}>
      <span className="material-icons">{icon}</span>
      <span>{message}</span>
    </div>
  )
}
