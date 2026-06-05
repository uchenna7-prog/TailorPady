import { useState, useEffect, useRef, useMemo } from 'react'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { useNavigate } from 'react-router-dom'
import styles from './RevenueGoalModal.module.css'

const PERIODS = [
  { id: 'weekly',  label: 'Weekly'  },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly',  label: 'Yearly'  },
]

const PERIOD_HINTS = {
  weekly:  { icon: 'date_range',     text: 'Resets every Monday'             },
  monthly: { icon: 'calendar_month', text: 'Resets on the 1st of each month' },
  yearly:  { icon: 'event_repeat',   text: 'Resets on January 1st each year' },
}

function formatAmount(amount, symbol, position, decimals, numberFormat) {
  if (!amount && amount !== 0) return ''
  const fixed     = Number(amount).toFixed(decimals)
  const parts     = fixed.split('.')
  const locale    = numberFormat === 'anglophone' ? 'en-US' : 'de-DE'
  parts[0]        = Number(parts[0]).toLocaleString(locale)
  const formatted = decimals > 0 ? parts.join('.') : parts[0]
  return position === 'prefix' ? `${symbol}${formatted}` : `${formatted}${symbol}`
}

export function RevenueGoalModal({
  onSave,
  onClose,
  onDelete,
  existingGoal   = null,
  derived        = null,
  existingPeriods = [],
}) {
  const { generalSettings } = useGeneralSettings()
  const navigate            = useNavigate()
  const inputRef            = useRef(null)

  const symbol       = generalSettings.currency               ?? '₦'
  const position     = generalSettings.currencySymbolPosition  ?? 'prefix'
  const decimals     = generalSettings.currencyDecimals        ?? 0
  const numberFormat = generalSettings.currencyNumberFormat    ?? 'anglophone'

  const [period,        setPeriod]        = useState(existingGoal?.period ?? 'monthly')
  const [goalInput,     setGoalInput]     = useState(existingGoal?.goal   ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [debouncedGoal, setDebouncedGoal] = useState(goalInput)

  useEffect(() => {
    if (existingGoal) {
      setPeriod(existingGoal.period)
      setGoalInput(String(existingGoal.goal))
    }
  }, [existingGoal])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 320)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedGoal(goalInput), 400)
    return () => clearTimeout(timer)
  }, [goalInput])

  const isEditing = !!existingGoal

  const takenPeriods = existingPeriods.filter(
    (p) => !isEditing || p !== existingGoal.period
  )
  const periodAlreadyTaken = takenPeriods.includes(period)
  const isDisabled = !goalInput || Number(goalInput) <= 0 || periodAlreadyTaken

  const hint = PERIOD_HINTS[period]

  const fmt = (n) => formatAmount(n, symbol, position, decimals, numberFormat)

  const progressPercent = useMemo(() => {
    if (!isEditing || !derived || !debouncedGoal || Number(debouncedGoal) <= 0) return null
    return Math.min(100, Math.round((derived.earnedThis / Number(debouncedGoal)) * 100))
  }, [isEditing, derived, debouncedGoal])

  const handleSave = () => {
    const amount = Number(String(goalInput).replace(/,/g, ''))
    if (!amount || amount <= 0) return
    onSave({ period, goal: amount })
  }

  const handleDeleteConfirm = () => {
    setConfirmDelete(false)
    onDelete?.()
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.handle} />

        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing ? 'Edit Revenue Goal' : 'Set Revenue Goal'}
          </h2>
          <p className={styles.sub}>Choose your tracking period and target amount</p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>Track by</div>
          <div className={styles.periodTabs}>
            {PERIODS.map(p => {
              const isTaken = takenPeriods.includes(p.id)
              return (
                <button
                  key={p.id}
                  className={`${styles.periodTab} ${period === p.id ? styles.periodTabActive : ''} ${isTaken ? styles.periodTabDisabled : ''}`}
                  onClick={() => !isTaken && setPeriod(p.id)}
                  disabled={isTaken}
                  title={isTaken ? `You already have a ${p.label.toLowerCase()} goal` : undefined}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
          <div className={styles.periodCaption}>
            <span className="mi" style={{ fontSize: '0.8rem' }}>{hint.icon}</span>
            {hint.text}
          </div>
        </div>

        <div className={styles.amountSection}>
          <div className={styles.sectionLabel}>Revenue target</div>

          <div className={styles.amountDisplay}>
            {position === 'prefix' && (
              <span className={styles.currencySymbol}>{symbol}</span>
            )}
            <input
              ref={inputRef}
              className={styles.amountInput}
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              min="1"
            />
            {position === 'suffix' && (
              <span className={styles.currencySymbol}>{symbol}</span>
            )}
          </div>

          {goalInput && Number(goalInput) > 0 && (
            <div className={styles.amountFormatted}>
              {fmt(Number(String(goalInput).replace(/,/g, '')))}
            </div>
          )}

          <button
            className={styles.currencyHintLink}
            onClick={() => { onClose(); navigate('/settings') }}
          >
            <span className="mi" style={{ fontSize: '0.75rem' }}>tune</span>
            Change currency in Settings
          </button>
        </div>

        {isEditing && derived && progressPercent !== null && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Current progress</span>
              <span className={styles.progressValue}>
                {fmt(derived.earnedThis)} · {progressPercent}%
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className={styles.progressSub}>
              {progressPercent >= 100
                ? "You've already hit this target 🎉"
                : `${fmt(Math.max(0, Number(String(goalInput).replace(/,/g, '')) - derived.earnedThis))} remaining`
              }
            </div>
          </div>
        )}

        <button className={styles.saveBtn} onClick={handleSave} disabled={isDisabled}>
          {isEditing ? 'Update Goal' : 'Save Goal'}
        </button>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>

        {isEditing && onDelete && (
          <div className={styles.dangerZone}>
            {!confirmDelete ? (
              <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
                <span className="mi" style={{ fontSize: '0.85rem' }}>delete_forever</span>
                Delete this goal
              </button>
            ) : (
              <div className={styles.confirmRow}>
                <span className={styles.confirmText}>Are you sure?</span>
                <button className={styles.confirmCancel} onClick={() => setConfirmDelete(false)}>Keep</button>
                <button className={styles.confirmDelete} onClick={handleDeleteConfirm}>Delete</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}