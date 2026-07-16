import { useState, useRef, useEffect } from 'react'
import { parseStoredPhone, buildPhoneNumber, savePersonalInfoLocally } from '../../utils'
import { useProfileSettings } from '../../../../contexts/ProfileSettingsContext'
import { FullModal } from '../FullModal/FullModal'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { Field } from '../Field/Field'
import { TextInput } from '../TextInput/TextInput'
import { PhoneField } from '../PhoneField/PhoneField'
import { updateProfile } from 'firebase/auth'
import { MONTHS, DAYS_IN_MONTH } from '../../datas'
import styles from './PersonalInfoModal.module.css'

function buildLocal(info) {
  return {
    fullName:   info.fullName   || '',
    email:      info.email      || '',
    city:       info.city       || '',
    country:    info.country    || '',
    sex:        info.sex        || '',
    birthMonth: info.birthMonth || '',
    birthDay:   info.birthDay   || '',
  }
}

export function PersonalInfoModal({ personalInfo, onBack, onSave, authUser }) {
  const { isLoading, updateManyProfileSettings } = useProfileSettings()
  const initializedRef = useRef(false)

  const parsed = parseStoredPhone(personalInfo.phone)
  const [saving,       setSaving]       = useState(false)
  const [local,        setLocal]        = useState(() => buildLocal(personalInfo))
  const [phoneLocal,   setPhoneLocal]   = useState(parsed.local)
  const [phoneCountry, setPhoneCountry] = useState(parsed.country)

  useEffect(() => {
    if (isLoading || initializedRef.current) return
    initializedRef.current = true
    const p = parseStoredPhone(personalInfo.phone)
    setLocal(buildLocal(personalInfo))
    setPhoneLocal(p.local)
    setPhoneCountry(p.country)
  }, [isLoading])

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  const handleMonthChange = month => {
    setLocal(p => {
      const maxDay     = DAYS_IN_MONTH[month] || 31
      const currentDay = parseInt(p.birthDay)
      return { ...p, birthMonth: month, birthDay: currentDay > maxDay ? '' : p.birthDay }
    })
  }

  const dayOptions = local.birthMonth
    ? Array.from({ length: DAYS_IN_MONTH[local.birthMonth] || 31 }, (_, i) => String(i + 1))
    : Array.from({ length: 31 }, (_, i) => String(i + 1))

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const builtPhone = buildPhoneNumber(phoneLocal, phoneCountry.dial_code) || phoneLocal
      const updated    = { ...personalInfo, ...local, phone: builtPhone }

      savePersonalInfoLocally(updated)

      updateManyProfileSettings({
        personalFullName:   updated.fullName,
        personalEmail:      updated.email,
        personalPhone:      updated.phone,
        personalCity:       updated.city,
        personalCountry:    updated.country,
        personalSex:        updated.sex,
        personalBirthMonth: updated.birthMonth,
        personalBirthDay:   updated.birthDay,
      })

      if (authUser && local.fullName && local.fullName !== authUser.displayName) {
        try {
          await updateProfile(authUser, { displayName: local.fullName.trim() })
        } catch {}
      }

      onSave(updated)
      onBack()
    } catch {
      onBack()
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <FullModal title="Personal Info" onBack={onBack}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ width: 28, height: 28, border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </FullModal>
    )
  }

  return (
    <FullModal title="Personal Info" onBack={onBack} onSave={saving ? undefined : handleSave}>

      <FieldGroup>

        <Field label="Full Name">
          <TextInput value={local.fullName} onChange={set('fullName')} placeholder="e.g. Amara Okonkwo" />
        </Field>

        <Field label="Email Address">
          <TextInput value={local.email} onChange={set('email')} placeholder="you@email.com" type="email" />
        </Field>

        <PhoneField
          label="Phone Number"
          localValue={phoneLocal}
          onLocalChange={setPhoneLocal}
          country={phoneCountry}
          onCountryChange={setPhoneCountry}
        />

      </FieldGroup>

      <FieldGroup>

        <Field label="City">
          <TextInput value={local.city} onChange={set('city')} placeholder="e.g. Lagos" />
        </Field>

        <Field label="Country">
          <TextInput value={local.country} onChange={set('country')} placeholder="e.g. Nigeria" />
        </Field>

      </FieldGroup>

      <FieldGroup>

        <Field label="Sex">
          <select
            className={styles.personalInfoSelect}
            style={{ width: '100%' }}
            value={local.sex}
            onChange={e => set('sex')(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </Field>

        <Field label="Birthday">
          <div className={styles.personalInfoRow}>
            <select
              className={styles.personalInfoSelect}
              value={local.birthMonth}
              onChange={e => handleMonthChange(e.target.value)}
            >
              <option value="">Month</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select
              className={styles.personalInfoSelect}
              value={local.birthDay}
              onChange={e => set('birthDay')(e.target.value)}
            >
              <option value="">Day</option>
              {dayOptions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </Field>

      </FieldGroup>

    </FullModal>
  )
}