import { useState } from 'react'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { CurrencyPickerSheet } from '../CurrencyPickerSheet/CurrencyPickerSheet'
import { SegmentControl } from '../../components/SegmentControl/SegmentControl'
import { Field } from '../Field/Field'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import styles from './CurrencyModal.module.css'


function formatPreview(currency, symbolPosition, decimals, numberFormat) {

  const symbol = currency?.symbol ?? '₦'
  const amount = 1234.5

  const thousands = numberFormat === 'francophone' ? '\u00A0' : ','
  const decimal   = numberFormat === 'francophone' ? ','       : '.'

  const [whole, fraction] = amount.toFixed(2).split('.')
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousands)
  const formattedAmount = decimals === 0
    ? formattedWhole
    : `${formattedWhole}${decimal}${fraction}`

  return symbolPosition === 'prefix'
    ? `${symbol}${formattedAmount}`
    : `${formattedAmount} ${symbol}`
}


export function CurrencyModal({ currentSettings, onBack, onSave }) {

  const [currency, setCurrency]           = useState(currentSettings?.currency ?? null)
  const [symbolPosition, setSymbolPosition] = useState(currentSettings?.symbolPosition ?? 'prefix')
  const [decimals, setDecimals]           = useState(currentSettings?.decimals ?? 2)
  const [numberFormat, setNumberFormat]   = useState(currentSettings?.numberFormat ?? 'anglophone')
  const [pickerOpen, setPickerOpen]       = useState(false)

  const preview = formatPreview(currency, symbolPosition, decimals, numberFormat)

  function handleSave() {
    onSave({ currency, symbolPosition, decimals, numberFormat })
  }

  return (
    <>
      <FullModal title="Apps's Currency" onBack={onBack} onSave={handleSave}>
        <div>

          <FieldGroup>
            <Field
              label="Default currency"
              hint="Used across your dashboard, totals, and reports. You can still bill clients in a different currency on individual invoices and receipts."
            >
              <button
                className={styles.currencyBtn}
                onClick={() => setPickerOpen(true)}
              >
                <div className={styles.currencyBtnLeft}>
                  {currency ? (
                    <>
                      <span className={styles.currencyFlag}>{getFlagEmoji(currency.countryCode)}</span>
                      <div className={styles.currencyText}>
                        <span className={styles.currencyCountry}>{currency.country}</span>
                        <span className={styles.currencyName}>{currency.currencyName}</span>
                      </div>
                    </>
                  ) : (
                    <span className={styles.currencyPlaceholder}>Select a currency</span>
                  )}
                </div>
                <div className={styles.currencyBtnRight}>
                  {currency && <span className={styles.currencyCode}>{currency.currencyCode}</span>}
                  <span className="mi" style={{ fontSize: '1rem', color: 'var(--text-sub)' }}>expand_more</span>
                </div>
              </button>
            </Field>
          </FieldGroup>

          <div style={{ height: 12 }} />

          <FieldGroup>
            <Field label="Symbol position" hint="Where the currency symbol appears next to amounts.">
              <SegmentControl
                options={[
                  { label: `${currency?.symbol ?? '₦'} Prefix`, value: 'prefix' },
                  { label: `Suffix ${currency?.symbol ?? '₦'}`, value: 'suffix' },
                ]}
                value={symbolPosition}
                onChange={setSymbolPosition}
              />
            </Field>

            <Field label="Decimal places" hint="How many decimal places to show on amounts.">
              <SegmentControl
                options={[
                  { label: 'None',      value: 0 },
                  { label: '2 places',  value: 2 },
                ]}
                value={decimals}
                onChange={setDecimals}
              />
            </Field>

            <Field label="Number format" hint="Anglophone uses commas and periods. Francophone uses spaces and commas.">
              <SegmentControl
                options={[
                  { label: '1,234.50', value: 'anglophone' },
                  { label: '1 234,50', value: 'francophone' },
                ]}
                value={numberFormat}
                onChange={setNumberFormat}
              />
            </Field>
          </FieldGroup>

          <div style={{ height: 12 }} />

          <FieldGroup>
            <Field label="Preview" hint="How amounts will appear across your app.">
              <div className={styles.preview}>
                <span className={styles.previewAmount}>{preview}</span>
              </div>
            </Field>
          </FieldGroup>

        </div>
      </FullModal>

      <CurrencyPickerSheet
        isOpen={pickerOpen}
        currentCurrency={currency}
        onClose={() => setPickerOpen(false)}
        onSelect={c => {
          setCurrency(c)
          setPickerOpen(false)
        }}
      />
    </>
  )
}


function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🏳'
  return countryCode
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('')
}
