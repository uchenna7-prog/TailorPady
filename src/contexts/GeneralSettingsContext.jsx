import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY         = 'TailorPady_general_settings'
const THEME_TRANSITION_MS = 350

const DEFAULT_CURRENCY = {
  country:      'Nigeria',
  countryCode:  'NG',
  currencyCode: 'NGN',
  currencyName: 'Nigerian Naira',
  symbol:       '₦',
}

export const DEFAULTS = {

  theme:      'light',
  accentId:    'default',
  accentColor:  null,
  dateFormat: 'DD/MM/YYYY',

  currency:               DEFAULT_CURRENCY,
  currencySymbolPosition: 'prefix',
  currencyDecimals:       2,
  currencyNumberFormat:   'anglophone',

  measureUnit:   'in',
  measureFormat: 'decimal',

  invoicePrefix:   'INV',
  invoiceCurrency: DEFAULT_CURRENCY,
  invoiceTemplate: 'invoiceTemplate1',
  invoiceDueDays:  7,
  invoiceShowTax:  false,
  invoiceTaxRate:  0,
  invoiceFooter:   'Thank you for your patronage 🙏',

  receiptPrefix:   'RCP',
  receiptCurrency: DEFAULT_CURRENCY,
  receiptTemplate: 'receiptTemplate1',
  receiptShowTax:  false,
  receiptTaxRate:  0,
  receiptFooter:   'Thank you for your patronage 🙏',

  defaultDepositPercent:      50,
  autoArchiveCompletedOrders: false,

  notifyOverdueTasks:      true,
  notifyUpcomingBirthdays: true,
  notifyUnpaidInvoices:    true,

  agentEnabled: false,

  agentAutoInvoice:          false,
  agentAutoInvoiceTimeframe: { amount: 1,  unit: 'days'  },

  agentAutoReceipt:          false,
  agentAutoReceiptTimeframe: { amount: 1,  unit: 'hours' },

  agentBirthdayMessages: false,
  agentBirthdayNotice:   { amount: 1,  unit: 'days'  },

  agentFollowUp:           false,
  agentFollowUpInactivity: { amount: 30, unit: 'days'  },

  agentPaymentReminder:       false,
  agentPaymentReminderBefore: { amount: 1,  unit: 'days'  },

  agentOverdueAlert:       false,
  agentOverdueGracePeriod: { amount: 1,  unit: 'days'  },

  agentOrderReadyReminder: false,
  agentOrderReadyWindow:   { amount: 1,  unit: 'days'  },

  agentDailyBrief: false,
}

function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) }
  } catch {
    return { ...DEFAULTS }
  }
  return { ...DEFAULTS }
}

function saveToLocalStorage(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {}
}

function resolveTheme(theme) {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme, animated) {
  const resolvedTheme = resolveTheme(theme)

  if (!animated) {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    return
  }

  const existingStyle = document.getElementById('__theme-transition__')
  existingStyle?.remove()

  const transitionStyle = document.createElement('style')
  transitionStyle.id = '__theme-transition__'
  transitionStyle.textContent = `
    *, *::before, *::after {
      transition:
        background-color ${THEME_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1),
        background       ${THEME_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1),
        border-color     ${THEME_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1),
        color            ${THEME_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow       ${THEME_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
  `

  document.head.appendChild(transitionStyle)
  document.documentElement.setAttribute('data-theme', resolvedTheme)

  const removalTimer = setTimeout(() => transitionStyle.remove(), THEME_TRANSITION_MS + 50)

  return () => {
    clearTimeout(removalTimer)
    transitionStyle.remove()
  }
}

function applyAccent(accentColor) {
  if (accentColor === null) {
    document.documentElement.style.removeProperty('--accent')
    document.documentElement.style.removeProperty('--accent-hover')
  } else {
    document.documentElement.style.setProperty('--accent', accentColor)
    document.documentElement.style.setProperty('--accent-hover', accentColor)
  }
}

const GeneralSettingsContext = createContext(null)

export function GeneralSettingsProvider({ children }) {

  const [settings, setSettings] = useState(loadFromLocalStorage)

  useEffect(() => {
    applyTheme(settings.theme, false)
    applyAccent(settings.accentColor ?? null)
  }, [])

  useEffect(() => {
    const currentTheme  = document.documentElement.getAttribute('data-theme')
    const resolvedTheme = resolveTheme(settings.theme)

    let cleanup
    if (currentTheme !== resolvedTheme) {
      cleanup = applyTheme(settings.theme, true)
    }

    if (settings.theme !== 'system') return cleanup

    const mediaQuery              = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => applyTheme('system', true)
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      cleanup?.()
    }
  }, [settings.theme])

  useEffect(() => {
    saveToLocalStorage(settings)
  }, [settings])

  function updateSetting(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  function updateManySettings(partial) {
    setSettings(prev => ({ ...prev, ...partial }))
  }

  function resetSettings() {
    setSettings({ ...DEFAULTS })
  }

  function updateAccent(accentId, accentColor) {
    applyAccent(accentColor)
    setSettings(prev => ({ ...prev, accentId, accentColor }))
  }

  return (
    <GeneralSettingsContext.Provider value={{
      generalSettings:           settings,
      updateGeneralSetting:      updateSetting,
      updateManyGeneralSettings: updateManySettings,
      resetGeneralSettings:      resetSettings,
      updateAccent,
    }}>
      {children}
    </GeneralSettingsContext.Provider>
  )
}

export function useGeneralSettings() {
  const ctx = useContext(GeneralSettingsContext)
  if (!ctx) throw new Error('useGeneralSettings must be used inside GeneralSettingsProvider')
  return ctx
}