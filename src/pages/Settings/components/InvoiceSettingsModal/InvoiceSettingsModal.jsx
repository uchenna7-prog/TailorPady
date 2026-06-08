import { useState } from 'react'
import styles from './InvoiceSettingsModal.module.css'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { useProfileSettings } from '../../../../contexts/ProfileSettingsContext'
import { Field } from '../Field/Field'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { Textarea } from '../Textarea/Textarea'
import { TextInput } from '../TextInput/TextInput'
import { Toggle } from '../../components/Toggle/Toggle'
import { CurrencyPickerSheet } from '../CurrencyPickerSheet/CurrencyPickerSheet'


const DUE_DAY_PRESETS = [3, 7, 14, 21, 30, 45, 60, 90]
const MAX_TERMS       = 3
const MAX_TERM_LENGTH = 60


function DueDayPicker({ value, onChange }) {
  const isCustom = !DUE_DAY_PRESETS.includes(value)

  const [showCustom, setShowCustom]   = useState(isCustom)
  const [customValue, setCustomValue] = useState(isCustom ? String(value) : '')

  function selectPreset(days) {
    setShowCustom(false)
    onChange(days)
  }

  function activateCustom() {
    setShowCustom(true)
    const days = parseInt(customValue, 10) || value
    onChange(days)
  }

  function handleCustomChange(e) {
    const raw  = e.target.value.replace(/\D/g, '')
    setCustomValue(raw)
    const days = parseInt(raw, 10)
    if (days > 0) onChange(days)
  }

  function handleCustomBlur() {
    const days = parseInt(customValue, 10)
    if (!days || days < 1) {
      setCustomValue('1')
      onChange(1)
    }
  }

  return (
    <div className={styles.duePicker}>
      <div className={styles.dueChips}>
        {DUE_DAY_PRESETS.map(days => (
          <button
            key={days}
            className={`${styles.chip} ${!showCustom && value === days ? styles.chipActive : ''}`}
            onClick={() => selectPreset(days)}
          >
            {days}d
          </button>
        ))}
        <button
          className={`${styles.chip} ${showCustom ? styles.chipActive : ''}`}
          onClick={activateCustom}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <div className={styles.customRow}>
          <input
            type="number"
            className={styles.customInput}
            value={customValue}
            onChange={handleCustomChange}
            onBlur={handleCustomBlur}
            min={1}
            inputMode="numeric"
            placeholder="e.g. 45"
          />
          <span className={styles.customUnit}>days</span>
        </div>
      )}
    </div>
  )
}


