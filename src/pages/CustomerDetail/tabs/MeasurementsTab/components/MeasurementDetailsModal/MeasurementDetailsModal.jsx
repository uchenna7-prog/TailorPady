import { useState, useEffect, useRef, useCallback } from "react"
import { ImageCarousel } from "../ImageCarousel/ImageCarousel"
import { ImageLightbox } from "../ImageLightbox/ImageLightbox"
import { UNIT_FULL, UNIT_SHORT } from "../../../../../../datas/measurementDatas"
import { useGarmentFeatures } from "../../../../../../hooks/useGarmentFeatures/useGarmentFeatures"
import { uploadToCloudinary, deleteFromCloudinary } from "../../../../../../services/cloudinaryService"
import Header from "../../../../../../components/Header/Header"
import styles from "./MeasurementDetailsModal.module.css"

function DressFormPlaceholder() {
  return (
    <div className={styles.placeholderBlock}>
      <span className={`mi ${styles.placeholderIcon}`}>checkroom</span>
      <p className={styles.placeholderText}>No design references saved</p>
    </div>
  )
}

function validateDraft(draftName, draftFields) {
  const errors = {}
  if (!draftName.trim()) {
    errors.name = 'Please enter a cloth type name'
  }
  const namedFields = draftFields.filter(f => f.name.trim())
  if (namedFields.length === 0) {
    errors.fields = 'Add at least one measurement field'
  }
  return errors
}

function buildDraftImages(measurement) {
  const urls = measurement.imgSrcs?.length
    ? measurement.imgSrcs
    : measurement.imgSrc
      ? [measurement.imgSrc]
      : []
  const publicIds = measurement.imgPublicIds || []

  return urls.map((url, i) => ({
    id:       `img-${i}-${Math.random().toString(36).slice(2)}`,
    url,
    publicId: publicIds[i] ?? null,
    file:     null,
    localSrc: url,
  }))
}

function getSelectedLabel(slot, styleSelections) {
  if (!styleSelections) return null
  if (slot.type === 'grouped') {
    const labels = slot.subSlots
      .map(sub => {
        const id = styleSelections[sub.id]
        if (!id) return null
        return sub.options.find(o => o.id === id)?.label ?? null
      })
      .filter(Boolean)
    return labels.length > 0 ? labels.join(', ') : null
  }
  const id = styleSelections[slot.id]
  if (!id) return null
  return slot.options.find(o => o.id === id)?.label ?? null
}

function getSelectedOptionsWithImage(slot, styleSelections) {
  if (!styleSelections) return []
  if (slot.type === 'grouped') {
    return slot.subSlots
      .map(sub => {
        const id = styleSelections[sub.id]
        if (!id) return null
        const opt = sub.options.find(o => o.id === id)
        if (!opt) return null
        return { label: opt.label, img: opt.img ?? null, subLabel: sub.label }
      })
      .filter(Boolean)
  }
  const id = styleSelections[slot.id]
  if (!id) return []
  const opt = slot.options.find(o => o.id === id)
  return opt ? [{ label: opt.label, img: opt.img ?? null }] : []
}

function slotHasImages(slot, styleSelections) {
  return getSelectedOptionsWithImage(slot, styleSelections).some(s => s.img)
}

function FeatureImageCard({ title, value, subLabel, img }) {
  return (
    <div className={styles.featureCard}>
      <span className={styles.featureCardLabel}>{title}</span>
      <div className={styles.featureCardImg}>
        {img
          ? <img src={img} alt={value} className={styles.featureCardImgSrc} />
          : <span className="mi-outlined" style={{ fontSize: '1.4rem', color: 'var(--text3)' }}>style</span>}
      </div>
      <span className={styles.featureCardValue}>
        {subLabel ? `${subLabel}: ${value}` : value}
      </span>
    </div>
  )
}

