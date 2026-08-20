import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { useParams, useNavigate, useLocation }      from 'react-router-dom'
import { useCustomers }                             from '../../contexts/CustomerContext'
import { useOrders }                                from '../../contexts/OrdersContext'
import { useUsage }                                 from '../../contexts/UsageContext'
import { useCustomerData }                          from '../../hooks/useCustomerData'
import { useInvoiceActions }                        from '../../hooks/useInvoiceActions'
import { useReceiptActions }                        from '../../hooks/useReceiptActions'
import { useTour }                                  from '../../contexts/TourContext'
import { formatMoney }                              from '../../utils/moneyUtils'
import { getInitials }                              from '../../utils/nameUtils'
import { getBirthday, formatLastOrderDate }         from './utils'
import { PhotoOverlay }                             from './components/PhotoOverlay/PhotoOverlay'
import { DeleteConfirmModal }                       from './components/DeleteConfirmModal/DeleteConfirmModal'
import { EditCustomerModal }                        from './components/EditCustomerModal/EditCustomerModal'
import { WhatsAppIcon }                             from './components/WhatsAppIcon/WhatsAppIcon'
import { TABS, TAB_IDS, TAB_MODAL_EVENTS }          from './datas'
import { UpgradeSheet }                             from '../../components/UpgradeSheet/UpgradeSheet'
import Header                                       from '../../components/Header/Header'
import Toast                                        from '../../components/Toast/Toast'
import MeasurementsTab                              from './tabs/MeasurementsTab/MeasurementsTab'
import OrdersTab                                    from './tabs/OrdersTab/OrdersTab'
import InvoicesTab                                  from './tabs/InvoicesTab/InvoicesTab'
import PaymentsTab                                  from './tabs/PaymentsTab/PaymentsTab'
import ReceiptsTab                                  from './tabs/ReceiptsTab/ReceiptsTab'
import styles                                       from './CustomerDetail.module.css'


const TAB_TOUR_STEP_IDS = {
  orders:   'goto-orders-tab',
  invoices: 'goto-invoices-tab',
  payments: 'goto-payments-tab',
  receipts: 'goto-receipts-tab',
}

const NUDGE_INITIAL_DELAY_MS = 1800
const NUDGE_RETRY_INTERVAL_MS = 1500
const NUDGE_MAX_ATTEMPTS = 8


function prevTabIdToDirection(currentTabId, nextTabId) {
  const currentIdx = TAB_IDS.indexOf(currentTabId)
  const nextIdx = TAB_IDS.indexOf(nextTabId)
  if (nextIdx === currentIdx) return null
  return nextIdx > currentIdx ? 'left' : 'right'
}


function resolveChainLanding(tourId, measurementsCount, ordersCount, paymentsCount) {
  if (measurementsCount === 0) return 'recovery-needs-measurement'
  if (tourId === 'recovery-orders') return 'goto-orders-tab'
  if (ordersCount === 0) return 'recovery-needs-order'
  if (tourId === 'recovery-invoices') return 'goto-invoices-tab'
  if (tourId === 'recovery-payments') return 'goto-payments-tab'
  if (paymentsCount === 0) return 'recovery-needs-payment'
  return 'goto-receipts-tab'
}


