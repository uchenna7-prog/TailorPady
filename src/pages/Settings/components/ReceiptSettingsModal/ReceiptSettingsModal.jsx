import { useState, useRef } from 'react'
import styles from './ReceiptSettingsModal.module.css'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { Field } from '../Field/Field'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { Textarea } from '../Textarea/Textarea'
import { TextInput } from '../TextInput/TextInput'
import { Toggle } from '../../components/Toggle/Toggle'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { CurrencyPickerSheet } from '../CurrencyPickerSheet/CurrencyPickerSheet'

const DEFAULT_CURRENCY = {
  country:      'Nigeria',
  countryCode:  'NG',
  currencyCode: 'NGN',
  currencyName: 'Nigerian Naira',
  symbol:       '₦',
}

function normaliseCurrency(raw) {
  if (!raw) return DEFAULT_CURRENCY
  if (typeof raw === 'string') return { ...DEFAULT_CURRENCY, symbol: raw }
  return raw
}

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🏳'
  return countryCode
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('')
}


export function ReceiptSettingsModal({ onBack, showToast }) {

  const { generalSettings, updateManyGeneralSettings } = useGeneralSettings()

  const [local, setLocal] = useState({
    receiptPrefix:   generalSettings.receiptPrefix  ?? 'RCP',
    receiptCurrency: normaliseCurrency(generalSettings.receiptCurrency),
    receiptFooter:   generalSettings.receiptFooter  ?? '',
    receiptShowTax:  generalSettings.receiptShowTax ?? false,
    receiptTaxRate:  generalSettings.receiptTaxRate ?? 0,
  })

  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const currencyTriggerRef                          = useRef(null)

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  function save() {
    updateManyGeneralSettings(local)
    showToast('Receipt settings saved')
    onBack()
  }

  const currency = local.receiptCurrency

  return (
    <>
      <FullModal title="Receipt Settings" onBack={onBack} onSave={save}>
        <div>

          <FieldGroup>
            <Field label="Receipt Number Prefix" hint="Shown before the number, e.g. RCP-0001.">
              <TextInput
                value={local.receiptPrefix}
                onChange={set('receiptPrefix')}
                placeholder="RCP"
              />
            </Field>

            <Field label="Currency" hint="Default currency for new receipts.">
              <button
                ref={currencyTriggerRef}
                className={styles.currencyBtn}
                onClick={() => setCurrencyPickerOpen(v => !v)}
              >
                <div className={styles.currencyBtnLeft}>
                  <span className={styles.currencyFlag}>{getFlagEmoji(currency.countryCode)}</span>
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
          </FieldGroup>

          <div style={{ height: 12 }} />

          <FieldGroup>
            <div
              className={styles.row}
              style={{ borderBottom: local.receiptShowTax ? '1px solid var(--border)' : 'none' }}
            >
              <div className={styles.rowIcon}>
                <span className="mi" style={{ fontSize: '1.15rem' }}>percent</span>
              </div>
              <div className={styles.rowText}>
                <div className={styles.rowLabel}>Show Tax Line</div>
                <div className={styles.rowSub}>Add a VAT / tax row to receipt totals</div>
              </div>
              <div className={styles.rowRight}>
                <Toggle value={local.receiptShowTax} onChange={set('receiptShowTax')} />
              </div>
            </div>
            {local.receiptShowTax && (
              <Field label="Tax Rate (%)" hint="e.g. 7.5 for 7.5% VAT">
                <TextInput
                  type="number"
                  value={String(local.receiptTaxRate)}
                  onChange={v => set('receiptTaxRate')(parseFloat(v) || 0)}
                  placeholder="7.5"
                />
              </Field>
            )}
          </FieldGroup>

          <div style={{ height: 12 }} />

          <FieldGroup>
            <Field label="Receipt Footer Text" hint="Printed at the bottom of every receipt.">
              <Textarea
                value={local.receiptFooter}
                onChange={set('receiptFooter')}
                placeholder="Thank you for your payment 🙏"
                rows={3}
              />
            </Field>
          </FieldGroup>

        </div>
      </FullModal>

      <CurrencyPickerSheet
        anchorRef={currencyTriggerRef}
        isOpen={currencyPickerOpen}
        onClose={() => setCurrencyPickerOpen(false)}
        selected={currency}
        onSelect={set('receiptCurrency')}
      />
    </>
  )
}