import { resolveCustomerName, resolveOrderName, haptic } from "../../../../utils"
import { ItemIconBox } from "../../../../components/ItemIconBox/ItemIconBox"
import { MIcon } from "../../../../components/MIcon/MIcon"
import { TagPill } from "../../../../components/TagPill/TagPill"
import styles from "./ScheduledRow.module.css"

export function ScheduledRow({ item, isLast, allOrders, allInvoices, allPayments, customers, onOpen }) {
  const customerName = resolveCustomerName(item, allOrders, allInvoices, allPayments, customers)
  const orderName = resolveOrderName(item, allOrders, allInvoices, allPayments)
  const displayTitle = item.title

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

        <div className={styles.rowMeta}>
          <MIcon name="schedule" size="0.72rem" color="var(--accent)" />
          <span className={`${styles.rowMetaText} ${styles.rowMetaAccent}`}>{item.when}</span>
        </div>
      </div>

      <div className={styles.rowRight}>
        <TagPill label={item.tag} />
      </div>
    </div>
  )
}
