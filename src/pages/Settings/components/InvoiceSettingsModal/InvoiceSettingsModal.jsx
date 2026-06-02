import { useState } from 'react'
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
    const days = parseInt(customValue, 10) || value
    onChange(days)
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

  const [local, setLocal] = useState({
    invoicePrefix:    generalSettings.invoicePrefix,
    invoiceCurrency:  typeof generalSettings.invoiceCurrency === 'object'
                        ? (generalSettings.invoiceCurrency?.symbol ?? '₦')
                        : (generalSettings.invoiceCurrency ?? '₦'),
    invoiceDueDays:   generalSettings.invoiceDueDays ?? 7,
    invoiceShowTax:   generalSettings.invoiceShowTax,
    invoiceTaxRate:   generalSettings.invoiceTaxRate,
    invoiceFooter:    generalSettings.invoiceFooter,
  })

  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false)

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  function save() {
    updateManyGeneralSettings(local)
    showToast('Invoice settings saved')
    onBack()
  }

  return (
    <FullModal title="Invoice Settings" onBack={onBack} onSave={save}>
      <div>

        <FieldGroup>
          <Field label="Invoice Number Prefix" hint="Shown before the number, e.g. INV-0042.">
            <TextInput
              value={local.invoicePrefix}
              onChange={set('invoicePrefix')}
              placeholder="INV"
            />
          </Field>

          <Field label="Currency" hint="Default currency for new invoices.">
            <button
              className={styles.currencyBtn}
              onClick={() => setIsCurrencySheetOpen(true)}
            >
              <span className={styles.currencyBtnText}>{local.invoiceCurrency}</span>
              <span className="mi" style={{ fontSize: '1rem', color: 'var(--text-sub)' }}>expand_more</span>
            </button>
          </Field>

          <Field label="Default Due Period" hint="Days after issue date the invoice is due.">
            <DueDayPicker
              value={local.invoiceDueDays}
              onChange={set('invoiceDueDays')}
            />
          </Field>
        </FieldGroup>

        <div style={{ height: 12 }} />

        <FieldGroup>
          <div
            className={styles.row}
            style={{ borderBottom: local.invoiceShowTax ? '1px solid var(--border)' : 'none' }}
          >
            <div className={styles.rowIcon}>
              <span className="mi" style={{ fontSize: '1.15rem' }}>percent</span>
            </div>
            <div className={styles.rowText}>
              <div className={styles.rowLabel}>Show Tax Line</div>
              <div className={styles.rowSub}>Add a VAT / tax row to invoice totals</div>
            </div>
            <div className={styles.rowRight}>
              <Toggle value={local.invoiceShowTax} onChange={set('invoiceShowTax')} />
            </div>
          </div>
          {local.invoiceShowTax && (
            <Field label="Tax Rate (%)" hint="e.g. 7.5 for 7.5% VAT">
              <TextInput
                type="number"
                value={String(local.invoiceTaxRate)}
                onChange={v => set('invoiceTaxRate')(parseFloat(v) || 0)}
                placeholder="7.5"
              />
            </Field>
          )}
        </FieldGroup>

        <div style={{ height: 12 }} />

        <FieldGroup>
          <Field label="Invoice Footer Text" hint="Printed at the bottom of every invoice.">
            <Textarea
              value={local.invoiceFooter}
              onChange={set('invoiceFooter')}
              placeholder="Thank you for your patronage 🙏"
              rows={3}
            />
          </Field>
        </FieldGroup>

      </div>

      <CurrencyPickerSheet
        isOpen={isCurrencySheetOpen}
        currentSymbol={local.invoiceCurrency}
        onSelect={set('invoiceCurrency')}
        onClose={() => setIsCurrencySheetOpen(false)}
      />

    </FullModal>
  )
}
