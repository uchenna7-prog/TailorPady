import { useState, useRef, useEffect }  from 'react'
import { MultiImageUploader }  from '../MultiImageUploader/MultiImageUploader'
import { uploadToCloudinary } from '../../../../../../services/cloudinaryService'
import { useNetworkStatus }  from '../../../../../../hooks/useNetworkStatus'
import { useGarmentFeatures }  from '../../../../../../hooks/useGarmentFeatures/useGarmentFeatures'
import { UNIT_FULL }   from '../../../../../../datas/measurementDatas'
import Header  from '../../../../../../components/Header/Header'
import styles  from './AddMeasurementModal.module.css'


function createBlankField() {
  return { id: Date.now() + Math.random(), name: '', value: '' }
}

function createBlankMeasurement() {
  return {
    category:        '',
    fullWearType:    '',
    lowerBodyType:   '',
    styleSelections: {},
    name:            '',
    fields:          [createBlankField()],
    slots:           [],
  }
}

function validateMeasurement(measurement) {
  const errors = {}
  if (!measurement.name.trim())                                 errors.name   = 'Please enter a garment name'
  if (!measurement.fields.some(f => f.name.trim().length > 0)) errors.fields = 'Add at least one measurement field'
  return errors
}

function getSlotSummary(slot, styleSelections) {
  if (slot.type === 'grouped') {
    const picked = slot.subSlots
      .map(sub => {
        const selectedId = styleSelections?.[sub.id]
        if (!selectedId) return null
        return sub.options.find(o => o.id === selectedId)
      })
      .filter(Boolean)

    if (picked.length === 0) return null

    return {
      label: picked.map(o => o.label).join(', '),
      img:   picked[0]?.img ?? null,
    }
  }

  const selectedId = styleSelections?.[slot.id]
  if (!selectedId) return null

  const option = slot.options.find(o => o.id === selectedId)
  if (!option) return null

  return { label: option.label, img: option.img ?? null }
}

function buildSavePayload(measurement, unit, imageUrls, gender) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return {
    id:              Date.now() + Math.random(),
    name:            measurement.name.trim(),
    category:        measurement.category      || null,
    fullWearType:    measurement.fullWearType  || null,
    lowerBodyType:   measurement.lowerBodyType || null,
    styleSelections: measurement.styleSelections,
    gender:          gender || null,
    imgSrcs:         imageUrls,
    imgSrc:          imageUrls[0] ?? null,
    unit,
    fields:          measurement.fields.filter(f => f.name.trim()).map(f => ({ name: f.name, value: f.value })),
    date:            today,
  }
}

async function uploadMeasurementImages(slots, isOnline) {
  if (!slots?.length) return []
  const urls = await Promise.all(
    slots.map(async slot => {
      if (!slot.file) return slot.localSrc ?? null
      if (!isOnline) return null
      try {
        return await uploadToCloudinary(slot.file, 'measurements')
      } catch {
        return null
      }
    })
  )
  return urls.filter(Boolean)
}

const hasStyleSelections = styleSelections =>
  Object.values(styleSelections).some(v => v && v !== '')