function ChipSlot({ slot, styleSelections }) {
  const selectedItems = getSelectedOptionsWithImage(slot, styleSelections)
  if (selectedItems.length === 0) return null

  return (
    <div className={styles.chipSlot}>
      <span className={styles.chipSlotLabel}>{slot.label}</span>
      <div className={styles.chipStrip}>
        {selectedItems.map((item, i) => (
          <span key={i} className={`${styles.featureChip} ${styles.featureChip_selected}`}>
            {item.subLabel ? `${item.subLabel}: ${item.label}` : item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function GarmentFeaturesSection({ measurement }) {
  const { category, fullWearType, lowerBodyType, styleSelections, gender } = measurement
  const { getSlotsForCard, GARMENT_CATEGORIES } = useGarmentFeatures()

  const hasSelections = styleSelections && Object.values(styleSelections).some(v => v && v !== '')
  if (!category || !hasSelections) return null

  const slots = getSlotsForCard(category, fullWearType, gender ?? null, lowerBodyType)
  const filledSlots = slots.filter(slot => !!getSelectedLabel(slot, styleSelections))
  if (filledSlots.length === 0) return null

  const categoryLabel = GARMENT_CATEGORIES.find(c => c.id === category)?.label ?? category

  const imageCards = []
  const chipSlots = []

  filledSlots.forEach(slot => {
    if (slotHasImages(slot, styleSelections)) {
      getSelectedOptionsWithImage(slot, styleSelections).forEach(item => {
        imageCards.push({
          key: `${slot.id}-${item.label}-${item.subLabel ?? ''}`,
          title: slot.label,
          value: item.label,
          subLabel: item.subLabel,
          img: item.img,
        })
      })
    } else {
      chipSlots.push(slot)
    }
  })

  return (
    <>
      <div className={styles.infoGrid}>
        <div className={styles.infoGridCell}>
          <div className={styles.infoGridLabel}>Features</div>
          <div className={styles.infoGridValue}>{filledSlots.length}</div>
        </div>
        <div className={styles.infoGridCell}>
          <div className={styles.infoGridLabel}>Worn On</div>
          <div className={styles.infoGridValue}>{categoryLabel}</div>
        </div>
      </div>

      <div className={styles.featuresCard}>
        {imageCards.length > 0 && (
          <div className={styles.featureGrid}>
            {imageCards.map(card => (
              <FeatureImageCard
                key={card.key}
                title={card.title}
                value={card.value}
                subLabel={card.subLabel}
                img={card.img}
              />
            ))}
          </div>
        )}

        {chipSlots.map(slot => (
          <ChipSlot key={slot.id} slot={slot} styleSelections={styleSelections} />
        ))}
      </div>
    </>
  )
}

export function MeasurementDetailsModal({ measurement, onClose, onDelete, onUpdate }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [imagesUploading, setImagesUploading] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftUnit, setDraftUnit] = useState('in')
  const [draftFields, setDraftFields] = useState([])
  const [draftImages, setDraftImages] = useState([])
  const [removedPublicIds, setRemovedPublicIds] = useState([])
  const [validationErrors, setValidationErrors] = useState({})
  const [activeTab, setActiveTab] = useState('details')

  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const imageInputRef = useRef(null)

  useEffect(() => {
    if (measurement) {
      setDraftName(measurement.name)
      setDraftUnit(measurement.unit ?? 'in')
      setDraftFields(measurement.fields.map(f => ({ ...f, id: f.id ?? Date.now() + Math.random() })))
      setDraftImages(buildDraftImages(measurement))
      setRemovedPublicIds([])
      setActiveTab('details')
    }
  }, [measurement])

  if (!measurement) return null

  const images = measurement.imgSrcs?.length
    ? measurement.imgSrcs
    : measurement.imgSrc
      ? [measurement.imgSrc]
      : []

  const hasStyleTab = measurement.styleSelections &&
    Object.values(measurement.styleSelections).some(v => v && v !== '')

  function enterEditMode() {
    setDraftName(measurement.name)
    setDraftUnit(measurement.unit ?? 'in')
    setDraftFields(measurement.fields.map(f => ({ ...f, id: f.id ?? Date.now() + Math.random() })))
    setDraftImages(buildDraftImages(measurement))
    setRemovedPublicIds([])
    setValidationErrors({})
    setIsEditing(true)
  }

  function cancelEdit() {
    draftImages.forEach(img => { if (img.file && img.localSrc) URL.revokeObjectURL(img.localSrc) })
    setValidationErrors({})
    setIsEditing(false)
  }

  function addDraftField() {
    setDraftFields(prev => [...prev, { id: Date.now() + Math.random(), name: '', value: '' }])
  }

  function removeDraftField(fieldId) {
    setDraftFields(prev => prev.filter(f => f.id !== fieldId))
  }

  function updateDraftField(fieldId, key, value) {
    setDraftFields(prev => prev.map(f => f.id === fieldId ? { ...f, [key]: value } : f))
    if (key === 'name' && validationErrors.fields) {
      setValidationErrors(prev => {
        const updated = { ...prev }
        delete updated.fields
        return updated
      })
    }
  }

  function clearNameError() {
    if (validationErrors.name) {
      setValidationErrors(prev => {
        const updated = { ...prev }
        delete updated.name
        return updated
      })
    }
  }

  function handleAddImages(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const newEntries = files.map(file => ({
      id:       `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url:      null,
      publicId: null,
      file,
      localSrc: URL.createObjectURL(file),
    }))
    setDraftImages(prev => [...prev, ...newEntries])
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  function removeDraftImage(imgId) {
    setDraftImages(prev => {
      const target = prev.find(img => img.id === imgId)
      if (target?.file && target.localSrc) URL.revokeObjectURL(target.localSrc)
      if (target?.publicId) setRemovedPublicIds(ids => [...ids, target.publicId])
      return prev.filter(img => img.id !== imgId)
    })
  }

  async function handleSave() {
    const errors = validateDraft(draftName, draftFields)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    const filledFields = draftFields
      .filter(f => f.name.trim())
      .map(f => ({ name: f.name.trim(), value: f.value }))

    setIsSaving(true)
    setImagesUploading(true)

    const uploaded = await Promise.all(
      draftImages.map(async img => {
        if (!img.file) return { url: img.url, publicId: img.publicId }
        try {
          const { url, publicId } = await uploadToCloudinary(img.file, 'measurements')
          return { url, publicId }
        } catch {
          return null
        }
      })
    )

    const finalImages = uploaded.filter(Boolean)

    removedPublicIds.forEach(publicId => deleteFromCloudinary(publicId).catch(() => {}))

    const updatedData = {
      name:         draftName.trim(),
      unit:         draftUnit,
      fields:       filledFields,
      imgSrcs:      finalImages.map(img => img.url),
      imgSrc:       finalImages[0]?.url ?? null,
      imgPublicIds: finalImages.map(img => img.publicId ?? null),
    }

    setIsSaving(false)
    setImagesUploading(false)
    setIsEditing(false)
    onClose()
    onUpdate(measurement.id, updatedData)
  }

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (!hasStyleTab || touchStartX.current === null) return

    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50

    if (isHorizontalSwipe) {
      if (dx < 0 && activeTab === 'details') setActiveTab('style')
      if (dx > 0 && activeTab === 'style')    setActiveTab('details')
    }

    touchStartX.current = null
    touchStartY.current = null
  }, [hasStyleTab, activeTab])

  if (isEditing) {
    return (
      <div
        className={`${styles.detailPanel} ${styles.detailPanel_open}`}
        onTouchStart={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}
      >
        <Header
          type="back"
          title="Edit Measurement"
          onBackClick={cancelEdit}
          customActions={[{
            label: isSaving ? (imagesUploading ? 'Uploading…' : 'Saving…') : 'Save',
            onClick: handleSave,
            disabled: isSaving,
          }]}
        />

        <div className={styles.detailScrollBody}>
          <div className={styles.editBody}>
            <p className={styles.editSectionLabel}>Unit of Measurement</p>
            <div className={styles.unitChipRow}>
              {['in', 'cm', 'yd'].map(u => (
                <button
                  key={u}
                  className={`${styles.unitChip} ${draftUnit === u ? styles.unitChip_active : ''}`}
                  onClick={() => setDraftUnit(u)}
                >
                  {UNIT_FULL[u]}
                </button>
              ))}
            </div>

            <p className={styles.editSectionLabel} style={{ marginTop: 24 }}>Cloth Type Name</p>
            <div className={styles.editCard}>
              <label className={styles.fieldLabel}>Name</label>
              <input
                type="text"
                className={`${styles.underlineInput} ${validationErrors.name ? styles.underlineInput_error : ''}`}
                placeholder="e.g. Shirt"
                value={draftName}
                onChange={e => { setDraftName(e.target.value); clearNameError() }}
              />
              {validationErrors.name && <p className={styles.inlineError}>{validationErrors.name}</p>}
            </div>

            <p className={styles.editSectionLabel} style={{ marginTop: 24 }}>Design References</p>
            <div className={styles.editCard}>
              {draftImages.length > 0 && (
                <div className={styles.editImageRow}>
                  {draftImages.map(img => (
                    <div key={img.id} className={styles.editImageThumb}>
                      <img src={img.localSrc} alt="" className={styles.editImageThumbSrc} />
                      <button
                        type="button"
                        className={styles.editImageRemoveBtn}
                        onClick={() => removeDraftImage(img.id)}
                      >
                        <span className="mi" style={{ fontSize: '0.8rem' }}>close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button className={styles.addFieldButton} onClick={() => imageInputRef.current?.click()}>
                <span className="mi" style={{ fontSize: '0.9rem' }}>add_photo_alternate</span>
                Add Photos
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleAddImages}
              />
            </div>

            <p className={styles.editSectionLabel} style={{ marginTop: 24 }}>Measurements</p>
            <div className={styles.editCard}>
              <div className={styles.measureFieldList}>
                {draftFields.map(field => (
                  <div key={field.id} className={styles.measureFieldRow}>
                    <div className={styles.measureFieldColumn}>
                      <label>Field</label>
                      <input
                        type="text"
                        className={styles.measureFieldInput}
                        placeholder="e.g. Neck"
                        value={field.name}
                        onChange={e => updateDraftField(field.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className={styles.measureFieldColumn}>
                      <label>Value</label>
                      <input
                        type="number"
                        className={styles.measureFieldInput}
                        placeholder="0"
                        inputMode="decimal"
                        value={field.value}
                        onChange={e => updateDraftField(field.id, 'value', e.target.value)}
                      />
                    </div>
                    <button className={styles.removeFieldButton} onClick={() => removeDraftField(field.id)}>
                      <span className="mi" style={{ fontSize: '1.1rem' }}>remove_circle_outline</span>
                    </button>
                  </div>
                ))}
              </div>

              {validationErrors.fields && <p className={styles.inlineError}>{validationErrors.fields}</p>}

              <button className={styles.addFieldButton} onClick={addDraftField}>
                <span className="mi" style={{ fontSize: '0.9rem' }}>add</span>
                Add Field
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`${styles.detailPanel} ${styles.detailPanel_open}`}
        onTouchStart={e => { e.stopPropagation(); handleTouchStart(e) }}
        onTouchEnd={e => { e.stopPropagation(); handleTouchEnd(e) }}
      >
        <Header
          type="back"
          showBorderBottom={false}
          title={measurement.name}
          onBackClick={onClose}
          customActions={[
            { icon: 'edit', onClick: enterEditMode, outlined: true },
            { icon: 'delete', onClick: onDelete, color: 'var(--danger)', outlined: true },
          ]}
        />

        {hasStyleTab && (
          <div className={styles.tabBar}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'details' ? styles.tabBtn_active : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'style' ? styles.tabBtn_active : ''}`}
              onClick={() => setActiveTab('style')}
            >
              Garment Features
            </button>
          </div>
        )}

        <div className={styles.detailScrollBody}>
          {activeTab === 'details' && (
            <>
              {images.length > 0
                ? (
                  <ImageCarousel
                    images={images}
                    className={styles.detailCarouselImage}
                    onImageClick={(index) => setLightboxIndex(index)}
                  />
                )
                : <DressFormPlaceholder />}

              <div className={styles.infoGrid}>
                <div className={styles.infoGridCell}>
                  <div className={styles.infoGridLabel}>Unit</div>
                  <div className={styles.infoGridValue}>{UNIT_FULL[measurement.unit] ?? measurement.unit}</div>
                </div>
                <div className={styles.infoGridCell}>
                  <div className={styles.infoGridLabel}>Fields</div>
                  <div className={styles.infoGridValue}>{measurement.fields.length}</div>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionCardLabel}>Measurements</div>

                {measurement.fields.length === 0
                  ? <p style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>No fields recorded.</p>
                  : measurement.fields.map((field, index) => (
                    <div
                      key={index}
                      className={`${styles.measurementFieldRow} ${index === measurement.fields.length - 1 ? styles.measurementFieldRow_last : ''}`}
                    >
                      <span className={styles.measurementFieldName}>{field.name}</span>
                      <span className={styles.measurementFieldValue}>
                        {field.value || '—'}
                        {field.value && <span className={styles.measurementFieldUnit}>{UNIT_SHORT[measurement.unit] ?? ''}</span>}
                      </span>
                    </div>
                  ))}
              </div>

              <div className={styles.detailFooterDate}>Saved on {measurement.date}</div>
            </>
          )}

          {activeTab === 'style' && <GarmentFeaturesSection measurement={measurement} />}
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}