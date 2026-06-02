import { useState,useRef } from "react"
import { FullModal } from "../FullModal/FullModal"
import { FieldGroup } from "../FieldGroup/FieldGroup"
import { PhoneField } from "../PhoneField/PhoneField"
import { Field } from "../Field/Field"
import { TextInput } from "../TextInput/TextInput"
import { Textarea } from "../Textarea/Textarea"
import { buildPhoneNumber } from "../../utils"
import { useProfileSettings } from "../../../../contexts/ProfileSettingsContext"
import { parseStoredPhone } from "../../utils"


export function BusinessContactModal({ onBack, showToast }) {


  const { profileSettings, updateManyProfileSettings } = useProfileSettings()
  const parsedBrandPhone = parseStoredPhone(profileSettings.brandPhone)

  const [local, setLocal] = useState({
    brandEmail:  profileSettings.brandEmail || '',
    brandAddress: profileSettings.brandAddress || '',
    brandWebsite: profileSettings.brandWebsite || '',
  })
  const [phoneLocal,   setPhoneLocal]   = useState(parsedBrandPhone.local)
  const [phoneCountry, setPhoneCountry] = useState(parsedBrandPhone.country)

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  const save = () => {
    const builtPhone = buildPhoneNumber(phoneLocal, phoneCountry.dial_code) || phoneLocal
    updateManyProfileSettings({ ...local, brandPhone: builtPhone })
    showToast('Business contact saved')
    onBack()
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
