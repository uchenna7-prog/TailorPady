import { SheetBase } from "../../../../components/SheetBase/SheetBase"
import { SheetHeader } from "../../../../components/SheetHeader/SheetHeader"
import { SheetHero } from "../../../../components/SheetHero/SheetHero"
import { SheetSection } from "../../../../components/SheetSection/SheetSection"
import { resolveCustomerName, haptic } from "../../../../utils"
import { MIcon } from "../../../../components/MIcon/MIcon"
import styles from "./ScheduledDetailSheet.module.css"

export function ScheduledDetailSheet({ item, onClose, onCancel, allOrders, allInvoices, allPayments, customers }) {
  if (!item) return null
  const customerName = resolveCustomerName(item, allOrders, allInvoices, allPayments, customers)

  return (
    <SheetBase onClose={onClose}>
      <SheetHeader title="Scheduled" onClose={onClose} />
      <SheetHero item={item} customerName={customerName} />

      <div className={styles.sheetBody}>
        <SheetSection icon="event_note" label="What will happen">
          <p className={styles.sectionText}>{item.desc}</p>
        </SheetSection>

        <div className={styles.sheetMeta}>
          <div className={styles.sheetMetaRow}>
            <MIcon name="schedule" size="0.78rem" color="var(--accent)" />
            <span className={styles.sheetMetaLabel}>Scheduled for</span>
            <span className={`${styles.sheetMetaValue} ${styles.sheetMetaAccent}`}>{item.when}</span>
          </div>
        </div>

        <button
          className={styles.btnDanger}
          onClick={() => { haptic('medium'); onCancel(item.id); onClose() }}
        >
          <MIcon name="cancel" size="0.9rem" color="#ef4444" />
          Cancel this action
        </button>
      </div>
    </SheetBase>
  )
}