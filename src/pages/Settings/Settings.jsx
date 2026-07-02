import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { usePortfolioSettings } from '../../contexts/PortfolioSettingsContext'
import { useAuth } from '../../contexts/AuthContext'
import { getCurrentSlug } from '../../services/slugService'
import Header from '../../components/Header/Header'
import Toast from '../../components/Toast/Toast'
import ConfirmSheet from '../../components/ConfirmSheet/ConfirmSheet'
import BottomNav from '../../components/BottomNav/BottomNav'
import { Toggle } from './components/Toggle/Toggle'
import { SettingRow } from './components/SettingRow/SettingRow'
import { SectionHeader } from './components/SectionHeader/SectionHeader'
import { TemplateModal } from '../../components/TemplateModal/TemplateModal'
import { ReceiptSettingsModal } from './components/ReceiptSettingsModal/ReceiptSettingsModal'
import { InvoiceSettingsModal } from './components/InvoiceSettingsModal/InvoiceSettingsModal'
import { PortfolioSettingsModal } from './components/PortfolioSettingsModal/PortfolioSettingsModal'
import { AgentSettingsModal } from './components/AgentSettingsModal/AgentSettingsModal'
import { PortfolioTemplateModal } from './components/PortfolioTemplateModal/PortfolioTemplateModal'
import { CurrencyModal } from './components/CurrencyModal/CurrencyModal'
import { AppearanceModal } from './components/AppearanceModal/AppearanceModal'
import { BotIcon } from '../../components/BotIcon/BotIcon'
import styles from './Settings.module.css'
import { db } from '../../firebase'


function resolveCurrencySymbol(raw) {
  if (!raw) return '₦'
  if (typeof raw === 'string') return raw
  return raw.symbol ?? raw.currencyCode ?? '₦'
}

function resolveCurrencyObject(raw) {
  const fallback = {
    country:      'Nigeria',
    countryCode:  'NG',
    currencyCode: 'NGN',
    currencyName: 'Nigerian Naira',
    symbol:       '₦',
  }
  if (!raw) return fallback
  if (typeof raw === 'string') return { ...fallback, symbol: raw }
  return raw
}


