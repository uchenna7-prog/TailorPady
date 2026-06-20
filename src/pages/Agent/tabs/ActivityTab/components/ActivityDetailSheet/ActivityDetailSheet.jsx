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
            <div className={styles.invoiceCard}>
              <div className={styles.invoiceCardLeft}>
                <div className={styles.invoiceOrderRow}>
                  <MIcon name={item.summary.icon} size="0.95rem" color="var(--text2)" />
                  <span className={styles.invoiceOrderName}>{item.summary.name}</span>
                </div>
                <p className={styles.invoiceAmount}>{item.summary.amount}</p>
                {item.summary.due && (
                  <p className={styles.invoiceDue}>Due {item.summary.due}</p>
                )}
              </div>
              <span className={styles.invoiceTime}>{item.time}</span>
            </div>
          ) : (
            <p className={styles.sectionText}>{item.desc}</p>
          )}
        </SheetSection>

        {item.reason && (
          <SheetSection icon="psychology" label="Why the assistant did this">
            <p className={styles.sectionText}>{item.reason}</p>
          </SheetSection>
        )}
      </div>
    </SheetBase>
  )
}