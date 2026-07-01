import { resolveCustomerName, resolveOrderName, extractTime, haptic } from "../../../../utils"
import { ItemIconBox } from "../../../../components/ItemIconBox/ItemIconBox"
import { TagPill } from "../../../../components/TagPill/TagPill"
import { MIcon } from "../../../../components/MIcon/MIcon"
import styles from "./DraftRow.module.css"

const descIcon = {
  reminder:   'payments',
  overdue:    'payments',
  birthday:   'cake',
  followup:   'person_search',
  orderready: 'inventory_2',
}

export function DraftRow({ item, isLast, allOrders, allInvoices, allPayments, customers, onOpen }) {
  const customerName = resolveCustomerName(item, allOrders, allInvoices, allPayments, customers)
  const orderName = resolveOrderName(item, allOrders, allInvoices, allPayments)
  const displayTitle = item.title
  const displayTime = extractTime(item.time)
  const fallbackIcon = descIcon[item.type]
  const fallbackDesc = !orderName && item.preview ? item.preview : null

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

        {fallbackDesc && fallbackIcon && (
          <div className={styles.rowMeta}>
            <MIcon name={fallbackIcon} size="0.72rem" color="var(--text3)" />
            <span className={`${styles.rowMetaText} ${styles.rowPreview}`}>{fallbackDesc}</span>
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
