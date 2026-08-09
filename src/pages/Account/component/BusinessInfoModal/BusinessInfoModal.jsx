import { useState, useRef, useEffect } from 'react'
import { FullModal } from '../FullModal/FullModal'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { PhoneField } from '../PhoneField/PhoneField'
import { Field } from '../Field/Field'
import { TextInput } from '../TextInput/TextInput'
import { Textarea } from '../Textarea/Textarea'
import { buildPhoneNumber, parseStoredPhone } from '../../utils'
import { useProfileSettings } from '../../../../contexts/ProfileSettingsContext'
import styles from './BusinessInfoModal.module.css'

const MAX_TERMS = 3
const MAX_TERM_LENGTH = 60

function parseTerms(raw) {
  if (Array.isArray(raw)) return raw.length > 0 ? raw : ['', '']
  if (typeof raw === 'string' && raw.trim()) return raw.split('\n').filter(Boolean)
  return ['', '']
}

function buildLocal(ps) {
  return {
    brandEmail: ps.brandEmail || '',
    brandAddress: ps.brandAddress || '',
    brandWebsite: ps.brandWebsite || '',
    accountBank: ps.accountBank || '',
    accountNumber: ps.accountNumber || '',
    accountName: ps.accountName || '',
    brandPaymentTerms: parseTerms(ps.brandPaymentTerms),
  }
}

function autoGrow(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

export function BusinessInfoModal({ onBack, showToast }) {
  const { profileSettings, isLoading, updateManyProfileSettings } = useProfileSettings()
  const initializedRef = useRef(false)
  const termRefs = useRef([])

  const parsed = parseStoredPhone(profileSettings.brandPhone)

  const [local, setLocal] = useState(() => buildLocal(profileSettings))
  const [phoneLocal, setPhoneLocal] = useState(parsed.local)
  const [phoneCountry, setPhoneCountry] = useState(parsed.country)

  useEffect(() => {
    if (isLoading || initializedRef.current) return
    initializedRef.current = true
    const p = parseStoredPhone(profileSettings.brandPhone)
    setLocal(buildLocal(profileSettings))
    setPhoneLocal(p.local)
    setPhoneCountry(p.country)
  }, [isLoading])

  useEffect(() => {
    termRefs.current.forEach(autoGrow)
  }, [local.brandPaymentTerms])

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
      const padded = updated.length >= 2 ? updated : updated.concat(Array(2 - updated.length).fill(''))
      return { ...p, brandPaymentTerms: padded }
    })
  }

  const termPlaceholder = i => {
    if (i === 0) return 'e.g. 50% deposit required before cutting begins'
    if (i === 1) return 'e.g. Balance due on pickup'
    return 'Add another term…'
  }

  const save = () => {
    const builtPhone = buildPhoneNumber(phoneLocal, phoneCountry.dial_code) || phoneLocal
    const filledTerms = local.brandPaymentTerms.filter(t => t.trim())
    updateManyProfileSettings({ ...local, brandPhone: builtPhone, brandPaymentTerms: filledTerms })
    showToast('Business info saved')
    onBack()
  }

  if (isLoading) {
    return (
      <FullModal title="Business Info" onBack={onBack}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ width: 28, height: 28, border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </FullModal>
    )
  }

  return (
    <FullModal title="Business Info" onBack={onBack} onSave={save}>

      <div className={styles.sectionLabel}>Contact</div>
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

      <div style={{ height: 20 }} />

      <div className={styles.sectionLabel}>Payment Details</div>
      <div className={styles.sectionHint}>These appear on your invoices so customers know exactly where to pay you.</div>
      <FieldGroup>
        <Field label="Bank Name" hint="e.g. GTBank, Access, OPay">
          <TextInput
            value={local.accountBank}
            onChange={set('accountBank')}
            placeholder="e.g. GTBank"
          />
        </Field>
        <Field label="Account Number">
          <TextInput
            value={local.accountNumber}
            onChange={set('accountNumber')}
            placeholder="e.g. 0123456789"
            type="tel"
          />
        </Field>
        <Field label="Account Name" hint="Name registered on the bank account">
          <TextInput
            value={local.accountName}
            onChange={set('accountName')}
            placeholder="e.g. Amara Okonkwo"
          />
        </Field>
      </FieldGroup>

      <div style={{ height: 20 }} />

      <div className={styles.sectionLabel}>Payment Terms</div>
      <div className={styles.sectionHint}>Short bullet points printed on invoices to set payment expectations upfront.</div>
      <FieldGroup>
        <Field hint="Up to 3 short terms printed on invoices. Each appears as a bullet point.">
          <div className={styles.termsList}>
            {local.brandPaymentTerms.map((term, i) => (
              <div key={i} className={styles.termRow}>
                <span className={styles.termBullet}>•</span>
                <div className={styles.termInputWrap}>
                  <textarea
                    ref={el => { termRefs.current[i] = el; autoGrow(el) }}
                    className={styles.termInput}
                    rows={1}
                    value={term}
                    maxLength={MAX_TERM_LENGTH}
                    onChange={e => { setTerm(i, e.target.value); autoGrow(e.target) }}
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

    </FullModal>
  )
}
