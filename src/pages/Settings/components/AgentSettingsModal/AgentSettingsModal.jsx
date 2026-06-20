import { useState } from 'react'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { Field } from '../Field/Field'
import { Toggle } from '../../components/Toggle/Toggle'
import { BotIcon } from '../../../../components/BotIcon/BotIcon'
import styles from './AgentSettingsModal.module.css'

const DURATION_PRESETS = [
  { label: '1h',  value: { amount: 1,  unit: 'hours'  } },
  { label: '6h',  value: { amount: 6,  unit: 'hours'  } },
  { label: '12h', value: { amount: 12, unit: 'hours'  } },
  { label: '1d',  value: { amount: 1,  unit: 'days'   } },
  { label: '3d',  value: { amount: 3,  unit: 'days'   } },
  { label: '1w',  value: { amount: 1,  unit: 'weeks'  } },
  { label: '2w',  value: { amount: 2,  unit: 'weeks'  } },
  { label: '1m',  value: { amount: 1,  unit: 'months' } },
]

const UNIT_OPTIONS = [
  { value: 'hours',  label: 'hours'  },
  { value: 'days',   label: 'days'   },
  { value: 'weeks',  label: 'weeks'  },
  { value: 'months', label: 'months' },
]

function normaliseDuration(value) {
  if (value && typeof value === 'object' && 'amount' in value && 'unit' in value) {
    return value
  }
  return { amount: 1, unit: 'days' }
}

function durationsMatch(a, b) {
  return a.amount === b.amount && a.unit === b.unit
}

