import { useState } from 'react'
import { MIcon } from '../../components/MIcon/MIcon'
import { DateDivider } from '../../components/DateDivider/DateDivider'
import { ActivityDetailSheet } from './components/ActivityDetailSheet/ActivityDetailSheet'
import { ActivityRow } from './components/ActivityRow/ActivityRow'
import { DailyBriefCard } from './components/DailyBriefCard/DailyBriefCard'
import { groupByDate } from '../../utils'
import styles from './ActivityTab.module.css'

export function ActivityTab({ user, drafts, approvedDrafts, dailyBrief, allOrders, allInvoices, allPayments, customers }) {
  const [selected, setSelected] = useState(null)

  const isEmpty = !drafts?.length && !dailyBrief

  if (isEmpty) return (
    <div className={styles.emptyTab}>
      <MIcon name="check_circle" size="2rem" color="var(--border2)" />
      <p className={styles.emptyTabTitle}>No activity yet</p>
      <p className={styles.emptyTabSub}>Your assistant will log its actions here as it works</p>
    </div>
  )

  const groups = groupByDate(drafts || [], i => i.date || 'Today')

  return (
    <>
      <div className={styles.listWrap}>
        {dailyBrief && !dailyBrief.isEmpty && (
          <DailyBriefCard user={user} brief={dailyBrief} />
        )}

        {groups.map(group => (
          <div key={group.date} className={styles.dateGroup}>
            <DateDivider label={group.date} />
            <div className={styles.groupRows}>
              {group.items.map((item, idx) => (
                <ActivityRow
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
        <ActivityDetailSheet
          item={selected}
          onClose={() => setSelected(null)}
          allOrders={allOrders}
          allInvoices={allInvoices}
          allPayments={allPayments}
          customers={customers}
        />
      )}
    </>
  )
}