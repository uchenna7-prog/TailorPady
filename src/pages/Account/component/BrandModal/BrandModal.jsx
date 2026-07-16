import { useState, useRef, useCallback, useEffect } from 'react'
import { FullModal } from '../FullModal/FullModal'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { Field } from '../Field/Field'
import { TextInput } from '../TextInput/TextInput'
import { SignatureSection } from '../SignatureSection/SignatureSection'
import { getPaletteById } from '../../../../config/brandPalette'
import { uploadToCloudinary, deleteFromCloudinary } from '../../../../services/cloudinaryService'
import { useProfileSettings } from '../../../../contexts/ProfileSettingsContext'
import { useAuth } from '../../../../contexts/AuthContext'
import BrandColourPicker from '../../../../components/BrandColourPicker/BrandColourPicker'
import { LogoCropModal } from '../../../../components/LogoCropModal/LogoCropModal'
import styles from './BrandModal.module.css'

const DEFAULT_COLOUR_ID = 'midnight'

function buildLocal(ps) {
  return {
    brandName:              ps.brandName              || '',
    brandTagline:           ps.brandTagline           || '',
    brandColourId:          (ps.brandColourId && !ps.brandColourId.startsWith('#'))
                              ? ps.brandColourId
                              : DEFAULT_COLOUR_ID,
    brandLogo:              ps.brandLogo              || null,
    brandLogoPublicId:      ps.brandLogoPublicId      || null,
    brandSignature:         ps.brandSignature         || null,
    brandSignaturePublicId: ps.brandSignaturePublicId || null,
  }
}

export function BrandModal({ onBack, showToast }) {
  const { profileSettings, isLoading, updateManyProfileSettings } = useProfileSettings()
  const { user } = useAuth()
  const logoInputRef   = useRef()
  const initializedRef = useRef(false)

  const [logoUploading, setLogoUploading] = useState(false)
  const [logoProgress,  setLogoProgress]  = useState(0)
  const [sigUploading,  setSigUploading]  = useState(false)
  const [sigProgress,   setSigProgress]   = useState(0)
  const [cropSrc,       setCropSrc]       = useState(null)
  const [local,         setLocal]         = useState(() => buildLocal(profileSettings))

  useEffect(() => {
    if (isLoading || initializedRef.current) return
    initializedRef.current = true
    setLocal(buildLocal(profileSettings))
  }, [isLoading])

  const set = useCallback(key => val => setLocal(p => ({ ...p, [key]: val })), [])

  const handleSignatureChange = useCallback(
    val => setLocal(p => ({ ...p, brandSignature: val })),
    []
  )

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
    const previousPublicId = local.brandLogoPublicId
    try {
      const { url, publicId } = await uploadToCloudinary(croppedFile, 'invoices', setLogoProgress)
      setLocal(p => ({ ...p, brandLogo: url, brandLogoPublicId: publicId }))
      if (previousPublicId) deleteFromCloudinary(previousPublicId).catch(() => {})
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

  const handleLogoRemove = () => {
    const previousPublicId = local.brandLogoPublicId
    setLocal(p => ({ ...p, brandLogo: null, brandLogoPublicId: null }))
    if (previousPublicId) deleteFromCloudinary(previousPublicId).catch(() => {})
  }

  const save = async () => {
    let signatureUrl      = local.brandSignature
    let signaturePublicId = local.brandSignaturePublicId
    const previousSignaturePublicId = local.brandSignaturePublicId

    if (local.brandSignature && local.brandSignature.startsWith('data:')) {
      setSigUploading(true)
      setSigProgress(0)
      try {
        const res      = await fetch(local.brandSignature)
        const blob     = await res.blob()
        const file     = new File([blob], 'signature.png', { type: 'image/png' })
        const uploaded = await uploadToCloudinary(file, 'signatures', setSigProgress)
        signatureUrl      = uploaded.url
        signaturePublicId = uploaded.publicId
      } catch {
        showToast('Signature upload failed — try again')
        setSigUploading(false)
        return
      }
      setSigUploading(false)
      setSigProgress(0)

      if (previousSignaturePublicId) deleteFromCloudinary(previousSignaturePublicId).catch(() => {})
    } else if (!local.brandSignature && previousSignaturePublicId) {
      deleteFromCloudinary(previousSignaturePublicId).catch(() => {})
      signaturePublicId = null
    }

    const entry = getPaletteById(local.brandColourId)

    updateManyProfileSettings({
      ...local,
      brandSignature:         signatureUrl,
      brandSignaturePublicId: signaturePublicId,
      brandColour:            entry?.tokens.primary || '#1C1814',
    })

    showToast('Brand info saved')
    onBack()
  }

  const isSaving = logoUploading || sigUploading

  if (isLoading) {
    return (
      <FullModal title="Brand Identity" onBack={onBack}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ width: 28, height: 28, border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </FullModal>
    )
  }

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
              <SignatureSection
                value={local.brandSignature}
                onChange={handleSignatureChange}
                userId={user?.uid}
              />
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