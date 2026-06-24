import { useState, useRef, useCallback } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { detectTightBounds, getCroppedBlob } from './useCropAutoDetect'
import styles from './LogoCropModal.module.css'

export function LogoCropModal({ imageSrc, onConfirm, onCancel }) {
  const imgRef                    = useRef(null)
  const [crop, setCrop]           = useState(undefined)
  const [completedCrop, setCompletedCrop] = useState(null)
  const [confirming, setConfirming] = useState(false)

  const onImageLoad = useCallback(e => {
    const img    = e.currentTarget
    const bounds = detectTightBounds(img)

    const pctCrop = {
      unit: '%',
      x:      (bounds.x      / img.naturalWidth)  * 100,
      y:      (bounds.y      / img.naturalHeight) * 100,
      width:  (bounds.width  / img.naturalWidth)  * 100,
      height: (bounds.height / img.naturalHeight) * 100,
    }

    setCrop(pctCrop)
    setCompletedCrop({
      x:      bounds.x,
      y:      bounds.y,
      width:  bounds.width,
      height: bounds.height,
      unit:   'px',
    })
  }, [])

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return
    setConfirming(true)
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop)
      const file = new File([blob], 'logo.png', { type: 'image/png' })
      onConfirm(file)
    } catch {
      setConfirming(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <div className={styles.header}>
          <h2 className={styles.title}>Crop Logo</h2>
          <p className={styles.hint}>
            We've auto-trimmed the empty space. Adjust the box if needed.
          </p>
        </div>

        <div className={styles.cropArea}>
          <ReactCrop
            crop={crop}
            onChange={(_, pct)    => setCrop(pct)}
            onComplete={(px)      => setCompletedCrop(px)}
            minWidth={20}
            minHeight={20}
            keepSelection
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Logo preview"
              className={styles.cropImg}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={confirming}
          >
            Cancel
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={confirming || !completedCrop}
          >
            {confirming ? 'Saving…' : 'Use this crop'}
          </button>
        </div>

      </div>
    </div>
  )
}