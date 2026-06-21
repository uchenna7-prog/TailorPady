import { useState, useEffect } from 'react'
import { getCurrency } from '../../../../utils/moneyUtils'
import { useProfileSettings } from '../../../../contexts/ProfileSettingsContext'
import { buildOrderItemsMap, groupReceiptsByDate } from './utils'
import { EmptyState } from './components/EmptyState/EmptyState'
import { AddReceiptModal } from './components/AddReceiptModal/AddReceiptModal'
import { ReceiptRow } from './components/ReceiptRow/ReceiptRow'
import ReceiptViewer from '../../../../components/ReceiptViewer/ReceiptViewer'
import ConfirmSheet from '../../../../components/ConfirmSheet/ConfirmSheet'
import styles from './ReceiptsTab.module.css'


export default function ReceiptTab({
  receipts = [],
  orders   = [],
  payments = [],
  customer,
  customerData,
  onDelete,
  onGenerateReceipt,
  showToast,
}) {
  const { profileSettings } = useProfileSettings()

  const [viewingReceipt,     setViewingReceipt]     = useState(null)
  const [deleteTarget,       setDeleteTarget]       = useState(null)
  const [addReceiptModalOpen, setAddReceiptModalOpen] = useState(false)

  const currency      = getCurrency()
  const orderItemsMap = buildOrderItemsMap(orders)
  const groupedByDate = groupReceiptsByDate(receipts)

  useEffect(() => {
    const openAddReceiptModal = () => setAddReceiptModalOpen(true)
    document.addEventListener('openAddReceiptModal', openAddReceiptModal)
    return () => document.removeEventListener('openAddReceiptModal', openAddReceiptModal)
  }, [])

  function handleSelectPayment(payment, installment) {
    onGenerateReceipt(payment, installment)
    setAddReceiptModalOpen(false)
  }

  function handleConfirmDelete() {
    onDelete(deleteTarget)
    showToast('Receipt deleted')
    setDeleteTarget(null)
    if (viewingReceipt?.id === deleteTarget) setViewingReceipt(null)
  }

  return (
    <>
      <div className={styles.tabContent}>
        {receipts.length === 0 && <EmptyState />}

        {receipts.length > 0 && Object.entries(groupedByDate).map(([date, dateReceipts]) => (
          <div key={date} className={styles.dateGroup}>
            <div className={styles.dateGroupLabel}>{date}</div>
            <div className={styles.dateGroupDivider} />

            {dateReceipts.map((receipt, index) => (
              <ReceiptRow
                key={receipt.id}
                receipt={receipt}
                currency={currency}
                isLast={index === dateReceipts.length - 1}
                onTap={() => setViewingReceipt(receipt)}
                orderItems={orderItemsMap[receipt.orderId] ?? receipt.orderItems ?? []}
              />
            ))}
          </div>
        ))}
      </div>

      <AddReceiptModal
        isOpen={addReceiptModalOpen}
        onClose={() => setAddReceiptModalOpen(false)}
        orders={orders}
        payments={payments}
        receipts={receipts}
        onSelectPayment={handleSelectPayment}
      />

      {viewingReceipt && (
        <ReceiptViewer
          receipt={viewingReceipt}
          customer={customer}
          customerData={customerData}
          colourId={profileSettings.brandColourId}
          onClose={() => setViewingReceipt(null)}
          onDelete={(id) => setDeleteTarget(id)}
          showToast={showToast}
        />
      )}

      <ConfirmSheet
        open={!!deleteTarget}
        title="Delete this receipt?"
        message="This can't be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}