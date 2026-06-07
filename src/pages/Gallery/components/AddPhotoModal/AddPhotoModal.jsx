import { useState,useRef,useEffect } from "react"
import {uploadToCloudinary} from "../../../../services/cloudinaryService"
import styles from './AddPhotoModal.module.css'
import Header from '../../../../components/Header/Header'



const CATEGORY_MAP = {
  completed_works: { label: 'Portfolio',    icon: 'check_circle' },
  designs:         { label: 'Design',       icon: 'content_cut'  },
  inspiration:     { label: 'Inspiration',  icon: 'lightbulb'    },
}


export function AddPhotoModal({ isOpen, onClose, onSave, GarmentTypes, activeMainTab }) {


  const [category,      setCategory]      = useState(activeMainTab || 'completed_works')
  const [photos,        setPhotos]        = useState([])
  const [captionErrors, setCaptionErrors] = useState({})
  const [typeErrors,    setTypeErrors]    = useState({})
  const fileInputRef   = useRef(null)
  const cameraInputRef = useRef(null)

  const typeOptions = GarmentTypes[category] || []


  const uploadFile = async (file, idx) => {
    setPhotos(prev => prev.map((p, i) =>
      i === idx ? { ...p, status: 'uploading', progress: 0, error: null } : p
    ))
    try {
      const url = await uploadToCloudinary(
        file,
        'gallery',
        (pct) => setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, progress: pct } : p))
      )
      setPhotos(prev => prev.map((p, i) =>
        i === idx ? { ...p, storageUrl: url, status: 'done', progress: 100 } : p
      ))
    } catch (err) {
      console.error('[Gallery] upload failed', err)
      setPhotos(prev => prev.map((p, i) =>
        i === idx ? { ...p, status: 'error', error: 'Upload failed. Tap to retry.' } : p
      ))
    }
  }


  const handleFiles = (files) => {
    const defaultType = typeOptions[0]?.id || ''
    const newEntries = Array.from(files).map(file => ({
      file,
      localSrc:    URL.createObjectURL(file),
      name:        file.name,
      caption:     '',
      clothingType: defaultType,
      price:       '',
      storageUrl:  null,
      status:      'idle',
      progress:    0,
      error:       null,
    }))

    setPhotos(prev => {
      const startIdx = prev.length
      const merged = [...prev, ...newEntries]
      newEntries.forEach((_, i) => {
        const globalIdx = startIdx + i
        setTimeout(() => uploadFile(newEntries[i].file, globalIdx), 0)
      })
      return merged
    })
  }

  const retryUpload = (idx) => {
    const photo = photos[idx]
    if (!photo?.file) return
    uploadFile(photo.file, idx)
  }

  const removePhoto = (idx) => {
    setPhotos(prev => {
      const entry = prev[idx]
      if (entry?.localSrc) URL.revokeObjectURL(entry.localSrc)
      return prev.filter((_, i) => i !== idx)
    })
    setCaptionErrors(prev => {
      const next = {}
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k)
        if (ki < idx) next[ki] = v
        else if (ki > idx) next[ki - 1] = v
      })
      return next
    })
    setTypeErrors(prev => {
      const next = {}
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k)
        if (ki < idx) next[ki] = v
        else if (ki > idx) next[ki - 1] = v
      })
      return next
    })
  }

  const updatePhoto = (idx, field, value) => {
    setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
    if (field === 'caption')      setCaptionErrors(prev => ({ ...prev, [idx]: false }))
    if (field === 'clothingType') setTypeErrors(prev    => ({ ...prev, [idx]: false }))
  }

  const reset = () => {
    photos.forEach(p => { if (p.localSrc) URL.revokeObjectURL(p.localSrc) })
    setCategory(activeMainTab || 'completed_works')
    setPhotos([]); setCaptionErrors({}); setTypeErrors({})
  }

  const handleClose = () => { reset(); onClose() }

  const anyUploading = photos.some(p => p.status === 'uploading')
  const anyError     = photos.some(p => p.status === 'error')

  const handleSave = () => {
    if (photos.length === 0 || anyUploading) return

    const capErrs = {}; const typErrs = {}
    photos.forEach((p, i) => {
      if (!p.caption.trim()) capErrs[i] = true
      if (!p.clothingType)   typErrs[i] = true
    })
    if (Object.keys(capErrs).length || Object.keys(typErrs).length) {
      setCaptionErrors(capErrs); setTypeErrors(typErrs); return
    }

    const dateStr = new Date().toISOString()
    photos.forEach(p => {
      const typeLabel = typeOptions.find(t => t.id === p.clothingType)?.label || p.clothingType
      onSave({
        id:               Date.now() + Math.random(),
        storageUrl:       p.storageUrl, 
        category,
        caption:          p.caption.trim(),
        clothingType:     p.clothingType,
        clothingTypeLabel: typeLabel,
        price:            category === 'completed_works' && p.price.trim() ? p.price.trim() : null,
        customerId:       null,
        customerName:     null,
        date:             dateStr,
      })
    })
    reset(); onClose()
  }

  useEffect(() => {
    const defaultType = (GarmentTypes[category] || [])[0]?.id || ''
    setPhotos(prev => prev.map(p => ({ ...p, clothingType: defaultType })))
  }, [category, GarmentTypes])

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <Header
        type="back"
        title="Add Photo"
        onBackClick={handleClose}
        customActions={[{
          label:    anyUploading ? 'Uploading…' : 'Save',
          onClick:  handleSave,
          disabled: photos.length === 0 || anyUploading || anyError,
        }]}
      />

      <div className={styles.modalBody}>

        {photos.length === 0 ? (
          <div className={styles.uploadArea}>
            <span className="mi" style={{ fontSize: '3rem', opacity: 0.3 }}>add_a_photo</span>
            <p className={styles.uploadText}>Add photos from your camera or files</p>
            <div className={styles.uploadBtns}>
              <button className={styles.uploadBtn} onClick={() => cameraInputRef.current?.click()}>
                <span className="mi" style={{ fontSize: '1.2rem' }}>photo_camera</span> Camera
              </button>
              <button className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
                <span className="mi" style={{ fontSize: '1.2rem' }}>photo_library</span> Gallery
              </button>
            </div>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={e => handleFiles(e.target.files)} />
            <input ref={fileInputRef}   type="file" accept="image/*" multiple           hidden onChange={e => handleFiles(e.target.files)} />
          </div>
        ) : (
          <div className={styles.previewSection}>
            {photos.map((p, i) => (
              <div key={i} className={styles.photoEntry}>
                <div className={styles.photoEntryTop}>

                  <div className={styles.previewThumb}>
                    <img src={p.localSrc} alt={p.name} className={styles.previewImg} />

                    {p.status === 'uploading' && (
                      <div className={styles.uploadOverlay}>
                        <div className={styles.uploadProgressRing}>
                          <span className={styles.uploadProgressText}>{p.progress}%</span>
                        </div>
                      </div>
                    )}

                    {p.status === 'done' && (
                      <div className={styles.uploadDoneBadge}>
                        <span className="mi" style={{ fontSize: '0.85rem', color: '#fff' }}>check</span>
                      </div>
                    )}

                    {p.status === 'error' && (
                      <div
                        className={styles.uploadErrorOverlay}
                        onClick={() => retryUpload(i)}
                        title="Tap to retry"
                      >
                        <span className="mi" style={{ fontSize: '1.1rem', color: '#fff' }}>refresh</span>
                        <span className={styles.uploadErrorLabel}>Retry</span>
                      </div>
                    )}

                    {p.status !== 'uploading' && (
                      <button className={styles.previewRemove} onClick={() => removePhoto(i)}>
                        <span className="mi" style={{ fontSize: '0.9rem' }}>close</span>
                      </button>
                    )}
                  </div>

                  <div className={styles.photoEntryFields}>
                    {/* Caption */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Caption <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        className={`${styles.input} ${captionErrors[i] ? styles.inputError : ''}`}
                        placeholder="e.g. Senator suit for Emeka"
                        value={p.caption}
                        onChange={e => updatePhoto(i, 'caption', e.target.value)}
                      />
                      {captionErrors[i] && <span className={styles.errorMsg}>Caption is required</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Dress Type <span className={styles.required}>*</span>
                      </label>
                      {typeOptions.length === 0 ? (
                        <p className={styles.noTypesHint}>
                          No dress types for this section. Add them via the edit icon on the gallery page.
                        </p>
                      ) : (
                        <div className={styles.selectWrap}>
                          <select
                            className={`${styles.select} ${typeErrors[i] ? styles.inputError : ''}`}
                            value={p.clothingType}
                            onChange={e => updatePhoto(i, 'clothingType', e.target.value)}
                          >
                            <option value="" disabled>Select dress type…</option>
                            {typeOptions.map(t => (
                              <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                          </select>
                          <span className={`mi ${styles.selectChevron}`}>expand_more</span>
                        </div>
                      )}
                      {typeErrors[i] && <span className={styles.errorMsg}>Dress type is required</span>}
                    </div>

                    {category === 'completed_works' && (
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Starting Price <span className={styles.optional}>(optional)</span>
                        </label>
                        <div className={styles.priceWrap}>
                          <span className={styles.priceCurrency}>₦</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            className={styles.priceInput}
                            placeholder="e.g. 45,000"
                            value={p.price}
                            onChange={e => updatePhoto(i, 'price', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {p.status === 'error' && (
                      <p className={styles.photoUploadError}>
                        <span className="mi" style={{ fontSize: '0.85rem' }}>error_outline</span>
                        {p.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button className={styles.addMoreBtn} onClick={() => fileInputRef.current?.click()}>
              <span className="mi" style={{ fontSize: '1.4rem', color: 'var(--text3)' }}>add_photo_alternate</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text3)', fontWeight: 700 }}>Add more photos</span>
            </button>
            <input ref={fileInputRef}   type="file" accept="image/*" multiple           hidden onChange={e => handleFiles(e.target.files)} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={e => handleFiles(e.target.files)} />
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Section</label>
          <div className={styles.categoryRow}>
            {Object.entries(CATEGORY_MAP).map(([key, val]) => (
              <button
                key={key}
                className={`${styles.categoryChip} ${category === key ? styles.categoryActive : ''}`}
                onClick={() => setCategory(key)}
              >
                <span className="mi" style={{ fontSize: '1rem' }}>{val.icon}</span>
                <span className={styles.categoryLabel}>{val.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
