import { useState } from 'react'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { Field } from '../Field/Field'
import { Toggle } from '../../components/Toggle/Toggle'
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

function SectionLabel({ children }) {
  return <p className={styles.sectionLabel}>{children}</p>
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
    <FullModal title="Agent" onBack={onBack} onSave={handleSave}>

      <div className={styles.content}>

        {/* Master toggle */}
        <div className={styles.masterCard}>
          <div className={styles.masterLeft}>
            <div className={`${styles.masterIcon} ${local.agentEnabled ? styles.masterIconActive : ''}`}>
              <span className="mi" style={{ fontSize: 22 }}>smart_toy</span>
              {local.agentEnabled && <span className={styles.masterPulse} />}
            </div>
            <div>
              <p className={styles.masterTitle}>TailorPady Agent</p>
              <p className={styles.masterSub}>
                {local.agentEnabled
                  ? 'Active — running in the background'
                  : 'Off — no automated actions'}
              </p>
            </div>
          </div>
          <Toggle value={local.agentEnabled} onChange={v => set('agentEnabled', v)} />
        </div>

        {masterOff ? (
          <div className={styles.offNotice}>
            <span className="mi" style={{ fontSize: 15 }}>info</span>
            <p>Turn the agent on to configure what it can do.</p>
          </div>
        ) : (
          <div className={styles.activeNotice}>
            <span className="mi" style={{ fontSize: 15 }}>lock</span>
            <p>The agent only drafts — it never sends or deletes anything without your approval.</p>
          </div>
        )}

        {/* Automation features */}
        <div className={`${styles.featuresSection} ${masterOff ? styles.featuresSectionDimmed : ''}`}>

          <SectionLabel>Automation</SectionLabel>

          <FieldGroup>

            <FeatureRow
              icon="receipt_long"
              title="Auto-generate invoices"
              sub="Drafts invoices for orders that have none"
              value={local.agentAutoInvoice}
              onChange={v => set('agentAutoInvoice', v)}
            >
              <Field label="Act after order goes uninvoiced for">
                <DurationPicker
                  value={local.agentAutoInvoiceTimeframe}
                  onChange={v => set('agentAutoInvoiceTimeframe', v)}
                />
              </Field>
            </FeatureRow>

            <FeatureRow
              icon="payments"
              title="Auto-generate receipts"
              sub="Drafts a receipt whenever a payment is recorded"
              value={local.agentAutoReceipt}
              onChange={v => set('agentAutoReceipt', v)}
            />

            <FeatureRow
              icon="notification_important"
              title="Payment reminders"
              sub="Drafts a reminder when an invoice is close to its due date"
              value={local.agentPaymentReminder}
              onChange={v => set('agentPaymentReminder', v)}
            >
              <Field label="Draft reminder this long before due date">
                <DurationPicker
                  value={local.agentPaymentReminderBefore}
                  onChange={v => set('agentPaymentReminderBefore', v)}
                />
              </Field>
            </FeatureRow>

            <FeatureRow
              icon="warning_amber"
              title="Overdue alerts"
              sub="Flags invoices that have passed their due date without payment"
              value={local.agentOverdueAlert}
              onChange={v => set('agentOverdueAlert', v)}
            >
              <Field label="Alert after invoice is overdue by">
                <DurationPicker
                  value={local.agentOverdueGracePeriod}
                  onChange={v => set('agentOverdueGracePeriod', v)}
                />
              </Field>
            </FeatureRow>

            <FeatureRow
              icon="inventory_2"
              title="Ready order reminders"
              sub="Nudges you when a completed order hasn't been picked up"
              value={local.agentOrderReadyReminder}
              onChange={v => set('agentOrderReadyReminder', v)}
            >
              <Field label="Remind after order sits ready for">
                <DurationPicker
                  value={local.agentOrderReadyWindow}
                  onChange={v => set('agentOrderReadyWindow', v)}
                />
              </Field>
            </FeatureRow>

          </FieldGroup>

          {/* Customer engagement */}
          <SectionLabel>Customer Engagement</SectionLabel>

          <FieldGroup>

            <FeatureRow
              icon="cake"
              title="Birthday messages"
              sub="Drafts a message for customers with upcoming birthdays"
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
              sub="Drafts a message for customers who haven't ordered in a while"
              value={local.agentFollowUp}
              onChange={v => set('agentFollowUp', v)}
            >
              <Field label="Draft message after customer is inactive for">
                <DurationPicker
                  value={local.agentFollowUpInactivity}
                  onChange={v => set('agentFollowUpInactivity', v)}
                />
              </Field>
            </FeatureRow>

          </FieldGroup>

          {/* Daily brief */}
          <SectionLabel>Reporting</SectionLabel>

          <FieldGroup>
            <FeatureRow
              icon="summarize"
              title="Daily brief"
              sub="Summarises agent activity when you open the app each day"
              value={local.agentDailyBrief}
              onChange={v => set('agentDailyBrief', v)}
            />
          </FieldGroup>

          {/* Autonomous messaging */}
          <SectionLabel>Send Messages Autonomously</SectionLabel>

          <FieldGroup>
            <div className={styles.messagingIntro}>
              <span className="mi" style={{ fontSize: 15, flexShrink: 0, color: 'var(--text3)' }}>info</span>
              <p>Connect a channel and the agent can send approved drafts directly — no copy-pasting. Currently in development.</p>
            </div>

            <MessagingChannelRow
              icon="chat"
              label="WhatsApp"
              description="Send messages via your WhatsApp Business account"
            />
            <MessagingChannelRow
              icon="email"
              label="Email"
              description="Send via Gmail, Outlook, or a custom SMTP address"
            />
            <MessagingChannelRow
              icon="send"
              label="Telegram"
              description="Send messages through a connected Telegram bot"
            />
          </FieldGroup>

        </div>

        <div style={{ height: 32 }} />
      </div>

    </FullModal>
  )
}
