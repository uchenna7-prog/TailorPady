import { useState, useRef, useEffect } from 'react'
import styles from './PortfolioSettingsModal.module.css'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { usePortfolioSettings } from '../../../../contexts/PortfolioSettingsContext'
import { useTour } from '../../../../contexts/TourContext'
import { Field } from '../Field/Field'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { TextInput } from '../TextInput/TextInput'
import { Textarea } from '../Textarea/Textarea'
import { TurnaroundPicker } from './TurnaroundPicker/TurnaroundPicker'
import { ServiceAreaPicker } from './ServiceAreaPicker/ServiceAreaPicker'
import { MilestonesField } from './MilestonesField/MilestonesField'
import { ProcessStepsField } from './ProcessStepsField/ProcessStepsField'
import { FaqField } from './FaqField/FaqField'
import { AvailableFromField } from './AvailableFromField/AvailableFromField'
import { BusinessHoursField } from './BusinessHoursField/BusinessHoursField'
import { ImageSourceMenu } from './ImageSourceMenu/ImageSourceMenu'
import { GalleryImagePickerSheet } from './GalleryImagePickerSheet/GalleryImagePickerSheet'
import { ImagePreview } from './ImagePreview/ImagePreview'
import { uploadToCloudinary } from '../../../../services/cloudinaryService'
import {
  AVAILABILITY_OPTIONS,
  MAX_LOCATION_LENGTH,
  MAX_FOOTER_TEXT_LENGTH,
  MAX_STYLE_STATEMENT_LENGTH,
  MAX_BOOKING_NOTE_LENGTH,
  MIN_ABOUT_LENGTH,
  MAX_ABOUT_LENGTH,
} from './datas'

const FIELD_ERROR_ORDER = ['about', 'yearFounded', 'location']

function normalizeAvailableUntil(v) {
  if (v && typeof v === 'object') {
    return { month: v.month || null, year: v.year || null }
  }
  return { month: null, year: null }
}

function normalizeBusinessHours(v) {
  if (v && typeof v === 'object') {
    return {
      startDay: v.startDay || null,
      endDay: v.endDay || null,
      openMinutes: typeof v.openMinutes === 'number' ? v.openMinutes : null,
      closeMinutes: typeof v.closeMinutes === 'number' ? v.closeMinutes : null,
    }
  }
  return { startDay: null, endDay: null, openMinutes: null, closeMinutes: null }
}

function buildLocal(ps) {
  return {
    ...ps,
    brandAbout: ps.brandAbout || '',
    brandMilestones: Array.isArray(ps.brandMilestones) && ps.brandMilestones.length === 2
      ? ps.brandMilestones
      : [{ number: '', label: '' }, { number: '', label: '' }],
    brandServiceArea: Array.isArray(ps.brandServiceArea) ? ps.brandServiceArea : [],
    brandProcessSteps: Array.isArray(ps.brandProcessSteps) && ps.brandProcessSteps.length > 0
      ? ps.brandProcessSteps
      : [{ title: '', description: '' }],
    brandFaqs: Array.isArray(ps.brandFaqs) && ps.brandFaqs.length > 0
      ? ps.brandFaqs
      : [{ question: '', answer: '' }],
    brandAvailableUntil: normalizeAvailableUntil(ps.brandAvailableUntil),
    brandBusinessHours: normalizeBusinessHours(ps.brandBusinessHours),
  }
}

function validateLocal(local) {
  const errors = {}
  if (!local.brandAbout || local.brandAbout.trim().length < MIN_ABOUT_LENGTH) errors.about = true
  if (!local.brandYearFounded || !local.brandYearFounded.toString().trim()) errors.yearFounded = true
  if (!local.brandLocation || !local.brandLocation.trim()) errors.location = true
  return errors
}

