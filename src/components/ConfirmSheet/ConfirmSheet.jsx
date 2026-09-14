import styles from './ConfirmSheet.module.css'

export default function ConfirmSheet({
  open,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}) {
  if (!open) return null

  const confirmClass = variant === 'accent' ? styles.btnAccent : styles.btnDel

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={styles.sheet}>
        <h4>{title}</h4>
        <p>{message}</p>
        <div className={styles.actions}>
          <button className={confirmClass} onClick={onConfirm}>{confirmText}</button>
          <button className={styles.btnCancel} onClick={onCancel}>{cancelText}</button>
        </div>
      </div>
    </div>
  )
}
