import { useState, useRef } from "react"
import { FullModal } from "../FullModal/FullModal"
import { FieldGroup } from "../FieldGroup/FieldGroup"
import { Field } from "../Field/Field"
import { TextInput } from "../TextInput/TextInput"
import { SignatureSection } from "../SignatureSection/SignatureSection"
import { getPaletteById } from "../../../../config/brandPalette"
import { uploadToCloudinary } from "../../../../services/cloudinaryService"
import { useProfileSettings } from "../../../../contexts/ProfileSettingsContext"
import BrandColourPicker from "../../../../components/BrandColourPicker/BrandColourPicker"
import { LogoCropModal } from "../../../../components/LogoCropModal/LogoCropModal"
import styles from "./BrandModal.module.css"

const DEFAULT_COLOUR_ID = 'midnight'

export function BrandModal({ onBack, showToast }) {

  const { profileSettings, updateManyProfileSettings } = useProfileSettings()
  const logoInputRef = useRef()

  const [logoUploading, setLogoUploading] = useState(false)
  const [logoProgress, setLogoProgress]   = useState(0)
  const [sigUploading, setSigUploading]   = useState(false)
  const [sigProgress, setSigProgress]     = useState(0)

  const [cropSrc, setCropSrc] = useState(null)

  const [local, setLocal] = useState({
    brandName:      profileSettings.brandName      || '',
    brandTagline:   profileSettings.brandTagline   || '',
    brandColourId:  (profileSettings.brandColourId && !profileSettings.brandColourId.startsWith('#'))
                      ? profileSettings.brandColourId
                      : DEFAULT_COLOUR_ID,
    brandLogo:      profileSettings.brandLogo      || null,
    brandSignature: profileSettings.brandSignature || null,
  })

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  const handleLogoChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Please select an image file'); return }
    if (file.size > 10 * 1024 * 1024)   { showToast('Image must be under 10MB');    return }

    const objectUrl = URL.createObjectURL(file)
    setCropSrc(objectUrl)

    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const handleCropConfirm = async croppedFile => {
    setCropSrc(null)
    setLogoUploading(true)
    setLogoProgress(0)

    try {
      const url = await uploadToCloudinary(croppedFile, 'invoices', setLogoProgress)
      setLocal(p => ({ ...p, brandLogo: url }))
      showToast('Logo uploaded')
    } catch {
      showToast('Upload failed — please try again')
    } finally {
      setLogoUploading(false)
      setLogoProgress(0)
    }
  }

  const handleCropCancel = () => {
    setCropSrc(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const handleLogoRemove = () => setLocal(p => ({ ...p, brandLogo: null }))

  const save = async () => {
    let signatureUrl = local.brandSignature

    if (local.brandSignature && local.brandSignature.startsWith('data:')) {
      setSigUploading(true)
      setSigProgress(0)
      try {
        const res  = await fetch(local.brandSignature)
        const blob = await res.blob()
        const file = new File([blob], 'signature.png', { type: 'image/png' })
        signatureUrl = await uploadToCloudinary(file, 'signatures', setSigProgress)
      } catch {
        showToast('Signature upload failed — try again')
        setSigUploading(false)
        return
      }
      setSigUploading(false)
      setSigProgress(0)
    }

    const entry = getPaletteById(local.brandColourId)

    updateManyProfileSettings({
      ...local,
      brandSignature: signatureUrl,
      brandColour:    entry?.tokens.primary || '#1C1814',
    })

    showToast('Brand info saved')
    onBack()
  }

  const isSaving = logoUploading || sigUploading

  return (
    <>
      <FullModal title="Brand Identity" onBack={onBack} onSave={isSaving ? undefined : save}>

        <FieldGroup>
          <Field label="Brand Logo" hint="PNG or JPG. Appears on invoice headers and portfolio. Ideally square.">
            {logoUploading ? (
              <div className={styles.logoUploadBtn} style={{ opacity: 0.7, pointerEvents: 'none', flexDirection: 'column', gap: 8 }}>
                <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${logoProgress}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.2s' }} />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>
                  Uploading… {logoProgress}%
                </span>
              </div>
            ) : local.brandLogo ? (
              <div className={styles.logoPreviewWrap}>
                <img src={local.brandLogo} alt="Brand logo" className={styles.logoPreview} />
                <button className={styles.logoRemove} onClick={handleLogoRemove}>
                  <span className="mi" style={{ fontSize: 15 }}>close</span> Remove
                </button>
              </div>
            ) : (
              <button className={styles.logoUploadBtn} onClick={() => logoInputRef.current?.click()}>
                <span className="mi">add_photo_alternate</span>
                Upload Logo
              </button>
            )}
            <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field label="Shop / Brand Name">
            <TextInput value={local.brandName} onChange={set('brandName')} placeholder="e.g. Emeka Tailors" />
          </Field>
          <Field label="Tagline" hint="Short line shown under your name on coloured invoice templates.">
            <TextInput value={local.brandTagline} onChange={set('brandTagline')} placeholder="e.g. Crafted with love, fitted for you" />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field label="Brand Colour" hint="Choose your brand colour. We've curated shades that look great on your portfolio and invoices.">
            <BrandColourPicker value={local.brandColourId} onChange={set('brandColourId')} />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field label="Signature" hint="Draw your signature. It will appear on your invoices.">
            {sigUploading ? (
              <div style={{ padding: '16px 0' }}>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: `${sigProgress}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.2s' }} />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>
                  Saving signature… {sigProgress}%
                </span>
              </div>
            ) : (
              <SignatureSection value={local.brandSignature} onChange={set('brandSignature')} />
            )}
          </Field>
        </FieldGroup>

      </FullModal>

      {cropSrc && (
        <LogoCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  )
}