function BackgroundImageField({ label, hint, value, onChange, showToast }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Please select an image file'); return }
    if (file.size > 10 * 1024 * 1024) { showToast('Image must be under 10MB'); return }

    setUploading(true)
    setProgress(0)

    try {
      const url = await uploadToCloudinary(file, 'portfolio', setProgress)
      onChange(url)
      showToast('Image uploaded')
    } catch {
      showToast('Upload failed — please try again')
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleGallerySelect(url) {
    onChange(url)
    showToast('Image selected')
  }

  return (
    <Field label={label} hint={hint}>
      {uploading ? (
        <div className={styles.uploadProgress}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressLabel}>Uploading… {progress}%</span>
        </div>
      ) : value ? (
        <div className={styles.previewActions}>
          <ImagePreview src={value} alt={label} onRemove={() => onChange(null)} />
        </div>
      ) : (
        <button className={styles.uploadBtn} onClick={() => setSourceMenuOpen(true)}>
          <span className="mi-outlined">add_photo_alternate</span>
          Add image
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      <ImageSourceMenu
        open={sourceMenuOpen}
        onClose={() => setSourceMenuOpen(false)}
        onChooseGallery={() => setGalleryOpen(true)}
        onChooseUpload={() => inputRef.current?.click()}
      />

      <GalleryImagePickerSheet
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={handleGallerySelect}
      />
    </Field>
  )
}

function AboutField({ value, onChange, error, fieldRef }) {
  const length = value?.length || 0
  const belowMin = length > 0 && length < MIN_ABOUT_LENGTH

  return (
    <Field
      ref={fieldRef}
      label="About"
      hint={`Tell clients who you are and what your brand stands for. At least ${MIN_ABOUT_LENGTH} characters.`}
    >
      <Textarea
        value={value}
        onChange={onChange}
        placeholder="e.g. I'm a tailor based in Lagos with over 8 years of experience crafting bespoke suits, agbadas, and formal wear for clients who value fit and finishing."
        rows={5}
        maxLength={MAX_ABOUT_LENGTH}
        error={error}
      />
      <div className={`${styles.charCount} ${belowMin || error ? styles.charCountWarn : ''}`}>
        {belowMin
          ? `${MIN_ABOUT_LENGTH - length} more characters needed`
          : `${length}/${MAX_ABOUT_LENGTH}`}
      </div>
    </Field>
  )
}

export function PortfolioSettingsModal({ onBack, showToast }) {
  const { portfolioSettings, updateManyPortfolioSettings, portfolioSettingsSettled } = usePortfolioSettings()
  const { currentStep, completeStep } = useTour()

  const [local, setLocal] = useState(() => buildLocal(portfolioSettings))
  const [fieldErrors, setFieldErrors] = useState({})
  const syncedRef = useRef(false)

  const aboutRef = useRef(null)
  const yearFoundedRef = useRef(null)
  const locationRef = useRef(null)
  const fieldRefs = { about: aboutRef, yearFounded: yearFoundedRef, location: locationRef }

  useEffect(() => {
    if (portfolioSettingsSettled && !syncedRef.current) {
      setLocal(buildLocal(portfolioSettings))
      syncedRef.current = true
    }
  }, [portfolioSettingsSettled, portfolioSettings])

  const set = key => val => {
    setLocal(p => ({ ...p, [key]: val }))
    const errorKey = key === 'brandAbout' ? 'about' : key === 'brandYearFounded' ? 'yearFounded' : key === 'brandLocation' ? 'location' : null
    if (errorKey) {
      setFieldErrors(prev => (prev[errorKey] ? { ...prev, [errorKey]: false } : prev))
    }
  }

  const save = () => {
    const errors = validateLocal(local)

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      const firstErrorKey = FIELD_ERROR_ORDER.find(key => errors[key])
      const el = fieldRefs[firstErrorKey]?.current
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      if (errors.about) {
        showToast(`About must be at least ${MIN_ABOUT_LENGTH} characters`)
      } else if (errors.yearFounded) {
        showToast('Year Founded is required')
      } else {
        showToast('Location is required')
      }
      return
    }

    setFieldErrors({})
    updateManyPortfolioSettings(local)
    showToast('Portfolio settings saved')
    if (currentStep?.id === 'portfolio-settings-save') {
      completeStep('portfolio-settings-save')
    }
    if (currentStep?.id === 'portfolio-settings-save-2') {
      completeStep('portfolio-settings-save-2')
    }
    onBack()
  }

  return (
    <FullModal title="Portfolio Settings" onBack={onBack} onSave={save}>

      <div className={styles.sectionLabel}>Availability</div>
      <FieldGroup>
        <Field label="Status">
          <div className={styles.availabilityRow}>
            {AVAILABILITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.availBtn} ${
                  local.brandAvailability === opt.value
                    ? opt.value === 'open'
                      ? styles.availBtnOpen
                      : styles.availBtnBooked
                    : ''
                }`}
                onClick={() => set('brandAvailability')(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
        {local.brandAvailability === 'booked' && (
          <Field label="Available From" hint="When will you start accepting orders again?">
            <AvailableFromField
              value={local.brandAvailableUntil}
              onChange={set('brandAvailableUntil')}
            />
          </Field>
        )}
      </FieldGroup>

      <div style={{ height: 20 }} />

      <div className={styles.sectionLabel}>Hero Section</div>
      <FieldGroup>
        <BackgroundImageField
          label="Background Image"
          hint="Full-width hero banner background. Recommended: 1920×1080px."
          value={local.heroBgImage}
          onChange={set('heroBgImage')}
          showToast={showToast}
        />
        <Field label="Style Statement" hint="Tell clients what kind of clothing you make and what makes your work special.">
          <Textarea
            value={local.brandStyleStatement}
            onChange={set('brandStyleStatement')}
            placeholder="e.g. Specializes in bespoke suits, traditional wear, and formal menswear. "
            rows={3}
            maxLength={MAX_STYLE_STATEMENT_LENGTH}
          />
          <div className={styles.charCount}>
            {(local.brandStyleStatement || '').length}/{MAX_STYLE_STATEMENT_LENGTH}
          </div>
        </Field>
      </FieldGroup>

      <div style={{ height: 20 }} />

      <div className={styles.sectionLabel}>About Section</div>
      <FieldGroup>
        <AboutField value={local.brandAbout} onChange={set('brandAbout')} error={fieldErrors.about} fieldRef={aboutRef} />
        <Field ref={yearFoundedRef} label="Year Founded" hint="When did you start your business? Shown as one of your stats.">
          <TextInput
            value={local.brandYearFounded}
            onChange={set('brandYearFounded')}
            placeholder="e.g. 2018"
            error={fieldErrors.yearFounded}
          />
        </Field>
        <Field label="Milestones" hint="Two proud achievements shown as stats on your portfolio. e.g. 500+ Happy Clients">
          <MilestonesField value={local.brandMilestones} onChange={set('brandMilestones')} />
        </Field>
        <Field ref={locationRef} label="Location" hint="Where you're based. Shown on your portfolio.">
          <TextInput
            value={local.brandLocation}
            onChange={set('brandLocation')}
            placeholder="e.g. Lekki, Lagos"
            maxLength={MAX_LOCATION_LENGTH}
            error={fieldErrors.location}
          />
          <div className={styles.charCount}>
            {(local.brandLocation || '').length}/{MAX_LOCATION_LENGTH}
          </div>
        </Field>
      </FieldGroup>

      <div style={{ height: 20 }} />

      <div className={styles.sectionLabel}>Process</div>
      <FieldGroup>
        <Field label="How You Work" hint="Tell clients what happens from the moment they place an order to when they receive it, one step at a time. Up to 5 steps.">
          <ProcessStepsField value={local.brandProcessSteps} onChange={set('brandProcessSteps')} />
        </Field>
      </FieldGroup>

      <div style={{ height: 20 }} />

      <div className={styles.sectionLabel}>Services</div>
      <FieldGroup>
        <Field label="Standard Turnaround Time" hint="How long does it typically take to complete an order?">
          <TurnaroundPicker value={local.brandTurnaround} onChange={set('brandTurnaround')} />
        </Field>
        <Field label="Service Area" hint="Select all states you deliver or offer services to.">
          <ServiceAreaPicker value={local.brandServiceArea} onChange={set('brandServiceArea')} />
        </Field>
      </FieldGroup>

      <div style={{ height: 20 }} />

      <div className={styles.sectionLabel}>FAQ</div>
      <FieldGroup>
        <Field label="Frequently Asked Questions" hint="Up to 6 questions.">
          <FaqField value={local.brandFaqs} onChange={set('brandFaqs')} />
        </Field>
      </FieldGroup>

      <div style={{ height: 20 }} />

      <div className={styles.sectionLabel}>Booking</div>
      <FieldGroup>
        <Field label="Booking Note" hint="A short note shown to clients on your booking form. e.g. Include your measurements when booking.">
          <Textarea
            value={local.brandBookingNote}
            onChange={set('brandBookingNote')}
            placeholder="e.g. Please include your measurement chart and fabric preference when reaching out."
            rows={3}
            maxLength={MAX_BOOKING_NOTE_LENGTH}
          />
          <div className={styles.charCount}>
            {(local.brandBookingNote || '').length}/{MAX_BOOKING_NOTE_LENGTH}
          </div>
        </Field>
        <Field label="Business Hours" hint="When clients can expect a response or a visit.">
          <BusinessHoursField
            value={local.brandBusinessHours}
            onChange={set('brandBusinessHours')}
          />
        </Field>
      </FieldGroup>

      <div style={{ height: 20 }} />

      <div className={styles.sectionLabel}>Footer Section</div>
      <FieldGroup>
        <BackgroundImageField
          label="Footer Background Image"
          hint="Optional background behind footer content. Leave empty for a solid color."
          value={local.footerBgImage}
          onChange={set('footerBgImage')}
          showToast={showToast}
        />
        <Field label="Footer Text" hint="A short closing line shown before your contact details.">
          <TextInput
            value={local.brandFooterText}
            onChange={set('brandFooterText')}
            placeholder="e.g. Let's create something beautiful together."
            maxLength={MAX_FOOTER_TEXT_LENGTH}
          />
          <div className={styles.charCount}>
            {(local.brandFooterText || '').length}/{MAX_FOOTER_TEXT_LENGTH}
          </div>
        </Field>
      </FieldGroup>

    </FullModal>
  )
}