export function InvoiceSettingsModal({ onBack, showToast }) {

  const { generalSettings, updateManyGeneralSettings } = useGeneralSettings()
  const { profileSettings, updateManyProfileSettings } = useProfileSettings()

  const parseTerms = raw => {
    if (Array.isArray(raw)) return raw.length > 0 ? raw : ['', '']
    if (typeof raw === 'string' && raw.trim()) return raw.split('\n').filter(Boolean)
    return ['', '']
  }

  const [localGeneral, setLocalGeneral] = useState({
    invoicePrefix:   generalSettings.invoicePrefix,
    invoiceCurrency: typeof generalSettings.invoiceCurrency === 'object'
                       ? (generalSettings.invoiceCurrency?.symbol ?? '₦')
                       : (generalSettings.invoiceCurrency ?? '₦'),
    invoiceDueDays:  generalSettings.invoiceDueDays ?? 7,
    invoiceShowTax:  generalSettings.invoiceShowTax,
    invoiceTaxRate:  generalSettings.invoiceTaxRate,
    invoiceFooter:   generalSettings.invoiceFooter,
  })

  const [localProfile, setLocalProfile] = useState({
    accountBank:       profileSettings.accountBank       || '',
    accountNumber:     profileSettings.accountNumber     || '',
    accountName:       profileSettings.accountName       || '',
    brandPaymentTerms: parseTerms(profileSettings.brandPaymentTerms),
  })

  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false)

  const setGeneral = key => val => setLocalGeneral(p => ({ ...p, [key]: val }))
  const setProfile = key => val => setLocalProfile(p => ({ ...p, [key]: val }))

  const setTerm = (index, value) => {
    setLocalProfile(p => {
      const updated = [...p.brandPaymentTerms]
      updated[index] = value
      return { ...p, brandPaymentTerms: updated }
    })
  }

  const addTerm = () => {
    if (localProfile.brandPaymentTerms.length >= MAX_TERMS) return
    setLocalProfile(p => ({ ...p, brandPaymentTerms: [...p.brandPaymentTerms, ''] }))
  }

  const removeTerm = index => {
    setLocalProfile(p => {
      const updated = p.brandPaymentTerms.filter((_, i) => i !== index)
      const padded  = updated.length >= 2 ? updated : updated.concat(Array(2 - updated.length).fill(''))
      return { ...p, brandPaymentTerms: padded }
    })
  }

  const termPlaceholder = i => {
    if (i === 0) return 'e.g. 50% deposit required before cutting begins'
    if (i === 1) return 'e.g. Balance due on pickup'
    return 'Add another term…'
  }

  function save() {
    const filledTerms = localProfile.brandPaymentTerms.filter(t => t.trim())
    updateManyGeneralSettings({ ...localGeneral })
    updateManyProfileSettings({ ...localProfile, brandPaymentTerms: filledTerms })
    showToast('Invoice settings saved')
    onBack()
  }

  return (
    <FullModal title="Invoice Settings" onBack={onBack} onSave={save}>
      <div>

        <div className={styles.sectionLabel}>Invoice</div>
        <FieldGroup>
          <Field label="Invoice Number Prefix" hint="Shown before the number, e.g. INV-0042.">
            <TextInput
              value={localGeneral.invoicePrefix}
              onChange={setGeneral('invoicePrefix')}
              placeholder="INV"
            />
          </Field>
          <Field label="Currency" hint="Default currency for new invoices.">
            <button
              className={styles.currencyBtn}
              onClick={() => setIsCurrencySheetOpen(true)}
            >
              <span className={styles.currencyBtnText}>{localGeneral.invoiceCurrency}</span>
              <span className="mi" style={{ fontSize: '1rem', color: 'var(--text-sub)' }}>expand_more</span>
            </button>
          </Field>
          <Field label="Default Due Period" hint="Days after issue date the invoice is due.">
            <DueDayPicker
              value={localGeneral.invoiceDueDays}
              onChange={setGeneral('invoiceDueDays')}
            />
          </Field>
        </FieldGroup>

        <div style={{ height: 20 }} />

        <div className={styles.sectionLabel}>Tax</div>
        <FieldGroup>
          <div
            className={styles.row}
            style={{ borderBottom: localGeneral.invoiceShowTax ? '1px solid var(--border)' : 'none' }}
          >
            <div className={styles.rowIcon}>
              <span className="mi" style={{ fontSize: '1.15rem' }}>percent</span>
            </div>
            <div className={styles.rowText}>
              <div className={styles.rowLabel}>Show Tax Line</div>
              <div className={styles.rowSub}>Add a VAT / tax row to invoice totals</div>
            </div>
            <div className={styles.rowRight}>
              <Toggle value={localGeneral.invoiceShowTax} onChange={setGeneral('invoiceShowTax')} />
            </div>
          </div>
          {localGeneral.invoiceShowTax && (
            <Field label="Tax Rate (%)" hint="e.g. 7.5 for 7.5% VAT">
              <TextInput
                type="number"
                value={String(localGeneral.invoiceTaxRate)}
                onChange={v => setGeneral('invoiceTaxRate')(parseFloat(v) || 0)}
                placeholder="7.5"
              />
            </Field>
          )}
        </FieldGroup>

        <div style={{ height: 20 }} />

        <div className={styles.sectionLabel}>Payment Details</div>
        <FieldGroup>
          <Field label="Bank Name" hint="e.g. GTBank, Access, OPay">
            <TextInput
              value={localProfile.accountBank}
              onChange={setProfile('accountBank')}
              placeholder="e.g. GTBank"
            />
          </Field>
          <Field label="Account Number">
            <TextInput
              value={localProfile.accountNumber}
              onChange={setProfile('accountNumber')}
              placeholder="e.g. 0123456789"
              type="tel"
            />
          </Field>
          <Field label="Account Name" hint="Name registered on the bank account">
            <TextInput
              value={localProfile.accountName}
              onChange={setProfile('accountName')}
              placeholder="e.g. Amara Okonkwo"
            />
          </Field>
        </FieldGroup>

        <div style={{ height: 20 }} />

        <div className={styles.sectionLabel}>Payment Terms</div>
        <FieldGroup>
          <Field hint="Up to 3 short terms printed on invoices. Each appears as a bullet point.">
            <div className={styles.termsList}>
              {localProfile.brandPaymentTerms.map((term, i) => (
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
                  {localProfile.brandPaymentTerms.length > 2 && (
                    <button className={styles.termRemove} onClick={() => removeTerm(i)}>
                      <span className="mi" style={{ fontSize: 16 }}>close</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {localProfile.brandPaymentTerms.length < MAX_TERMS && (
              <button className={styles.addTermBtn} onClick={addTerm}>
                <span className="mi" style={{ fontSize: 16 }}>add</span>
                Add another term
              </button>
            )}
          </Field>
        </FieldGroup>

        <div style={{ height: 20 }} />

        <div className={styles.sectionLabel}>Footer</div>
        <FieldGroup>
          <Field label="Invoice Footer Text" hint="Printed at the bottom of every invoice.">
            <Textarea
              value={localGeneral.invoiceFooter}
              onChange={setGeneral('invoiceFooter')}
              placeholder="Thank you for your patronage 🙏"
              rows={3}
            />
          </Field>
        </FieldGroup>

        <div style={{ height: 8 }} />

      </div>

      <CurrencyPickerSheet
        isOpen={isCurrencySheetOpen}
        currentSymbol={localGeneral.invoiceCurrency}
        onSelect={setGeneral('invoiceCurrency')}
        onClose={() => setIsCurrencySheetOpen(false)}
      />

    </FullModal>
  )
}