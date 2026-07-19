import { useEffect } from 'react'
import styles from './FullModal.module.css'

export function FullModal({ title, onBack, onSave, saving, children }) {

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
            <button
              className={styles.saveBtn}
              onClick={onSave}
              disabled={saving}
              style={saving ? { opacity: 0.7, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 6 } : undefined}
            >
              {saving ? (
                <>
                  <span className="mi" style={{ fontSize: 16, animation: 'spin 0.7s linear infinite' }}>progress_activity</span>
                  Saving…
                </>
              ) : 'Save'}
            </button>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.bodyInner}>{children}</div>
        </div>

      </div>
    </div>
  )
}
