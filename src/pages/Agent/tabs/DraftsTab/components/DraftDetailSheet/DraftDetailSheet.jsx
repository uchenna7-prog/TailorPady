import { useState } from "react"
import { resolveCustomerName } from "../../../../utils"
import { MIcon } from "../../../../components/MIcon/MIcon"
import { SheetHeader } from "../../../../components/SheetHeader/SheetHeader"
import { SheetHero } from "../../../../components/SheetHero/SheetHero"
import { SheetSection } from "../../../../components/SheetSection/SheetSection"
import { haptic, buildBrandSnapshot, buildInvoiceMessage, buildReceiptMessage } from "../../../../utils"
import InvoiceViewer from "../../../../../../components/InvoiceViewer/InvoiceViewer"
import ReceiptViewer from "../../../../../../components/ReceiptViewer/ReceiptViewer"
import styles from "./DraftDetailSheet.module.css"

function getOrderIdFromInvoiceDraftId(draftId) {
  return draftId?.replace('invoice-', '') || null
}

function getPaymentIdFromReceiptDraftId(draftId) {
  if (!draftId?.startsWith('receipt-')) return null
  return draftId.replace('receipt-', '').split('::')[0] || null
}

function getInstallmentIdFromReceiptDraftId(draftId) {
  if (!draftId?.startsWith('receipt-')) return null
  const parts = draftId.replace('receipt-', '').split('::')
  return parts[1] || null
}