export default function Settings({ onMenuClick }) {

  const { generalSettings, updateGeneralSetting, updateManyGeneralSettings, resetGeneralSettings } = useGeneralSettings()
  const { profileSettings } = useProfileSettings()
  const { portfolioSettings, updateManyPortfolioSettings } = usePortfolioSettings()
  const { user } = useAuth()
  const location = useLocation()
  const navigate  = useNavigate()

  const [toastMessage, setToastMessage] = useState('')
  const toastTimerRef = useRef(null)

  const [isTemplateModalOpen,          setIsTemplateModalOpen]          = useState(false)
  const [isInvoiceModalOpen,           setIsInvoiceModalOpen]           = useState(false)
  const [isReceiptModalOpen,           setIsReceiptModalOpen]           = useState(false)
  const [isAgentModalOpen,             setIsAgentModalOpen]             = useState(false)
  const [isPortfolioModalOpen,         setIsPortfolioModalOpen]         = useState(false)
  const [isPortfolioTemplateModalOpen, setIsPortfolioTemplateModalOpen] = useState(false)
  const [isCurrencyModalOpen,          setIsCurrencyModalOpen]          = useState(false)
  const [isAppearanceModalOpen,        setIsAppearanceModalOpen]        = useState(false)
  const [isClearDataConfirmOpen,       setIsClearDataConfirmOpen]       = useState(false)
  const [isResetSettingsConfirmOpen,   setIsResetSettingsConfirmOpen]   = useState(false)

  const [portfolioSlug, setPortfolioSlug] = useState(null)
  const [pendingTemplate, setPendingTemplate] = useState(null)
  const [returnTo, setReturnTo] = useState(null)

  const isDarkMode = generalSettings.theme === 'dark'

  useEffect(() => {
    if (!user?.uid) return
    getCurrentSlug(db,user.uid)
      .then(slug => setPortfolioSlug(slug))
      .catch(() => {})
  }, [user?.uid])

  useEffect(() => {
    const navState = location.state
    if (!navState?.autoOpenModal) return

    if (navState.autoOpenModal === 'invoiceSettings') {
      setIsInvoiceModalOpen(true)
    }

    if (navState.pendingTemplate) {
      setPendingTemplate(navState.pendingTemplate)
    }

    if (navState.returnTo) {
      setReturnTo(navState.returnTo)
    }

    navigate(location.pathname, { replace: true, state: null })
  }, [location.state])

  function showToast(message) {
    setToastMessage(message)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 2400)
  }

  function applyPendingTemplateIfAny(extraMessage) {
    if (!pendingTemplate) {
      if (extraMessage) showToast(extraMessage)
      return
    }
    updateManyGeneralSettings({
      invoiceTemplate: pendingTemplate.invoiceTemplate,
      receiptTemplate: pendingTemplate.receiptTemplate,
    })
    setPendingTemplate(null)
    showToast(extraMessage ? `${extraMessage} · Template applied ✓` : 'Template applied ✓')
  }

  function returnToOriginIfAny() {
    if (!returnTo) return
    navigate(`/customers/${returnTo.customerId}`, {
      state: {
        reopenInvoiceId: returnTo.invoiceId,
        reopenMissingFields: returnTo.reopenMissingFields ?? false,
        completedModal: returnTo.completedModal ?? null,
        completedFields: returnTo.completedFields ?? [],
      },
    })
    setReturnTo(null)
  }

  function handleInvoiceModalBack() {
    setIsInvoiceModalOpen(false)
    applyPendingTemplateIfAny('Invoice settings saved')
    returnToOriginIfAny()
  }

  function handleTemplateSelect(selectedTemplates) {
    updateManyGeneralSettings({
      invoiceTemplate: selectedTemplates.invoiceTemplate,
      receiptTemplate: selectedTemplates.receiptTemplate,
    })
    showToast('Template selected')
  }

  async function handlePortfolioTemplateSelect(templateId) {
    setIsPortfolioTemplateModalOpen(false)
    try {
      await updateManyPortfolioSettings({ portfolioTemplate: templateId })
      showToast('Portfolio template saved')
    } catch {
      showToast('Failed to save template')
    }
  }

  function handleCurrencySave(settings) {
    updateManyGeneralSettings({
      currency:               settings.currency,
      currencySymbolPosition: settings.symbolPosition,
      currencyDecimals:       settings.decimals,
      currencyNumberFormat:   settings.numberFormat,
    })
    setIsCurrencyModalOpen(false)
    showToast('Currency updated')
  }

  function handleThemeChange(theme) {
    updateGeneralSetting('theme', theme)
  }

  function handleAccentChange(accentId, accentColor) {
    updateManyGeneralSettings({ accentId, accentColor })
    document.documentElement.style.setProperty('--accent', accentColor)
    showToast('Accent updated')
  }

  function handleClearAllData() {
    localStorage.clear()
    setIsClearDataConfirmOpen(false)
    showToast('Cleared')
  }

  function handleResetAllSettings() {
    resetGeneralSettings()
    setIsResetSettingsConfirmOpen(false)
    showToast('Settings reset')
  }

  function getSelectedTemplates() {
    const invoiceTemplate       = generalSettings.invoiceTemplate
    const receiptTemplate       = generalSettings.receiptTemplate
    const invoiceTemplateNumber = invoiceTemplate.replace('invoiceTemplate', '')
    const receiptTemplateNumber = receiptTemplate.replace('receiptTemplate', '')
    if (invoiceTemplateNumber === receiptTemplateNumber) {
      return 'Templates ' + (receiptTemplateNumber || invoiceTemplateNumber)
    }
    return ''
  }

  function getAgentSub() {
    if (!generalSettings.agentEnabled) return 'Off'
    return "On"
  }

  function getPortfolioTemplate() {
    return portfolioSettings.portfolioTemplate ?? 'Choose a layout for your public page'
  }

  function getPortfolioSettingsSub() {
    const parts = []
    if (portfolioSettings.heroBgImage)     parts.push('Hero bg')
    if (portfolioSettings.heroAvatarImage) parts.push('Avatar')
    if (portfolioSettings.footerBgImage)   parts.push('Footer bg')
    if (portfolioSettings.footerLogoImage) parts.push('Logo')
    return parts.length > 0 ? parts.join(' · ') : 'Hero and footer images'
  }

  function getCurrency() {
    const c = resolveCurrencyObject(generalSettings.currency)
    return `${c.symbol} (${c.currencyCode})`
  }

  function getInvoice() {
    const prefix = generalSettings.invoicePrefix  ?? 'INV'
    return `${prefix}`
  }

  function getReceipt() {
    const prefix = generalSettings.receiptPrefix ?? 'RCP'
    return `${prefix}`
  }

  function getAppearance() {
    const theme    = isDarkMode ? 'Dark Mode' : 'Light Mode'
    return `${theme}`
  }

  const currentCurrencySettings = {
    currency:       resolveCurrencyObject(generalSettings.currency),
    symbolPosition: generalSettings.currencySymbolPosition ?? 'prefix',
    decimals:       generalSettings.currencyDecimals       ?? 2,
    numberFormat:   generalSettings.currencyNumberFormat   ?? 'anglophone',
  }

  return (
    <div className={styles.settingsPage}>

      <Header onMenuClick={onMenuClick} />

      <div className={styles.settingsScrollArea}>

        <SectionHeader icon="palette" label="Appearance" />

        <SettingRow
          icon="palette"
          label="Appearance"
          sub={"choose your preferred theme and accent color"}
          value={getAppearance()}
          onClick={() => setIsAppearanceModalOpen(true)}
          chevron
        />

        <SectionHeader icon="paid" label="Currency" />

        <SettingRow
          icon="currency_exchange"
          label="Display Currency"
          sub={"Choose your preferred currency for your Business"}
          value={getCurrency()}
          onClick={() => setIsCurrencyModalOpen(true)}
          chevron
        />

        <SectionHeader icon="receipt_long" label="Invoice & Receipt" />

        <SettingRow
          icon="tune"
          label="Invoice Settings"
          sub={"Configure your invoice setting preferences"}
          value={getInvoice()}
          onClick={() => setIsInvoiceModalOpen(true)}
          chevron
        />

        <SettingRow
          icon="request_quote"
          label="Receipt Settings"
          sub={"Configure your receipt setting preferences"}
          value={getReceipt()}
          onClick={() => setIsReceiptModalOpen(true)}
          chevron
        />

        <SettingRow
          icon="description"
          label="Templates"
          sub="Choose your preferred invoice and receipt templates"
          value={getSelectedTemplates()}
          onClick={() => setIsTemplateModalOpen(true)}
          chevron
        />

        <SectionHeader icon="public" label="Portfolio" />

        <SettingRow
          icon="image"
          label="Portfolio Settings"
          sub={getPortfolioSettingsSub()}
          onClick={() => setIsPortfolioModalOpen(true)}
          chevron
        />

        <SettingRow
          icon="web"
          label="Portfolio Template"
          value={getPortfolioTemplate()}
          sub={"Choose your preferred portfolio template"}
          onClick={() => setIsPortfolioTemplateModalOpen(true)}
          chevron
        />

        <SectionHeader icon={BotIcon} label="AI Assitant" />

        <SettingRow
          icon={BotIcon}
          label="AI Settings"
          sub={"Configure your AI assistant preferences"}
          value={getAgentSub()}
          onClick={() => setIsAgentModalOpen(true)}
          chevron
        />

        <SectionHeader icon="notifications" label="Notifications" />

        <SettingRow
          icon="alarm"
          label="Overdue Tasks"
          sub="Alert when tasks pass their due date"
        >
          <Toggle
            value={generalSettings.notifyOverdueTasks}
            onChange={isOn => updateGeneralSetting('notifyOverdueTasks', isOn)}
          />
        </SettingRow>

        <SettingRow
          icon="cake"
          label="Customer Birthdays"
          sub="Remind you a day before"
        >
          <Toggle
            value={generalSettings.notifyUpcomingBirthdays}
            onChange={isOn => updateGeneralSetting('notifyUpcomingBirthdays', isOn)}
          />
        </SettingRow>

        <SettingRow
          icon="money_off"
          label="Unpaid Invoices"
          sub="Alert for invoices past due date"
        >
          <Toggle
            value={generalSettings.notifyUnpaidInvoices}
            onChange={isOn => updateGeneralSetting('notifyUnpaidInvoices', isOn)}
          />
        </SettingRow>

        <SectionHeader icon="storage" label="Data" />

        <SettingRow
          icon="restart_alt"
          label="Reset All Settings"
          sub="Restore defaults. Your customers and orders are safe."
          onClick={() => setIsResetSettingsConfirmOpen(true)}
          chevron
          danger
        />

        <SettingRow
          icon="delete_forever"
          label="Clear All Data"
          sub="Permanently delete everything"
          onClick={() => setIsClearDataConfirmOpen(true)}
          chevron
          divider={false}
          danger
        />

        <div style={{ height: 32 }} />

      </div>


      <TemplateModal
        isOpen={isTemplateModalOpen}
        currentInvoiceTemplate={generalSettings.invoiceTemplate || 'invoiceTemplate1'}
        currentReceiptTemplate={generalSettings.receiptTemplate || 'receiptTemplate1'}
        colourId={profileSettings.brandColourId}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleTemplateSelect}
      />

      {isInvoiceModalOpen && (
        <InvoiceSettingsModal
          onBack={handleInvoiceModalBack}
          showToast={showToast}
        />
      )}

      {isReceiptModalOpen && (
        <ReceiptSettingsModal
          onBack={() => setIsReceiptModalOpen(false)}
          showToast={showToast}
        />
      )}

      {isAgentModalOpen && (
        <AgentSettingsModal
          onBack={() => setIsAgentModalOpen(false)}
          showToast={showToast}
        />
      )}

      {isPortfolioModalOpen && (
        <PortfolioSettingsModal
          onBack={() => setIsPortfolioModalOpen(false)}
          showToast={showToast}
        />
      )}

      {isPortfolioTemplateModalOpen && (
        <PortfolioTemplateModal
          currentTemplate={portfolioSettings.portfolioTemplate || 'template2'}
          slug={portfolioSlug || user?.uid}
          onClose={() => setIsPortfolioTemplateModalOpen(false)}
          onSelect={handlePortfolioTemplateSelect}
        />
      )}

      {isCurrencyModalOpen && (
        <CurrencyModal
          currentSettings={currentCurrencySettings}
          onBack={() => setIsCurrencyModalOpen(false)}
          onSave={handleCurrencySave}
        />
      )}

      {isAppearanceModalOpen && (
        <AppearanceModal
          currentTheme={generalSettings.theme || 'light'}
          currentAccent={generalSettings.accentId || 'charcoal'}
          onBack={() => setIsAppearanceModalOpen(false)}
          onThemeChange={handleThemeChange}
          onAccentChange={handleAccentChange}
        />
      )}

      <ConfirmSheet
        open={isClearDataConfirmOpen}
        title="Delete All Data?"
        onConfirm={handleClearAllData}
        onCancel={() => setIsClearDataConfirmOpen(false)}
      />

      <ConfirmSheet
        open={isResetSettingsConfirmOpen}
        title="Reset All Settings?"
        onConfirm={handleResetAllSettings}
        onCancel={() => setIsResetSettingsConfirmOpen(false)}
      />

      <Toast message={toastMessage} />
      <BottomNav />

    </div>
  )
}