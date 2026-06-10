import { useState, useRef }                                      from 'react'
import { createBlankCard }                                       from '../../utils'
import { MultiImageUploader }                                    from '../MultiImageUploader/MultiImageUploader'
import { uploadToCloudinary }                                    from '../../../../../../services/cloudinaryService'
import { useNetworkStatus }                                      from '../../../../../../hooks/useNetworkStatus'
import { UNIT_FULL }                                             from '../../../../../../datas/measurementDatas'
import { GARMENT_CATEGORIES, FULL_WEAR_TYPES, getSlotsForCard } from './garmentFeatures'
import Header                                                    from '../../../../../../components/Header/Header'
import styles                                                    from './AddMeasurementModal.module.css'


function validateCards(cards) {
  const errors = {}

  cards.forEach(card => {
    const cardErrors  = {}
    const hasName     = card.name.trim().length > 0
    const hasOneField = card.fields.some(f => f.name.trim().length > 0)

    if (!hasName)     cardErrors.name   = 'Please enter a cloth type name'
    if (!hasOneField) cardErrors.fields = 'Add at least one measurement field'

    if (Object.keys(cardErrors).length > 0) {
      errors[card.id] = cardErrors
    }
  })

  return errors
}


async function uploadCardImages(slots) {
  const uploadedUrls = await Promise.all(
    slots.map(async slot => {
      if (slot.file) return await uploadToCloudinary(slot.file, 'measurements')
      return slot.localSrc
    })
  )
  return uploadedUrls.filter(Boolean)
}


