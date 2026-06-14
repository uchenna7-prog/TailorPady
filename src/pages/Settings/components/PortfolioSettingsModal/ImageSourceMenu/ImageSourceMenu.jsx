import { createPortal } from 'react-dom'
import styles from './ImageSourceMenu.module.css'

export function ImageSourceMenu({ open, onClose, onChooseGallery, onChooseUpload }) {
  if (!open) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />
        <div className={styles.title}>Choose Image Source</div>

        <button
          type="button"
          className={styles.option}
          onClick={() => { onClose(); onChooseGallery() }}
        >
          <div className={styles.iconBox}>
            <span className="mi-outlined">photo_library</span>
          </div>
          <div className={styles.optionText}>
            <div className={styles.optionLabel}>Choose from Gallery</div>
            <div className={styles.optionHint}>Pick from your Portfolio photos</div>
          </div>
          <span className={`mi ${styles.chevron}`}>chevron_right</span>
        </button>

        <button
          type="button"
          className={styles.option}
          onClick={() => { onClose(); onChooseUpload() }}
        >
          <div className={styles.iconBox}>
            <span className="mi-outlined">upload</span>
          </div>
          <div className={styles.optionText}>
            <div className={styles.optionLabel}>Upload from Phone</div>
            <div className={styles.optionHint}>Select a new image from your device</div>
          </div>
          <span className={`mi ${styles.chevron}`}>chevron_right</span>
        </button>

        <button type="button" className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>,
    document.body
  )
}