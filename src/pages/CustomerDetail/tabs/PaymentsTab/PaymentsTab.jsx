import { useState, useEffect, useRef } from 'react'
import { formatMoney } from '../../../../utils/moneyUtils'
import { useTour } from '../../../../contexts/TourContext'
import { useFirstItemHint } from '../../../../hooks/useFirstItemHint'
import { FirstItemHint } from '../../../../components/FirstItemHint/FirstItemHint'
import { AddPaymentModal } from './components/AddPaymentModal/AddPaymentModal'
import { PaymentRow } from './components/PaymentRow/PaymentRow'
import { EmptyState } from './components/EmptyState/EmptyState'
import { PaymentDetailsModal } from './components/PaymentDetailsModal/PaymentDetailsModal'
import { getTodayLabel, getTimeLabel, buildOrderItemsMap, groupPaymentsByDate, getTotalPaid } from './utils'
import ConfirmSheet from '../../../../components/ConfirmSheet/ConfirmSheet'
import styles from './PaymentsTab.module.css'


export default function PaymentsTab({
  orders          = [],
  payments        = [],
  receipts        = [],
  showToast,
  onSavePayment,
  onUpdatePayment,
  onDeletePayment,
  onInvoicePaid,
  onGenerateReceipt,
  onViewReceipt,
}) {

  const { completeStep, pauseTour, resumeTour } = useTour()
  const [hintSeen, markHintSeen] = useFirstItemHint('payment')
  const firstRowRef = useRef(null)

  const [modalOpen,      setModalOpen]      = useState(false)
  const [viewingPayment, setViewingPayment] = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)

  useEffect(() => {
    if (!viewingPayment) return
    const updated = payments.find(p => p.id === viewingPayment.id)
    setViewingPayment(updated ?? null)
  }, [payments])

  useEffect(() => {
    const handler = () => setModalOpen(true)
    document.addEventListener('openAddPaymentModal', handler)
    return () => document.removeEventListener('openAddPaymentModal', handler)
  }, [])

  useEffect(() => {
    if (!modalOpen) return
    pauseTour()
    return () => resumeTour()
  }, [modalOpen, pauseTour, resumeTour])

  const orderItemsMap = buildOrderItemsMap(orders)
  const groupedByDate = groupPaymentsByDate(payments)

  async function handleSavePayment(paymentData) {
  try {
    await onSavePayment(paymentData)
    showToast('Payment recorded ✓')
    completeStep('add-payment')
    if (paymentData.status === 'paid')      onInvoicePaid?.(paymentData.orderId, 'paid')
    else if (paymentData.status === 'part') onInvoicePaid?.(paymentData.orderId, 'part_paid')
  } catch {
    showToast('Failed to save payment.')
  }
  }

  async function handleStatusChange(paymentId, newStatus) {
    try {
      await onUpdatePayment(paymentId, { status: newStatus })
    } catch {
      showToast('Failed to update status.')
    }
  }

  async function handleAddInstallment(paymentId, amount, method) {
    const payment = payments.find(p => p.id === paymentId)
    if (!payment) return

    const newInstallment      = { amount, method, date: getTodayLabel(), time: getTimeLabel(), id: Date.now() }
    const updatedInstallments = [...(payment.installments || []), newInstallment]
    const totalPaid           = getTotalPaid(updatedInstallments)
    const fullPrice           = parseFloat(payment.orderPrice) || 0
    const newStatus           = fullPrice > 0 && totalPaid >= fullPrice ? 'paid' : payment.status

    try {
      await onUpdatePayment(paymentId, { installments: updatedInstallments, status: newStatus })
      completeStep('add-payment')
      if (newStatus === 'paid') {
        showToast('Payment complete! Marked as Paid ✓')
        onInvoicePaid?.(payment.orderId, 'paid')
      } else {
        showToast('Payment recorded ✓')
        onInvoicePaid?.(payment.orderId, 'part_paid')
      }
    } catch {
      showToast('Failed to record payment.')
    }
  }

  async function handleConfirmDelete() {
  if (!deleteTarget) return
  const target = deleteTarget
  setDeleteTarget(null)
  setViewingPayment(null)
  try {
    await onDeletePayment(target.id)
    showToast('Payment deleted')
  } catch {
    showToast('Failed to delete.')
  }
  }

  const showFirstItemHint = payments.length === 1 && !hintSeen
  let renderedFirstRow = false

  return (
    <>
      <div className={styles.tabContent}>
        {payments.length === 0 ? (
          <EmptyState />
        ) : (
          Object.entries(groupedByDate).map(([date, datePayments]) => (
            <div key={date} className={styles.dateGroup}>
              <div className={styles.dateGroupLabel}>{date}</div>
              <div className={styles.dateGroupDivider} />

              {datePayments.map((payment, index) => {
                const isFirstOverall = showFirstItemHint && !renderedFirstRow
                if (isFirstOverall) renderedFirstRow = true
                return (
                  <div key={payment.id ?? index} ref={isFirstOverall ? firstRowRef : undefined}>
                    <PaymentRow
                      payment={payment}
                      index={index}
                      datePayments={datePayments}
                      orderItemsMap={orderItemsMap}
                      onTap={setViewingPayment}
                    />
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      <AddPaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        orders={orders}
        payments={payments}
        onSave={handleSavePayment}
      />

      {viewingPayment && (
        <PaymentDetailsModal
          payment={viewingPayment}
          receipts={receipts}
          onClose={() => setViewingPayment(null)}
          onDelete={() => setDeleteTarget(viewingPayment)}
          onStatusChange={handleStatusChange}
          onAddInstallment={handleAddInstallment}
          onGenerateReceipt={onGenerateReceipt}
          onViewReceipt={onViewReceipt}
        />
      )}

      <ConfirmSheet
        open={!!deleteTarget}
        title="Delete Payment?"
        message="This can't be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showFirstItemHint && (
        <FirstItemHint
          targetRef={firstRowRef}
          message="Tap to view details"
          onDismiss={markHintSeen}
        />
      )}
    </>
  )
}

PaymentsTab.openModal = () => {
  document.dispatchEvent(new Event('openPaymentModal'))
}