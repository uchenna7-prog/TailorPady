import { ItemIconBox } from "../../../../components/ItemIconBox/ItemIconBox"
import { TagPill } from "../../../../components/TagPill/TagPill"
import { MIcon } from "../../../../components/MIcon/MIcon"
import { resolveCustomerName, resolveOrderName, extractTime, haptic, formatTitle } from "../../../../utils"
import styles from "./ActivityRow.module.css"

export function ActivityRow({ item, isLast, allOrders, allInvoices, allPayments, customers, onOpen }) {
  const customerName = resolveCustomerName(item, allOrders, allInvoices, allPayments, customers)
  const orderName = resolveOrderName(item, allOrders, allInvoices, allPayments)
  const displayTitle = formatTitle(item.title)
  const displayTime = extractTime(item.time)

  return (
    <div
      className={`${styles.row} ${isLast ? styles.rowLast : ''}`}
      onClick={() => { haptic('light'); onOpen(item) }}
    >
      <ItemIconBox
        type={item.type}
        itemId={item.id}
        orderId={item.orderId}
        allOrders={allOrders}
        allInvoices={allInvoices}
        allPayments={allPayments}
      />

      <div className={styles.rowBody}>
        <div className={styles.rowTitle}>{displayTitle}</div>

        {customerName && (
          <div className={styles.rowMeta}>
            <MIcon name="person" size="0.72rem" color="var(--text3)" />
            <span className={styles.rowMetaText}>{customerName}</span>
          </div>
        )}

        {orderName && (
          <div className={styles.rowMeta}>
            <MIcon name="shopping_cart" size="0.72rem" color="var(--text3)" />
            <span className={styles.rowMetaText}>{orderName}</span>
          </div>
        )}
      </div>

      <div className={styles.rowRight}>
        <TagPill label={item.tag} />
        <div className={styles.rowMeta}>
          <span className={styles.rowMetaText}>{displayTime}</span>
        </div>
      </div>
    </div>
  )
}