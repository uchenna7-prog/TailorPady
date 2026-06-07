import { useState, useRef } from 'react'
import styles from './PortfolioSettingsModal.module.css'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { Field } from '../Field/Field'
import { FieldGroup } from '../FieldGroup/FieldGroup'


function ImagePicker({ label, hint, value, onChange, aspectRatio = 'wide', shape = 'square' }) {
  const inputRef = useRef(null)
  const isWide = aspectRatio === 'wide'

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onChange({ file, url, name: file.name })
    e.target.value = ''
  }

  function handleRemove() {
    onChange(null)
  }

  return (
    <Field label={label} hint={hint}>
      <div className={`${styles.imgPicker} ${isWide ? styles.imgPickerWide : ''}`}>
        <div
          className={`${styles.imgPreview} ${isWide ? styles.imgPreviewWide : ''} ${shape === 'circle' ? styles.imgPreviewCircle : ''} ${value ? styles.imgPreviewHasImg : ''}`}
        >
          {value ? (
            <img src={value.url} alt={label} className={styles.imgPreviewImg} />
          ) : (
            <div className={styles.imgPreviewPlaceholder}>
              <span className="mi" style={{ fontSize: '1.4rem', color: 'var(--text3)' }}>
                {shape === 'circle' ? 'person' : 'image'}
              </span>
              <span className={styles.imgPreviewNone}>No image</span>
            </div>
          )}
          {value && (
            <div className={styles.imgPreviewBadge}>Custom</div>
          )}
        </div>

        <div className={`${styles.imgControls} ${isWide ? styles.imgControlsWide : ''}`}>
          <button
            className={styles.uploadBtn}
            onClick={() => inputRef.current?.click()}
          >
            <span className="mi" style={{ fontSize: '1rem' }}>upload</span>
            <span>Upload image</span>
          </button>
          <button
            className={styles.removeBtn}
            onClick={handleRemove}
            disabled={!value}
          >
            <span className="mi" style={{ fontSize: '0.95rem' }}>delete</span>
            <span>Remove</span>
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </Field>
  )
}


export function PortfolioSettingsModal({ onBack, showToast }) {
  const { generalSettings, updateManyGeneralSettings } = useGeneralSettings()

  const [local, setLocal] = useState({
    heroBgImage:       generalSettings.heroBgImage       ?? null,
    heroAvatarImage:   generalSettings.heroAvatarImage   ?? null,
    footerBgImage:     generalSettings.footerBgImage     ?? null,
    footerLogoImage:   generalSettings.footerLogoImage   ?? null,
  })

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  function save() {
    updateManyGeneralSettings(local)
    showToast('Portfolio settings saved')
    onBack()
  }

  return (
    <FullModal title="Portfolio Settings" onBack={onBack} onSave={save}>
      <div>

        <div className={styles.sectionLabel}>Hero Section</div>

        <FieldGroup>
          <ImagePicker
            label="Background Image"
            hint="Full-width hero banner background. Recommended: 1920×1080px."
            value={local.heroBgImage}
            onChange={set('heroBgImage')}
            aspectRatio="wide"
          />
          <ImagePicker
            label="Profile / Avatar"
            hint="Your photo shown on the hero. Recommended: 400×400px square."
            value={local.heroAvatarImage}
            onChange={set('heroAvatarImage')}
            aspectRatio="square"
            shape="circle"
          />
        </FieldGroup>

        <div style={{ height: 12 }} />
        <div className={styles.sectionLabel}>Footer Section</div>

        <FieldGroup>
          <ImagePicker
            label="Footer Background Image"
            hint="Optional background behind footer content. Leave empty for a solid color."
            value={local.footerBgImage}
            onChange={set('footerBgImage')}
            aspectRatio="wide"
          />
          <ImagePicker
            label="Footer Logo"
            hint="Brand mark shown in the footer. PNG with transparency works best."
            value={local.footerLogoImage}
            onChange={set('footerLogoImage')}
            aspectRatio="square"
          />
        </FieldGroup>

      </div>
    </FullModal>
  )
}