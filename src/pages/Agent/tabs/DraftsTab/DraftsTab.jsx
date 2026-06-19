import { useState } from "react"
import { DateDivider } from "../../components/DateDivider/DateDivider"
import { DraftDetailSheet } from "./components/DraftDetailSheet/DraftDetailSheet"
import { DraftRow } from "./components/DraftRow/DraftRow"
import { MIcon } from "../../components/MIcon/MIcon"
import { groupByDate } from "../../utils"
import styles from "./DraftsTab.module.css"

export function DraftsTab({
  items,
  onDiscard,
  allOrders,
  allInvoices,
  allReceipts,
  allPayments,
  customers,
  generalSettings,
  profileSettings,
  showToast,
  onSaveDoc,
}) {
  const [selected, setSelected] = useState(null)

  if (!items.length) return (
    <div className={styles.emptyTab}>
      <MIcon name="edit_note" size="2rem" color="var(--border2)" />
      <p className={styles.emptyTabTitle}>Nothing ready yet</p>
      <p className={styles.emptyTabSub}>Documents and messages your assistant prepares will appear here</p>
    </div>
  )

  const groups = groupByDate(items, i => i.date)

  return (
    <>
      <div className={styles.listWrap}>
        {groups.map(group => (
          <div key={group.date} className={styles.dateGroup}>
            <DateDivider label={group.date} />
            <div className={styles.groupRows}>
              {group.items.map((item, idx) => (
                <DraftRow
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
        <DraftDetailSheet
          item={selected}
          onClose={() => setSelected(null)}
          onDiscard={onDiscard}
          allOrders={allOrders}
          allInvoices={allInvoices}
          allReceipts={allReceipts}
          allPayments={allPayments}
          customers={customers}
          generalSettings={generalSettings}
          profileSettings={profileSettings}
          showToast={showToast}
          onSaveDoc={onSaveDoc}
        />
      )}
    </>
  )
}