export function AddMeasurementModal({ isOpen, onClose, onSave, gender }) {
  const [activeTab,         setActiveTab]         = useState('measurements')
  const [unit,              setUnit]              = useState('in')
  const [measurement,       setMeasurement]       = useState(createBlankMeasurement)
  const [validationErrors,  setValidationErrors]  = useState({})
  const [isSaving,          setIsSaving]          = useState(false)
  const [openSlotId,        setOpenSlotId]        = useState(null)
  const [formInlineMsg,     setFormInlineMsg]     = useState(null)
  const [uploadedImageUrls, setUploadedImageUrls] = useState(null)
  const isOnline                                  = useNetworkStatus()
  const detailsRef                                = useRef(null)
  const scrollBodyRef                             = useRef(null)
  const slotCardRefs                              = useRef({})
  const subTabRowRef                              = useRef(null)
  const formInlineMsgTimer                        = useRef(null)

  const { GARMENT_CATEGORIES, FEMALE_FULL_WEAR_TYPES, FEMALE_LOWER_BODY_TYPES, getSlotsForCard } = useGarmentFeatures()

  const fullWearTypes = gender === 'Female' ? FEMALE_FULL_WEAR_TYPES : []


  function showInlineMsg(text, ok = true) {
    setFormInlineMsg({ text, ok })
    clearTimeout(formInlineMsgTimer.current)
    formInlineMsgTimer.current = setTimeout(() => setFormInlineMsg(null), 2600)
  }


  function updateMeasurement(key, value) {
    setMeasurement(prev => ({ ...prev, [key]: value }))
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const updated = { ...prev }
        delete updated[key]
        return updated
      })
    }
  }

  function updateCategory(categoryId) {
    setMeasurement(prev => ({
      ...prev,
      category:        categoryId,
      fullWearType:    '',
      lowerBodyType:   '',
      styleSelections: {},
    }))
    setOpenSlotId(null)
  }

  function updateFullWearType(typeId) {
    setMeasurement(prev => ({
      ...prev,
      fullWearType:    typeId,
      styleSelections: {},
    }))
    setOpenSlotId(null)
  }

  function updateLowerBodyType(typeId) {
    setMeasurement(prev => ({
      ...prev,
      lowerBodyType:   typeId,
      styleSelections: {},
    }))
    setOpenSlotId(null)
  }

  function updateStyleSelection(slotId, optionId) {
    setMeasurement(prev => ({
      ...prev,
      styleSelections: { ...prev.styleSelections, [slotId]: optionId },
    }))
  }

  function toggleSlot(slotId) {
    const isOpening = openSlotId !== slotId
    setOpenSlotId(prev => prev === slotId ? null : slotId)

    if (isOpening) {
      requestAnimationFrame(() => {
        const card       = slotCardRefs.current[slotId]
        const scrollBody = scrollBodyRef.current
        if (!card || !scrollBody) return
        const cardTop    = card.getBoundingClientRect().top
        const bodyTop    = scrollBody.getBoundingClientRect().top
        const subTabBar  = subTabRowRef.current
        const offset     = subTabBar ? subTabBar.getBoundingClientRect().height : 0
        scrollBody.scrollBy({ top: cardTop - bodyTop - offset - 16, behavior: 'smooth' })
      })
    }
  }

  function handleOptionSelect(slotId, optionId, parentSlotId) {
    const currentValue  = measurement.styleSelections?.[slotId]
    const isDeselecting = currentValue === optionId
    updateStyleSelection(slotId, isDeselecting ? '' : optionId)
    if (!parentSlotId && !isDeselecting) setOpenSlotId(null)
  }

  function addField() {
    setMeasurement(prev => ({
      ...prev,
      fields: [...prev.fields, createBlankField()],
    }))
  }

  function removeField(fieldId) {
    setMeasurement(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    }))
  }

  function updateField(fieldId, key, value) {
    setMeasurement(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f),
    }))

    if (key === 'name' && validationErrors.fields) {
      setValidationErrors(prev => {
        const updated = { ...prev }
        delete updated.fields
        return updated
      })
    }
  }


  async function handleSave() {
    if (activeTab === 'measurements') {
      const errors = validateMeasurement(measurement)
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        showInlineMsg(Object.values(errors)[0], false)
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      const hasPendingFiles = measurement.slots.some(s => s.file)

      if (isOnline && hasPendingFiles) {
        setIsSaving(true)
        const urls = await uploadMeasurementImages(measurement.slots, true)
        setUploadedImageUrls(urls)
        setIsSaving(false)
      }

      showInlineMsg(
        !isOnline && hasPendingFiles
          ? 'Saved — design photos will upload when back online'
          : 'Measurements saved ✓',
        true
      )
      setActiveTab('features')
      return
    }

    setIsSaving(true)
    const imageUrls = uploadedImageUrls ?? await uploadMeasurementImages(measurement.slots, isOnline)
    onSave(buildSavePayload(measurement, unit, imageUrls, gender))
    setIsSaving(false)
    resetAndClose()
  }

  async function handleSkip() {
    setIsSaving(true)
    const imageUrls = uploadedImageUrls ?? await uploadMeasurementImages(measurement.slots, isOnline)
    onSave({
      ...buildSavePayload(measurement, unit, imageUrls, gender),
      styleSelections: {},
      skippedFeatures: true,
    })
    setIsSaving(false)
    resetAndClose()
  }


  function resetAndClose() {
    setMeasurement(createBlankMeasurement())
    setUnit('in')
    setActiveTab('measurements')
    setValidationErrors({})
    setOpenSlotId(null)
    setFormInlineMsg(null)
    setUploadedImageUrls(null)
    clearTimeout(formInlineMsgTimer.current)
    onClose()
  }


  const isFemaleLoweBody = gender === 'Female' && measurement.category === 'lower_body'
  const isFemaleFullBody = gender === 'Female' && measurement.category === 'full_body'
  const slots            = getSlotsForCard(measurement.category, measurement.fullWearType, gender, measurement.lowerBodyType)
  const hasFeatures      = hasStyleSelections(measurement.styleSelections)

  const subTabOptions = isFemaleLoweBody
    ? FEMALE_LOWER_BODY_TYPES
    : isFemaleFullBody
      ? fullWearTypes
      : []

  const subTabValue = isFemaleLoweBody
    ? measurement.lowerBodyType
    : isFemaleFullBody
      ? measurement.fullWearType
      : ''

  const subTabSetter = isFemaleLoweBody
    ? updateLowerBodyType
    : isFemaleFullBody
      ? updateFullWearType
      : () => {}

  useEffect(() => {
    setOpenSlotId(null)
    scrollBodyRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [subTabValue])

  const headerAction = (() => {
    if (activeTab === 'measurements') {
      return { label: isSaving ? 'Uploading...' : 'Save', onClick: handleSave, disabled: isSaving }
    }
    if (hasFeatures) {
      return { label: isSaving ? 'Saving...' : 'Save', onClick: handleSave, disabled: isSaving }
    }
    return { label: isSaving ? 'Saving...' : 'Skip', onClick: handleSkip, color: 'var(--text2)', disabled: isSaving }
  })()

  return (
    <div
      className={`${styles.formOverlay} ${isOpen ? styles.formOverlay_open : ''}`}
      onClick={resetAndClose}
      onTouchStart={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
      <div className={styles.formPanel} onClick={e => e.stopPropagation()}>
        <Header
          type="back"
          title="New Measurement"
          onBackClick={resetAndClose}
          customActions={[headerAction]}
        />

        <div className={styles.formTabs}>
          <button
            className={`${styles.formTab} ${activeTab === 'measurements' ? styles.formTab_active : ''}`}
            onClick={() => setActiveTab('measurements')}
          >
            Measurements
          </button>
          <button
            className={`${styles.formTab} ${activeTab === 'features' ? styles.formTab_active : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Garment Features
          </button>
        </div>

        {formInlineMsg && (
          <div className={`${styles.formInlineMsg} ${formInlineMsg.ok ? styles.formInlineMsgOk : styles.formInlineMsgErr}`}>
            <span className="mi" style={{ fontSize: '0.95rem' }}>
              {formInlineMsg.ok ? 'check_circle' : 'error_outline'}
            </span>
            {formInlineMsg.text}
          </div>
        )}

        <div className={styles.formScrollBody} ref={scrollBodyRef}>

          {activeTab === 'measurements' && (
            <div className={styles.tabSection}>

              <p className={styles.stepHeading}>1. Unit of Measurement</p>
              <div className={styles.unitChipRow}>
                {['in', 'cm', 'yd'].map(u => (
                  <button
                    key={u}
                    className={`${styles.unitChip} ${unit === u ? styles.unitChip_active : ''}`}
                    onClick={() => setUnit(u)}
                  >
                    {UNIT_FULL[u]}
                  </button>
                ))}
              </div>

              <p className={styles.stepHeading} style={{ marginTop: 24 }}>2. Garment Category</p>
              <p className={styles.stepSubheading}>Where on the body is this garment worn?</p>
              <div className={styles.categoryChipRow}>
                {GARMENT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`${styles.categoryChip} ${measurement.category === cat.id ? styles.categoryChip_active : ''}`}
                    onClick={() => updateCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <p className={styles.stepHeading} style={{ marginTop: 24 }}>3. Garment Details</p>

              <div
                ref={detailsRef}
                className={`${styles.clothCard} ${Object.keys(validationErrors).length > 0 ? styles.clothCard_error : ''}`}
              >
                <label className={styles.fieldLabel}>Name</label>
                <input
                  type="text"
                  className={`${styles.underlineInput} ${validationErrors.name ? styles.underlineInput_error : ''}`}
                  placeholder="e.g. Shirt"
                  value={measurement.name}
                  onChange={e => updateMeasurement('name', e.target.value)}
                />
                {validationErrors.name && (
                  <p className={styles.inlineError}>{validationErrors.name}</p>
                )}

                <label className={styles.fieldLabel}>Design References</label>
                <MultiImageUploader
                  images={measurement.slots}
                  cardId="single"
                  isOnline={isOnline}
                  onChange={slots => updateMeasurement('slots', slots)}
                />

                <label className={styles.fieldLabel} style={{ marginTop: 4 }}>Measurements</label>

                <div className={styles.measureFieldList}>
                  {measurement.fields.map(field => (
                    <div key={field.id} className={styles.measureFieldRow}>
                      <div className={styles.measureFieldColumn}>
                        <label>Field</label>
                        <input
                          type="text"
                          className={styles.measureFieldInput}
                          placeholder="e.g. Neck"
                          value={field.name}
                          onChange={e => updateField(field.id, 'name', e.target.value)}
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
                          onChange={e => updateField(field.id, 'value', e.target.value)}
                        />
                      </div>
                      <button className={styles.removeFieldButton} onClick={() => removeField(field.id)}>
                        <span className="mi" style={{ fontSize: '1.1rem' }}>remove_circle_outline</span>
                      </button>
                    </div>
                  ))}
                </div>

                {validationErrors.fields && (
                  <p className={styles.inlineError}>{validationErrors.fields}</p>
                )}

                <button className={styles.addFieldButton} onClick={addField}>
                  <span className="mi" style={{ fontSize: '0.9rem' }}>add</span>
                  Add Field
                </button>
              </div>

            </div>
          )}

          {activeTab === 'features' && (
            <div className={styles.tabSection}>

              {!measurement.category && (
                <div className={styles.featureEmptyState}>
                  <span className="mi-outlined" style={{ fontSize: '2rem', color: 'var(--text3)' }}>category</span>
                  <p>No category selected</p>
                  <span>Go to the Measurements tab and pick a garment category first.</span>
                </div>
              )}

              {measurement.category === 'full_body' && fullWearTypes.length === 0 && (
                <div className={styles.featureEmptyState}>
                  <span className="mi-outlined" style={{ fontSize: '2rem', color: 'var(--text3)' }}>checkroom</span>
                  <p>No garment types available</p>
                  <span>Full body garment types for this profile are not set up yet.</span>
                </div>
              )}

              {subTabOptions.length > 0 && (
                <div className={styles.subTabRow} ref={subTabRowRef}>
                  {subTabOptions.map(option => (
                    <button
                      key={option.id}
                      className={`${styles.subTabChip} ${subTabValue === option.id ? styles.subTabChip_active : ''}`}
                      onClick={() => subTabSetter(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {subTabOptions.length > 0 && !subTabValue && (
                <div className={styles.featureEmptyState}>
                  <span className="mi-outlined" style={{ fontSize: '2rem', color: 'var(--text3)' }}>tune</span>
                  <p>No type selected</p>
                  <span>Tap one of the tabs above to see its garment features.</span>
                </div>
              )}

              {slots.length > 0 && (
                <div className={styles.slotAccordionList}>
                  {slots.map(slot => {
                    const isOpen  = openSlotId === slot.id
                    const summary = getSlotSummary(slot, measurement.styleSelections)

                    return (
                      <div key={slot.id} ref={el => slotCardRefs.current[slot.id] = el}>
                        <div
                          className={`${styles.slotCard} ${isOpen ? styles.slotCard_open : ''}`}
                          onClick={() => toggleSlot(slot.id)}
                        >
                          <div className={styles.slotCardLeft}>
                            {summary?.img
                              ? <img src={summary.img} alt={summary.label} className={styles.slotCardThumb} />
                              : (
                                <div className={styles.slotCardThumbPlaceholder}>
                                  <span className="mi-outlined" style={{ fontSize: '1rem', color: 'var(--text3)' }}>
                                    style
                                  </span>
                                </div>
                              )
                            }
                            <div className={styles.slotCardInfo}>
                              <span className={styles.slotCardLabel}>{slot.label}</span>
                              {summary
                                ? <span className={styles.slotCardValue}>{summary.label}</span>
                                : <span className={styles.slotCardHint}>Tap to choose</span>
                              }
                            </div>
                          </div>

                          <div className={styles.slotCardRight}>
                            {summary && (
                              <div className={styles.slotCheckCircle}>
                                <span className="mi" style={{ fontSize: '0.85rem' }}>check</span>
                              </div>
                            )}
                            <span
                              className="mi"
                              style={{
                                fontSize:   '1.1rem',
                                color:      'var(--text3)',
                                transition: 'transform 0.2s',
                                transform:  isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              }}
                            >
                              expand_more
                            </span>
                          </div>
                        </div>

                        {isOpen && (
                          <div className={styles.slotAccordionBody}>
                            {slot.type === 'grouped'
                              ? slot.subSlots.map((subSlot, index) => (
                                  <div key={subSlot.id}>
                                    {index > 0 && <div className={styles.subSlotDivider} />}
                                    <p className={styles.subSlotLabel}>{subSlot.label}</p>
                                    <div className={styles.optionChipGrid}>
                                      {subSlot.options.map(opt => {
                                        const isSelected = measurement.styleSelections?.[subSlot.id] === opt.id
                                        return (
                                          <div key={opt.id} className={styles.optionChipWrapper}>
                                            <button
                                              className={`${styles.optionChip} ${isSelected ? styles.optionChip_active : ''}`}
                                              onClick={e => { e.stopPropagation(); handleOptionSelect(subSlot.id, opt.id, slot.id) }}
                                            >
                                              {opt.img
                                                ? <img src={opt.img} alt={opt.label} className={styles.optionChipImg} />
                                                : <span className={styles.optionChipText}>{opt.label}</span>
                                              }
                                            </button>
                                            {opt.img && (
                                              <span className={styles.optionChipLabel}>{opt.label}</span>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ))
                              : (
                                <div className={styles.optionChipGrid}>
                                  {slot.options.map(opt => {
                                    const isSelected = measurement.styleSelections?.[slot.id] === opt.id
                                    return (
                                      <div key={opt.id} className={styles.optionChipWrapper}>
                                        <button
                                          className={`${styles.optionChip} ${isSelected ? styles.optionChip_active : ''}`}
                                          onClick={e => { e.stopPropagation(); handleOptionSelect(slot.id, opt.id, null) }}
                                        >
                                          {opt.img
                                            ? <img src={opt.img} alt={opt.label} className={styles.optionChipImg} />
                                            : <span className={styles.optionChipText}>{opt.label}</span>
                                          }
                                        </button>
                                        {opt.img && (
                                          <span className={styles.optionChipLabel}>{opt.label}</span>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            }
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
