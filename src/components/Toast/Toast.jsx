import styles from './Toast.module.css'

const ICONS = {
  success: 'check_circle',
  error:   'error',
  warning: 'warning',
  info:    'info',
}

export default function Toast({ message, type = 'success', onDismiss }) {
  if (!message) return null

  return (
    <div className={`${styles.toast} ${styles.show} ${styles[type]}`}>

      <div className={styles.iconWrap}>
        <span className={`mi-outlined ${styles.icon}`}>
          {ICONS[type] ?? ICONS.info}
        </span>
      </div>

      <span className={styles.message}>{message}</span>

      <button
        className={styles.dismiss}
        onClick={() => onDismiss?.()}
        aria-label="Dismiss"
      >
        <span className="mi" style={{ fontSize: '16px' }}>close</span>
      </button>

    </div>
  )
}