export default function CustomerDetail({ onMenuClick, sidebarOpen }) {

  const { id }       = useParams()
  const navigate     = useNavigate()
  const location     = useLocation()
  const { completeStep, currentStep, startTour, hasCompletedTour, activeTourId, goToStep } = useTour()

  const { getCustomer, updateCustomer, deleteCustomerAndAllData } = useCustomers()
  const { allOrders }  = useOrders()
  const { limits }     = useUsage()
  const isDeletingRef  = useRef(false)

  const customer   = getCustomer(id)
  const resolvedId = customer?.id ?? id

  const customerData = useCustomerData(resolvedId)
  const orders       = allOrders.filter(o => o.customerId === resolvedId)

  const [activeTab,       setActiveTab]       = useState('measurements')
  const [isScrolled,      setIsScrolled]      = useState(false)
  const [toastMsg,        setToastMsg]        = useState('')
  const [editModalOpen,   setEditModalOpen]   = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [photoModalOpen,  setPhotoModalOpen]  = useState(false)
  const [notesExpanded,   setNotesExpanded]   = useState(false)
  const [reopenInvoiceId, setReopenInvoiceId] = useState(null)
  const [reopenReceiptId, setReopenReceiptId] = useState(null)
  const [reopenMissingFields, setReopenMissingFields] = useState(false)
  const [reopenTemplateModal, setReopenTemplateModal] = useState(false)
  const [completedModal, setCompletedModal]   = useState(null)
  const [completedFields, setCompletedFields] = useState([])
  const [invoiceUpgradeOpen, setInvoiceUpgradeOpen] = useState(false)
  const [receiptUpgradeOpen, setReceiptUpgradeOpen] = useState(false)

  const toastTimerRef  = useRef(null)
  const tabsRef        = useRef(null)
  const topSentinelRef = useRef(null)
  const healedRef      = useRef(false)
  const touchStartX    = useRef(null)
  const touchStartY    = useRef(null)
  const tabRefs        = useRef({})
  const tabStripDragged = useRef(false)
  const tabStripScrollAtDown = useRef(null)
  const tabStripPointerStartX = useRef(null)
  const tabStripCooldownRef  = useRef(null)
  const uiBusyRef = useRef(false)
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })
  const [dragOffset, setDragOffset] = useState(0)
  const [slideDirection, setSlideDirection] = useState(null)
  const isDraggingRef = useRef(false)

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastMsg(''), 2400)
  }, [])

  const { handleGenerateInvoice, handleInvoicePaid, handleDeleteInvoice } = useInvoiceActions({
    customerData,
    orders,
    showToast,
    setActiveTab,
    setReopenInvoiceId,
    onLimitReached: () => setInvoiceUpgradeOpen(true),
  })

  const { handleGenerateReceipt, handleDeleteReceipt } = useReceiptActions({
    customerData,
    orders,
    showToast,
    setActiveTab,
    setReopenReceiptId,
    onLimitReached: () => setReceiptUpgradeOpen(true),
  })

  const handleViewInvoice = useCallback((invoiceId) => {
    setActiveTab('invoices')
    setReopenInvoiceId(invoiceId)
  }, [])

  const handleViewReceipt = useCallback((receiptId) => {
    setActiveTab('receipts')
    setReopenReceiptId(receiptId)
  }, [])

  useEffect(() => {
    if (!customer) return
    if (customer.id === id) return
    navigate(`/customers/${customer.id}`, { replace: true, state: location.state })
  }, [customer, id, navigate, location.state])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0.1 }
    )
    if (topSentinelRef.current) observer.observe(topSentinelRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (healedRef.current) return
    if (!customerData.invoices?.length || !customerData.payments?.length) return

    healedRef.current = true

    for (const payment of customerData.payments) {
      if (!payment.orderId) continue

      const amountPaid = (payment.installments || []).reduce(
        (sum, installment) => sum + (parseFloat(installment.amount) || 0), 0
      )
      if (amountPaid <= 0) continue

      const unpaidInvoice = customerData.invoices.find(
        invoice =>
          String(invoice.orderId) === String(payment.orderId) &&
          invoice.status === 'unpaid'
      )
      if (!unpaidInvoice) continue

      const correctedStatus = payment.status === 'paid' ? 'paid' : 'part_paid'
      customerData.updateInvoiceStatus(unpaidInvoice.id, correctedStatus)
    }
  }, [customerData.invoices, customerData.payments])

  useEffect(() => {
    const onSwitchTab   = () => setActiveTab('invoices')
    const onGenerateInv = (e) => handleGenerateInvoice(e.detail.orderId)

    document.addEventListener('switchToInvoiceTab', onSwitchTab)
    document.addEventListener('generateInvoice', onGenerateInv)
    return () => {
      document.removeEventListener('switchToInvoiceTab', onSwitchTab)
      document.removeEventListener('generateInvoice', onGenerateInv)
    }
  }, [handleGenerateInvoice])

  useEffect(() => {
    const navState = location.state
    if (!navState?.reopenInvoiceId && !navState?.reopenReceiptId) return

    if (navState.reopenInvoiceId) {
      setActiveTab('invoices')
      setReopenInvoiceId(navState.reopenInvoiceId)
    }

    if (navState.reopenReceiptId) {
      setActiveTab('receipts')
      setReopenReceiptId(navState.reopenReceiptId)
    }

    setReopenMissingFields(navState.reopenMissingFields ?? false)
    setCompletedModal(navState.completedModal ?? null)
    setCompletedFields(navState.completedFields ?? [])
    setReopenTemplateModal(navState.reopenTemplateModal ?? false)

    navigate(location.pathname, { replace: true, state: null })
  }, [location.state])

  useEffect(() => {
    uiBusyRef.current = Boolean(
      sidebarOpen ||
      activeTourId ||
      editModalOpen ||
      deleteModalOpen ||
      photoModalOpen ||
      invoiceUpgradeOpen ||
      receiptUpgradeOpen
    )
  }, [sidebarOpen, activeTourId, editModalOpen, deleteModalOpen, photoModalOpen, invoiceUpgradeOpen, receiptUpgradeOpen])

  function armNudge(startFn) {
    let attempts = 0
    let timeoutId = setTimeout(function tryFire() {
      if (uiBusyRef.current || document.hidden) {
        attempts += 1
        if (attempts >= NUDGE_MAX_ATTEMPTS) return
        timeoutId = setTimeout(tryFire, NUDGE_RETRY_INTERVAL_MS)
        return
      }
      startFn()
    }, NUDGE_INITIAL_DELAY_MS)
    return () => clearTimeout(timeoutId)
  }

  useEffect(() => {
    if (!customer) return
    if (activeTourId) return
    if (!hasCompletedTour('onboarding')) return
    if (hasCompletedTour('body-measurements-nudge')) return
    return armNudge(() => startTour('body-measurements-nudge'))
  }, [customer, activeTourId, hasCompletedTour, startTour])

  useEffect(() => {
    if (currentStep?.id !== 'recovery-chain-check') return
    if (customerData.measurementsLoading || customerData.ordersLoading || customerData.paymentsLoading) return
    const landing = resolveChainLanding(
      activeTourId,
      customerData.measurements?.length ?? 0,
      orders.length,
      customerData.payments?.length ?? 0,
    )
    goToStep(landing)
  }, [currentStep, activeTourId, customerData.measurementsLoading, customerData.ordersLoading, customerData.paymentsLoading, customerData.measurements, orders, customerData.payments, goToStep])

  useEffect(() => {
    if (currentStep?.id !== 'confirm-setup-profile-after-tour') return
    if (activeTourId !== 'recovery-receipts') return
    goToStep('done')
  }, [currentStep, activeTourId, goToStep])

  const scrollTabIntoView = useCallback((tabId) => {
    tabRefs.current[tabId]?.scrollIntoView({
      behavior: 'smooth', block: 'nearest', inline: 'center',
    })
  }, [])

  const updateUnderline = useCallback(() => {
    const activeEl = tabRefs.current[activeTab]
    const stripEl  = tabsRef.current
    if (!activeEl || !stripEl) return
    const tabRect   = activeEl.getBoundingClientRect()
    const stripRect = stripEl.getBoundingClientRect()
    const nextLeft  = tabRect.left - stripRect.left + stripEl.scrollLeft
    const nextWidth = tabRect.width

    setUnderlineStyle(prev => {
      if (prev.left === nextLeft && prev.width === nextWidth) return prev
      return { left: nextLeft, width: nextWidth }
    })
  }, [activeTab])

  const updateUnderlineRef = useRef(updateUnderline)
  useEffect(() => {
    updateUnderlineRef.current = updateUnderline
  }, [updateUnderline])

  useLayoutEffect(() => {
    updateUnderline()
  }, [activeTab, updateUnderline])

  useEffect(() => {
    const handleExternalChange = () => updateUnderlineRef.current()

    const resizeObserver = new ResizeObserver(handleExternalChange)
    TAB_IDS.forEach(tabId => {
      const el = tabRefs.current[tabId]
      if (el) resizeObserver.observe(el)
    })

    window.addEventListener('resize', handleExternalChange)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleExternalChange)
    }
  }, [])

  const goToTab = useCallback((tabId) => {
    const tourStepId = TAB_TOUR_STEP_IDS[tabId]
    if (tourStepId) completeStep(tourStepId)
  }, [completeStep])

  const handleTabStripTouchStart = useCallback((e) => {
    e.stopPropagation()
    clearTimeout(tabStripCooldownRef.current)
    tabStripDragged.current = false
    tabStripScrollAtDown.current = tabsRef.current?.scrollLeft ?? 0
    tabStripPointerStartX.current = e.touches[0].clientX
  }, [])

  const handleTabStripTouchMove = useCallback((e) => {
    e.stopPropagation()
    if (tabStripPointerStartX.current === null) return
    const dx = e.touches[0].clientX - tabStripPointerStartX.current
    if (Math.abs(dx) > 8) tabStripDragged.current = true
  }, [])

  const handleTabTouchEnd = useCallback((e, tabId) => {
    e.stopPropagation()
    const startScroll = tabStripScrollAtDown.current
    tabStripPointerStartX.current = null

    setTimeout(() => {
      const endScroll  = tabsRef.current?.scrollLeft ?? 0
      const scrollMoved = startScroll !== null && Math.abs(endScroll - startScroll) > 2

      if (scrollMoved || tabStripDragged.current) {
        tabStripDragged.current = true
        clearTimeout(tabStripCooldownRef.current)
        tabStripCooldownRef.current = setTimeout(() => {
          tabStripDragged.current = false
        }, 250)
        return
      }

      setSlideDirection(prevTabIdToDirection(activeTab, tabId))
      setActiveTab(tabId)
      scrollTabIntoView(tabId)
      goToTab(tabId)
      setTimeout(() => setSlideDirection(null), 260)
    }, 60)
  }, [scrollTabIntoView, activeTab, goToTab])

  const handleTabClick = useCallback((tabId) => {
    if (tabStripDragged.current) return
    setSlideDirection(prevTabIdToDirection(activeTab, tabId))
    setActiveTab(tabId)
    scrollTabIntoView(tabId)
    goToTab(tabId)
    setTimeout(() => setSlideDirection(null), 260)
  }, [scrollTabIntoView, activeTab, goToTab])

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isDraggingRef.current = false
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (window.innerWidth > 600 || touchStartX.current === null) return

    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (!isDraggingRef.current) {
      if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) < 10) return
      isDraggingRef.current = true
    }

    const currentIdx  = TAB_IDS.indexOf(activeTab)
    const canGoLeft   = dx < 0 && currentIdx < TAB_IDS.length - 1
    const canGoRight  = dx > 0 && currentIdx > 0
    if (!canGoLeft && !canGoRight) return

    const resisted = dx * 0.35
    setDragOffset(Math.max(-48, Math.min(48, resisted)))
  }, [activeTab])

  const handleTouchEnd = useCallback((e) => {
    if (window.innerWidth > 600 || touchStartX.current === null) {
      setDragOffset(0)
      isDraggingRef.current = false
      return
    }

    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50

    if (isHorizontalSwipe) {
      const currentIdx   = TAB_IDS.indexOf(activeTab)
      const isSwipeLeft  = dx < 0 && currentIdx < TAB_IDS.length - 1
      const isSwipeRight = dx > 0 && currentIdx > 0

      const nextTabId = isSwipeLeft
        ? TAB_IDS[currentIdx + 1]
        : isSwipeRight
          ? TAB_IDS[currentIdx - 1]
          : null

      if (nextTabId) {
        setSlideDirection(isSwipeLeft ? 'left' : 'right')
        setActiveTab(nextTabId)
        scrollTabIntoView(nextTabId)
        goToTab(nextTabId)
        setTimeout(() => setSlideDirection(null), 260)
      }
    }

    setDragOffset(0)
    isDraggingRef.current = false
    touchStartX.current = null
    touchStartY.current = null
  }, [activeTab, scrollTabIntoView, goToTab])

  const handleFabClick = useCallback(() => {
    const eventName = TAB_MODAL_EVENTS[activeTab]
    if (eventName) document.dispatchEvent(new CustomEvent(eventName))
  }, [activeTab])

  const handleEditSave = useCallback(async (updates) => {
    try {
      await updateCustomer(resolvedId, updates)
      showToast('Customer updated ✓')
    } catch {
      showToast('Failed to update customer. Try again.')
    }
  }, [resolvedId, updateCustomer, showToast])

  const handleDeleteConfirm = useCallback(async () => {
    try {
      isDeletingRef.current = true
      setDeleteModalOpen(false)
      navigate('/customers', { replace: true })
      await deleteCustomerAndAllData(resolvedId)
    } catch {
      isDeletingRef.current = false
      showToast('Failed to delete customer. Try again.')
    }
  }, [resolvedId, deleteCustomerAndAllData, navigate, showToast])

  const handleInvoiceUpgrade = useCallback(() => {
    setInvoiceUpgradeOpen(false)
    navigate('/upgrade')
  }, [navigate])

  const handleReceiptUpgrade = useCallback(() => {
    setReceiptUpgradeOpen(false)
    navigate('/upgrade')
  }, [navigate])

  const handleBodyMeasurementsClick = useCallback(() => {
    if (currentStep?.id === 'body-measurements-tip') {
      completeStep('body-measurements-tip')
    }
    navigate(`/customers/${resolvedId}/body-measurements`)
  }, [currentStep, completeStep, navigate, resolvedId])

  if (!customer && !isDeletingRef.current) return null

  const initials     = getInitials(customer.name)
  const birthday     = getBirthday(customer.birthday)
  const hasPhoto     = Boolean(customer.photo)
  const isOnWhatsApp = customer.onWhatsApp === true
  const hasEmail     = Boolean(customer.email?.trim())

  const lastOrder = orders.length > 0
    ? orders.reduce((latest, order) => {
        const toMs = (o) => {
          if (o.createdAt?.toDate)  return o.createdAt.toDate().getTime()
          if (o.createdAt?.seconds) return o.createdAt.seconds * 1000
          if (o.createdAt)          return new Date(o.createdAt).getTime()
          if (o.takenAt)            return new Date(o.takenAt).getTime()
          return 0
        }
        return toMs(order) > toMs(latest) ? order : latest
      }, orders[0])
    : null

  const lastOrderLabel = lastOrder
    ? (() => {
        const rawDate =
          lastOrder.createdAt?.toDate?.()?.toISOString?.() ||
          (lastOrder.createdAt?.seconds
            ? new Date(lastOrder.createdAt.seconds * 1000).toISOString()
            : null) ||
          lastOrder.createdAt ||
          lastOrder.takenAt   ||
          null
        const dateStr = rawDate ? formatLastOrderDate(rawDate) : 'Recently'
        return `${lastOrder.desc || 'Order'} · ${dateStr}`
      })()
    : null

  const totalBilled = orders.reduce(
    (sum, order) => sum + (parseFloat(order.totalAmount || order.price) || 0), 0
  )

  const totalPaid = customerData.payments.reduce(
    (sum, payment) => sum + (payment.installments || []).reduce(
      (s, installment) => s + (parseFloat(installment.amount) || 0), 0
    ), 0
  )

  const balanceDue = Math.max(0, totalBilled - totalPaid)

  const tabItemCounts = {
    measurements: customerData.measurements?.length ?? 0,
    orders:       orders.length,
    invoices:     customerData.invoices?.length  ?? 0,
    payments:     customerData.payments?.length  ?? 0,
    receipts:     customerData.receipts?.length  ?? 0,
  }

  const activeTabIsEmpty = tabItemCounts[activeTab] === 0

  const scrolledAvatar = {
    src:     hasPhoto ? customer.photo : null,
    initials,
    onClick: () => setPhotoModalOpen(true),
  }

  return (
    <div
      className={styles.page}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={topSentinelRef} className={styles.sentinel} />

      <div className={styles.navHeader} data-tour="page-header">
        <Header
          type="back"
          title={isScrolled ? customer.name : 'Customer Details'}
          isScrolled={isScrolled}
          showBorderBottom={false}
          scrolledAvatar={scrolledAvatar}
          customActions={[
            { icon: 'edit',   onClick: () => setEditModalOpen(true),   outlined: true },
            { icon: 'delete', onClick: () => setDeleteModalOpen(true), outlined: true, color: 'var(--danger)' },
          ]}
        />
      </div>

      <div className={styles.profileContainer} data-tour="customer-profile-block">
        <div className={styles.profileSection}>

          <div className={styles.topRow}>
            <div
              className={`${styles.avatar} ${isScrolled ? styles.avatarScrolled : ''}`}
              onClick={() => setPhotoModalOpen(true)}
              role="button"
              aria-label="View profile photo"
            >
              {hasPhoto
                ? <img src={customer.photo} className={styles.avatarImg} alt={customer.name} />
                : <span className={styles.avatarInitials}>{initials}</span>
              }
            </div>

            <div className={styles.identityBlock}>
              <div className={styles.name}>{customer.name}</div>

              <div className={styles.metaRow}>
                <span className={styles.metaChip}>
                  <span className="mi">call</span>
                  <span className={styles.metaChipText}>{customer.phone}</span>
                </span>

                {customer.sex && (
                  <>
                    <span className={styles.metaDot} aria-hidden="true">·</span>
                    <span className={styles.metaChip}>
                      <span className="mi">person</span>
                      <span className={styles.metaChipText}>{customer.sex}</span>
                    </span>
                  </>
                )}

                {birthday && (
                  <>
                    <span className={styles.metaDot} aria-hidden="true">·</span>
                    <span className={`${styles.metaChip} ${styles.metaChipBirthday}`}>
                      <span className="mi">cake</span>
                      <span className={styles.metaChipText}>{birthday}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {(customer.email || customer.address) && (
            <div className={styles.contactBlock}>
              {customer.email && (
                <div className={styles.contactRow}>
                  <span className="mi">mail_outline</span>
                  <span className={styles.contactText}>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className={styles.contactRow}>
                  <span className="mi">place</span>
                  <span className={styles.contactText}>{customer.address}</span>
                </div>
              )}
            </div>
          )}

          {lastOrderLabel && (
            <div className={styles.lastOrderBlock}>
              <div className={styles.lastOrderLine}>
                <span className="mi">schedule</span>
                <span className={styles.lastOrderText}><strong>{lastOrderLabel}</strong></span>
              </div>
            </div>
          )}

          {customer.notes && (
            <div className={styles.notesBlock}>
              <div className={styles.notesLine}>
                <span className="mi">edit_note</span>
                <p
                  className={`${styles.notesText} ${notesExpanded ? styles.notesText_expanded : ''}`}
                  onClick={() => setNotesExpanded(prev => !prev)}
                >
                  {customer.notes}
                </p>
              </div>
            </div>
          )}

          {totalBilled > 0 && (
            <div className={styles.statsBlock}>
              <div className={styles.statsGrid}>
                <div className={styles.statCell}>
                  <span className={styles.statAmount}>{formatMoney('₦', totalBilled, 0, 0)}</span>
                  <span className={styles.statLabel}>Total Billed</span>
                </div>

                {balanceDue > 0 && (
                  <div className={`${styles.statCell} ${styles.statCell_owed}`}>
                    <span className={styles.statAmount}>{formatMoney('₦', balanceDue, 0, 0)}</span>
                    <span className={styles.statLabel}>Balance Due</span>
                  </div>
                )}

                {totalPaid > 0 && (
                  <div className={`${styles.statCell} ${styles.statCell_paid}`}>
                    <span className={styles.statAmount}>{formatMoney('₦', totalPaid, 0, 0)}</span>
                    <span className={styles.statLabel}>Total Paid</span>
                  </div>
                )}

                {balanceDue === 0 && totalBilled > 0 && (
                  <div className={`${styles.statCell} ${styles.statCell_owed}`}>
                    <span className={styles.statAmount}>{formatMoney('₦', balanceDue, 0, 0)}</span>
                    <span className={styles.statLabel}>Balance</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.light}`}
            onClick={() => { window.location = `tel:${customer.phone}` }}
          >
            <span className="mi">call</span>
            Call
          </button>

          {isOnWhatsApp && (
            <button
              className={`${styles.btn} ${styles.light}`}
              onClick={() => { window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}`, '_blank') }}
            >
              <WhatsAppIcon size={15} color="#25D366" />
              WhatsApp
            </button>
          )}

          {!isOnWhatsApp && hasEmail && (
            <button
              className={`${styles.btn} ${styles.light}`}
              onClick={() => { window.location = `mailto:${customer.email}` }}
            >
              <span className="mi">mail_outline</span>
              Email
            </button>
          )}

          <button
            className={`${styles.btn} ${styles.primary}`}
            onClick={handleBodyMeasurementsClick}
            data-tour="body-measurements-btn"
          >
            <span className="mi">straighten</span>
            Body Measurements
          </button>
        </div>
      </div>

      <div className={styles.stickyTabsWrapper}>
        <div
          className={styles.tabs}
          ref={tabsRef}
          onTouchStart={handleTabStripTouchStart}
          onTouchMove={handleTabStripTouchMove}
        >
          {TABS.map(tab => (
            <div
              key={tab.id}
              ref={el => { tabRefs.current[tab.id] = el }}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => handleTabClick(tab.id)}
              onTouchEnd={e => handleTabTouchEnd(e, tab.id)}
              data-tour={`tab-${tab.id}`}
            >
              <span>{tab.label}</span>
              {tabItemCounts[tab.id] > 0 && (
                <span className={`${styles.tabBadge} ${activeTab === tab.id ? styles.tabBadge_active : ''}`}>
                  {tabItemCounts[tab.id]}
                </span>
              )}
            </div>
          ))}
          <span
            className={styles.tabUnderline}
            style={{ transform: `translateX(${underlineStyle.left}px)`, width: `${underlineStyle.width}px` }}
          />
        </div>
      </div>

      <div
        className={styles.tabContent}
        data-empty={activeTabIsEmpty ? 'true' : 'false'}
        key={activeTab}
        data-slide={slideDirection ?? undefined}
        style={dragOffset !== 0 ? { transform: `translateX(${dragOffset}px)` } : undefined}
      >
        {activeTab === 'measurements' && (
          <MeasurementsTab
            measurements={customerData.measurements}
            loading={customerData.measurementsLoading}
            gender={customer.sex}
            onSave={customerData.saveMeasurement}
            onUpdate={customerData.updateMeasurement}
            onDelete={customerData.deleteMeasurement}
            showToast={showToast}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersTab
            customerId={resolvedId}
            orders={orders}
            loading={customerData.ordersLoading}
            measurements={customerData.measurements}
            showToast={showToast}
            onGenerateInvoice={handleGenerateInvoice}
            onViewInvoice={handleViewInvoice}
          />
        )}
        {activeTab === 'invoices' && (
          <InvoicesTab
            invoices={customerData.invoices}
            loading={customerData.invoicesLoading}
            orders={orders}
            measurements={customerData.measurements}
            customer={customer}
            customerData={customerData}
            onSave={customerData.saveInvoice}
            onDelete={handleDeleteInvoice}
            onStatusChange={customerData.updateInvoiceStatus}
            onGenerateInvoice={handleGenerateInvoice}
            showToast={showToast}
            reopenInvoiceId={reopenInvoiceId}
            reopenMissingFields={reopenMissingFields}
            reopenTemplateModal={reopenTemplateModal}
            completedModal={completedModal}
            completedFields={completedFields}
            onReopenInvoiceHandled={() => {
              setReopenInvoiceId(null)
              setReopenMissingFields(false)
              setReopenTemplateModal(false)
              setCompletedModal(null)
              setCompletedFields([])
            }}
          />
        )}
        {activeTab === 'payments' && (
          <PaymentsTab
            orders={orders}
            payments={customerData.payments}
            receipts={customerData.receipts}
            showToast={showToast}
            onSavePayment={customerData.savePayment}
            onUpdatePayment={customerData.updatePayment}
            onDeletePayment={customerData.deletePayment}
            onInvoicePaid={handleInvoicePaid}
            onGenerateReceipt={handleGenerateReceipt}
            onViewReceipt={handleViewReceipt}
          />
        )}
        {activeTab === 'receipts' && (
          <ReceiptsTab
            receipts={customerData.receipts}
            customer={customer}
            customerData={customerData}
            orders={orders}
            payments={customerData.payments}
            onDelete={handleDeleteReceipt}
            onGenerateReceipt={handleGenerateReceipt}
            showToast={showToast}
            reopenReceiptId={reopenReceiptId}
            reopenMissingFields={reopenMissingFields}
            reopenTemplateModal={reopenTemplateModal}
            completedModal={completedModal}
            completedFields={completedFields}
            onReopenReceiptHandled={() => {
              setReopenReceiptId(null)
              setReopenMissingFields(false)
              setReopenTemplateModal(false)
              setCompletedModal(null)
              setCompletedFields([])
            }}
          />
        )}
      </div>

      <button className={styles.fab} onClick={handleFabClick} data-tour="detail-fab">
        <span className="mi">add</span>
      </button>

      <Toast message={toastMsg} />

      <PhotoOverlay
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        photo={hasPhoto ? customer.photo : null}
        initials={initials}
        name={customer.name}
      />

      {editModalOpen && (
        <EditCustomerModal
          customer={customer}
          onSave={handleEditSave}
          onClose={() => setEditModalOpen(false)}
        />
      )}

      {deleteModalOpen && (
        <DeleteConfirmModal
          customer={customer}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}

      <UpgradeSheet
        isOpen={invoiceUpgradeOpen}
        onClose={() => setInvoiceUpgradeOpen(false)}
        onUpgrade={handleInvoiceUpgrade}
        icon="receipt_long"
        title="Invoice limit reached"
        message={`You've hit the free plan limit of ${limits.invoicesPerMonth} invoices this month. Upgrade to Premium for unlimited invoices.`}
      />

      <UpgradeSheet
        isOpen={receiptUpgradeOpen}
        onClose={() => setReceiptUpgradeOpen(false)}
        onUpgrade={handleReceiptUpgrade}
        icon="receipt"
        title="Receipt limit reached"
        message={`You've hit the free plan limit of ${limits.receiptsPerMonth} receipts this month. Upgrade to Premium for unlimited receipts.`}
      />
    </div>
  )
}