function DurationPicker({ value, onChange }) {
  const normalised = normaliseDuration(value)
  const matchedPreset = DURATION_PRESETS.find(p => durationsMatch(p.value, normalised))
  const isCustom = !matchedPreset

  const [showCustom, setShowCustom] = useState(isCustom)
  const [customAmount, setCustomAmount] = useState(
    isCustom ? String(normalised.amount) : '2'
  )
  const [customUnit, setCustomUnit] = useState(
    isCustom ? normalised.unit : 'weeks'
  )

  function selectPreset(preset) {
    setShowCustom(false)
    onChange(preset.value)
  }

  function activateCustom() {
    setShowCustom(true)
    const amount = parseInt(customAmount, 10) || 2
    onChange({ amount, unit: customUnit })
  }

  function handleCustomAmountChange(e) {
    const raw = e.target.value.replace(/\D/g, '')
    setCustomAmount(raw)
    const amount = parseInt(raw, 10)
    if (amount > 0) onChange({ amount, unit: customUnit })
  }

  function handleCustomAmountBlur() {
    const amount = parseInt(customAmount, 10)
    if (!amount || amount < 1) {
      setCustomAmount('1')
      onChange({ amount: 1, unit: customUnit })
    }
  }

  function handleCustomUnitChange(e) {
    setCustomUnit(e.target.value)
    const amount = parseInt(customAmount, 10) || 1
    onChange({ amount, unit: e.target.value })
  }

  return (
    <div className={styles.durationPicker}>
      <div className={styles.presetChips}>
        {DURATION_PRESETS.map(preset => (
          <button
            key={preset.label}
            className={`${styles.chip} ${!showCustom && durationsMatch(preset.value, normalised) ? styles.chipActive : ''}`}
            onClick={() => selectPreset(preset)}
          >
            {preset.label}
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
            className={styles.customAmountInput}
            value={customAmount}
            onChange={handleCustomAmountChange}
            onBlur={handleCustomAmountBlur}
            min={1}
            inputMode="numeric"
          />
          <select
            className={styles.customUnitSelect}
            value={customUnit}
            onChange={handleCustomUnitChange}
          >
            {UNIT_OPTIONS.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children, premium = false }) {
  return (
    <div className={styles.sectionLabelRow}>
      <p className={styles.sectionLabel}>{children}</p>
      {premium && (
        <span className={styles.premiumBadge}>
          <span className="mi" style={{ fontSize: '0.7rem' }}>workspace_premium</span>PRO
        </span>
      )}
    </div>
  )
}

function StatusDot({ active }) {
  return <span className={`${styles.statusDot} ${active ? styles.statusDotActive : ''}`} />
}

function FeatureRow({ icon, title, sub, value, onChange, children }) {
  return (
    <div className={styles.featureRow}>
      <div className={styles.featureRowTop}>
        <div className={styles.featureRowIcon}>
          <span className="mi" style={{ fontSize: 18 }}>{icon}</span>
        </div>
        <div className={styles.featureRowText}>
          <p className={styles.featureRowTitle}>{title}</p>
          <p className={styles.featureRowSub}>{sub}</p>
        </div>
        <Toggle value={value} onChange={onChange} />
      </div>
      {value && children && (
        <div className={styles.featureRowBody}>
          {children}
        </div>
      )}
    </div>
  )
}

function MessagingChannelRow({ icon, label, description }) {
  return (
    <div className={styles.messagingRow}>
      <div className={styles.messagingIcon}>
        <span className="mi" style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div className={styles.messagingText}>
        <p className={styles.messagingLabel}>{label}</p>
        <p className={styles.messagingDesc}>{description}</p>
      </div>
      <span className={styles.comingSoonBadge}>Soon</span>
    </div>
  )
}

export function AgentSettingsModal({ onBack, showToast }) {
  const { generalSettings, updateManyGeneralSettings } = useGeneralSettings()

  const [local, setLocal] = useState({
    agentEnabled:               generalSettings.agentEnabled,
    agentAutoInvoice:           generalSettings.agentAutoInvoice,
    agentAutoInvoiceTimeframe:  normaliseDuration(generalSettings.agentAutoInvoiceTimeframe),
    agentAutoReceipt:           generalSettings.agentAutoReceipt,
    agentAutoReceiptTimeframe:  normaliseDuration(generalSettings.agentAutoReceiptTimeframe),
    agentBirthdayMessages:      generalSettings.agentBirthdayMessages,
    agentBirthdayNotice:        normaliseDuration(generalSettings.agentBirthdayNotice),
    agentFollowUp:              generalSettings.agentFollowUp,
    agentFollowUpInactivity:    normaliseDuration(generalSettings.agentFollowUpInactivity),
    agentPaymentReminder:       generalSettings.agentPaymentReminder,
    agentPaymentReminderBefore: normaliseDuration(generalSettings.agentPaymentReminderBefore),
    agentOverdueAlert:          generalSettings.agentOverdueAlert ?? false,
    agentOverdueGracePeriod:    normaliseDuration(generalSettings.agentOverdueGracePeriod),
    agentOrderReadyReminder:    generalSettings.agentOrderReadyReminder ?? false,
    agentOrderReadyWindow:      normaliseDuration(generalSettings.agentOrderReadyWindow),
    agentDailyBrief:            generalSettings.agentDailyBrief,
  })

  function set(key, value) {
    setLocal(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    updateManyGeneralSettings(local)
    showToast('Agent settings saved')
    onBack()
  }

  const masterOff = !local.agentEnabled

  return (
    <FullModal title="AI Assistant" onBack={onBack} onSave={handleSave}>

      <div className={styles.content}>

        <div className={styles.masterCard}>
          <div className={styles.masterLeft}>
            <div className={`${styles.masterIcon} ${local.agentEnabled ? styles.masterIconActive : ''}`}>
              <BotIcon size={22} color="currentColor" backgroundColor={local.agentEnabled ? 'var(--accent)' : 'var(--surface2)'} />
              <StatusDot active={local.agentEnabled} />
            </div>
            <div>
              <p className={styles.masterTitle}>TailorPady AI</p>
              <p className={styles.masterSub}>
                {local.agentEnabled
                  ? 'Active and running in the background'
                  : 'Off, no automated actions'}
              </p>
            </div>
          </div>
          <Toggle value={local.agentEnabled} onChange={v => set('agentEnabled', v)} />
        </div>

        {masterOff ? (
          <div className={styles.offNotice}>
            <span className="mi" style={{ fontSize: 15 }}>info</span>
            <p>Turn the AI assistant on to configure what it can do.</p>
          </div>
        ) : (
          <div className={styles.activeNotice}>
            <span className="mi" style={{ fontSize: 15 }}>lock</span>
            <p>The assistant only prepares drafts. Nothing is sent or deleted without your approval.</p>
          </div>
        )}

        <div className={`${styles.featuresSection} ${masterOff ? styles.featuresSectionDimmed : ''}`}>

          <SectionLabel>Billing automation</SectionLabel>

          <FieldGroup>

            <FeatureRow
              icon="receipt_long"
              title="Auto-generate invoices"
              sub="Drafts an invoice when an order has gone without one"
              value={local.agentAutoInvoice}
              onChange={v => set('agentAutoInvoice', v)}
            >
              <Field label="Draft after order has no invoice for">
                <DurationPicker
                  value={local.agentAutoInvoiceTimeframe}
                  onChange={v => set('agentAutoInvoiceTimeframe', v)}
                />
              </Field>
            </FeatureRow>

            <FeatureRow
              icon="payments"
              title="Auto-generate receipts"
              sub="Drafts a receipt as soon as a payment is recorded"
              value={local.agentAutoReceipt}
              onChange={v => set('agentAutoReceipt', v)}
            >
              <Field label="Draft after payment is recorded for">
                <DurationPicker
                  value={local.agentAutoReceiptTimeframe}
                  onChange={v => set('agentAutoReceiptTimeframe', v)}
                />
              </Field>
            </FeatureRow>

            <FeatureRow
              icon="notification_important"
              title="Payment reminders"
              sub="Drafts a reminder as an invoice approaches its due date"
              value={local.agentPaymentReminder}
              onChange={v => set('agentPaymentReminder', v)}
            >
              <Field label="Draft reminder this far before the due date">
                <DurationPicker
                  value={local.agentPaymentReminderBefore}
                  onChange={v => set('agentPaymentReminderBefore', v)}
                />
              </Field>
            </FeatureRow>

            <FeatureRow
              icon="warning_amber"
              title="Overdue alerts"
              sub="Flags invoices that have passed their due date unpaid"
              value={local.agentOverdueAlert}
              onChange={v => set('agentOverdueAlert', v)}
            >
              <Field label="Alert once overdue by">
                <DurationPicker
                  value={local.agentOverdueGracePeriod}
                  onChange={v => set('agentOverdueGracePeriod', v)}
                />
              </Field>
            </FeatureRow>

            <FeatureRow
              icon="inventory_2"
              title="Ready order reminders"
              sub="Nudges you when a finished order hasn't been picked up"
              value={local.agentOrderReadyReminder}
              onChange={v => set('agentOrderReadyReminder', v)}
            >
              <Field label="Remind once an order has been ready for">
                <DurationPicker
                  value={local.agentOrderReadyWindow}
                  onChange={v => set('agentOrderReadyWindow', v)}
                />
              </Field>
            </FeatureRow>

          </FieldGroup>

          <SectionLabel>Customer engagement</SectionLabel>

          <FieldGroup>

            <FeatureRow
              icon="cake"
              title="Birthday messages"
              sub="Drafts a message ahead of a customer's birthday"
              value={local.agentBirthdayMessages}
              onChange={v => set('agentBirthdayMessages', v)}
            >
              <Field label="Prepare draft this far in advance">
                <DurationPicker
                  value={local.agentBirthdayNotice}
                  onChange={v => set('agentBirthdayNotice', v)}
                />
              </Field>
            </FeatureRow>

            <FeatureRow
              icon="person_search"
              title="Win-back messages"
              sub="Drafts a message for customers who have gone quiet"
              value={local.agentFollowUp}
              onChange={v => set('agentFollowUp', v)}
            >
              <Field label="Draft after customer is inactive for">
                <DurationPicker
                  value={local.agentFollowUpInactivity}
                  onChange={v => set('agentFollowUpInactivity', v)}
                />
              </Field>
            </FeatureRow>

          </FieldGroup>

          <SectionLabel>Reporting</SectionLabel>

          <FieldGroup>
            <FeatureRow
              icon="summarize"
              title="Daily brief"
              sub="A short summary of assistant activity each time you open the app"
              value={local.agentDailyBrief}
              onChange={v => set('agentDailyBrief', v)}
            />
          </FieldGroup>

          <SectionLabel premium>Autonomous sending</SectionLabel>

          <FieldGroup>
            <div className={styles.messagingIntro}>
              <span className="mi" style={{ fontSize: 15 }}>auto_awesome</span>
              <p>Connect a channel and approved drafts go out on their own, no copying or pasting required.</p>
            </div>

            <MessagingChannelRow
              icon="chat"
              label="WhatsApp"
              description="Send through your WhatsApp Business account"
            />
            <MessagingChannelRow
              icon="email"
              label="Email"
              description="Send via Gmail, Outlook, or a custom address"
            />
            <MessagingChannelRow
              icon="send"
              label="Telegram"
              description="Send through a connected Telegram bot"
            />
          </FieldGroup>

        </div>

        <div style={{ height: 32 }} />
      </div>

    </FullModal>
  )
}