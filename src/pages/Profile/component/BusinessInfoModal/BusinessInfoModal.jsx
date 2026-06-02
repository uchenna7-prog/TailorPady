import { useState } from "react"
import { FullModal } from "../FullModal/FullModal"
import { FieldGroup } from "../FieldGroup/FieldGroup"
import { Field } from "../Field/Field"
import { TextInput } from "../TextInput/TextInput"
import { Textarea } from "../Textarea/Textarea"
import { TurnaroundPicker } from "../TurnaroundPicker/TurnaroundPicker"
import { ServiceAreaPicker } from "../ServiceAreaPicker/ServiceAreaPicker"
import { useProfileSettings } from "../../../../contexts/ProfileSettingsContext"
import { AVAILABILITY_OPTIONS } from "../../datas"
import styles from "./BusinessInfoModal.module.css"

export function BusinessInfoModal({ onBack, showToast }) {

  const { profileSettings, updateManyProfileSettings } = useProfileSettings()

  const [local, setLocal] = useState({
    brandAvailability:   profileSettings.brandAvailability   || 'open',
    brandAvailableUntil: profileSettings.brandAvailableUntil || '',
    brandTurnaround:     profileSettings.brandTurnaround     || '1 weeks',
    brandServiceArea:    profileSettings.brandServiceArea    || '',
    brandStyleStatement: profileSettings.brandStyleStatement || '',
  })

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  const save = () => {
    updateManyProfileSettings(local)
    showToast('Business info saved')
    onBack()
  }

  return (
    <FullModal title="Business Info" onBack={onBack} onSave={save}>

      <FieldGroup>

        <Field label="Availability">
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

      <FieldGroup>

        <Field label="Standard Turnaround Time" hint="How long does it typically take to complete an order?">
          <TurnaroundPicker value={local.brandTurnaround} onChange={set('brandTurnaround')} />
        </Field>

      </FieldGroup>

      <FieldGroup>

        <Field label="Service Area" hint="Select all states you deliver or offer services to.">
          <ServiceAreaPicker value={local.brandServiceArea} onChange={set('brandServiceArea')} />
        </Field>

      </FieldGroup>

      <FieldGroup>

        <Field label="Style Statement" hint="Describe your craft style. Shown on your portfolio.">
          <Textarea
            value={local.brandStyleStatement}
            onChange={set('brandStyleStatement')}
            placeholder="e.g. I specialise in bold Ankara fusion pieces that blend traditional Yoruba aesthetics with modern silhouettes…"
            rows={6}
          />
        </Field>

      </FieldGroup>

    </FullModal>
  )
}