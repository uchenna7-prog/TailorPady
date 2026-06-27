import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import BottomNav from '../../components/BottomNav/BottomNav'
import { useAutonomousAgent } from '../../contexts/AutonomousAgentContext'
import { useAuth } from '../../contexts/AuthContext'
import { useOrders } from '../../contexts/OrdersContext'
import { useInvoices } from '../../contexts/InvoiceContext'
import { useReceipts } from '../../contexts/ReceiptContext'
import { usePayments } from '../../contexts/PaymentContext'
import { useCustomers } from '../../contexts/CustomerContext'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { ActivityTab } from './tabs/ActivityTab/ActivityTab'
import { ScheduledTab } from './tabs/ScheduledTab/ScheduledTab'
import { DraftsTab } from './tabs/DraftsTab/DraftsTab'
import { AgentTitleIcon } from './components/AgentTitleIcon/AgentTitleIcon'
import { haptic } from './utils'
import styles from './Agent.module.css'

function Agent() {
  const navigate = useNavigate()

  const {
    enabled,
    drafts,
    pendingDrafts,
    approvedDrafts,
    pendingCount,
    upcomingTasks,
    dailyBrief,
    cancelUpcoming,
    approveDraft,
    discardDraft,
  } = useAutonomousAgent()

  const { user }                     = useAuth()
  const { allOrders }               = useOrders()
  const { allInvoices, addInvoice } = useInvoices()
  const { allReceipts, addReceipt } = useReceipts()
  const { allPayments }             = usePayments()
  const { customers }               = useCustomers()
  const { generalSettings }         = useGeneralSettings()
  const { profileSettings }         = useProfileSettings()

  const [tab,             setTab]             = useState('activity')
  const [toast,           setToast]           = useState(null)
  const [swipeProgress,   setSwipeProgress]   = useState(0)
  const [tabMeasurements, setTabMeasurements] = useState([])

  const tabsRef         = useRef(null)
  const tabItemRefs     = useRef([])
  const touchStartX     = useRef(null)
  const touchStartY     = useRef(null)
  const swipeAxisLocked = useRef(null)

  const TABS = [
    { key: 'activity',  label: 'Activity',  badge: 0 },
    { key: 'scheduled', label: 'Scheduled', badge: upcomingTasks.length },
    { key: 'drafts',    label: 'Drafts',    badge: pendingCount },
  ]

  const activeTabIdx = TABS.findIndex(t => t.key === tab)

  const measureTabs = useCallback(() => {
    if (!tabsRef.current) return
    const containerRect = tabsRef.current.getBoundingClientRect()
    const measurements  = tabItemRefs.current.map(el => {
      if (!el) return { left: 0, width: 0 }
      const rect = el.getBoundingClientRect()
      return {
        left:  rect.left - containerRect.left,
        width: rect.width,
      }
    })
    setTabMeasurements(measurements)
  }, [])

  useLayoutEffect(() => {
    measureTabs()
  }, [tab, upcomingTasks.length, pendingCount, measureTabs])

  useEffect(() => {
    window.addEventListener('resize', measureTabs)
    return () => window.removeEventListener('resize', measureTabs)
  }, [measureTabs])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
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

  const handleTouchStart = useCallback((e) => {
    touchStartX.current     = e.touches[0].clientX
    touchStartY.current     = e.touches[0].clientY
    swipeAxisLocked.current = null
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (touchStartX.current === null) return

    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (swipeAxisLocked.current === null) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        swipeAxisLocked.current = 'horizontal'
      } else if (Math.abs(dy) > 8) {
        swipeAxisLocked.current = 'vertical'
      }
    }

    if (swipeAxisLocked.current !== 'horizontal') return

    const screenW    = window.innerWidth || 375
    const rawProgress = dx / screenW

    const atStart = activeTabIdx === 0
    const atEnd   = activeTabIdx === TABS.length - 1

    let clamped = rawProgress
    if (atStart && rawProgress > 0) clamped = rawProgress * 0.15
    if (atEnd   && rawProgress < 0) clamped = rawProgress * 0.15

    setSwipeProgress(Math.max(-1, Math.min(1, clamped)))
  }, [activeTabIdx, TABS.length])

  const handleTouchEnd = useCallback(() => {
    if (swipeAxisLocked.current === 'horizontal' && Math.abs(swipeProgress) > 0.2) {
      if (swipeProgress < 0 && activeTabIdx < TABS.length - 1) {
        setTab(TABS[activeTabIdx + 1].key)
      } else if (swipeProgress > 0 && activeTabIdx > 0) {
        setTab(TABS[activeTabIdx - 1].key)
      }
    }
    touchStartX.current     = null
    touchStartY.current     = null
    swipeAxisLocked.current = null
    setSwipeProgress(0)
  }, [swipeProgress, activeTabIdx, TABS])

  const getUnderlineStyle = () => {
    const current = tabMeasurements[activeTabIdx]
    if (!current) return { left: 0, width: 0 }

    if (swipeProgress === 0) {
      return { left: current.left, width: current.width }
    }

    const neighbourIdx = swipeProgress < 0 ? activeTabIdx + 1 : activeTabIdx - 1
    const neighbour    = tabMeasurements[neighbourIdx]
    if (!neighbour) return { left: current.left, width: current.width }

    const t     = Math.abs(swipeProgress)
    const left  = current.left  + (neighbour.left  - current.left)  * t
    const width = current.width + (neighbour.width - current.width) * t

    return { left, width }
  }

  const underlineStyle = getUnderlineStyle()

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.stickyTop}>
        <Header
          type="back"
          customTitle={{ iconComponent: AgentTitleIcon, title: 'Pady' }}
          showBorderBottom={false}
          onBackClick={() => navigate('/')}
          agentActive={enabled}
          customActions={[
            {
              icon:    'chat',
              onClick: () => { haptic('light'); navigate('/agent/chat') },
              color:   'var(--text)',
            },
          ]}
        />

        <div className={styles.tabRow} ref={tabsRef}>
          {TABS.map((t, idx) => (
            <button
              key={t.key}
              ref={el => { tabItemRefs.current[idx] = el }}
              className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ''}`}
              onClick={() => { haptic('light'); setTab(t.key) }}
            >
              {t.label}
              {t.badge > 0 && (
                <span className={`${styles.tabBadge} ${tab === t.key ? styles.tabBadgeActive : ''}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}

          <div
            className={styles.tabUnderlineTrack}
            style={{ left: underlineStyle.left, width: underlineStyle.width }}
          />
        </div>
      </div>

      <div
        className={styles.tabContent}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {tab === 'activity' && (
          <ActivityTab
            user={user}
            drafts={drafts}
            approvedDrafts={approvedDrafts}
            dailyBrief={dailyBrief}
            allOrders={allOrders}
            allInvoices={allInvoices}
            allPayments={allPayments}
            customers={customers}
          />
        )}
        {tab === 'scheduled' && (
          <ScheduledTab
            items={upcomingTasks}
            allOrders={allOrders}
            allInvoices={allInvoices}
            allPayments={allPayments}
            customers={customers}
            onCancel={cancelUpcoming}
          />
        )}
        {tab === 'drafts' && (
          <DraftsTab
            items={drafts}
            pendingDrafts={pendingDrafts}
            approvedDrafts={approvedDrafts}
            onApprove={approveDraft}
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
    </div>
  )
}

export default Agent