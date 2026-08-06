import { SheetBase } from "../../../../components/SheetBase/SheetBase"
import { SheetHeader } from "../../../../components/SheetHeader/SheetHeader"
import { SheetHero } from "../../../../components/SheetHero/SheetHero"
import { SheetSection } from "../../../../components/SheetSection/SheetSection"
import { MIcon } from "../../../../components/MIcon/MIcon"
import { resolveCustomerName } from "../../../../utils"
import styles from "./ActivityDetailSheet.module.css"

export function ActivityDetailSheet({ item, onClose, allOrders, allInvoices, allPayments, customers }) {
  if (!item) return null
  const customerName = resolveCustomerName(item, allOrders, allInvoices, allPayments, customers)

  return (
    <SheetBase onClose={onClose}>
      <SheetHeader title="Activity" onClose={onClose} />
      <SheetHero
        item={item}
        customerName={customerName}
        allOrders={allOrders}
        allInvoices={allInvoices}
        allPayments={allPayments}
      />

      <div className={styles.sheetBody}>
        <SheetSection icon="info" label="What happened">
          {item.summary ? (
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <div className={styles.summaryIconBadge}>
                  <MIcon name={item.summary.icon} size="1rem" color="var(--text2)" />
                </div>
                <span className={styles.summaryName}>{item.summary.name}</span>
                <span className={styles.summaryTime}>{item.time}</span>
              </div>
              <div className={styles.summaryAmount}>{item.summary.amount}</div>
              {item.summary.due && (
                <div className={styles.summaryDue}>
                  <MIcon name="schedule" size="0.78rem" color="#ef4444" />
                  Due {item.summary.due}
                </div>
              )}
            </div>
          ) : (
            <p className={styles.sectionText}>{item.desc}</p>
          )}
        </SheetSection>

        {item.reason && (
          <SheetSection icon="psychology" label="Why the assistant did this">
            <div className={styles.reasonCard}>
              <p className={styles.reasonText}>{item.reason}</p>
            </div>
          </SheetSection>
        )}
      </div>
    </SheetBase>
  )
}
