import styles from "./ImageDropdown.module.css"


export function ImageDropdown({ label, photos, value, onChange, required, hasError }) {


  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return photos
    return photos.filter(p =>
      (p.caption || '').toLowerCase().includes(q) ||
      (p.clothingTypeLabel || '').toLowerCase().includes(q)
    )
  }, [photos, query])

  const selected = photos.find(p => p.id === value) || null

  return (
    <div className={styles.imgDropWrap}>
      <p className={styles.imgDropLabel}>
        {label}{required && <span className={styles.imgDropRequired}> *</span>}
      </p>
      <button
        type="button"
        className={`${styles.imgDropTrigger} ${isOpen ? styles.imgDropTriggerOpen : ''} ${hasError ? styles.imgDropTriggerError : ''}`}
        onClick={() => setIsOpen(p => !p)}
      >
        {selected ? (
          <div className={styles.imgDropSelected}>
            <img src={selected.src || selected.storageUrl} alt={selected.caption} className={styles.imgDropThumb} />
            <span className={styles.imgDropSelectedName}>{selected.caption || 'Untitled'}</span>
            <button type="button" className={styles.imgDropClear} onClick={e => { e.stopPropagation(); onChange(null); setQuery('') }}>
              <span className="mi" style={{ fontSize: '1rem' }}>close</span>
            </button>
          </div>
        ) : (
          <span className={styles.imgDropPlaceholder}>
            <span className="mi" style={{ fontSize: '1rem', opacity: 0.45 }}>image_search</span>
            Choose an image…
          </span>
        )}
        <span className={`mi ${styles.imgDropChevron} ${isOpen ? styles.imgDropChevronOpen : ''}`}>expand_more</span>
      </button>
      {hasError && (
        <p className={styles.imgDropErrorHint}>
          <span className="mi" style={{ fontSize: '0.8rem' }}>error_outline</span>
          Please select an image
        </p>
      )}
      {isOpen && (
        <div className={styles.imgDropPanel}>
          <div className={styles.imgDropSearch}>
            <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>search</span>
            <input className={styles.imgDropSearchInput} type="text" placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} autoFocus />
            {query && <button type="button" className={styles.imgDropSearchClear} onClick={() => setQuery('')}><span className="mi" style={{ fontSize: '0.9rem' }}>close</span></button>}
          </div>
          <div className={styles.imgDropList}>
            {filtered.length === 0 ? (
              <div className={styles.imgDropEmpty}>No images found</div>
            ) : filtered.map(photo => (
              <button type="button" key={photo.id}
                className={`${styles.imgDropOption} ${value === photo.id ? styles.imgDropOptionActive : ''}`}
                onClick={() => { onChange(photo.id); setIsOpen(false); setQuery('') }}
              >
                <img src={photo.src || photo.storageUrl} alt={photo.caption} className={styles.imgDropOptionThumb} />
                <div className={styles.imgDropOptionInfo}>
                  <span className={styles.imgDropOptionName}>{photo.caption || 'Untitled'}</span>
                  {photo.clothingTypeLabel && <span className={styles.imgDropOptionMeta}>{photo.clothingTypeLabel}</span>}
                </div>
                {value === photo.id && <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--accent)', flexShrink: 0 }}>check_circle</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
