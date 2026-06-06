import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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

const SWIPE_CLOSE_THRESHOLD = 80
const SWIPE_VELOCITY_THRESHOLD = 0.4

function formatAmount(amount, symbol, position, decimals, numberFormat) {
  if (!amount && amount !== 0) return ''
  const fixed  = Number(amount).toFixed(decimals)
  const parts  = fixed.split('.')
  const locale = numberFormat === 'anglophone' ? 'en-US' : 'de-DE'
  parts[0]     = Number(parts[0]).toLocaleString(locale)
  const formatted = decimals > 0 ? parts.join('.') : parts[0]
  return position === 'prefix' ? `${symbol}${formatted}` : `${formatted}${symbol}`
}

function formatInputDisplay(raw, numberFormat) {
  const digits = raw.replace(/[^0-9]/g, '')
  if (!digits) return ''
  const locale = numberFormat === 'anglophone' ? 'en-US' : 'de-DE'
  return Number(digits).toLocaleString(locale)
}

function haptic(pattern = 10) {
  navigator.vibrate?.(pattern)
}

export function RevenueGoalModal({
  onSave,
  onClose,
  onDelete,
  existingGoal    = null,
  derived         = null,
  existingPeriods = [],
}) {
  const { generalSettings } = useGeneralSettings()
  const navigate            = useNavigate()
  const sheetRef            = useRef(null)
  const inputRef            = useRef(null)
  const dragState           = useRef({ startY: 0, startTime: 0, dragging: false })

  const symbol       = generalSettings.currency               ?? '₦'
  const position     = generalSettings.currencySymbolPosition  ?? 'prefix'
  const decimals     = generalSettings.currencyDecimals        ?? 0
  const numberFormat = generalSettings.currencyNumberFormat    ?? 'anglophone'

  const [period,        setPeriod]        = useState(existingGoal?.period ?? 'monthly')
  const [rawGoal,       setRawGoal]       = useState(existingGoal ? String(existingGoal.goal) : '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [sheetOffset,   setSheetOffset]  = useState(0)
  const [debouncedGoal, setDebouncedGoal] = useState(rawGoal)

  const isEditing = !!existingGoal

  const takenPeriods       = existingPeriods.filter(p => !isEditing || p !== existingGoal.period)
  const periodAlreadyTaken = takenPeriods.includes(period)

  const numericGoal = Number(rawGoal.replace(/[^0-9.]/g, ''))
  const isDisabled  = !rawGoal || numericGoal <= 0 || periodAlreadyTaken

  useEffect(() => {
    if (existingGoal) {
      setPeriod(existingGoal.period)
      setRawGoal(String(existingGoal.goal))
    }
  }, [existingGoal])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedGoal(rawGoal), 400)
    return () => clearTimeout(timer)
  }, [rawGoal])

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport || !sheetRef.current) return

    const onResize = () => {
      const gap = window.innerHeight - viewport.height - viewport.offsetTop
      if (sheetRef.current) {
        sheetRef.current.style.transform = gap > 50
          ? `translateY(-${gap}px)`
          : ''
      }
    }

    viewport.addEventListener('resize', onResize)
    viewport.addEventListener('scroll', onResize)
    return () => {
      viewport.removeEventListener('resize', onResize)
      viewport.removeEventListener('scroll', onResize)
    }
  }, [])

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    dragState.current = {
      startY:   touch.clientY,
      startTime: Date.now(),
      dragging: true,
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!dragState.current.dragging) return
    const dy = e.touches[0].clientY - dragState.current.startY
    if (dy < 0) return
    setSheetOffset(dy)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!dragState.current.dragging) return
    const elapsed  = Date.now() - dragState.current.startTime
    const velocity = sheetOffset / elapsed

    if (sheetOffset > SWIPE_CLOSE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      haptic(8)
      onClose()
    } else {
      setSheetOffset(0)
    }
    dragState.current.dragging = false
  }, [sheetOffset, onClose])

  const handleInputChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, '')
    setRawGoal(digits)
  }

  const handlePeriodClick = (id) => {
    if (takenPeriods.includes(id)) return
    haptic(6)
    setPeriod(id)
  }

  const handleSave = () => {
  if (isDisabled) return
  haptic([6, 30, 6])
  onClose()
  onSave({ period, goal: numericGoal })
}

  const handleDeleteConfirm = () => {
  haptic([10, 40, 10])
  setConfirmDelete(false)
  onClose()
  onDelete?.()
}

  const fmt = (n) => formatAmount(n, symbol, position, decimals, numberFormat)

  const progressPercent = useMemo(() => {
    if (!isEditing || !derived || !debouncedGoal || Number(debouncedGoal) <= 0) return null
    return Math.min(100, Math.round((derived.earnedThis / Number(debouncedGoal)) * 100))
  }, [isEditing, derived, debouncedGoal])

  const displayValue = rawGoal ? formatInputDisplay(rawGoal, numberFormat) : ''

  const sheetStyle = {
    transform:  sheetOffset > 0 ? `translateY(${sheetOffset}px)` : undefined,
    transition: sheetOffset === 0 ? 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
    opacity:    sheetOffset > 0 ? Math.max(0.6, 1 - sheetOffset / 300) : undefined,
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={sheetRef}
        className={styles.sheet}
        style={sheetStyle}
        onClick={e => e.stopPropagation()}
      >
        <div
          className={styles.handleArea}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.handle} />
        </div>

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
                  className={`
                    ${styles.periodTab}
                    ${period === p.id ? styles.periodTabActive : ''}
                    ${isTaken ? styles.periodTabDisabled : ''}
                  `}
                  onClick={() => handlePeriodClick(p.id)}
                  disabled={isTaken}
                >
                  {p.label}
                  {isTaken && <span className={styles.takenDot} />}
                </button>
              )
            })}
          </div>

          {periodAlreadyTaken ? (
            <div className={styles.periodError}>
              <span className="mi" style={{ fontSize: '0.75rem' }}>error_outline</span>
              A {period} goal already exists
            </div>
          ) : (
            <div className={styles.periodCaption}>
              <span className="mi" style={{ fontSize: '0.8rem' }}>{PERIOD_HINTS[period].icon}</span>
              {PERIOD_HINTS[period].text}
            </div>
          )}
        </div>

        <div className={styles.amountSection}>
          <div className={styles.sectionLabel}>Revenue target</div>

          <div className={styles.amountDisplay} onClick={() => inputRef.current?.focus()}>
            {position === 'prefix' && (
              <span className={`${styles.currencySymbol} ${!rawGoal ? styles.currencySymbolDim : ''}`}>
                {symbol}
              </span>
            )}
            <input
              ref={inputRef}
              className={styles.amountInput}
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={displayValue}
              onChange={handleInputChange}
            />
            {position === 'suffix' && (
              <span className={`${styles.currencySymbol} ${!rawGoal ? styles.currencySymbolDim : ''}`}>
                {symbol}
              </span>
            )}
          </div>

          {rawGoal && numericGoal > 0 && (
            <div className={styles.amountFormatted}>
              {fmt(numericGoal)}
            </div>
          )}
        </div>

        <button
          className={styles.currencySettingsBtn}
          onClick={() => { onClose(); navigate('/settings') }}
        >
          <div className={styles.currencySettingsBtnInner}>
            <span className={styles.currencySettingsIcon}>
              <span className="mi">tune</span>
            </span>
            <div className={styles.currencySettingsText}>
              <span className={styles.currencySettingsTitle}>Currency settings</span>
              <span className={styles.currencySettingsSub}>Symbol, decimals & format</span>
            </div>
            <span className="mi" style={{ fontSize: '0.9rem', color: 'var(--text3)' }}>chevron_right</span>
          </div>
        </button>

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
                className={`${styles.progressFill} ${progressPercent >= 100 ? styles.progressFillComplete : ''}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className={styles.progressSub}>
              {progressPercent >= 100
                ? "You've already hit this target 🎉"
                : `${fmt(Math.max(0, numericGoal - derived.earnedThis))} remaining`
              }
            </div>
          </div>
        )}

        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={isDisabled}
        >
          {isEditing ? 'Update Goal' : 'Save Goal'}
        </button>

        <button className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>

        {isEditing && onDelete && (
          <div className={styles.dangerZone}>
            {!confirmDelete ? (
              <button
                className={styles.deleteBtn}
                onClick={() => { haptic(8); setConfirmDelete(true) }}
              >
                <span className="mi" style={{ fontSize: '0.85rem' }}>delete_forever</span>
                Delete this goal
              </button>
            ) : (
              <div className={styles.confirmRow}>
                <span className={styles.confirmText}>Are you sure?</span>
                <button
                  className={styles.confirmCancel}
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep
                </button>
                <button
                  className={styles.confirmDelete}
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}