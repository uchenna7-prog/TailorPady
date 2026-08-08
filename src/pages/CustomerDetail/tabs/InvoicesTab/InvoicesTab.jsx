import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrency } from '../../../../utils/moneyUtils'
import { useProfileSettings } from '../../../../contexts/ProfileSettingsContext'
import { useTour } from '../../../../contexts/TourContext'
import { useUsage } from '../../../../contexts/UsageContext'
import { buildOrderItemsMap, groupInvoicesByDate } from './utils'
import { EmptyState } from './components/EmptyState/EmptyState'
import { InvoiceRow } from './components/InvoiceRow/InvoiceRow'
import { InvoiceRowSkeleton } from './components/InvoiceRowSkeleton/InvoiceRowSkeleton'
import { AddInvoiceModal } from './components/AddInvoiceModal/AddInvoiceModal'
import { LimitBanner } from '../../../../components/LimitBanner/LimitBanner'
import InvoiceViewer from '../../../../components/TemplateViewers/InvoiceViewer/InvoiceViewer'
import ConfirmSheet from '../../../../components/ConfirmSheet/ConfirmSheet'
import styles from './InvoicesTab.module.css'


const NEAR_LIMIT_THRESHOLD = 3


export default function InvoiceTab({
  invoices = [],
  loading  = false,
  orders   = [],
  customer,
  customerData,
  onStatusChange,
  onDelete,
  onGenerateInvoice,
  showToast,
  reopenInvoiceId,
  reopenMissingFields = false,
  reopenTemplateModal = false,
  completedModal = null,
  completedFields = [],
  onReopenInvoiceHandled,
}) {
  const navigate = useNavigate()
  const { profileSettings } = useProfileSettings()
  const { pauseTour, resumeTour } = useTour()
  const { hasReachedLimit, remaining, limits } = useUsage()

  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [addInvoiceModalOpen,  setaddInvoiceModalOpen]     = useState(false)
  const [generatingIds,  setGeneratingIds]  = useState(new Set())
  const [pendingReopen,  setPendingReopen]  = useState(false)
  const [pendingCompletedModal, setPendingCompletedModal] = useState(null)
  const [pendingCompletedFields, setPendingCompletedFields] = useState([])
  const [pendingReopenTemplateModal, setPendingReopenTemplateModal] = useState(false)

  const currency      = getCurrency()
  const orderItemsMap = buildOrderItemsMap(orders)
  const groupedByDate = groupInvoicesByDate(invoices)

  const remainingInvoices = remaining('invoicesPerMonth', 'invoicesPerMonth')
  const atLimit             = hasReachedLimit('invoicesPerMonth', 'invoicesPerMonth')
  const nearLimit            = !atLimit && remainingInvoices <= NEAR_LIMIT_THRESHOLD
  const showLimitBanner      = atLimit || nearLimit

  useEffect(() => {
    const openAddInvoiceModal = () => setaddInvoiceModalOpen(true)
    document.addEventListener('openAddInvoiceModal', openAddInvoiceModal)
    return () => document.removeEventListener('openAddInvoiceModal', openAddInvoiceModal)
  }, [])

  useEffect(() => {
    if (!addInvoiceModalOpen) return
    pauseTour()
    return () => resumeTour()
  }, [addInvoiceModalOpen, pauseTour, resumeTour])

  useEffect(() => {
    if (!viewingInvoice) return
    pauseTour()
    return () => resumeTour()
  }, [viewingInvoice, pauseTour, resumeTour])

  useEffect(() => {
    if (!reopenInvoiceId) return
    const match = invoices.find(inv => inv.id === reopenInvoiceId)
    if (!match) return
    setViewingInvoice(match)
    if (reopenMissingFields) {
      setPendingReopen(true)
      setPendingCompletedModal(completedModal)
      setPendingCompletedFields(completedFields)
    }
    if (reopenTemplateModal) {
      setPendingReopenTemplateModal(true)
    }
    onReopenInvoiceHandled?.()
  }, [reopenInvoiceId, invoices])

  async function handleGenerateSelected(selectedOrders) {

    if (generatingIds.size > 0) return

    setGeneratingIds(new Set(selectedOrders.map(o => o.id)))
    let anyFailed = false
    let limitHit  = false

    for (const order of selectedOrders) {
      if (limitHit) break

      try {
        const result = await onGenerateInvoice(order.id)
        if (result?.reason === 'limit-reached') {
          limitHit = true
        } else if (result?.reason && result.reason !== 'ok' && result.reason !== 'already-exists') {
          anyFailed = true
        }
      }
      catch {
        anyFailed = true
        showToast(`Failed to generate invoice for "${order.desc || 'order'}".`)
      }
      setGeneratingIds(prev => {
        const next = new Set(prev)
        next.delete(order.id)
        return next
      })
    }

    if (!limitHit && !anyFailed) {
      showToast(selectedOrders.length > 1
        ? `${selectedOrders.length} invoices generated`
        : 'Invoice generated'
      )
    }

    setaddInvoiceModalOpen(false)
  }

  function handleConfirmDelete() {
    onDelete(deleteTarget)
    showToast('Invoice deleted')
    setDeleteTarget(null)
    if (viewingInvoice?.id === deleteTarget) setViewingInvoice(null)
  }

  function handleStatusChange(id, newStatus) {
    onStatusChange(id, newStatus)
    showToast(`Marked as ${INVOICE_STATUS_LABELS[newStatus] || newStatus}`)
    if (viewingInvoice?.id === id) {
      setViewingInvoice(prev => ({ ...prev, status: newStatus }))
    }
  }

  useEffect(() => {
    if (!viewingInvoice) return
    const updated = invoices.find(inv => inv.id === viewingInvoice.id)
    if (updated) setViewingInvoice(updated)
  }, [invoices])


  if (loading) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.dateGroup}>
          {[1, 2, 3].map(i => <InvoiceRowSkeleton key={i} />)}
        </div>
      </div>
    )
  }


  if (invoices.length === 0) {
    return (
      <div className={styles.tabContent}>
        {showLimitBanner && (
          <LimitBanner
            atLimit={atLimit}
            icon="receipt_long"
            message={
              atLimit
                ? "You've reached your Free plan limit of " + limits.invoicesPerMonth + " invoices this month"
                : remainingInvoices + " invoice" + (remainingInvoices === 1 ? '' : 's') + " left this month on Free plan"
            }
            onUpgradeClick={() => navigate('/upgrade')}
          />
        )}
        <EmptyState />
        <AddInvoiceModal
          isOpen={addInvoiceModalOpen}
          onClose={() => {
            if (generatingIds.size > 0) return
            setaddInvoiceModalOpen(false)
          }}
          orders={orders}
          invoices={invoices}
          onGenerateSelected={handleGenerateSelected}
          generatingIds={generatingIds}
        />
      </div>
    )
  }

  return (
    <div className={styles.tabContent}>
      {showLimitBanner && (
        <LimitBanner
          atLimit={atLimit}
          icon="receipt_long"
          message={
            atLimit
              ? "You've reached your Free plan limit of " + limits.invoicesPerMonth + " invoices this month"
              : remainingInvoices + " invoice" + (remainingInvoices === 1 ? '' : 's') + " left this month on Free plan"
          }
          onUpgradeClick={() => navigate('/upgrade')}
        />
      )}

      {Object.entries(groupedByDate).map(([date, dateInvoices]) => (
        <div key={date} className={styles.dateGroup}>
          <div className={styles.dateGroupLabel}>{date}</div>
          <div className={styles.dateGroupDivider} />

          {dateInvoices.map((invoice, index) => (
            <InvoiceRow
              key={invoice.id}
              invoice={invoice}
              currency={currency}
              isLast={index === dateInvoices.length - 1}
              onTap={() => setViewingInvoice(invoice)}
              orderItems={orderItemsMap[invoice.orderId] ?? []}
            />
          ))}
        </div>
      ))}

      <AddInvoiceModal
        isOpen={addInvoiceModalOpen}
        onClose={() => {
          if (generatingIds.size > 0) return
          setaddInvoiceModalOpen(false)
        }}
        orders={orders}
        invoices={invoices}
        onGenerateSelected={handleGenerateSelected}
        generatingIds={generatingIds}
      />

      {viewingInvoice && (
        <InvoiceViewer
          invoice={viewingInvoice}
          customer={customer}
          customerData={customerData}
          colourId={profileSettings.brandColourId}
          onClose={() => setViewingInvoice(null)}
          onStatusChange={handleStatusChange}
          onDelete={(id) => setDeleteTarget(id)}
          showToast={showToast}
          reopenMissingFields={pendingReopen}
          completedModal={pendingCompletedModal}
          completedFields={pendingCompletedFields}
          onReopenMissingFieldsHandled={() => {
            setPendingReopen(false)
            setPendingCompletedModal(null)
            setPendingCompletedFields([])
          }}
          reopenTemplateModal={pendingReopenTemplateModal}
          onReopenTemplateModalHandled={() => setPendingReopenTemplateModal(false)}
        />
      )}

      <ConfirmSheet
        open={!!deleteTarget}
        title="Delete this invoice?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
