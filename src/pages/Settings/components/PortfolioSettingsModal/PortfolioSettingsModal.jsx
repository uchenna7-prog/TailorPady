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
import { ImageSourceMenu } from './ImageSourceMenu/ImageSourceMenu'
import { GalleryImagePickerSheet } from './GalleryImagePickerSheet/GalleryImagePickerSheet'
import { ImagePreview } from './ImagePreview/ImagePreview'
import { uploadToCloudinary } from '../../../../services/cloudinaryService'
import { AVAILABILITY_OPTIONS } from './datas'


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


function ImageUploadField({ label, hint, value, onChange, showToast }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

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
        <ImagePreview src={value} alt={label} onRemove={() => onChange(null)} />
      ) : (
        <button className={styles.uploadBtn} onClick={() => inputRef.current?.click()}>
          <span className="mi">add_photo_alternate</span>
          Upload image
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </Field>
  )
}


export function PortfolioSettingsModal({ onBack, showToast }) {
  const { portfolioSettings, updateManyPortfolioSettings } = usePortfolioSettings()

  const [local, setLocal] = useState({ ...portfolioSettings })

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  function save() {
    updateManyPortfolioSettings(local)
    showToast('Portfolio settings saved')
    onBack()
  }

  return (
    <FullModal title="Portfolio Settings" onBack={onBack} onSave={save}>
      <div>

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

        <div style={{ height: 20 }} />

        <div className={styles.sectionLabel}>About You</div>
        <FieldGroup>
          <Field label="Milestone" hint="A proud achievement shown on your portfolio. e.g. 500+ happy clients">
            <TextInput
              value={local.brandMilestone}
              onChange={set('brandMilestone')}
              placeholder="e.g. 500+ happy clients"
            />
          </Field>
          <Field label="Signature Style" hint="What you're known for. e.g. Hand-embroidered agbada">
            <TextInput
              value={local.brandSignatureStyle}
              onChange={set('brandSignatureStyle')}
              placeholder="e.g. Hand-embroidered agbada"
            />
          </Field>
          <Field label="Style Statement" hint="Describe your craft. Shown on your portfolio.">
            <Textarea
              value={local.brandStyleStatement}
              onChange={set('brandStyleStatement')}
              placeholder="e.g. I specialise in bold Ankara fusion pieces that blend traditional Yoruba aesthetics with modern silhouettes..."
              rows={5}
            />
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

        <div className={styles.sectionLabel}>Booking</div>
        <FieldGroup>
          <Field label="Booking Note" hint="A short note shown to clients on your booking form. e.g. Include your measurements when booking.">
            <Textarea
              value={local.brandBookingNote}
              onChange={set('brandBookingNote')}
              placeholder="e.g. Please include your measurement chart and fabric preference when reaching out."
              rows={3}
            />
          </Field>
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
          <ImageUploadField
            label="Profile / Avatar"
            hint="Your photo shown on the hero. Recommended: 400×400px square."
            value={local.heroAvatarImage}
            onChange={set('heroAvatarImage')}
            showToast={showToast}
          />
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
          <ImageUploadField
            label="Footer Logo"
            hint="Brand mark shown in the footer. PNG with transparency works best."
            value={local.footerLogoImage}
            onChange={set('footerLogoImage')}
            showToast={showToast}
          />
        </FieldGroup>

        <div style={{ height: 8 }} />

      </div>
    </FullModal>
  )
}