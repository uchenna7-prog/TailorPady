import { ICON_META,ICON_BG } from "../../datas"
import { MIcon } from "../MIcon/MIcon"
import OrderMosaic from "../../../../components/OrderMosaic/OrderMosaic"
import styles from "./ItemIconBox.module.css"


export function ItemIconBox({ type, itemId, orderId, allOrders, allInvoices }) {
  const meta = ICON_META[type] || ICON_META.brief
  let resolvedOrderId = orderId || null

  if (!resolvedOrderId && itemId) {
    for (const prefix of ['invoice-', 'upcoming-invoice-']) {
      if (itemId.startsWith(prefix)) {
        resolvedOrderId = itemId.slice(prefix.length)
        break
      }
    }
  }

  if (!resolvedOrderId && itemId && allInvoices) {
    let invoiceId = null
    if (itemId.startsWith('receipt-')) {
      invoiceId = itemId.slice('receipt-'.length).split('::')[0]
    }
    if (!invoiceId) {
      for (const prefix of ['upcoming-reminder-', 'reminder-']) {
        if (itemId.startsWith(prefix)) {
          invoiceId = itemId.slice(prefix.length)
          break
        }
      }
    }
    if (invoiceId) {
      const invoice = allInvoices.find(inv => String(inv.id) === String(invoiceId))
      resolvedOrderId = invoice?.orderId ?? null
    }
  }

  if (!resolvedOrderId && itemId && allOrders) {
    let customerId = null
    for (const prefix of ['upcoming-followup-', 'followup-']) {
      if (itemId.startsWith(prefix)) {
        customerId = itemId.slice(prefix.length)
        break
      }
    }
    if (customerId) {
      const customerOrders = allOrders
        .filter(o => String(o.customerId) === String(customerId) && o.items?.length > 0)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      resolvedOrderId = customerOrders[0]?.id ?? null
    }
  }

  const linkedOrder = resolvedOrderId
    ? allOrders?.find(o => String(o.id) === String(resolvedOrderId))
    : null

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