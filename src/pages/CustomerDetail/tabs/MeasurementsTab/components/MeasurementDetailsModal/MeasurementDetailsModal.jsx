import { useState, useEffect }                                                            from "react"
import { ImageCarousel }                                                                  from "../ImageCarousel/ImageCarousel"
import { ImageLightbox }                                                                  from "../ImageLightbox/ImageLightbox"
import { UNIT_FULL, UNIT_SHORT }                                                          from "../../../../../../datas/measurementDatas"
import { getSlotsForCard, GARMENT_CATEGORIES }                                            from "../AddMeasurementModal/garmentFeatures"
import Header                                                                             from "../../../../../../components/Header/Header"
import styles                                                                             from "./MeasurementDetailsModal.module.css"


// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// Returns only the selected option(s) with image — never the full list
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


// ─── Feature Slot: selected image tile(s) only ────────────────────────────────

function ImageTileSlot({ slot, styleSelections }) {
  const selectedItems = getSelectedOptionsWithImage(slot, styleSelections)
  if (selectedItems.length === 0) return null

  return (
    <div className={styles.featureSlot}>
      <div className={styles.slotHeader}>
        <span className={styles.slotName}>{slot.label}</span>
        <span className={styles.slotSelectedLabel}>{selectedItems.map(i => i.label).join(', ')}</span>
      </div>
      <div className={styles.selectedTileGrid}>
        {selectedItems.map((item, i) => (
          <div key={i} className={styles.selectedTile}>
            <div className={styles.selectedTileImg}>
              {item.img
                ? <img src={item.img} alt={item.label} className={styles.tileImgSrc} />
                : <span className="mi-outlined" style={{ fontSize: '1.4rem', color: 'var(--text3)' }}>style</span>
              }
            </div>
            {item.subLabel && (
              <span className={styles.selectedTileSubLabel}>{item.subLabel}</span>
            )}
            <span className={styles.selectedTileLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


// ─── Feature Slot: chip row (selected only) ───────────────────────────────────

function ChipSlot({ slot, styleSelections }) {
  const selectedItems = getSelectedOptionsWithImage(slot, styleSelections)
  if (selectedItems.length === 0) return null

  return (
    <div className={styles.featureSlot}>
      <div className={styles.slotHeader}>
        <span className={styles.slotName}>{slot.label}</span>
        <span className={styles.slotSelectedLabel}>{selectedItems.map(i => i.label).join(', ')}</span>
      </div>
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

function slotHasImages(slot, styleSelections) {
  const selected = getSelectedOptionsWithImage(slot, styleSelections)
  return selected.some(s => s.img)
}


// ─── Garment Features Section ─────────────────────────────────────────────────

function GarmentFeaturesSection({ measurement }) {
  const { category, fullWearType, lowerBodyType, styleSelections, gender } = measurement

  const hasSelections =
    styleSelections && Object.values(styleSelections).some(v => v && v !== '')
  if (!category || !hasSelections) return null

  const slots = getSlotsForCard(category, fullWearType, gender ?? null, lowerBodyType)

  const filledSlots = slots.filter(slot => {
    const label = getSelectedLabel(slot, styleSelections)
    return !!label
  })

  if (filledSlots.length === 0) return null

  const categoryLabel =
    GARMENT_CATEGORIES.find(c => c.id === category)?.label ?? category

  return (
    <div className={styles.featuresCard}>

      <div className={styles.featuresTop}>
        <div className={styles.featuresTopLeft}>
          <div className={styles.featIconWrap}>
            <span className="mi" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>auto_awesome</span>
          </div>
          <span className={styles.featTitle}>Garment Features</span>
        </div>
        <span className={styles.categoryPill}>{categoryLabel}</span>
      </div>

      <div className={styles.featSlotList}>
        {filledSlots.map((slot, index) => (
          <div key={slot.id}>
            {index > 0 && <div className={styles.slotDivider} />}
            {slotHasImages(slot, styleSelections)
              ? <ImageTileSlot slot={slot} styleSelections={styleSelections} />
              : <ChipSlot     slot={slot} styleSelections={styleSelections} />
            }
          </div>
        ))}
      </div>

    </div>
  )
}


// ─── Main Component ───────────────────────────────────────────────────────────

export function MeasurementDetailsModal({ measurement, onClose, onDelete, onUpdate }) {

  const [lightboxIndex,    setLightboxIndex]    = useState(null)
  const [isEditing,        setIsEditing]        = useState(false)
  const [isSaving,         setIsSaving]         = useState(false)
  const [draftName,        setDraftName]        = useState('')
  const [draftUnit,        setDraftUnit]        = useState('in')
  const [draftFields,      setDraftFields]      = useState([])
  const [validationErrors, setValidationErrors] = useState({})
  const [activeTab,        setActiveTab]        = useState('details')

  useEffect(() => {
    if (measurement) {
      setDraftName(measurement.name)
      setDraftUnit(measurement.unit ?? 'in')
      setDraftFields(measurement.fields.map(f => ({ ...f, id: f.id ?? Date.now() + Math.random() })))
      setActiveTab('details')
    }
  }, [measurement])

  if (!measurement) return null

  const images = measurement.imgSrcs?.length
    ? measurement.imgSrcs
    : measurement.imgSrc
      ? [measurement.imgSrc]
      : []

  function enterEditMode() {
    setDraftName(measurement.name)
    setDraftUnit(measurement.unit ?? 'in')
    setDraftFields(measurement.fields.map(f => ({ ...f, id: f.id ?? Date.now() + Math.random() })))
    setValidationErrors({})
    setIsEditing(true)
  }

  function cancelEdit() {
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

  async function handleSave() {
    const errors = validateDraft(draftName, draftFields)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    const filledFields = draftFields
      .filter(f => f.name.trim())
      .map(f => ({ name: f.name.trim(), value: f.value }))
    const updatedData = {
      name:    draftName.trim(),
      unit:    draftUnit,
      fields:  filledFields,
      imgSrcs: measurement.imgSrcs ?? [],
      imgSrc:  measurement.imgSrcs?.[0] ?? measurement.imgSrc ?? null,
    }
    setIsEditing(false)
    onClose()
    onUpdate(measurement.id, updatedData)
  }


  // ─── Edit Mode ──────────────────────────────────────────────────────────────

  if (isEditing) {
    return (
      <div className={`${styles.detailPanel} ${styles.detailPanel_open}`}>
        <Header
          type="back"
          title="Edit Measurement"
          onBackClick={cancelEdit}
          customActions={[{
            label:   isSaving ? 'Saving…' : 'Save',
            onClick: handleSave,
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
              {validationErrors.name && (
                <p className={styles.inlineError}>{validationErrors.name}</p>
              )}
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
                    <button
                      className={styles.removeFieldButton}
                      onClick={() => removeDraftField(field.id)}
                    >
                      <span className="mi" style={{ fontSize: '1.1rem' }}>remove_circle_outline</span>
                    </button>
                  </div>
                ))}
              </div>

              {validationErrors.fields && (
                <p className={styles.inlineError}>{validationErrors.fields}</p>
              )}

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


  // ─── View Mode ──────────────────────────────────────────────────────────────

  const hasStyleTab =
    measurement.styleSelections &&
    Object.values(measurement.styleSelections).some(v => v && v !== '')

  return (
    <>
      <div className={`${styles.detailPanel} ${styles.detailPanel_open}`}>
        <Header
          type="back"
          title={measurement.name}
          onBackClick={onClose}
          customActions={[
            { icon: 'edit',   onClick: enterEditMode, outlined: true                         },
            { icon: 'delete', onClick: onDelete,      color: 'var(--danger)', outlined: true },
          ]}
        />

        {/* Tab bar — only shown when Style tab exists */}
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

          {/* ── Details tab ── */}
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
                : <DressFormPlaceholder />
              }

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
                          {field.value
                            ? <span className={styles.measurementFieldUnit}>{UNIT_SHORT[measurement.unit] ?? ''}</span>
                            : ''
                          }
                        </span>
                      </div>
                    ))
                }
              </div>

              <div className={styles.detailFooterDate}>Saved on {measurement.date}</div>
            </>
          )}

          {/* ── Style tab ── */}
          {activeTab === 'style' && (
            <GarmentFeaturesSection measurement={measurement} />
          )}

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