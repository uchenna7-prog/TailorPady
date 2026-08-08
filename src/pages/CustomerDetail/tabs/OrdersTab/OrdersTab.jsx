import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../../../../contexts/OrdersContext'
import { useUsage } from '../../../../contexts/UsageContext'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { useTour } from '../../../../contexts/TourContext'
import { AddOrderModal } from './components/AddOrderModal/AddOrderModal'
import OrderDetailModal from '../../../../components/OrderDetailModal/OrderDetailModal'
import { OrderRow } from './components/OrderRow/OrderRow'
import { OrderRowSkeleton } from './components/OrderRowSkeleton/OrderRowSkeleton'
import { EmptyState } from './components/EmptyState/EmptyState'
import { UpgradeSheet } from '../../../../components/UpgradeSheet/UpgradeSheet'
import { formatFirestoreDate } from './utils'
import styles from './OrdersTab.module.css'


export default function OrdersTab({ customerId, orders, loading, measurements, showToast, onGenerateInvoice, onViewInvoice }) {

  const navigate = useNavigate()
  const { addOrder } = useOrders()
  const { hasReachedLimit, remaining, limits } = useUsage()
  const { generalSettings } = useGeneralSettings()
  const { completeStep, currentStep, pendingViewItemId, pauseTour, resumeTour } = useTour()

  const taxEnabled = generalSettings.invoiceShowTax ?? false
  const taxRate    = generalSettings.invoiceTaxRate ?? 0

  const [isModalOpen,   setIsModalOpen]   = useState(false)
  const [upgradeOpen,   setUpgradeOpen]   = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const remainingOrders = remaining('ordersPerMonth', 'ordersPerMonth')
  const atLimit          = hasReachedLimit('ordersPerMonth', 'ordersPerMonth')

  useEffect(() => {
    const openModal = () => {
      if (atLimit) {
        setUpgradeOpen(true)
        return
      }
      setIsModalOpen(true)
    }
    document.addEventListener('openAddOrderModal', openModal)
    return () => document.removeEventListener('openAddOrderModal', openModal)
  }, [atLimit])

  useEffect(() => {
    if (!isModalOpen) return
    pauseTour()
    return () => resumeTour()
  }, [isModalOpen, pauseTour, resumeTour])

  useEffect(() => {
    if (!selectedOrder) return
    pauseTour()
    return () => resumeTour()
  }, [selectedOrder, pauseTour, resumeTour])


  async function handleSaveOrder(orderData) {
    try {
      const newId = await addOrder(customerId, orderData)
      showToast('Order placed ✓')
      completeStep('add-order', { itemId: newId ? String(newId) : null })
    } catch (err) {
      console.error('[OrdersTab] failed to place order:', err)
      const code = err?.code
      if (code === 'limit-reached') {
        setIsModalOpen(false)
        setUpgradeOpen(true)
      } else if (code === 'resource-exhausted') {
        showToast('Failed to place order — daily limit reached, try again later')
      } else if (code === 'permission-denied') {
        showToast('Failed to place order — permission denied')
      } else {
        showToast('Failed to place order')
      }
    }
  }

  function handleCardTap(order) {
    if (
      currentStep?.id === 'view-new-order' &&
      String(order.clientId ?? order.id) === pendingViewItemId
    ) {
      completeStep('view-new-order')
    }
    setSelectedOrder(order)
  }

  function handleUpgrade() {
    setUpgradeOpen(false)
    navigate('/upgrade')
  }


  if (loading) {
    return (
      <div className={styles.orderGroup}>
        {[1, 2, 3].map(i => <OrderRowSkeleton key={i} />)}
      </div>
    )
  }

  const ordersByDate = orders.reduce((groups, order) => {
    const dateKey = order.takenAt || formatFirestoreDate(order.createdAt) || order.date || 'Unknown Date'
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(order)
    return groups
  }, {})

  return (
    <div>
      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        Object.entries(ordersByDate).map(([date, ordersInGroup]) => (
          <div key={date} className={styles.orderGroup}>
            <div className={styles.orderGroupDate}>{date}</div>
            <div className={styles.orderGroupDivider} />

            {ordersInGroup.map((order, index) => (
              <div
                key={order.id ?? index}
                data-tour={String(order.clientId ?? order.id) === pendingViewItemId ? 'new-order-row' : undefined}
              >
                <OrderRow
                  order={order}
                  ordersInGroup={ordersInGroup}
                  index={index}
                  onTap={handleCardTap}
                />
              </div>
            ))}
          </div>
        ))
      )}

      <AddOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        measurements={measurements}
        onSave={handleSaveOrder}
        taxRate={taxRate}
        taxEnabled={taxEnabled}
      />

      <UpgradeSheet
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgrade}
        icon="receipt_long"
        title="Order limit reached"
        message={`You've hit the free plan limit of ${limits.ordersPerMonth} active orders this month. Upgrade to Premium for unlimited orders.`}
      />

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onGenerateInvoice={(orderId) => {
            setSelectedOrder(null)
            onGenerateInvoice(orderId)
          }}
          onViewInvoice={(invoiceId) => {
            setSelectedOrder(null)
            onViewInvoice?.(invoiceId)
          }}
          fullHeight
          hideCustomerName
          showToast={showToast}
        />
      )}
    </div>
  )
}
