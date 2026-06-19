import { ICON_META, ICON_BG } from "../../datas"
import { MIcon } from "../MIcon/MIcon"
import OrderMosaic from "../../../../components/OrderMosaic/OrderMosaic"
import styles from "./ItemIconBox.module.css"

function resolveOrderId(itemId, orderId, allInvoices, allPayments, allOrders) {
  if (orderId) return orderId
  if (!itemId) return null

  for (const prefix of ['invoice-', 'upcoming-invoice-']) {
    if (itemId.startsWith(prefix)) return itemId.slice(prefix.length)
  }

  if (itemId.startsWith('receipt-') && allPayments) {
    const paymentId = itemId.slice('receipt-'.length).split('::')[0]
    const payment = allPayments.find(p => String(p.id) === String(paymentId))
    if (payment?.orderId) return payment.orderId
  }

  if (allInvoices) {
    for (const prefix of ['upcoming-reminder-', 'reminder-']) {
      if (itemId.startsWith(prefix)) {
        const invoiceId = itemId.slice(prefix.length)
        const invoice = allInvoices.find(inv => String(inv.id) === String(invoiceId))
        if (invoice?.orderId) return invoice.orderId
      }
    }
  }

  if (allOrders) {
    for (const prefix of ['upcoming-followup-', 'followup-']) {
      if (itemId.startsWith(prefix)) {
        const customerId = itemId.slice(prefix.length)
        const customerOrders = allOrders
          .filter(o => String(o.customerId) === String(customerId) && o.items?.length > 0)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        return customerOrders[0]?.id ?? null
      }
    }
  }

  return null
}

export function ItemIconBox({ type, itemId, orderId, allOrders, allInvoices, allPayments }) {
  const meta = ICON_META[type] || ICON_META.brief
  const resolvedOrderId = resolveOrderId(itemId, orderId, allInvoices, allPayments, allOrders)
  const linkedOrder = resolvedOrderId ? allOrders?.find(o => String(o.id) === String(resolvedOrderId)) : null

  if (linkedOrder) {
    return <OrderMosaic items={linkedOrder.items ?? []} size="md" />
  }

  return (
    <div className={styles.rowIconOuter}>
      <div className={styles.rowIconInner} style={{ background: ICON_BG[type] || 'var(--surface2)' }}>
        <MIcon name={meta.icon} size="1.3rem" color={meta.color} />
      </div>
    </div>
  )
}