import { useState } from 'react'
import styles from './ReceiptSettingsModal.module.css'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { Field } from '../Field/Field'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { Textarea } from '../Textarea/Textarea'
import { TextInput } from '../TextInput/TextInput'
import { Toggle } from '../../components/Toggle/Toggle'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { CurrencyPickerSheet } from '../CurrencyPickerSheet/CurrencyPickerSheet'


export function ReceiptSettingsModal({ onBack, showToast }) {

  const { generalSettings, updateManyGeneralSettings } = useGeneralSettings()

  const [local, setLocal] = useState({
    receiptPrefix:    generalSettings.receiptPrefix  ?? 'RCP',
    receiptCurrency:  typeof generalSettings.receiptCurrency === 'object'
                        ? (generalSettings.receiptCurrency?.symbol ?? '₦')
                        : (generalSettings.receiptCurrency ?? '₦'),
    receiptFooter:    generalSettings.receiptFooter  ?? '',
    receiptShowTax:   generalSettings.receiptShowTax ?? false,
    receiptTaxRate:   generalSettings.receiptTaxRate ?? 0,
  })

  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false)

  const set = key => val => setLocal(p => ({ ...p, [key]: val }))

  const save = () => {
    updateManyGeneralSettings(local)
    showToast('Receipt settings saved')
    onBack()
  }

  return (
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
              className={styles.currencyBtn}
              onClick={() => setIsCurrencySheetOpen(true)}
            >
              <span className={styles.currencyBtnText}>{local.receiptCurrency}</span>
              <span className="mi" style={{ fontSize: '1rem', color: 'var(--text-sub)' }}>expand_more</span>
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

      <CurrencyPickerSheet
        isOpen={isCurrencySheetOpen}
        currentSymbol={local.receiptCurrency}
        onSelect={set('receiptCurrency')}
        onClose={() => setIsCurrencySheetOpen(false)}
      />

    </FullModal>
  )
}