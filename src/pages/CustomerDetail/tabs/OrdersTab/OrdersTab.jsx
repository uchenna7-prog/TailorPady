import { useState, useEffect } from 'react'
import { useOrders } from '../../../../contexts/OrdersContext'
import { useGeneralSettings } from '../../../../contexts/GeneralSettingsContext'
import { AddOrderModal } from './components/AddOrderModal/AddOrderModal'
import OrderDetailModal from '../../../../components/OrderDetailModal/OrderDetailModal'
import { OrderRow } from './components/OrderRow/OrderRow'
import { OrderRowSkeleton } from './components/OrderRowSkeleton/OrderRowSkeleton'
import { EmptyState } from './components/EmptyState/EmptyState'
import { formatFirestoreDate } from './utils'
import styles from './OrdersTab.module.css'


export default function OrdersTab({ customerId, orders, loading, measurements, showToast, onGenerateInvoice }) {

  const { addOrder } = useOrders()
  const { generalSettings } = useGeneralSettings()

  const taxEnabled = generalSettings.invoiceShowTax ?? false
  const taxRate    = generalSettings.invoiceTaxRate ?? 0

  const [isModalOpen,   setIsModalOpen]   = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const openModal = () => setIsModalOpen(true)
    document.addEventListener('openAddOrderModal', openModal)
    return () => document.removeEventListener('openAddOrderModal', openModal)
  }, [])


  async function handleSaveOrder(orderData) {
    try {
      await addOrder(customerId, orderData)
      showToast('Order placed ✓')
    } catch {
      showToast('Failed to place order')
    }
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
              <OrderRow
                key={order.id ?? index}
                order={order}
                ordersInGroup={ordersInGroup}
                index={index}
                onTap={setSelectedOrder}
              />
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

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onGenerateInvoice={(orderId) => {
            setSelectedOrder(null)
            onGenerateInvoice(orderId)
          }}
          fullHeight
          hideCustomerName
          showToast={showToast}
        />
      )}
    </div>
  )
}