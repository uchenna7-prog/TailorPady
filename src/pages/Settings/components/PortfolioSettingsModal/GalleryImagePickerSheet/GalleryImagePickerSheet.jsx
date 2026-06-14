import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import styles from './GalleryImagePickerSheet.module.css'
import { useGallery } from '../../../../../contexts/GalleryContext'

export function GalleryImagePickerSheet({ open, onClose, onSelect }) {
  const { photos } = useGallery()
  const [search, setSearch] = useState('')

  const completedWorks = useMemo(
    () => photos.filter(p => p.category === 'completed_works'),
    [photos]
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return completedWorks
    return completedWorks.filter(p => {
      const caption = (p.caption || '').toLowerCase()
      const typeLabel = (p.clothingTypeLabel || '').toLowerCase()
      return caption.includes(term) || typeLabel.includes(term)
    })
  }, [completedWorks, search])

  if (!open) return null

  function handleSelect(photo) {
    onSelect(photo.storageUrl || photo.src)
    onClose()
  }

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Choose from Gallery</div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <span className="mi">close</span>
          </button>
        </div>

        <div className={styles.searchWrap}>
          <span className={`mi ${styles.searchIcon}`}>search</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search portfolio photos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button type="button" className={styles.clearBtn} onClick={() => setSearch('')}>
              <span className="mi" style={{ fontSize: 16 }}>close</span>
            </button>
          )}
        </div>

        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <span className="mi-outlined" style={{ fontSize: 40 }}>image_search</span>
              <div className={styles.emptyTitle}>No images found</div>
              <div className={styles.emptySubtitle}>
                {completedWorks.length === 0
                  ? 'Add photos to your Portfolio gallery first.'
                  : 'Try a different search term.'}
              </div>
            </div>
          ) : (
            filtered.map(photo => (
              <button
                key={photo.id}
                type="button"
                className={styles.item}
                onClick={() => handleSelect(photo)}
              >
                <img
                  src={photo.storageUrl || photo.src}
                  alt={photo.caption || 'Gallery image'}
                  className={styles.itemImage}
                />
                {photo.caption && <div className={styles.itemLabel}>{photo.caption}</div>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}