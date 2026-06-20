import { formatTitle } from "../../utils"
import { MIcon } from "../MIcon/MIcon"
import { TagPill } from "../TagPill/TagPill"
import { ItemIconBox } from "../ItemIconBox/ItemIconBox"
import styles from "./SheetHero.module.css"


export function SheetHero({ item, customerName, allOrders, allInvoices, allPayments }) {

  return (
    <div className={styles.sheetHero}>
      <ItemIconBox
        type={item.type}
        itemId={item.id}
        orderId={item.orderId}
        allOrders={allOrders}
        allInvoices={allInvoices}
        allPayments={allPayments}
      />
      <div className={styles.sheetHeroBody}>
        <TagPill label={item.tag} />
        <p className={styles.sheetHeroTitle}>{formatTitle(item.title)}</p>
        {(customerName || item.time) && (
          <div className={styles.sheetHeroMeta}>
            {customerName && (
              <>
                <MIcon name="person" size="0.7rem" color="var(--text3)" />
                <span>{customerName}</span>
              </>
            )}
            {customerName && item.time && <span>·</span>}
            {item.time && (
              <>
                <MIcon name="schedule" size="0.7rem" color="var(--text3)" />
                <span>{item.time}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}