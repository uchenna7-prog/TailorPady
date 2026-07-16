import { useState, useRef, useEffect } from 'react'
import { FullModal } from '../FullModal/FullModal'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { PhoneField } from '../PhoneField/PhoneField'
import { Field } from '../Field/Field'
import { TextInput } from '../TextInput/TextInput'
import { Textarea } from '../Textarea/Textarea'
import { buildPhoneNumber, parseStoredPhone } from '../../utils'
import { useProfileSettings } from '../../../../contexts/ProfileSettingsContext'

function buildLocal(ps) {
  return {
    brandEmail:   ps.brandEmail   || '',
    brandAddress: ps.brandAddress || '',
    brandWebsite: ps.brandWebsite || '',
  }
}

export function BusinessContactModal({ onBack, showToast }) {
  const { profileSettings, isLoading, updateManyProfileSettings } = useProfileSettings()
  const initializedRef = useRef(false)

  const parsed = parseStoredPhone(profileSettings.brandPhone)

  const [local,        setLocal]        = useState(() => buildLocal(profileSettings))
  const [phoneLocal,   setPhoneLocal]   = useState(parsed.local)
  const [phoneCountry, setPhoneCountry] = useState(parsed.country)

  useEffect(() => {
    if (isLoading || initializedRef.current) return
    initializedRef.current = true
    const p = parseStoredPhone(profileSettings.brandPhone)
    setLocal(buildLocal(profileSettings))
    setPhoneLocal(p.local)
    setPhoneCountry(p.country)
  }, [isLoading])

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  const save = () => {
    const builtPhone = buildPhoneNumber(phoneLocal, phoneCountry.dial_code) || phoneLocal
    updateManyProfileSettings({ ...local, brandPhone: builtPhone })
    showToast('Business contact saved')
    onBack()
  }

  if (isLoading) {
    return (
      <FullModal title="Business Contact" onBack={onBack}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ width: 28, height: 28, border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </FullModal>
    )
  }

  return (
    <FullModal title="Business Contact" onBack={onBack} onSave={save}>

      <FieldGroup>

        <PhoneField
          label="Business Phone"
          localValue={phoneLocal}
          onLocalChange={setPhoneLocal}
          country={phoneCountry}
          onCountryChange={setPhoneCountry}
        />

        <Field label="Business Email">
          <TextInput value={local.brandEmail} onChange={set('brandEmail')} placeholder="shop@email.com" type="email" />
        </Field>

        <Field label="Business Address">
          <Textarea value={local.brandAddress} onChange={set('brandAddress')} placeholder="12 Tailor Street, Ikeja, Lagos" rows={2} />
        </Field>

        <Field label="Website / Social Handle">
          <TextInput value={local.brandWebsite} onChange={set('brandWebsite')} placeholder="instagram.com/yourbrand" />
        </Field>

      </FieldGroup>

    </FullModal>
  )
}