import { getInitials } from "../../../../utils/nameUtils"
import { getBirthdayStr } from "../../utils"
import styles from "./CustomerRow.module.css"


export function CustomerRow({ customer, onDelete, onOpen, isLast }) {

  const initials = getInitials(customer.name)
  const birthdayStr = getBirthdayStr(customer.birthday)

  return (
    <div
      className={`${styles.custListItem} ${isLast ? styles.custListItemLast : ''}`}
      onClick={onOpen}
    >
      <div className={styles.custListOuter}>
        <div className={styles.custListInner}>
          {customer.photo
            ? <img src={customer.photo} alt={customer.name} className={styles.custListPhoto} />
            : <span className={styles.custListInitials}>{initials}</span>
          }
        </div>
      </div>

      <div className={styles.custListInfo}>
        <div className={styles.custListName}>{customer.name}</div>
        {customer.phone && (
          <div className={styles.custListMeta}>{customer.phone}{birthdayStr ? ` · ${birthdayStr}` : ''}</div>
        )}
        {customer.email && (
          <div className={styles.custListMeta}>{customer.email}</div>
        )}
      </div>

      <div className={styles.custListActions}>
        <button
          className={styles.custDeleteBtn}
          onClick={e => { e.stopPropagation(); onDelete(customer) }}
        >
          <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--text3)' }}>delete_outline</span>
        </button>
        <span className="mi" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>chevron_right</span>
      </div>
    </div>
  )
}
