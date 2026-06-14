import styles from './ImagePreview.module.css'

export function ImagePreview({ src, alt, onRemove, size = 80 }) {
  if (!src) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.imageBox} style={{ width: size, height: size }}>
        <img src={src} alt={alt} className={styles.image} />
      </div>
      {onRemove && (
        <button type="button" className={styles.removeBtn} onClick={onRemove}>
          <span className="mi" style={{ fontSize: 15 }}>close</span>
          Remove
        </button>
      )}
    </div>
  )
}