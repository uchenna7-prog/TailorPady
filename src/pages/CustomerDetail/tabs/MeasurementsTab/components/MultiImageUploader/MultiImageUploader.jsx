import { useState, useEffect, useRef } from 'react'
import styles from './MultiImageUploader.module.css'


function buildSlotsFromUrls(urls) {
  return (urls || []).map(url => ({
    id:       Math.random().toString(36).slice(2),
    localSrc: url,
    file:     null,
  }))
}


export function MultiImageUploader({ images, onChange, isOnline }) {
  const [slots,        setSlots]        = useState(() => buildSlotsFromUrls(images))
  const [previewIndex, setPreviewIndex] = useState(0)
  const isMounted                       = useRef(false)


  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    onChange(slots)
  }, [slots])


  function handleFilePick(files) {
    const fileArray = Array.from(files)

    const newSlots = fileArray.map(file => ({
      id:       Math.random().toString(36).slice(2),
      localSrc: URL.createObjectURL(file),
      file,
    }))

    setSlots(prev => {
      const allSlots = [...prev, ...newSlots]
      setPreviewIndex(allSlots.length - 1)
      return allSlots
    })
  }


  function removeSlot(slotIndex) {
    setSlots(prev => {
      const slot    = prev[slotIndex]
      if (slot?.file) URL.revokeObjectURL(slot.localSrc)
      const updated = prev.filter((_, index) => index !== slotIndex)
      setPreviewIndex(i => Math.max(0, i - 1))
      return updated
    })
  }


  if (slots.length === 0) {
    return (
      <div className={styles.uploadArea_wrapper}>
        <label className={`${styles.uploadArea_empty} ${!isOnline ? styles.uploadArea_empty_offline : ''}`}>
          {isOnline ? (
            <>
              <span className="mi" style={{ fontSize: '1.8rem', color: 'var(--text3)', pointerEvents: 'none' }}>
                add_a_photo
              </span>
              <span className={styles.uploadArea_label}>Tap to add design references</span>
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={e => e.target.files.length && handleFilePick(e.target.files)}
              />
            </>
          ) : (
            <>
              <span className="mi" style={{ fontSize: '2rem', color: 'var(--text3)', pointerEvents: 'none' }}>
                wifi_off
              </span>
              <span className={styles.uploadArea_label}>You're offline</span>
              <span className={styles.uploadArea_sub}>Photos can be added once you're back online</span>
            </>
          )}
        </label>
      </div>
    )
  }


  const currentSlot = slots[previewIndex]
  const previewSrc  = currentSlot?.localSrc || null

  return (
    <div className={styles.uploadArea_wrapper}>
      <div className={styles.uploadCarousel}>

        {previewSrc && (
          <img
            src={previewSrc}
            alt={`Preview ${previewIndex + 1}`}
            className={styles.uploadCarouselImage}
          />
        )}

        <button
          type="button"
          className={styles.uploadRemoveButton}
          onClick={e => { e.stopPropagation(); removeSlot(previewIndex) }}
        >
          <span className="mi" style={{ fontSize: '1rem' }}>close</span>
        </button>

        {slots.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.carouselArrow} ${styles.carouselArrow_left}`}
              onClick={e => { e.stopPropagation(); setPreviewIndex(i => Math.max(0, i - 1)) }}
            >
              <span className="mi">chevron_left</span>
            </button>
            <button
              type="button"
              className={`${styles.carouselArrow} ${styles.carouselArrow_right}`}
              onClick={e => { e.stopPropagation(); setPreviewIndex(i => Math.min(slots.length - 1, i + 1)) }}
            >
              <span className="mi">chevron_right</span>
            </button>
          </>
        )}

        <div className={styles.carouselDots}>
          {slots.map((slot, i) => (
            <button
              key={slot.id}
              type="button"
              className={`${styles.carouselDot} ${i === previewIndex ? styles.carouselDot_active : ''}`}
              onClick={e => { e.stopPropagation(); setPreviewIndex(i) }}
            />
          ))}
        </div>

        <div className={styles.uploadCarouselCounter}>
          {previewIndex + 1} / {slots.length}
        </div>
      </div>

      <label className={styles.addMoreImagesButton}>
        <span className="mi" style={{ fontSize: '0.9rem' }}>add_photo_alternate</span>
        Add More Images
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={e => e.target.files.length && handleFilePick(e.target.files)}
        />
      </label>
    </div>
  )
}