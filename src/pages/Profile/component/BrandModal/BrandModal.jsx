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
import styles from "./BrandModal.module.css"

const DEFAULT_COLOUR_ID = 'midnight'
const MAX_TERMS        = 3
const MAX_TERM_LENGTH  = 60

export function BrandModal({ onBack, showToast }) {

  const { profileSettings, updateManyProfileSettings } = useProfileSettings()
  const logoInputRef = useRef()

  const [logoUploading, setLogoUploading] = useState(false)
  const [logoProgress, setLogoProgress]   = useState(0)
  const [sigUploading, setSigUploading]   = useState(false)
  const [sigProgress, setSigProgress]     = useState(0)

  const parseTerms = raw => {
    if (Array.isArray(raw)) return raw.length > 0 ? raw : ['', '']
    if (typeof raw === 'string' && raw.trim()) return raw.split('\n').filter(Boolean)
    return ['', '']
  }

  const [local, setLocal] = useState({
    brandName:           profileSettings.brandName            || '',
    brandTagline:        profileSettings.brandTagline         || '',
    brandColourId:       (profileSettings.brandColourId && !profileSettings.brandColourId.startsWith('#'))
                           ? profileSettings.brandColourId
                           : DEFAULT_COLOUR_ID,
    brandLogo:           profileSettings.brandLogo            || null,
    brandMilestone:      profileSettings.brandMilestone       || '',
    brandSignatureStyle: profileSettings.brandSignatureStyle  || '',
    brandSignature:      profileSettings.brandSignature       || null,
    brandPaymentTerms:   parseTerms(profileSettings.brandPaymentTerms),
  })

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  const setTerm = (index, value) => {
    setLocal(p => {
      const updated = [...p.brandPaymentTerms]
      updated[index] = value
      return { ...p, brandPaymentTerms: updated }
    })
  }

  const addTerm = () => {
    if (local.brandPaymentTerms.length >= MAX_TERMS) return
    setLocal(p => ({ ...p, brandPaymentTerms: [...p.brandPaymentTerms, ''] }))
  }

  const removeTerm = index => {
    setLocal(p => {
      const updated = p.brandPaymentTerms.filter((_, i) => i !== index)
      const padded  = updated.length >= 2 ? updated : updated.concat(Array(2 - updated.length).fill(''))
      return { ...p, brandPaymentTerms: padded }
    })
  }

  const handleLogoChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Please select an image file'); return }
    if (file.size > 10 * 1024 * 1024)   { showToast('Image must be under 10MB');    return }

    setLogoUploading(true)
    setLogoProgress(0)

    try {
      const url = await uploadToCloudinary(file, 'invoices', setLogoProgress)
      setLocal(p => ({ ...p, brandLogo: url }))
      showToast('Logo uploaded')
    } catch {
      showToast('Upload failed — please try again')
    } finally {
      setLogoUploading(false)
      setLogoProgress(0)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
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

    const filledTerms = local.brandPaymentTerms.filter(t => t.trim())
    const entry       = getPaletteById(local.brandColourId)

    updateManyProfileSettings({
      ...local,
      brandSignature:    signatureUrl,
      brandPaymentTerms: filledTerms,
      brandColour:       entry?.tokens.primary || '#1C1814',
    })

    showToast('Brand info saved')
    onBack()
  }

  const isSaving = logoUploading || sigUploading

  const termPlaceholder = i => {
    if (i === 0) return 'e.g. 50% deposit required before cutting begins'
    if (i === 1) return 'e.g. Balance due on pickup'
    return 'Add another term…'
  }

  return (
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
        <Field label="Milestone" hint="A proud achievement shown on your portfolio. e.g. 500+ happy clients">
          <TextInput value={local.brandMilestone} onChange={set('brandMilestone')} placeholder="e.g. 500+ happy clients" />
        </Field>
        <Field label="Signature Style" hint="What you're known for. e.g. Hand-embroidered agbada">
          <TextInput value={local.brandSignatureStyle} onChange={set('brandSignatureStyle')} placeholder="e.g. Hand-embroidered agbada" />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field label="Payment Terms" hint="Up to 3 short terms printed on invoices. Each appears as a bullet point.">
          <div className={styles.termsList}>
            {local.brandPaymentTerms.map((term, i) => (
              <div key={i} className={styles.termRow}>
                <span className={styles.termBullet}>•</span>
                <div className={styles.termInputWrap}>
                  <input
                    className={styles.termInput}
                    type="text"
                    value={term}
                    maxLength={MAX_TERM_LENGTH}
                    onChange={e => setTerm(i, e.target.value)}
                    placeholder={termPlaceholder(i)}
                  />
                  <span className={`${styles.termCounter} ${term.length >= MAX_TERM_LENGTH ? styles.termCounterMax : ''}`}>
                    {term.length}/{MAX_TERM_LENGTH}
                  </span>
                </div>
                {local.brandPaymentTerms.length > 2 && (
                  <button className={styles.termRemove} onClick={() => removeTerm(i)}>
                    <span className="mi" style={{ fontSize: 16 }}>close</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {local.brandPaymentTerms.length < MAX_TERMS && (
            <button className={styles.addTermBtn} onClick={addTerm}>
              <span className="mi" style={{ fontSize: 16 }}>add</span>
              Add another term
            </button>
          )}
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
  )
}
