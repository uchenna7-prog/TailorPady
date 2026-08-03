
import { useState, useRef } from 'react'
import styles from './PortfolioSettingsModal.module.css'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { usePortfolioSettings } from '../../../../contexts/PortfolioSettingsContext'
import { Field } from '../Field/Field'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { TextInput } from '../TextInput/TextInput'
import { Textarea } from '../Textarea/Textarea'
import { TurnaroundPicker } from './TurnaroundPicker/TurnaroundPicker'
import { ServiceAreaPicker } from './ServiceAreaPicker/ServiceAreaPicker'
import { MilestonesField } from './MilestonesField/MilestonesField'
import { ProcessStepsField } from './ProcessStepsField/ProcessStepsField'
import { FaqField } from './FaqField/FaqField'
import { ImageSourceMenu } from './ImageSourceMenu/ImageSourceMenu'
import { GalleryImagePickerSheet } from './GalleryImagePickerSheet/GalleryImagePickerSheet'
import { ImagePreview } from './ImagePreview/ImagePreview'
import { uploadToCloudinary } from '../../../../services/cloudinaryService'
import { AVAILABILITY_OPTIONS, MAX_LOCATION_LENGTH, MAX_FOOTER_TEXT_LENGTH } from './datas'


function SectionCardLabel({ icon, children }) {
  return (
    <div className={styles.sectionCardLabel}>
      <span className={`mi ${styles.sectionIcon}`}>{icon}</span>
      {children}
    </div>
  )
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
        <div className={styles.uploadBtn} style={{ flexDirection: 'column', gap: 8, opacity: 0.7, pointerEvents: 'none' }}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressLabel}>Uploading… {progress}%</span>
        </div>
      ) : value ? (
        <div className={styles.previewActions}>
          <ImagePreview src={value} alt={label} onRemove={() => onChange(null)} />
          <button type="button" className={styles.changeBtn} onClick={() => setSourceMenuOpen(true)}>
            <span className="mi-outlined" style={{ fontSize: 16 }}>swap_horiz</span>
            Change Image
          </button>
        </div>
      ) : (
        <button className={styles.uploadBtn} onClick={() => setSourceMenuOpen(true)}>
          <span className="mi">add_photo_alternate</span>
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


export function PortfolioSettingsModal({ onBack, showToast }) {
  const { portfolioSettings, updateManyPortfolioSettings } = usePortfolioSettings()

  const [local, setLocal] = useState({
    ...portfolioSettings,
    brandMilestones: Array.isArray(portfolioSettings.brandMilestones) && portfolioSettings.brandMilestones.length === 2
      ? portfolioSettings.brandMilestones
      : [{ number: '', label: '' }, { number: '', label: '' }],
    brandServiceArea: Array.isArray(portfolioSettings.brandServiceArea) ? portfolioSettings.brandServiceArea : [],
    brandProcessSteps: Array.isArray(portfolioSettings.brandProcessSteps) && portfolioSettings.brandProcessSteps.length > 0
      ? portfolioSettings.brandProcessSteps
      : [{ title: '', description: '' }],
    brandFaqs: Array.isArray(portfolioSettings.brandFaqs) && portfolioSettings.brandFaqs.length > 0
      ? portfolioSettings.brandFaqs
      : [{ question: '', answer: '' }],
  })

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  function save() {
    updateManyPortfolioSettings(local)
    showToast('Portfolio settings saved')
    onBack()
  }

  return (
    <FullModal title="Portfolio Settings" onBack={onBack} onSave={save}>
      <div className={styles.body}>

        <div className={styles.sectionCard}>
          <SectionCardLabel icon="toggle_on">Availability</SectionCardLabel>
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
                    <span className="mi" style={{ fontSize: '1rem' }}>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
            {local.brandAvailability === 'booked' && (
              <Field label="Available From" hint="When will you start accepting orders again?">
                <TextInput
                  value={local.brandAvailableUntil}
                  onChange={set('brandAvailableUntil')}
                  placeholder="e.g. January 2025"
                />
              </Field>
            )}
          </FieldGroup>
        </div>

        <div className={styles.sectionCard}>
          <SectionCardLabel icon="panorama">Hero Section</SectionCardLabel>
          <FieldGroup>
            <BackgroundImageField
              label="Background Image"
              hint="Full-width hero banner background. Recommended: 1920×1080px."
              value={local.heroBgImage}
              onChange={set('heroBgImage')}
              showToast={showToast}
            />
            <Field label="Hero Subtext" hint="A short line shown beneath your name. Describe your craft in one sentence.">
              <Textarea
                value={local.brandStyleStatement}
                onChange={set('brandStyleStatement')}
                placeholder="e.g. Bespoke fashion designed to complement your shape, style, and personality."
                rows={3}
              />
            </Field>
          </FieldGroup>
        </div>

        <div className={styles.sectionCard}>
          <SectionCardLabel icon="auto_stories">Brand Story</SectionCardLabel>
          <FieldGroup>
            <Field label="Year Founded" hint="When did you start your business? Shown as one of your stats.">
              <TextInput
                value={local.brandYearFounded}
                onChange={set('brandYearFounded')}
                placeholder="e.g. 2018"
              />
            </Field>
            <Field label="Milestones" hint="Two proud achievements shown as stats on your portfolio. e.g. 500+ Happy Clients">
              <MilestonesField value={local.brandMilestones} onChange={set('brandMilestones')} />
            </Field>
            <Field label="Location" hint="Where you're based. Shown on your portfolio.">
              <TextInput
                value={local.brandLocation}
                onChange={set('brandLocation')}
                placeholder="e.g. Lekki, Lagos"
                maxLength={MAX_LOCATION_LENGTH}
              />
            </Field>
          </FieldGroup>
        </div>

        <div className={styles.sectionCard}>
          <SectionCardLabel icon="timeline">Process</SectionCardLabel>
          <FieldGroup>
            <Field label="How You Work" hint="Up to 5 steps.">
              <ProcessStepsField value={local.brandProcessSteps} onChange={set('brandProcessSteps')} />
            </Field>
          </FieldGroup>
        </div>

        <div className={styles.sectionCard}>
          <SectionCardLabel icon="design_services">Services</SectionCardLabel>
          <FieldGroup>
            <Field label="Standard Turnaround Time" hint="How long does it typically take to complete an order?">
              <TurnaroundPicker value={local.brandTurnaround} onChange={set('brandTurnaround')} />
            </Field>
            <Field label="Service Area" hint="Select all states you deliver or offer services to.">
              <ServiceAreaPicker value={local.brandServiceArea} onChange={set('brandServiceArea')} />
            </Field>
          </FieldGroup>
        </div>

        <div className={styles.sectionCard}>
          <SectionCardLabel icon="quiz">FAQ</SectionCardLabel>
          <FieldGroup>
            <Field label="Frequently Asked Questions" hint="Up to 6 questions.">
              <FaqField value={local.brandFaqs} onChange={set('brandFaqs')} />
            </Field>
          </FieldGroup>
        </div>

        <div className={styles.sectionCard}>
          <SectionCardLabel icon="event_available">Booking</SectionCardLabel>
          <FieldGroup>
            <Field label="Booking Note" hint="A short note shown to clients on your booking form. e.g. Include your measurements when booking.">
              <Textarea
                value={local.brandBookingNote}
                onChange={set('brandBookingNote')}
                placeholder="e.g. Please include your measurement chart and fabric preference when reaching out."
                rows={3}
              />
            </Field>
            <Field label="Business Hours" hint="When clients can expect a response or a visit.">
              <TextInput
                value={local.brandBusinessHours}
                onChange={set('brandBusinessHours')}
                placeholder="e.g. Mon–Sat, 9am–6pm"
              />
            </Field>
          </FieldGroup>
        </div>

        <div className={styles.sectionCard}>
          <SectionCardLabel icon="dashboard_customize">Footer Section</SectionCardLabel>
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
            </Field>
          </FieldGroup>
        </div>

      </div>
    </FullModal>
  )
}
