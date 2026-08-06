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
            <div className={styles.detailSectionCard}>
              <div className={styles.cardHeaderRow}>
                <div className={styles.iconBadge}>
                  <MIcon name={item.summary.icon} size="1rem" color="var(--text2)" />
                </div>
                <span className={styles.cardHeaderName}>{item.summary.name}</span>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoGridCell}>
                  <div className={styles.infoGridLabel}>Amount</div>
                  <div className={styles.infoGridValue}>{item.summary.amount}</div>
                </div>
                {item.summary.due && (
                  <div className={styles.infoGridCell}>
                    <div className={styles.infoGridLabel}>Due</div>
                    <div className={`${styles.infoGridValue} ${styles.overdueText}`}>{item.summary.due}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.detailSectionCard}>
              <p className={styles.detailNoteText}>{item.desc}</p>
            </div>
          )}
        </SheetSection>

        {item.reason && (
          <SheetSection icon="psychology" label="Why the assistant did this">
            <div className={styles.detailSectionCard}>
              <p className={styles.detailNoteText}>{item.reason}</p>
            </div>
          </SheetSection>
        )}
      </div>
    </SheetBase>
  )
}
