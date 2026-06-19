import { resolveCustomerName,resolveOrderName,formatTitle } from "../../../../utils"
import { ItemIconBox } from "../../../../components/ItemIconBox/ItemIconBox"
import { TagPill } from "../../../../components/TagPill/TagPill"
import { MIcon } from "../../../../components/MIcon/MIcon"
import { haptic } from "../../../../utils"
import styles from "./DraftRow.module.css"


export function DraftRow({ item, isLast, allOrders, allInvoices, customers, onOpen }) {

  const customerName = resolveCustomerName(item, allOrders, allInvoices, customers)
  const orderName    = resolveOrderName(item, allOrders, allInvoices)
  const displayTitle = orderName || formatTitle(item.title)
  const isDoc        = item.type === 'invoice' || item.type === 'receipt'

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

        {!isDoc && item.preview ? (
          <div className={styles.rowPreview}>{item.preview}</div>
        ) : (
          <div className={styles.rowMeta}>
            <MIcon
              name={isDoc ? 'check_circle' : 'chat_bubble'}
              size="0.72rem"
              color="var(--text3)"
            />
            <span className={styles.rowMetaText}>
              {isDoc ? 'Ready to send' : 'Message ready'}
            </span>
          </div>
        )}
      </div>

      <div className={styles.rowRight}>
        <TagPill label={item.tag} />
       
      </div>
    </div>
  )
}
