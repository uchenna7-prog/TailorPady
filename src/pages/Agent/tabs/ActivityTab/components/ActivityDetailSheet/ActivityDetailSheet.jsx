import { SheetBase } from "../../../../components/SheetBase/SheetBase"
import { SheetHeader } from "../../../../components/SheetHeader/SheetHeader"
import { SheetSection } from "../../../../components/SheetSection/SheetSection"
import { MIcon } from "../../../../components/MIcon/MIcon"
import { resolveCustomerName } from "../../../../utils"
import styles from "./ActivityDetailSheet.module.css"

const TAG_COLORS = {
  invoice:    { color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.4)'  },
  receipt:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.4)'   },
  reminder:   { color: '#eab308', bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.4)'   },
  overdue:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)'   },
  orderready: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',  border: 'rgba(14,165,233,0.4)'  },
  birthday:   { color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.4)'  },
  followup:   { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.4)'  },
}

const DRAFT_STATUS = {
  pending:  { label: 'Pending Review', color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.4)', icon: 'schedule' },
  approved: { label: 'Approved',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.4)', icon: 'check_circle' },
}

function getInitials(name) {
  if (!name) return ''
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
}

export function ActivityDetailSheet({ item, onClose, allOrders, allInvoices, allPayments, customers }) {
  if (!item) return null
  const customerName = resolveCustomerName(item, allOrders, allInvoices, allPayments, customers)
  const tagMeta = TAG_COLORS[item.type] || TAG_COLORS.reminder
  const statusMeta = DRAFT_STATUS[item.status] || DRAFT_STATUS.pending
  const linkedOrderName = item.summary?.name
  const whatHappened = item.preview || item.desc

  return (
    <SheetBase onClose={onClose}>
      <SheetHeader title="Activity" onClose={onClose} />

      <div className={styles.sheetBody}>
        <span className={styles.tagChip} style={{ background: tagMeta.bg, borderColor: tagMeta.border, color: tagMeta.color }}>
          {item.tag}
        </span>

        <div className={styles.detailTitle}>{item.title}</div>

        {item.status && (
          <div className={styles.statusRow}>
            <div className={styles.chipLabel}>Status</div>
            <div className={styles.statusChip} style={{ background: statusMeta.bg, borderColor: statusMeta.border }}>
              <MIcon name={statusMeta.icon} size="0.9rem" color={statusMeta.color} />
              <span style={{ color: statusMeta.color }}>{statusMeta.label}</span>
            </div>
          </div>
        )}

        <div className={styles.infoGrid}>
          {item.summary ? (
            <>
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
            </>
          ) : null}
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Time</div>
            <div className={styles.infoGridValue}>{item.time}</div>
          </div>
        </div>

        {customerName && (
          <SheetSection icon="person" label="Customer">
            <div className={styles.linkedRow}>
              <div className={styles.linkedAvatar}>
                <span className={styles.linkedAvatarInitials}>{getInitials(customerName)}</span>
              </div>
              <span className={styles.linkedName}>{customerName}</span>
            </div>
          </SheetSection>
        )}

        {linkedOrderName && (
          <SheetSection icon="shopping_bag" label="Linked Order">
            <div className={styles.linkedRow}>
              <div className={styles.iconBadge}>
                <MIcon name={item.summary.icon || 'checkroom'} size="1rem" color="var(--text2)" />
              </div>
              <span className={styles.linkedName}>{linkedOrderName}</span>
            </div>
          </SheetSection>
        )}

        <SheetSection icon="info" label="What happened">
          <p className={styles.detailNoteText}>{whatHappened}</p>
        </SheetSection>

        {item.reason && (
          <SheetSection icon="psychology" label="Why the assistant did this">
            <p className={styles.detailNoteText}>{item.reason}</p>
          </SheetSection>
        )}
      </div>
    </SheetBase>
  )
}
