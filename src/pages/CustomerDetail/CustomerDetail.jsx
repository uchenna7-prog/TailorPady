import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate, useLocation }      from 'react-router-dom'
import { useCustomers }                             from '../../contexts/CustomerContext'
import { useOrders }                                from '../../contexts/OrdersContext'
import { usePremium }                               from '../../contexts/PremiumContext'
import { useCustomerData }                          from '../../hooks/useCustomerData'
import { useInvoiceActions }                        from '../../hooks/useInvoiceActions'
import { useReceiptActions }                        from '../../hooks/useReceiptActions'
import { formatMoney }                              from '../../utils/moneyUtils'
import { getInitials }                              from '../../utils/nameUtils'
import { getBirthday, formatLastOrderDate }         from './utils'
import { PhotoOverlay }                             from './components/PhotoOverlay/PhotoOverlay'
import { DeleteConfirmModal }                       from './components/DeleteConfirmModal/DeleteConfirmModal'
import { EditCustomerModal }                        from './components/EditCustomerModal/EditCustomerModal'
import { WhatsAppIcon }                             from './components/WhatsAppIcon/WhatsAppIcon'
import { TABS, TAB_IDS, TAB_MODAL_EVENTS }          from './datas'
import Header                                       from '../../components/Header/Header'
import Toast                                        from '../../components/Toast/Toast'
import MeasurementsTab                              from './tabs/MeasurementsTab/MeasurementsTab'
import OrdersTab                                    from './tabs/OrdersTab/OrdersTab'
import InvoicesTab                                  from './tabs/InvoicesTab/InvoicesTab'
import PaymentsTab                                  from './tabs/PaymentsTab/PaymentsTab'
import ReceiptsTab                                  from './tabs/ReceiptsTab/ReceiptsTab'
import styles                                       from './CustomerDetail.module.css'


