import { resolveCustomerName,resolveOrderName,formatTitle } from "../../../../utils"
import { ItemIconBox } from "../../../../components/ItemIconBox/ItemIconBox"
import { MIcon } from "../../../../components/MIcon/MIcon"
import { TagPill } from "../../../../components/TagPill/TagPill"
import { haptic } from "../../../../utils"
import styles from "./ScheduledRow.module.css"


export function ScheduledRow({ item, isLast, allOrders, allInvoices, customers, onOpen }) {

  const customerName = resolveCustomerName(item, allOrders, allInvoices, customers)
  const orderName    = resolveOrderName(item, allOrders, allInvoices)
  const displayTitle = orderName || formatTitle(item.title)

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
      />

      <div className={styles.rowBody}>
        <div className={styles.rowTitle}>{displayTitle}</div>

        {customerName && (
          <div className={styles.rowMeta}>
            <MIcon name="person" size="0.72rem" color="var(--text3)" />
            <span className={styles.rowMetaText}>{customerName}</span>
          </div>
        )}

        <div className={styles.rowMeta}>
          <MIcon name="schedule" size="0.72rem" color="var(--accent)" />
          <span className={`${styles.rowMetaText} ${styles.rowMetaAccent}`}>{item.when}</span>
        </div>
      </div>

      <TagPill label={item.tag} />
    </div>
  )
}