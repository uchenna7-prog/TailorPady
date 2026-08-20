import { useEffect } from 'react'
import styles from './FullModal.module.css'

export function FullModal({ title, onBack, onSave, saving = false, children }) {

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape' && !saving) onBack() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onBack, saving])

  const handleBackdropClick = e => {
    if (saving) return
    if (e.target === e.currentTarget) onBack()
  }

  const handleClose = () => {
    if (saving) return
    onBack()
  }

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.panel}>

        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={handleClose} disabled={saving}>
            <span className="mi-outlined">close</span>
          </button>
          <div className={styles.headerTitle}>{title}</div>
          {onSave && (
            <button className={styles.saveBtn} onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>

        <div className={styles.body}>
          <div className={`${styles.bodyInner} ${saving ? styles.bodyInnerSaving : ''}`}>{children}</div>
        </div>

      </div>
    </div>
  )
}