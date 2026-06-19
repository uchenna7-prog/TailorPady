import { SheetBase } from "../../../../components/SheetBase/SheetBase"
import { SheetHeader } from "../../../../components/SheetHeader/SheetHeader"
import { SheetHero } from "../../../../components/SheetHero/SheetHero"
import { SheetSection } from "../../../../components/SheetSection/SheetSection"
import { resolveCustomerName } from "../../../../utils"
import { MIcon } from "../../../../components/MIcon/MIcon"
import styles from "./ActivityDetailSheet.module.css"

export function ActivityDetailSheet({ item, onClose, allOrders, allInvoices, allPayments, customers }) {
  if (!item) return null
  const customerName = resolveCustomerName(item, allOrders, allInvoices, allPayments, customers)

  return (
    <SheetBase onClose={onClose}>
      <SheetHeader title="Activity" onClose={onClose} />
      <SheetHero item={item} customerName={customerName} />

      <div className={styles.sheetBody}>
        <SheetSection icon="info" label="What happened">
          <p className={styles.sectionText}>{item.desc}</p>
        </SheetSection>

        <div className={styles.sheetMeta}>
          <div className={styles.sheetMetaRow}>
            <MIcon name="schedule" size="0.78rem" color="var(--text3)" />
            <span className={styles.sheetMetaLabel}>Time</span>
            <span className={styles.sheetMetaValue}>{item.time}</span>
          </div>
        </div>

        {item.reason && (
          <SheetSection icon="psychology" label="Why the assistant did this">
            <p className={styles.sectionText}>{item.reason}</p>
          </SheetSection>
        )}
      </div>
    </SheetBase>
  )
}