import { useState, useRef } from "react"
import { getInitials } from "../../../../utils/nameUtils"
import { useBodyMeasurementImages } from "../../../../contexts/BodyMeasurementImagesContext"
import { CountryCodePicker } from "../../../../components/CountryCodePicker/CountryCodePicker"
import { buildPhoneNumber } from "../../utils"
import { uploadToCloudinary } from "../../../../services/cloudinaryService"
import { useNetworkStatus } from "../../../../hooks/useNetworkStatus"
import Header from "../../../../components/Header/Header"
import styles from "./AddCustomerModal.module.css"


const MONTHS          = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS            = Array.from({ length: 31 }, (_, i) => i + 1)
const DEFAULT_COUNTRY = { name: 'Nigeria', dial_code: '+234', flag: '🇳🇬' }

const COUNTRY_DIAL_CODES = [
  { dial_code: '+1',   name: 'United States', flag: '🇺🇸' },
  { dial_code: '+44',  name: 'United Kingdom', flag: '🇬🇧' },
  { dial_code: '+234', name: 'Nigeria',        flag: '🇳🇬' },
  { dial_code: '+233', name: 'Ghana',          flag: '🇬🇭' },
  { dial_code: '+254', name: 'Kenya',          flag: '🇰🇪' },
  { dial_code: '+27',  name: 'South Africa',   flag: '🇿🇦' },
  { dial_code: '+91',  name: 'India',          flag: '🇮🇳' },
  { dial_code: '+49',  name: 'Germany',        flag: '🇩🇪' },
  { dial_code: '+33',  name: 'France',         flag: '🇫🇷' },
  { dial_code: '+86',  name: 'China',          flag: '🇨🇳' },
  { dial_code: '+55',  name: 'Brazil',         flag: '🇧🇷' },
  { dial_code: '+20',  name: 'Egypt',          flag: '🇪🇬' },
]


function detectCountryFromNumber(rawNumber) {
  const cleaned = rawNumber.replace(/\s+/g, '').replace(/-/g, '')
  if (!cleaned.startsWith('+')) return null

  const sorted = [...COUNTRY_DIAL_CODES].sort((a, b) => b.dial_code.length - a.dial_code.length)

  for (const country of sorted) {
    if (cleaned.startsWith(country.dial_code)) {
      return { country, local: cleaned.slice(country.dial_code.length) }
    }
  }

  return null
}


