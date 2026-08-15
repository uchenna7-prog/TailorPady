import { useState, useRef } from 'react'
import styles from './InvoiceSettingsModal.module.css'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { Field } from '../Field/Field'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { Textarea } from '../Textarea/Textarea'
import { TextInput } from '../TextInput/TextInput'
import { Toggle } from '../../components/Toggle/Toggle'
import { CurrencyPickerSheet } from '../CurrencyPickerSheet/CurrencyPickerSheet'

const DUE_DAY_PRESETS = [3, 7, 14, 21, 30, 45, 60, 90]

const DEFAULT_CURRENCY = {
  country: 'Nigeria',
  countryCode: 'NG',
  currencyCode: 'NGN',
  currencyName: 'Nigerian Naira',
  symbol: '₦',
}

function normaliseCurrency(raw) {
  if (!raw) return DEFAULT_CURRENCY
  if (typeof raw === 'string') return { ...DEFAULT_CURRENCY, symbol: raw }
  return raw
}

function FlagIcon({ countryCode }) {
  if (!countryCode) return <span className={styles.flagFallback}>🏳</span>
  return (
    <img
      src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png 2x`}
      alt=""
      width={24}
      height={18}
      className={styles.flagImg}
      loading="lazy"
    />
  )
}

function DueDayPicker({ value, onChange }) {
  const isCustom = !DUE_DAY_PRESETS.includes(value)

  const [showCustom, setShowCustom] = useState(isCustom)
  const [customValue, setCustomValue] = useState(isCustom ? String(value) : '')

  function selectPreset(days) {
    setShowCustom(false)
    onChange(days)
  }

  function activateCustom() {
    setShowCustom(true)
    onChange(parseInt(customValue, 10) || value)
  }

  function handleCustomChange(e) {
    const raw = e.target.value.replace(/\D/g, '')
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

  const [localGeneral, setLocalGeneral] = useState({
    invoicePrefix: generalSettings.invoicePrefix,
    invoiceCurrency: normaliseCurrency(generalSettings.invoiceCurrency),
    invoiceDueDays: generalSettings.invoiceDueDays ?? 7,
    invoiceShowTax: generalSettings.invoiceShowTax,
    invoiceTaxRate: generalSettings.invoiceTaxRate,
    invoiceFooter: generalSettings.invoiceFooter,
  })

  const [prefixError, setPrefixError] = useState(false)

  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const currencyTriggerRef = useRef(null)
  const prefixFieldRef = useRef(null)

  const setGeneral = key => val => {
    setLocalGeneral(p => ({ ...p, [key]: val }))
    if (key === 'invoicePrefix' && prefixError) setPrefixError(false)
  }

  function save() {
    if (!localGeneral.invoicePrefix?.trim()) {
      setPrefixError(true)
      prefixFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      showToast('Invoice number prefix is required')
      return
    }

    setPrefixError(false)
    updateManyGeneralSettings({ ...localGeneral })
    showToast('Invoice settings saved')
    onBack()
  }

  const currency = localGeneral.invoiceCurrency

  return (
    <>
      <FullModal title="Invoice Settings" onBack={onBack} onSave={save}>
        <div>

          <div className={styles.sectionLabel}>Invoice</div>
          <FieldGroup>
            <Field ref={prefixFieldRef} label="Invoice Number Prefix" hint="Shown before the number, e.g. INV-0042.">
              <TextInput
                value={localGeneral.invoicePrefix}
                onChange={setGeneral('invoicePrefix')}
                placeholder="INV"
                error={prefixError}
              />
            </Field>

            <Field label="Currency" hint="Default currency for new invoices.">
              <button
                ref={currencyTriggerRef}
                className={styles.currencyBtn}
                onClick={() => setCurrencyPickerOpen(v => !v)}
              >
                <div className={styles.currencyBtnLeft}>
                  <FlagIcon countryCode={currency.countryCode} />
                  <div className={styles.currencyText}>
                    <span className={styles.currencyCountry}>{currency.country}</span>
                    <span className={styles.currencyName}>{currency.currencyName}</span>
                  </div>
                </div>
                <div className={styles.currencyBtnRight}>
                  <span className={styles.currencyCode}>{currency.currencyCode}</span>
                  <span className="mi" style={{ fontSize: '1rem', color: 'var(--text3)' }}>expand_more</span>
                </div>
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
      </FullModal>

      <CurrencyPickerSheet
        anchorRef={currencyTriggerRef}
        isOpen={currencyPickerOpen}
        onClose={() => setCurrencyPickerOpen(false)}
        selected={currency}
        onSelect={setGeneral('invoiceCurrency')}
      />
    </>
  )
}