export default function CustomerDetail({ onMenuClick }) {

  const { id }       = useParams()
  const navigate     = useNavigate()
  const location     = useLocation()

  const { getCustomer, updateCustomer, deleteCustomerAndAllData } = useCustomers()
  const { allOrders }  = useOrders()
  const { isPremium }  = usePremium()
  const isDeletingRef  = useRef(false)

  const customerData = useCustomerData(id)
  const orders       = allOrders.filter(o => o.customerId === id)

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
  const [completedModal, setCompletedModal]   = useState(null)
  const [completedFields, setCompletedFields] = useState([])

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
  })

  const { handleGenerateReceipt, handleDeleteReceipt } = useReceiptActions({
    customerData,
    orders,
    showToast,
    setActiveTab,
  })

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

    navigate(location.pathname, { replace: true, state: null })
  }, [location.state])

  const scrollTabIntoView = useCallback((tabId) => {
    tabRefs.current[tabId]?.scrollIntoView({
      behavior: 'smooth', block: 'nearest', inline: 'center',
    })
  }, [])

  const handleTabClick = useCallback((tabId) => {
    if (tabStripDragged.current) return
    setActiveTab(tabId)
    scrollTabIntoView(tabId)
  }, [scrollTabIntoView])

  const handleTabStripPointerDown = useCallback((e) => {
    clearTimeout(tabStripCooldownRef.current)
    tabStripDragged.current = false
    tabStripScrollAtDown.current = tabsRef.current?.scrollLeft ?? 0
    tabStripPointerStartX.current = e.clientX
  }, [])

  const handleTabStripPointerMove = useCallback((e) => {
    if (tabStripPointerStartX.current === null) return
    const dx = e.clientX - tabStripPointerStartX.current
    if (Math.abs(dx) > 8) tabStripDragged.current = true
  }, [])

  const handleTabStripPointerUp = useCallback(() => {
    const startScroll = tabStripScrollAtDown.current
    const endScroll   = tabsRef.current?.scrollLeft ?? 0
    const scrollMoved  = startScroll !== null && Math.abs(endScroll - startScroll) > 2
    tabStripPointerStartX.current = null

    if (scrollMoved || tabStripDragged.current) {
      tabStripDragged.current = true
      clearTimeout(tabStripCooldownRef.current)
      tabStripCooldownRef.current = setTimeout(() => {
        tabStripDragged.current = false
      }, 200)
    }
  }, [])

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (window.innerWidth > 600 || touchStartX.current === null) return

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
        setActiveTab(nextTabId)
        scrollTabIntoView(nextTabId)
      }
    }

    touchStartX.current = null
    touchStartY.current = null
  }, [activeTab, scrollTabIntoView])

  const handleFabClick = useCallback(() => {
    const eventName = TAB_MODAL_EVENTS[activeTab]
    if (eventName) document.dispatchEvent(new CustomEvent(eventName))
  }, [activeTab])

  const handleEditSave = useCallback(async (updates) => {
    try {
      await updateCustomer(id, updates)
      showToast('Customer updated ✓')
    } catch {
      showToast('Failed to update customer. Try again.')
    }
  }, [id, updateCustomer, showToast])

  const handleDeleteConfirm = useCallback(async () => {
    try {
      isDeletingRef.current = true
      setDeleteModalOpen(false)
      navigate('/customers', { replace: true })
      await deleteCustomerAndAllData(id)
    } catch {
      isDeletingRef.current = false
      showToast('Failed to delete customer. Try again.')
    }
  }, [id, deleteCustomerAndAllData, navigate, showToast])

  const customer = getCustomer(id)
  if (!customer && !isDeletingRef.current) return null

  const initials     = getInitials(customer.name)
  const birthday     = getBirthday(customer.birthday)
  const hasPhoto     = isPremium && customer.photo
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
      onTouchEnd={handleTouchEnd}
    >
      <div ref={topSentinelRef} className={styles.sentinel} />

      <div className={styles.navHeader}>
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

      <div className={styles.profileContainer}>
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
            onClick={() => navigate(`/customers/${id}/body-measurements`)}
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
          onPointerDown={handleTabStripPointerDown}
          onPointerMove={handleTabStripPointerMove}
          onPointerUp={handleTabStripPointerUp}
          onPointerCancel={handleTabStripPointerUp}
        >
          {TABS.map(tab => (
            <div
              key={tab.id}
              ref={el => { tabRefs.current[tab.id] = el }}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span>{tab.label}</span>
              {tabItemCounts[tab.id] > 0 && (
                <span className={`${styles.tabBadge} ${activeTab === tab.id ? styles.tabBadge_active : ''}`}>
                  {tabItemCounts[tab.id]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tabContent} data-empty={activeTabIsEmpty ? 'true' : 'false'}>
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
            customerId={id}
            orders={orders}
            loading={customerData.ordersLoading}
            measurements={customerData.measurements}
            showToast={showToast}
            onGenerateInvoice={handleGenerateInvoice}
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
            completedModal={completedModal}
            completedFields={completedFields}
            onReopenInvoiceHandled={() => {
              setReopenInvoiceId(null)
              setReopenMissingFields(false)
              setCompletedModal(null)
              setCompletedFields([])
            }}
          />
        )}
        {activeTab === 'payments' && (
          <PaymentsTab
            orders={orders}
            payments={customerData.payments}
            showToast={showToast}
            onSavePayment={customerData.savePayment}
            onUpdatePayment={customerData.updatePayment}
            onDeletePayment={customerData.deletePayment}
            onInvoicePaid={handleInvoicePaid}
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
            completedModal={completedModal}
            completedFields={completedFields}
            onReopenReceiptHandled={() => {
              setReopenReceiptId(null)
              setReopenMissingFields(false)
              setCompletedModal(null)
              setCompletedFields([])
            }}
          />
        )}
      </div>

      <button className={styles.fab} onClick={handleFabClick}>
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
    </div>
  )
}