export function AddMeasurementModal({ isOpen, onClose, onSave, gender }) {
  const [activeTab,        setActiveTab]        = useState('measurements')
  const [unit,             setUnit]             = useState('in')
  const [cards,            setCards]            = useState(() => [createBlankCard(1)])
  const [validationErrors, setValidationErrors] = useState({})
  const [isSaving,         setIsSaving]         = useState(false)
  const isOnline                                = useNetworkStatus()
  const cardRefs                                = useRef({})


  function updateCard(cardId, key, value) {
    setCards(prev => prev.map(card =>
      card.id === cardId ? { ...card, [key]: value } : card
    ))

    if (validationErrors[cardId]?.[key]) {
      setValidationErrors(prev => {
        const updated = { ...prev }
        delete updated[cardId][key]
        if (Object.keys(updated[cardId]).length === 0) delete updated[cardId]
        return updated
      })
    }
  }


  function updateCardCategory(cardId, categoryId) {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, category: categoryId, fullWearType: '', styleSelections: {} }
        : card
    ))
  }


  function updateFullWearType(cardId, typeId) {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, fullWearType: typeId, styleSelections: {} }
        : card
    ))
  }


  function updateStyleSelection(cardId, slotId, value) {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, styleSelections: { ...card.styleSelections, [slotId]: value } }
        : card
    ))
  }


  function addCard() {
    setCards(prev => [...prev, createBlankCard(prev.length + 1)])
  }


  function removeCard(cardId) {
    setCards(prev => prev.filter(card => card.id !== cardId))
    setValidationErrors(prev => {
      const updated = { ...prev }
      delete updated[cardId]
      return updated
    })
  }


  function addField(cardId) {
    const newField = { id: Date.now() + Math.random(), name: '', value: '' }
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, fields: [...card.fields, newField] }
        : card
    ))
  }


  function removeField(cardId, fieldId) {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, fields: card.fields.filter(f => f.id !== fieldId) }
        : card
    ))
  }


  function updateField(cardId, fieldId, key, value) {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, fields: card.fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f) }
        : card
    ))

    const isNameFieldWithError = key === 'name' && validationErrors[cardId]?.fields
    if (isNameFieldWithError) {
      setValidationErrors(prev => {
        const updated = { ...prev }
        delete updated[cardId].fields
        if (Object.keys(updated[cardId]).length === 0) delete updated[cardId]
        return updated
      })
    }
  }


  function scrollToFirstErrorCard(errors) {
    const firstErrorCardId = Object.keys(errors)[0]
    if (!firstErrorCardId) return
    cardRefs.current[firstErrorCardId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }


  async function handleSave() {
    const errors = validateCards(cards)

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      scrollToFirstErrorCard(errors)
      setActiveTab('measurements')
      return
    }

    setIsSaving(true)

    const today = new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

    for (const card of cards) {
      if (!card.name.trim()) continue

      const filledFields = card.fields
        .filter(f => f.name.trim())
        .map(f => ({ name: f.name, value: f.value }))

      const imageUrls = card.slots?.length > 0
        ? await uploadCardImages(card.slots)
        : []

      onSave({
        id:              Date.now() + Math.random(),
        name:            card.name.trim(),
        category:        card.category        || null,
        fullWearType:    card.fullWearType    || null,
        styleSelections: card.styleSelections || {},
        imgSrcs:         imageUrls,
        imgSrc:          imageUrls[0] ?? null,
        unit,
        fields:          filledFields,
        date:            today,
      })
    }

    setIsSaving(false)
    resetAndClose()
  }


  function resetAndClose() {
    setCards([createBlankCard(1)])
    setUnit('in')
    setActiveTab('measurements')
    setValidationErrors({})
    onClose()
  }


  function renderOptionChipRow(options, selectedValue, onSelect) {
    const cols = Math.min(options.length, 4)
    return (
      <div
        className={styles.optionChipRow}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {options.map(opt => {
          const isSelected = selectedValue === opt.id
          return (
            <div key={opt.id} className={styles.optionChipWrapper}>
              <button
                className={`${styles.optionChip} ${isSelected ? styles.optionChip_active : ''}`}
                onClick={() => onSelect(isSelected ? '' : opt.id)}
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


  return (
    <div className={`${styles.formOverlay} ${isOpen ? styles.formOverlay_open : ''}`}>
      <Header
        type="back"
        title="New Measurement"
        onBackClick={resetAndClose}
        customActions={[{
          label:    isSaving ? 'Saving...' : 'Save',
          onClick:  handleSave,
          disabled: isSaving,
        }]}
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

      <div className={styles.formScrollBody}>

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

            <p className={styles.stepHeading} style={{ marginTop: 24 }}>2. Cloth Types</p>

            {cards.map((card, index) => {
              const cardErrors = validationErrors[card.id] || {}
              const hasError   = Object.keys(cardErrors).length > 0

              return (
                <div
                  key={card.id}
                  ref={element => { cardRefs.current[card.id] = element }}
                  className={`${styles.clothCard} ${hasError ? styles.clothCard_error : ''}`}
                >
                  <div className={styles.clothCardHeader}>
                    <span className={styles.clothCardLabel}>{card.label}</span>
                    {index > 0 && (
                      <button className={styles.removeCardButton} onClick={() => removeCard(card.id)}>
                        <span className="mi" style={{ fontSize: '1.1rem' }}>cancel</span>
                      </button>
                    )}
                  </div>

                  <label className={styles.fieldLabel}>Garment Category</label>
                  <div className={styles.categoryChipRow}>
                    {GARMENT_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        className={`${styles.categoryChip} ${card.category === cat.id ? styles.categoryChip_active : ''}`}
                        onClick={() => updateCardCategory(card.id, cat.id)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <label className={styles.fieldLabel}>Name</label>
                  <input
                    type="text"
                    className={`${styles.underlineInput} ${cardErrors.name ? styles.underlineInput_error : ''}`}
                    placeholder="e.g. Shirt"
                    value={card.name}
                    onChange={e => updateCard(card.id, 'name', e.target.value)}
                  />
                  {cardErrors.name && (
                    <p className={styles.inlineError}>{cardErrors.name}</p>
                  )}

                  <label className={styles.fieldLabel}>Design References</label>
                  <MultiImageUploader
                    images={card.imgSrcs}
                    cardId={card.id}
                    isOnline={isOnline}
                    onChange={slots => updateCard(card.id, 'slots', slots)}
                  />

                  <label className={styles.fieldLabel} style={{ marginTop: 4 }}>Measurements</label>

                  <div className={styles.measureFieldList}>
                    {card.fields.map(field => (
                      <div key={field.id} className={styles.measureFieldRow}>
                        <div className={styles.measureFieldColumn}>
                          <label>Field</label>
                          <input
                            type="text"
                            className={styles.measureFieldInput}
                            placeholder="e.g. Neck"
                            value={field.name}
                            onChange={e => updateField(card.id, field.id, 'name', e.target.value)}
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
                            onChange={e => updateField(card.id, field.id, 'value', e.target.value)}
                          />
                        </div>
                        <button className={styles.removeFieldButton} onClick={() => removeField(card.id, field.id)}>
                          <span className="mi" style={{ fontSize: '1.1rem' }}>remove_circle_outline</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {cardErrors.fields && (
                    <p className={styles.inlineError}>{cardErrors.fields}</p>
                  )}

                  <button className={styles.addFieldButton} onClick={() => addField(card.id)}>
                    <span className="mi" style={{ fontSize: '0.9rem' }}>add</span>
                    Add Field
                  </button>
                </div>
              )
            })}

            <button className={styles.addClothButton} onClick={addCard}>
              <span className="mi">add_circle_outline</span>
              Add Another Cloth Type
            </button>
          </div>
        )}

        {activeTab === 'features' && (
          <div className={styles.tabSection}>
            <p className={styles.stepHeading}>Garment Features</p>

            {cards.map(card => {
              const slots      = getSlotsForCard(card.category, card.fullWearType, gender)
              const cardName   = card.name.trim() || card.label
              const needsType  = card.category === 'full_wear' && !card.fullWearType
              const noCategory = !card.category

              return (
                <div key={card.id} className={styles.clothCard}>
                  <div className={styles.clothCardHeader}>
                    <span className={styles.clothCardLabel}>{cardName}</span>
                    {card.category && (
                      <span className={styles.categoryBadge}>
                        {GARMENT_CATEGORIES.find(c => c.id === card.category)?.label}
                      </span>
                    )}
                  </div>

                  {noCategory && (
                    <div className={styles.featureEmptyState}>
                      <span className="mi-outlined" style={{ fontSize: '2rem', color: 'var(--text3)' }}>
                        category
                      </span>
                      <p>No category selected</p>
                      <span>Go to the Measurements tab and pick a garment category for this cloth type.</span>
                    </div>
                  )}

                  {!noCategory && needsType && (
                    <>
                      <label className={styles.fieldLabel}>Garment Type</label>
                      <div className={styles.typeChipRow}>
                        {FULL_WEAR_TYPES.map(type => (
                          <button
                            key={type.id}
                            className={`${styles.typeChip} ${card.fullWearType === type.id ? styles.typeChip_active : ''}`}
                            onClick={() => updateFullWearType(card.id, type.id)}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {slots.map(slot => (
                    <div key={slot.id} className={styles.slotGroup}>
                      <label className={styles.fieldLabel}>{slot.label}</label>

                      {slot.type === 'grouped' ? (
                        <div className={styles.groupedSlot}>
                          {slot.subSlots.map(subSlot => (
                            <div key={subSlot.id} className={styles.subSlotGroup}>
                              <p className={styles.subSlotLabel}>{subSlot.label}</p>
                              {renderOptionChipRow(
                                subSlot.options,
                                card.styleSelections?.[subSlot.id],
                                value => updateStyleSelection(card.id, subSlot.id, value)
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        renderOptionChipRow(
                          slot.options,
                          card.styleSelections?.[slot.id],
                          value => updateStyleSelection(card.id, slot.id, value)
                        )
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}