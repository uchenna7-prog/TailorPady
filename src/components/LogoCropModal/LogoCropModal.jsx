import { useState, useRef, useCallback } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { detectTightBounds, getCroppedBlob } from './useCropAutoDetect'
import styles from './LogoCropModal.module.css'

export function LogoCropModal({ imageSrc, onConfirm, onCancel }) {
  const imgRef                              = useRef(null)
  const [crop, setCrop]                     = useState(undefined)
  const [completedCrop, setCompletedCrop]   = useState(null)
  const [confirming, setConfirming]         = useState(false)
  const [freeForm, setFreeForm]             = useState(false)

  const onImageLoad = useCallback(e => {
    const img    = e.currentTarget
    const bounds = detectTightBounds(img)

    const size = Math.min(bounds.width, bounds.height)
    const cx   = bounds.x + (bounds.width  - size) / 2
    const cy   = bounds.y + (bounds.height - size) / 2

    const squarePct = {
      unit:   '%',
      x:      (cx   / img.naturalWidth)  * 100,
      y:      (cy   / img.naturalHeight) * 100,
      width:  (size / img.naturalWidth)  * 100,
      height: (size / img.naturalHeight) * 100,
    }

    setCrop(squarePct)
    setCompletedCrop({
      x:      cx,
      y:      cy,
      width:  size,
      height: size,
      unit:   'px',
    })
  }, [])

  const handleFreeFormToggle = () => {
    setFreeForm(prev => {
      const next = !prev
      if (!next && imgRef.current && completedCrop) {
        const img  = imgRef.current
        const size = Math.min(completedCrop.width, completedCrop.height)
        const cx   = completedCrop.x + (completedCrop.width  - size) / 2
        const cy   = completedCrop.y + (completedCrop.height - size) / 2

        const squarePct = {
          unit:   '%',
          x:      (cx   / img.naturalWidth)  * 100,
          y:      (cy   / img.naturalHeight) * 100,
          width:  (size / img.naturalWidth)  * 100,
          height: (size / img.naturalHeight) * 100,
        }

        setCrop(squarePct)
        setCompletedCrop({ x: cx, y: cy, width: size, height: size, unit: 'px' })
      }
      return next
    })
  }

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
            onChange={(_, pct) => setCrop(pct)}
            onComplete={px     => setCompletedCrop(px)}
            aspect={freeForm ? undefined : 1}
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

        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${freeForm ? styles.toggleBtnActive : ''}`}
            onClick={handleFreeFormToggle}
          >
            <span className="mi" style={{ fontSize: '1rem' }}>
              {freeForm ? 'crop_square' : 'crop_free'}
            </span>
            {freeForm ? 'Switch to square' : 'Switch to free-form'}
          </button>
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