export function DraftDetailSheet({
  item,
  onClose,
  onDiscard,
  allOrders,
  allInvoices,
  allReceipts,
  allPayments,
  customers,
  generalSettings,
  profileSettings,
  showToast,
  onSaveDoc,
}) {
  const [viewerInvoice, setViewerInvoice] = useState(null)
  const [viewerReceipt, setViewerReceipt] = useState(null)
  const [confirmSave, setConfirmSave] = useState(false)

  if (!item) return null

  const isDoc = item.type === 'invoice' || item.type === 'receipt'
  const isReceipt = item.type === 'receipt'
  const customerName = resolveCustomerName(item, allOrders, allInvoices, allPayments, customers)

  function getInvoiceForDraft() {
    const orderId = getOrderIdFromInvoiceDraftId(item.id)
    if (!orderId) return null

    const existing = allInvoices.find(inv => String(inv.orderId) === String(orderId))
    if (existing) return existing

    const order = allOrders.find(o => String(o.id) === String(orderId))
    if (!order) return null

    const prefix = generalSettings.invoicePrefix || 'INV'
    const template = generalSettings.invoiceTemplate || 'invoiceTemplate1'
    const dueDays = generalSettings.invoiceDueDays || 7
    const invoiceNumber = `${prefix}-${String(allInvoices.length + 1).padStart(3, '0')}`
    const today = new Date()
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const dueDate = new Date(today)
    dueDate.setDate(dueDate.getDate() + dueDays)
    const dueDateStr = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const brandSnapshot = buildBrandSnapshot(profileSettings, generalSettings, 'invoice')

    return {
      id: `preview-${order.id}`,
      orderId: order.id,
      customerId: order.customerId,
      number: invoiceNumber,
      date: dateStr,
      status: 'unpaid',
      template,
      orderDesc: order.desc,
      price: order.price,
      qty: order.qty,
      items: Array.isArray(order.items) ? order.items : [],
      due: dueDateStr,
      notes: order.notes || '',
      shippingFee: order.shippingFee ?? 0,
      discountType: order.discountType ?? null,
      discountValue: order.discountValue ?? 0,
      discountAmount: order.discountAmount ?? 0,
      taxRate: order.taxRate ?? 0,
      taxAmount: order.taxAmount ?? 0,
      totalAmount: order.totalAmount ?? order.price ?? 0,
      brandSnapshot,
      _isPreview: true,
    }
  }

  function getReceiptForDraft() {
    const paymentId = getPaymentIdFromReceiptDraftId(item.id)
    const installmentId = getInstallmentIdFromReceiptDraftId(item.id)
    if (!paymentId || !installmentId) return null

    const payment = allPayments.find(p => String(p.id) === String(paymentId))
    if (!payment || !Array.isArray(payment.installments)) return null

    const existing = allReceipts.find(r =>
      String(r.paymentId) === String(payment.id) &&
      (r.installmentIds || []).map(String).includes(String(installmentId))
    )
    if (existing) return { ...existing, _isPreview: false }

    const allInstallments = payment.installments
    const thisIndex = allInstallments.findIndex(inst => String(inst.id) === String(installmentId))
    if (thisIndex === -1) return null

    const thisInstallment = allInstallments[thisIndex]
    const previousInstallments = allInstallments.slice(0, thisIndex).map(inst => ({
      id: inst.id,
      amount: inst.amount,
      method: inst.method || 'cash',
      date: inst.date,
      time: inst.time || null,
    }))

    const order = allOrders.find(o => String(o.id) === String(payment.orderId))
    const orderTotal = parseFloat(order?.totalAmount ?? order?.price) || 0
    const cumulativePaid = allInstallments
      .slice(0, thisIndex + 1)
      .reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0)
    const balance = Math.max(0, orderTotal - cumulativePaid)
    const isFullPayment = balance <= 0

    const prefix = generalSettings.receiptPrefix || 'RCP'
    const template = generalSettings.receiptTemplate || 'receiptTemplate1'
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const brandSnapshot = buildBrandSnapshot(profileSettings, generalSettings, 'receipt')
    const globalReceiptCount = allReceipts.length + 1
    const receiptsForThisPayment = allReceipts.filter(r => String(r.paymentId) === String(payment.id)).length + 1
    const receiptNumber = `${prefix}-${String(receiptsForThisPayment).padStart(2, '0')}-${String(globalReceiptCount).padStart(3, '0')}`

    return {
      id: `preview-receipt-${payment.id}-${thisInstallment.id}`,
      paymentId: payment.id,
      orderId: payment.orderId,
      customerId: payment.customerId,
      orderDesc: order?.desc,
      orderPrice: order?.totalAmount ?? order?.price,
      items: order?.items || [],
      number: receiptNumber,
      date: today,
      template,
      payments: [{
        id: thisInstallment.id,
        amount: thisInstallment.amount,
        method: thisInstallment.method || 'cash',
        date: thisInstallment.date,
        time: thisInstallment.time || null,
      }],
      previousInstallments,
      previousPaid: previousInstallments.reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0),
      cumulativePaid,
      isFullPayment,
      balance,
      installmentIds: [String(thisInstallment.id)],
      notes: payment.notes || '',
      shippingFee: order?.shippingFee ?? 0,
      discountType: order?.discountType ?? null,
      discountValue: order?.discountValue ?? 0,
      discountAmount: order?.discountAmount ?? 0,
      taxRate: order?.taxRate ?? 0,
      taxAmount: order?.taxAmount ?? 0,
      totalAmount: order?.totalAmount ?? order?.price ?? 0,
      brandSnapshot,
      _isPreview: true,
    }
  }

  function getCustomerForDraft() {
    if (item.type === 'invoice') {
      const orderId = getOrderIdFromInvoiceDraftId(item.id)
      const order = allOrders.find(o => String(o.id) === String(orderId))
      if (!order) return null
      return customers.find(c => String(c.id) === String(order.customerId)) || null
    }
    if (item.type === 'receipt') {
      const paymentId = getPaymentIdFromReceiptDraftId(item.id)
      const payment = allPayments.find(p => String(p.id) === String(paymentId))
      if (!payment) return null
      return customers.find(c => String(c.id) === String(payment.customerId)) || null
    }
    return null
  }

  async function shareText(text, fallbackMessage) {
    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch (err) {
        if (err?.name === 'AbortError') return
      }
    }
    navigator.clipboard?.writeText(text).catch(() => {})
    showToast?.(fallbackMessage)
  }

  async function handleShareBreakdown() {
    haptic('medium')
    const doc = item.type === 'invoice' ? getInvoiceForDraft() : getReceiptForDraft()
    const customer = getCustomerForDraft()
    if (!doc || !customer) { showToast?.('Could not build message'); return }

    const brand = doc.brandSnapshot
    const message = item.type === 'invoice'
      ? buildInvoiceMessage(doc, customer, brand)
      : buildReceiptMessage(doc, customer, brand)

    await shareText(message, 'Copied to clipboard')
  }

  async function handleShareMessage() {
    haptic('medium')
    await shareText(item.preview, 'Copied to clipboard')
  }

  function handleViewDoc() {
    haptic('light')
    if (item.type === 'invoice') {
      const invoice = getInvoiceForDraft()
      const customer = getCustomerForDraft()
      if (!invoice || !customer) { showToast?.('Could not load invoice data'); return }
      setViewerInvoice({ invoice, customer })
    } else {
      const receipt = getReceiptForDraft()
      const customer = getCustomerForDraft()
      if (!receipt || !customer) { showToast?.('Could not load receipt data'); return }
      setViewerReceipt({ receipt, customer })
    }
  }

  async function handleConfirmSave() {
    setConfirmSave(false)

    if (item.type === 'invoice') {
      const invoice = getInvoiceForDraft()
      if (!invoice) { showToast?.('Could not save invoice'); return }
      if (invoice._isPreview) {
        const { _isPreview, ...data } = invoice
        onSaveDoc?.('invoice', data, item.id)
      } else {
        showToast?.('Invoice already exists')
        onDiscard(item.id)
      }
    } else if (item.type === 'receipt') {
      const receipt = getReceiptForDraft()
      if (!receipt) { showToast?.('Could not save receipt'); return }
      if (receipt._isPreview) {
        const { _isPreview, ...data } = receipt
        onSaveDoc?.('receipt', data, item.id)
      } else {
        showToast?.('Receipt already exists')
        onDiscard(item.id)
      }
    }

    onClose()
  }

  const sheetTitle = isDoc
    ? (item.type === 'invoice' ? 'Invoice Draft' : 'Receipt Draft')
    : 'Message Draft'

  return (
    <>
      <div className={styles.sheetOverlay} onClick={e => e.target === e.currentTarget && !confirmSave && onClose()}>
        <div className={styles.sheetPanel}>
          <div className={styles.sheetHandle} />
          <SheetHeader title={sheetTitle} onClose={onClose} />
          <SheetHero item={item} customerName={customerName} />

          <div className={styles.sheetBody}>
            <SheetSection icon="preview" label={isDoc ? 'Breakdown preview' : 'Message'}>
              <p className={`${styles.sectionText} ${styles.sectionTextItalic}`}>{item.preview}</p>
            </SheetSection>

            {isDoc ? (
              <div className={styles.sheetActions}>
                <div className={styles.btnRow}>
                  <button className={styles.btnSecondary} onClick={handleViewDoc}>
                    <MIcon name="open_in_new" size="0.82rem" />
                    View {item.type}
                  </button>
                  <button className={styles.btnGreen} onClick={() => { haptic('light'); setConfirmSave(true) }}>
                    <MIcon name="add_circle" size="0.82rem" color="#22c55e" />
                    Save {item.type}
                  </button>
                </div>

                <button
                  className={styles.btnGhost}
                  onClick={() => { haptic('light'); onDiscard(item.id); onClose() }}
                >
                  <MIcon name="delete_outline" size="0.9rem" color="#ef4444" />
                  Discard draft
                </button>

                <button className={styles.btnPrimary} onClick={handleShareBreakdown}>
                  <MIcon name="ios_share" size="0.9rem" color="var(--bg)" />
                  Send breakdown to client
                </button>
              </div>
            ) : (
              <div className={styles.sheetActions}>
                <button className={styles.btnPrimary} onClick={handleShareMessage}>
                  <MIcon name="ios_share" size="0.9rem" color="var(--bg)" />
                  Share message
                </button>
                <button
                  className={styles.btnGhost}
                  onClick={() => { haptic('light'); onDiscard(item.id); onClose() }}
                >
                  <MIcon name="delete_outline" size="0.9rem" color="#ef4444" />
                  Discard draft
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmSave && (
        <div className={styles.confirmOverlay} onClick={() => setConfirmSave(false)}>
          <div className={styles.confirmSheet} onClick={e => e.stopPropagation()}>
            <div className={`${styles.confirmIcon} ${isReceipt ? styles.confirmIconGreen : ''}`}>
              <MIcon
                name={isReceipt ? 'payments' : 'receipt_long'}
                size="1.3rem"
                color={isReceipt ? '#22c55e' : 'var(--accent)'}
              />
            </div>
            <p className={styles.confirmTitle}>Save this {item.type}?</p>
            <p className={styles.confirmSub}>
              This will add the {item.type} to your {isReceipt ? 'Receipts' : 'Invoices'} list
              where you can view, edit, and share it anytime.
            </p>
            <div className={styles.confirmBtns}>
              <button className={styles.confirmBtnCancel} onClick={() => setConfirmSave(false)}>
                Not now
              </button>
              <button
                className={`${styles.confirmBtnSave} ${isReceipt ? styles.confirmBtnSaveGreen : ''}`}
                onClick={handleConfirmSave}
              >
                <MIcon name="check" size="0.82rem" color="var(--bg)" />
                Save {item.type}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewerInvoice && (
        <InvoiceViewer
          invoice={viewerInvoice.invoice}
          customer={viewerInvoice.customer}
          onClose={() => setViewerInvoice(null)}
          onDelete={viewerInvoice.invoice?._isPreview ? null : () => {
            setViewerInvoice(null)
            showToast?.('Invoice deleted')
          }}
          showToast={showToast}
        />
      )}

      {viewerReceipt && (
        <ReceiptViewer
          receipt={viewerReceipt.receipt}
          customer={viewerReceipt.customer}
          onClose={() => setViewerReceipt(null)}
          onDelete={viewerReceipt.receipt?._isPreview ? null : () => {
            setViewerReceipt(null)
            showToast?.('Receipt deleted')
          }}
          showToast={showToast}
        />
      )}
    </>
  )
}