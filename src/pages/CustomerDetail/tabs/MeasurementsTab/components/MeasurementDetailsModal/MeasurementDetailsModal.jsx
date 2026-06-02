import { useState, useEffect } from "react"
import { ImageCarousel } from "../ImageCarousel/ImageCarousel"
import { ImageLightbox } from "../ImageLightbox/ImageLightbox"
import { UNIT_FULL, UNIT_SHORT } from "../../../../../../datas/measurementDatas"
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


export function MeasurementDetailsModal({ measurement, onClose, onDelete, onUpdate }) {

  const [lightboxIndex,    setLightboxIndex]    = useState(null)
  const [isEditing,        setIsEditing]        = useState(false)
  const [isSaving,         setIsSaving]         = useState(false)
  const [draftName,        setDraftName]        = useState('')
  const [draftUnit,        setDraftUnit]        = useState('in')
  const [draftFields,      setDraftFields]      = useState([])
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    if (measurement) {
      setDraftName(measurement.name)
      setDraftUnit(measurement.unit ?? 'in')
      setDraftFields(measurement.fields.map(f => ({ ...f, id: f.id ?? Date.now() + Math.random() })))
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

    setIsSaving(true)
    await onUpdate(measurement.id, {
      name:   draftName.trim(),
      unit:   draftUnit,
      fields: filledFields,
      imgSrcs: measurement.imgSrcs ?? [],
      imgSrc:  measurement.imgSrcs?.[0] ?? measurement.imgSrc ?? null,
    })
    setIsSaving(false)
    setIsEditing(false)
  }


  if (isEditing) {
    return (
      <div className={`${styles.detailPanel} ${styles.detailPanel_open}`}>
        <Header
          type="back"
          title="Edit Measurement"
          onBackClick={cancelEdit}
          customActions={[{
            label:    isSaving ? 'Saving…' : 'Save',
            onClick:  handleSave,
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


  return (
    <>
      <div className={`${styles.detailPanel} ${styles.detailPanel_open}`}>
        <Header
          type="back"
          title={measurement.name}
          onBackClick={onClose}
          customActions={[
            { icon: 'edit',           onClick: enterEditMode },
            { icon: 'delete_outline', onClick: onDelete, color: 'var(--danger)' },
          ]}
        />

        <div className={styles.detailScrollBody}>

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