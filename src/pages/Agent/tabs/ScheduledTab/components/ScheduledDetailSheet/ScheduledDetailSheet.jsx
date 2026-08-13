import { useState }         from "react"
import { SheetBase }        from "../../../../components/SheetBase/SheetBase"
import { SheetHeader }      from "../../../../components/SheetHeader/SheetHeader"
import { SheetSection }     from "../../../../components/SheetSection/SheetSection"
import { resolveCustomerName, resolveCustomer, resolveOrder, haptic } from "../../../../utils"
import { MIcon }            from "../../../../components/MIcon/MIcon"
import OrderMosaic          from "../../../../../../components/OrderMosaic/OrderMosaic"
import styles               from "./ScheduledDetailSheet.module.css"

const TAG_COLORS = {
  invoice:    { color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.4)'  },
  receipt:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.4)'   },
  reminder:   { color: '#eab308', bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.4)'   },
  overdue:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)'   },
  orderready: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',  border: 'rgba(14,165,233,0.4)'  },
  birthday:   { color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.4)'  },
  followup:   { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.4)'  },
}

function getInitials(name) {
  if (!name) return ''
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
}

export function ScheduledDetailSheet({ item, onClose, onCancel, allOrders, allInvoices, allPayments, customers, onGoToCustomer }) {
  const [photoFailed, setPhotoFailed] = useState(false)
  if (!item) return null
  const customerName = resolveCustomerName(item, allOrders, allInvoices, allPayments, customers)
  const customerObj = resolveCustomer(item, allOrders, allInvoices, allPayments, customers)
  const orderObj = resolveOrder(item, allOrders, allInvoices, allPayments)
  const tagMeta = TAG_COLORS[item.type] || TAG_COLORS.reminder

  return (
    <SheetBase onClose={onClose}>
      <SheetHeader title="Scheduled" onClose={onClose} />

      <div className={styles.sheetBody}>
        <div className={styles.detailTitle}>{item.title}</div>

        <div className={styles.infoGrid}>
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Type</div>
            <div className={styles.infoGridValue} style={{ color: tagMeta.color }}>{item.tag}</div>
          </div>
          <div className={styles.infoGridCell}>
            <div className={styles.infoGridLabel}>Scheduled For</div>
            <div className={`${styles.infoGridValue} ${styles.accentText}`}>{item.when}</div>
          </div>
        </div>

        {customerName && (
          <div className={styles.sectionSpacer}>
            <SheetSection
              label="Customer"
              hideIcon
              noDivider
              headerAction={onGoToCustomer && customerObj?.id ? <MIcon name="chevron_right" size="1.1rem" color="var(--text3)" /> : null}
            >
              {onGoToCustomer && customerObj?.id ? (
                <button
                  type="button"
                  className={styles.linkedRowBtn}
                  onClick={() => { onClose(); onGoToCustomer(customerObj.id) }}
                >
                  <div className={styles.linkedAvatar}>
                    {customerObj?.photo && !photoFailed
                      ? <img src={customerObj.photo} alt="" className={styles.linkedAvatarImg} onError={() => setPhotoFailed(true)} />
                      : <span className={styles.linkedAvatarInitials}>{getInitials(customerName)}</span>}
                  </div>
                  <span className={styles.linkedName}>{customerName}</span>
                </button>
              ) : (
                <div className={styles.linkedRow}>
                  <div className={styles.linkedAvatar}>
                    {customerObj?.photo && !photoFailed
                      ? <img src={customerObj.photo} alt="" className={styles.linkedAvatarImg} onError={() => setPhotoFailed(true)} />
                      : <span className={styles.linkedAvatarInitials}>{getInitials(customerName)}</span>}
                  </div>
                  <span className={styles.linkedName}>{customerName}</span>
                </div>
              )}
            </SheetSection>
          </div>
        )}

        {orderObj && (
          <div className={styles.sectionSpacer}>
            <SheetSection label="Linked Order" hideIcon noDivider>
              <div className={styles.linkedRow}>
                <OrderMosaic items={orderObj.items || []} size="sm" />
                <span className={styles.linkedName}>{orderObj.desc}</span>
              </div>
            </SheetSection>
          </div>
        )}

        <div className={styles.sectionSpacer}>
          <SheetSection icon="event_note" label="What will happen">
            <p className={styles.detailNoteText}>{item.detail || item.desc}</p>
          </SheetSection>
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
