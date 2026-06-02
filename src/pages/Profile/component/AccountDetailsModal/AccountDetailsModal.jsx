import { useState } from "react"
import { FullModal } from "../FullModal/FullModal"
import { FieldGroup } from "../FieldGroup/FieldGroup"
import { Field } from "../Field/Field"
import { TextInput } from "../TextInput/TextInput"
import { useProfileSettings } from "../../../../contexts/ProfileSettingsContext"


export function AccountDetailsModal({ onBack, showToast }) {

  const { profileSettings, updateManyProfileSettings } = useProfileSettings()

  const [local, setLocal] = useState({
    accountBank: profileSettings.accountBank   || '',
    accountNumber: profileSettings.accountNumber || '',
    accountName: profileSettings.accountName   || '',
  })

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  const save = () => {
    updateManyProfileSettings(local)
    showToast('Account details saved')
    onBack()
  }

  return (
    <FullModal title="Account Details" onBack={onBack} onSave={save}>

      <FieldGroup>

        <Field label="Bank Name" hint="e.g. GTBank, Access, OPay">
          <TextInput value={local.accountBank} onChange={set('accountBank')} placeholder="e.g. GTBank" />
        </Field>

        <Field label="Account Number">
          <TextInput value={local.accountNumber} onChange={set('accountNumber')} placeholder="e.g. 0123456789" type="tel" />
        </Field>

        <Field label="Account Name" hint="Name registered on the bank account">
          <TextInput value={local.accountName} onChange={set('accountName')} placeholder="e.g. Amara Okonkwo" />
        </Field>

      </FieldGroup>

    </FullModal>
  )
}
