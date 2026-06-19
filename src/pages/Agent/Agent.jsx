import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import BottomNav      from '../../components/BottomNav/BottomNav'
import { useAgent, useAutonomousAgent } from '../../contexts/AgentContext'
import { useOrders }          from '../../contexts/OrdersContext'
import { useInvoices }        from '../../contexts/InvoiceContext'
import { useReceipts }        from '../../contexts/ReceiptContext'
import { usePayments }        from '../../contexts/PaymentContext'
import { useCustomers }       from '../../contexts/CustomerContext'
import { useAuth }            from '../../contexts/AuthContext'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { ActivityTab } from './tabs/ActivityTab/ActivityTab'
import { ScheduledTab } from './tabs/ScheduledTab/ScheduledTab'
import { DraftsTab } from './tabs/DraftsTab/DraftsTab'
import { ChatPanel } from './components/ChatPanel/ChatPanel'
import { getGreeting,haptic } from './utils'
import { AgentTitleIcon } from './components/AgentTitleIcon/AgentTitleIcon'
import styles from './Agent.module.css'



function Agent({ onMenuClick }) {
  const navigate = useNavigate()

  const {
    messages,
    isTyping,
    isLoading,
    activeFlow,
    sendMessage,
    handleAction,
    cancelFlow,
  } = useAgent()

  const {
    enabled,
    doneTasks,
    upcomingTasks,
    drafts,
    cancelUpcoming,
    discardDraft,
  } = useAutonomousAgent()

  const { allOrders }               = useOrders()
  const { allInvoices, addInvoice } = useInvoices()
  const { allReceipts, addReceipt } = useReceipts()
  const { allPayments }             = usePayments()
  const { customers }               = useCustomers()
  const { user }                    = useAuth()
  const { generalSettings }         = useGeneralSettings()
  const { profileSettings }         = useProfileSettings()

  const [tab,        setTab]        = useState('done')
  const [chatOpen,   setChatOpen]   = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [toast,      setToast]      = useState(null)
  const [greeting]                  = useState(() => {
    const firstName = user?.displayName?.split(' ')[0] || ''
    return getGreeting(firstName)
  })

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleSend() {
    const v = inputValue.trim()
    if (!v) return
    haptic('light')
    setInputValue('')
    sendMessage(v)
  }

  async function handleSaveDoc(type, data, draftId) {
    try {
      if (type === 'invoice') {
        await addInvoice(data)
      } else {
        await addReceipt(data)
      }
      discardDraft(draftId)
      showToast(`${type === 'invoice' ? 'Invoice' : 'Receipt'} saved!`)
    } catch {
      showToast('Failed to save — please try again')
    }
  }

  const handleActionBtn = useCallback((action, payload) => {
    if (action === 'navigate') { navigate(payload.route); return }
    handleAction(action, payload)
  }, [handleAction, navigate])

  const TABS = [
    { key: 'done',     label: 'Activity' , badge: doneTasks.length },
    { key: 'upcoming', label: 'Scheduled', badge: upcomingTasks.length },
    { key: 'drafts',   label: 'Drafts', badge: drafts.length  },
  ]

  return (
    <div className={styles.pageWrapper}>
      <Header
        type="back"
        customTitle={{ iconComponent: AgentTitleIcon, title: 'Pady' }}
        onBackClick={() => navigate('/')}
        agentActive={enabled}
        customActions={[
          {
            icon: 'chat',
            onClick: () => { haptic('light'); setChatOpen(true) },
            color: 'var(--text)',
          },
        ]}
      />

      <div className={styles.tabRow}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ''}`}
            onClick={() => { haptic('light'); setTab(t.key) }}
          >
            {t.label}
            {t.badge > 0 && (
              <span className={styles.tabBadge}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {tab === 'done' && (
          <ActivityTab
            items={doneTasks}
            allOrders={allOrders}
            allInvoices={allInvoices}
            customers={customers}
          />
        )}
        {tab === 'upcoming' && (
          <ScheduledTab
            items={upcomingTasks}
            allOrders={allOrders}
            allInvoices={allInvoices}
            customers={customers}
            onCancel={cancelUpcoming}
          />
        )}
        {tab === 'drafts' && (
          <DraftsTab
            items={drafts}
            onDiscard={discardDraft}
            allOrders={allOrders}
            allInvoices={allInvoices}
            allReceipts={allReceipts}
            allPayments={allPayments}
            customers={customers}
            generalSettings={generalSettings}
            profileSettings={profileSettings}
            showToast={showToast}
            onSaveDoc={handleSaveDoc}
          />
        )}
      </div>

      {toast && (
        <div className={styles.toast}>{toast}</div>
      )}

      <BottomNav />

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        isTyping={isTyping}
        isLoading={isLoading}
        activeFlow={activeFlow}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={handleSend}
        onAction={handleActionBtn}
        onNavigate={navigate}
        onCancelFlow={cancelFlow}
        greeting={greeting}
      />
    </div>
  )
}

export default Agent
