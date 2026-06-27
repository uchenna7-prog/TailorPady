import { useState } from 'react'
import { MIcon } from '../../components/MIcon/MIcon'
import { DateDivider } from '../../components/DateDivider/DateDivider'
import { ScheduledDetailSheet } from './components/ScheduledDetailSheet/ScheduledDetailSheet'
import { ScheduledRow } from './components/ScheduledRow/ScheduledRow'
import { groupByDate } from '../../utils'
import styles from './ScheduledTab.module.css'

export function ScheduledTab({ items, allOrders, allInvoices, allPayments, customers, onCancel }) {
  const [selected, setSelected] = useState(null)

  if (!items?.length) return (
    <div className={styles.emptyTab}>
      <MIcon name="schedule" size="2rem" color="var(--border2)" />
      <p className={styles.emptyTabTitle}>Nothing scheduled</p>
      <p className={styles.emptyTabSub}>Upcoming assistant actions will appear here</p>
    </div>
  )

  const groups = groupByDate(items, i => i.whenDate || 'Upcoming')

  return (
    <>
      <div className={styles.listWrap}>
        {groups.map(group => (
          <div key={group.date} className={styles.dateGroup}>
            <DateDivider label={group.date} />
            <div className={styles.groupRows}>
              {group.items.map((item, idx) => (
                <ScheduledRow
                  key={item.id}
                  item={item}
                  isLast={idx === group.items.length - 1}
                  allOrders={allOrders}
                  allInvoices={allInvoices}
                  allPayments={allPayments}
                  customers={customers}
                  onOpen={setSelected}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ScheduledDetailSheet
          item={selected}
          onClose={() => setSelected(null)}
          onCancel={onCancel}
          allOrders={allOrders}
          allInvoices={allInvoices}
          allPayments={allPayments}
          customers={customers}
        />
      )}
    </>
  )
}