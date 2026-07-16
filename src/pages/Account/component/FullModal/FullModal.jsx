import { useEffect } from 'react'
import styles from './FullModal.module.css'

export function FullModal({ title, onBack, onSave, children }) {

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onBack() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onBack])

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onBack()}>
      <div className={styles.panel}>

        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onBack}>
            <span className="mi">close</span>
          </button>
          <div className={styles.headerTitle}>{title}</div>
          {onSave && (
            <button className={styles.saveBtn} onClick={onSave}>Save</button>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.bodyInner}>{children}</div>
        </div>

      </div>
    </div>
  )
}