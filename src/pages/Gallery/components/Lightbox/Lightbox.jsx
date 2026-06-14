import { useState,useEffect } from "react"
import styles from "./Lightbox.module.css"



const CATEGORY_MAP = {
  completed_works: { label: 'Portfolio',    icon: 'check_circle' },
  designs:         { label: 'Design',       icon: 'content_cut'  },
  inspiration:     { label: 'Inspiration',  icon: 'lightbulb'    },
}


function formatDate(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}



export function Lightbox({ photo, photos, onClose, onDelete }) {
  const [current, setCurrent] = useState(photo)
  const idx     = photos.findIndex(p => p.id === current.id)
  const hasPrev = idx > 0
  const hasNext = idx < photos.length - 1

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft'  && hasPrev) setCurrent(photos[idx - 1])
      if (e.key === 'ArrowRight' && hasNext) setCurrent(photos[idx + 1])
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx, hasPrev, hasNext, photos, onClose])

  const cat = CATEGORY_MAP[current.category]
  const imgSrc = current.storageUrl || current.src

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
        <div className={styles.lightboxBar}>
          <button className={styles.lightboxBtn} onClick={onClose}>
            <span className="mi" style={{ fontSize: '1.6rem' }}>close</span>
          </button>
          <div className={styles.lightboxCounter}>{idx + 1} / {photos.length}</div>
          <button className={styles.lightboxBtn} onClick={() => onDelete(current)}>
            <span className="mi" style={{ fontSize: '1.4rem', color: 'var(--danger)' }}>delete_outline</span>
          </button>
        </div>

        <div className={styles.lightboxImgWrap}>
          {hasPrev && (
            <button className={`${styles.navBtn} ${styles.navLeft}`} onClick={() => setCurrent(photos[idx - 1])}>
              <span className="mi" style={{ fontSize: '1.6rem' }}>chevron_left</span>
            </button>
          )}
          <img src={imgSrc} alt={current.caption || 'Photo'} className={styles.lightboxImg} />
          {hasNext && (
            <button className={`${styles.navBtn} ${styles.navRight}`} onClick={() => setCurrent(photos[idx + 1])}>
              <span className="mi" style={{ fontSize: '1.6rem' }}>chevron_right</span>
            </button>
          )}
        </div>

        <div className={styles.lightboxInfo}>
          {current.caption && <div className={styles.lightboxCaption}>{current.caption}</div>}
          <div className={styles.lightboxMeta}>
            {current.price && (
              <span className={`${styles.lightboxChip} ${styles.lightboxPriceChip}`}>
                <span className="mi" style={{ fontSize: '0.75rem' }}>sell</span>
                From ₦{current.price}
              </span>
            )}
            {current.clothingTypeLabel && (
              <span className={styles.lightboxChip}>
                <span className="mi" style={{ fontSize: '0.75rem' }}>checkroom</span>
                {current.clothingTypeLabel}
              </span>
            )}
            {cat && (
              <span className={styles.lightboxChip}>
                <span className="mi" style={{ fontSize: '0.85rem' }}>{cat.icon}</span>
                {cat.label}
              </span>
            )}
            {current.customerName && (
              <span className={styles.lightboxChip}>
                <span className="mi" style={{ fontSize: '0.75rem' }}>person</span>
                {current.customerName}
              </span>
            )}
            <span className={styles.lightboxChip}>
              <span className="mi" style={{ fontSize: '0.75rem' }}>calendar_today</span>
              {formatDate(current.createdAt || current.date)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}