export function AddCustomerModal({ isOpen, onClose, onSave }) {

  const { getBodyMeasurementConfig } = useBodyMeasurementImages()
  const isOnline                     = useNetworkStatus()

  const [formTab,          setFormTab]          = useState('personal')
  const [name,             setName]             = useState('')
  const [localPhone,       setLocalPhone]       = useState('')
  const [selectedCountry,  setSelectedCountry]  = useState(DEFAULT_COUNTRY)
  const [phoneType,        setPhoneType]        = useState('Mobile')
  const [onWhatsApp,       setOnWhatsApp]       = useState(null)
  const [sex,              setSex]              = useState('')
  const [bdayDay,          setBdayDay]          = useState('')
  const [bdayMonth,        setBdayMonth]        = useState('')
  const [email,            setEmail]            = useState('')
  const [address,          setAddress]          = useState('')
  const [notes,            setNotes]            = useState('')
  const [photoFile,        setPhotoFile]        = useState(null)
  const [photoLocalSrc,    setPhotoLocalSrc]    = useState(null)
  const [photoUploading,   setPhotoUploading]   = useState(false)
  const [photoProgress,    setPhotoProgress]    = useState(0)
  const [contactNumbers,   setContactNumbers]   = useState(null)
  const [bodyMeasurements, setBodyMeasurements] = useState({})
  const [customFields,     setCustomFields]     = useState([])
  const [sexError,         setSexError]         = useState(false)
  const [whatsAppError,    setWhatsAppError]    = useState(false)
  const [formInlineMsg,    setFormInlineMsg]    = useState(null)

  const formInlineMsgTimer = useRef(null)
  const fileInputRef       = useRef(null)

  const initials                           = getInitials(name) || '+'
  const { fields: measureFields, imgMap }  = getBodyMeasurementConfig(sex)
  const hasMeasurements                    =
    Object.values(bodyMeasurements).some(v => v !== '' && v !== undefined && v !== '0' && v !== 0) ||
    customFields.some(f => f.label.trim() && f.value !== '')

  const contactPickerSupported =
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    'ContactsManager' in window


  function showInlineMsg(text, ok = true) {
    setFormInlineMsg({ text, ok })
    clearTimeout(formInlineMsgTimer.current)
    formInlineMsgTimer.current = setTimeout(() => setFormInlineMsg(null), 2600)
  }


  function applyContactNumber(rawNumber) {
    const detected = detectCountryFromNumber(rawNumber)
    if (detected) {
      setSelectedCountry(detected.country)
      setLocalPhone(detected.local)
    } else {
      setLocalPhone(rawNumber.replace(/\D/g, ''))
    }
    setContactNumbers(null)
  }


  async function handleContactPicker() {
    if (!contactPickerSupported) return
    try {
      const contacts = await navigator.contacts.select(['tel'], { multiple: false })
      if (!contacts?.length) return
      const numbers = contacts[0].tel || []
      if (numbers.length === 0) return
      if (numbers.length === 1) applyContactNumber(numbers[0])
      else setContactNumbers(numbers)
    } catch (err) {
      console.error('[Contacts] picker error', err)
    }
  }


  function handlePhotoPicker() {
    if (!isOnline) {
      showInlineMsg("You're offline — photo can be added once you're back online", false)
      return
    }
    fileInputRef.current?.click()
  }


  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (photoLocalSrc) URL.revokeObjectURL(photoLocalSrc)
    setPhotoFile(file)
    setPhotoLocalSrc(URL.createObjectURL(file))
  }


  function removePhoto(e) {
    e.stopPropagation()
    if (photoLocalSrc) URL.revokeObjectURL(photoLocalSrc)
    setPhotoFile(null)
    setPhotoLocalSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }


  function updateBodyMeasure(field, val) {
    setBodyMeasurements(prev => ({ ...prev, [field]: val }))
  }

  function addCustomField() {
    setCustomFields(prev => [...prev, { id: Date.now(), label: '', value: '' }])
  }

  function updateCustomField(id, key, val) {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f))
  }

  function removeCustomField(id) {
    setCustomFields(prev => prev.filter(f => f.id !== id))
  }


  function resetForm() {
    if (photoLocalSrc) URL.revokeObjectURL(photoLocalSrc)
    setFormTab('personal')
    setName('')
    setLocalPhone('')
    setSelectedCountry(DEFAULT_COUNTRY)
    setPhoneType('Mobile')
    setOnWhatsApp(null)
    setSex('')
    setBdayDay('')
    setBdayMonth('')
    setEmail('')
    setAddress('')
    setNotes('')
    setPhotoFile(null)
    setPhotoLocalSrc(null)
    setPhotoUploading(false)
    setPhotoProgress(0)
    setBodyMeasurements({})
    setCustomFields([])
    setSexError(false)
    setWhatsAppError(false)
    setFormInlineMsg(null)
    setContactNumbers(null)
    clearTimeout(formInlineMsgTimer.current)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }


  function handleClose() {
    resetForm()
    onClose()
  }


  async function uploadPhotoIfNeeded() {
    if (!photoFile) return null
    try {
      setPhotoUploading(true)
      setPhotoProgress(0)
      const url = await uploadToCloudinary(photoFile, 'customers', pct => setPhotoProgress(pct))
      return url
    } catch {
      return null
    } finally {
      setPhotoUploading(false)
      setPhotoProgress(0)
    }
  }


  function validatePersonalTab() {
    if (!name)             { showInlineMsg('Name is required', false); return false }
    if (!sex)              { setSexError(true); showInlineMsg('Please select a sex', false); return false }
    if (!localPhone.trim()) { showInlineMsg('Phone number is required', false); return false }
    if (buildPhoneNumber(localPhone, selectedCountry.dial_code) === null) {
      showInlineMsg('Phone must be 10 digits (or 11 starting with 0)', false)
      return false
    }
    if (onWhatsApp === null) {
      setWhatsAppError(true)
      showInlineMsg('Please indicate if this number is on WhatsApp', false)
      return false
    }
    return true
  }


  async function handleSave() {
    if (formTab === 'personal') {
      if (!validatePersonalTab()) return
      showInlineMsg('Personal info saved ✓', true)
      setFormTab('body')
      return
    }

    if (onWhatsApp === null) {
      setWhatsAppError(true)
      showInlineMsg('Please indicate if the number is on WhatsApp', false)
      setFormTab('personal')
      return
    }

    const photoUrl   = await uploadPhotoIfNeeded()
    const allBody    = { ...bodyMeasurements }
    customFields.forEach(f => { if (f.label.trim()) allBody[f.label.trim()] = f.value })
    const birthday   = bdayMonth && bdayDay ? `${bdayMonth}-${bdayDay}` : ''
    const builtPhone = buildPhoneNumber(localPhone, selectedCountry.dial_code)

    if (localPhone.trim() && builtPhone === null) {
      onSave({ name, phone: '__INVALID_PHONE__', phoneType, onWhatsApp, sex, birthday, email, address, notes, photo: photoUrl, bodyMeasurements: allBody })
      return
    }

    onSave({ name, phone: builtPhone || '', phoneType, onWhatsApp, sex, birthday, email, address, notes, photo: photoUrl, bodyMeasurements: allBody })
    resetForm()
    onClose()
  }


  async function handleSkip() {
    if (onWhatsApp === null) {
      setWhatsAppError(true)
      showInlineMsg('Please indicate if the number is on WhatsApp', false)
      setFormTab('personal')
      return
    }

    const photoUrl   = await uploadPhotoIfNeeded()
    const birthday   = bdayMonth && bdayDay ? `${bdayMonth}-${bdayDay}` : ''
    const builtPhone = buildPhoneNumber(localPhone, selectedCountry.dial_code)

    onSave({ name, phone: builtPhone || '', phoneType, onWhatsApp, sex, birthday, email, address, notes, photo: photoUrl, bodyMeasurements: {} })
    resetForm()
    onClose()
  }


  const phoneDigits = localPhone.replace(/\D/g, '')
  const phoneHint   = (() => {
    if (!phoneDigits) return null
    if (phoneDigits.length === 11 && phoneDigits.startsWith('0'))  return { ok: true,  msg: 'Leading 0 will be removed when saving' }
    if (phoneDigits.length === 10)                                  return { ok: true,  msg: 'Valid' }
    if (phoneDigits.length > 11)                                    return { ok: false, msg: 'Too many digits' }
    if (phoneDigits.length === 11 && !phoneDigits.startsWith('0')) return { ok: false, msg: '11-digit numbers must start with 0' }
    return { ok: false, msg: `${10 - phoneDigits.length} more digit${10 - phoneDigits.length !== 1 ? 's' : ''} needed` }
  })()


  return (
    <>
      <div
        className={`${styles.formOverlay} ${isOpen ? styles.formOverlayOpen : ''}`}
        onClick={handleClose}
      >
        <div className={styles.formPanel} onClick={e => e.stopPropagation()}>

          <Header
            type="back"
            title="New Customer"
            onBackClick={handleClose}
            customActions={[
              formTab === 'personal'
                ? { label: 'Save', onClick: handleSave, color: 'var(--accent)', disabled: photoUploading }
                : hasMeasurements
                  ? { label: 'Save', onClick: handleSave, color: 'var(--accent)', disabled: photoUploading }
                  : { label: 'Skip', onClick: handleSkip, color: 'var(--text2)', disabled: photoUploading }
            ]}
          />

          <div className={styles.formTabs}>
            <button
              className={`${styles.formTab} ${formTab === 'personal' ? styles.formTabActive : ''}`}
              onClick={() => setFormTab('personal')}
            >
              Personal Info
            </button>
            <button
              className={`${styles.formTab} ${formTab === 'body' ? styles.formTabActive : ''}`}
              onClick={() => setFormTab('body')}
            >
              Body Measurements
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

          <div className={styles.formBody}>
            {formTab === 'personal' && (
              <>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div
                    className={styles.photoPicker}
                    onClick={handlePhotoPicker}
                    style={{ position: 'relative' }}
                  >
                    {photoLocalSrc
                      ? <img src={photoLocalSrc} alt="Profile" className={styles.photoPreview} />
                      : <div className={styles.photoInitials}>{initials}</div>
                    }

                    {photoUploading && (
                      <div className={styles.photoUploadOverlay}>
                        <span className={styles.photoUploadProgress}>{photoProgress}%</span>
                      </div>
                    )}

                    <div className={styles.camBadge}>
                      <span className="mi" style={{ fontSize: '0.9rem' }}>
                        {isOnline ? 'photo_camera' : 'wifi_off'}
                      </span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handlePhotoChange}
                    />
                  </div>

                  {photoLocalSrc && !photoUploading && (
                    <button
                      type="button"
                      className={styles.photoRemoveBtn}
                      onClick={removePhoto}
                      title="Remove photo"
                    >
                      <span className="mi" style={{ fontSize: '0.75rem' }}>close</span>
                    </button>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Full Name *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Uchendu Daniel"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Sex *
                    {sexError && (
                      <span style={{ color: 'var(--danger)', marginLeft: 6, fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
                        Required
                      </span>
                    )}
                  </label>
                  <div className={styles.sexRow}>
                    {['Male', 'Female'].map(s => (
                      <button
                        key={s}
                        className={`${styles.sexChip} ${sex === s ? styles.sexChipActive : ''} ${sexError && !sex ? styles.sexChipError : ''}`}
                        onClick={() => { setSex(s); setSexError(false) }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Birthday (Day & Month)</label>
                  <div className={styles.inputRow}>
                    <select className={styles.formInput} value={bdayDay} onChange={e => setBdayDay(e.target.value)}>
                      <option value="">Day</option>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className={styles.formInput} value={bdayMonth} onChange={e => setBdayMonth(e.target.value)}>
                      <option value="">Month</option>
                      {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Phone Number *</label>
                  <div className={styles.phoneRow}>
                    <CountryCodePicker selected={selectedCountry} onSelect={setSelectedCountry} />
                    <input
                      type="tel"
                      className={`${styles.formInput} ${styles.phoneInput}`}
                      placeholder="e.g. 09078117654"
                      inputMode="tel"
                      value={localPhone}
                      onChange={e => setLocalPhone(e.target.value)}
                    />
                  </div>
                  {phoneHint && (
                    <div className={styles.phoneHint} style={{ color: phoneHint.ok ? 'var(--accent)' : 'var(--danger)' }}>
                      {phoneHint.msg}
                    </div>
                  )}
                  {contactPickerSupported && (
                    <button className={styles.contactPickerRow} onClick={handleContactPicker}>
                      <div className={styles.contactPickerRowIcon}>
                        <span className="mi" style={{ fontSize: '1rem' }}>contacts</span>
                      </div>
                      <div className={styles.contactPickerRowText}>
                        <span className={styles.contactPickerRowLabel}>Select from phone contacts</span>
                        <span className={styles.contactPickerRowSub}>Tap to browse your saved contacts</span>
                      </div>
                      <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>chevron_right</span>
                    </button>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Phone Type</label>
                  <select className={styles.formInput} value={phoneType} onChange={e => setPhoneType(e.target.value)}>
                    <option>Mobile</option>
                    <option>Home</option>
                    <option>Work</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    On WhatsApp? *
                    {whatsAppError && (
                      <span style={{ color: 'var(--danger)', marginLeft: 6, fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
                        Required
                      </span>
                    )}
                  </label>
                  <div className={styles.sexRow}>
                    {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
                      <button
                        key={opt.label}
                        className={`${styles.sexChip} ${onWhatsApp === opt.value ? styles.sexChipActive : ''} ${whatsAppError && onWhatsApp === null ? styles.sexChipError : ''}`}
                        onClick={() => { setOnWhatsApp(opt.value); setWhatsAppError(false) }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email Address</label>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="Optional"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Address</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Optional"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
              </>
            )}

            {formTab === 'body' && (
              <>
                {!sex && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: '0.85rem' }}>
                    Please select a sex on the Personal Info tab first.
                  </div>
                )}
                {sex && (
                  <>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                      {sex === 'Female' ? 'Female' : 'Male'} body measurements (inches)
                    </p>

                    {measureFields.map((field, idx) => {
                      const imgSrc         = imgMap[field] || null
                      const isLastImgField = imgSrc && !measureFields.slice(idx + 1).some(f => imgMap[f])

                      if (imgSrc) {
                        return (
                          <div
                            key={field}
                            className={`${styles.measureImgRow} ${isLastImgField ? styles.measureImgRowLast : ''}`}
                          >
                            <img src={imgSrc} alt={field} className={styles.measureImg} />
                            <div className={styles.measureImgRight}>
                              <label className={styles.inputLabel}>{field}</label>
                              <input
                                type="number"
                                className={styles.formInput}
                                placeholder="0"
                                inputMode="decimal"
                                value={bodyMeasurements[field] || ''}
                                onChange={e => updateBodyMeasure(field, e.target.value)}
                              />
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div key={field} className={styles.inputGroup}>
                          <label className={styles.inputLabel}>{field}</label>
                          <input
                            type="number"
                            className={styles.formInput}
                            placeholder="0"
                            inputMode="decimal"
                            value={bodyMeasurements[field] || ''}
                            onChange={e => updateBodyMeasure(field, e.target.value)}
                          />
                        </div>
                      )
                    })}

                    {customFields.map(f => (
                      <div key={f.id} className={styles.customFieldRow}>
                        <div className={styles.customFieldInputs}>
                          <input
                            type="text"
                            className={styles.formInput}
                            placeholder="Field name"
                            value={f.label}
                            onChange={e => updateCustomField(f.id, 'label', e.target.value)}
                          />
                          <input
                            type="number"
                            className={styles.formInput}
                            placeholder="0"
                            inputMode="decimal"
                            value={f.value}
                            onChange={e => updateCustomField(f.id, 'value', e.target.value)}
                          />
                        </div>
                        <button className={styles.removeCustomBtn} onClick={() => removeCustomField(f.id)}>
                          <span className="mi" style={{ fontSize: '1.2rem' }}>remove_circle_outline</span>
                        </button>
                      </div>
                    ))}

                    <button className={styles.addCustomFieldBtn} onClick={addCustomField}>
                      <span className="mi" style={{ fontSize: '1rem' }}>add</span>
                      Add Custom Field
                    </button>
                  </>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {contactNumbers && (
        <div className={styles.contactSheetBackdrop} onClick={() => setContactNumbers(null)}>
          <div className={styles.contactSheet} onClick={e => e.stopPropagation()}>
            <p className={styles.contactSheetTitle}>Choose a number</p>
            {contactNumbers.map((num, i) => (
              <button
                key={i}
                className={styles.contactSheetOption}
                onClick={() => applyContactNumber(num)}
              >
                <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>phone</span>
                {num}
              </button>
            ))}
            <button className={styles.contactSheetCancel} onClick={() => setContactNumbers(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}