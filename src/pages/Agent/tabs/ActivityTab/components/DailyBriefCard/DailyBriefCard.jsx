import { MIcon } from '../../../../components/MIcon/MIcon'
import { getGreeting, getDisplayName } from '../../../../utils'
import styles from './DailyBriefCard.module.css'

const ITEMS_CONFIG = [
  {
    key:     'pendingDrafts',
    icon:    'edit_note',
    title:   count => count === 1 ? 'Draft awaiting review'   : 'Drafts awaiting review',
    sub:     count => count === 1 ? 'Tap to review and approve' : 'Tap to review and approve',
    mod:     'draft',
  },
  {
    key:     'ordersDueToday',
    icon:    'calendar_today',
    title:   count => count === 1 ? 'Order due today'         : 'Orders due today',
    sub:     ()    => 'Check progress and mark ready',
    mod:     'due',
  },
  {
    key:     'overdueInvoices',
    icon:    'warning_amber',
    title:   count => count === 1 ? 'Overdue invoice'         : 'Overdue invoices',
    sub:     ()    => 'Past due date and unpaid',
    mod:     'overdue',
  },
  {
    key:     'pendingReceipts',
    icon:    'receipt_long',
    title:   count => count === 1 ? 'Payment without a receipt' : 'Payments without receipts',
    sub:     ()    => 'Receipt will be generated shortly',
    mod:     'receipt',
  },
  {
    key:     'upcomingCount',
    icon:    'schedule',
    title:   count => count === 1 ? 'Action scheduled'        : 'Actions scheduled',
    sub:     ()    => 'View the Scheduled tab for details',
    mod:     'scheduled',
  },
]

export function DailyBriefCard({ user, brief, onDismiss }) {
  if (!brief || brief.isEmpty) return null

  const name     = getDisplayName(user)
  const greeting = `${getGreeting()}${name ? `, ${name}` : ''} 👋`

  const items = ITEMS_CONFIG
    .map(cfg => ({ ...cfg, count: brief[cfg.key] || 0 }))
    .filter(item => item.count > 0)

  const totalCount = items.reduce((sum, item) => sum + item.count, 0)

  const hasBirthdays = brief.upcomingBirthdays?.length > 0

  const summaryLine = totalCount === 0
    ? "Everything's looking good today."
    : totalCount === 1
      ? 'You have 1 thing that needs attention.'
      : `You have ${totalCount} things that need attention.`

  return (
    <div className={styles.card}>

      <div className={styles.eyebrow}>
        <div className={styles.eyebrowLeft}>
   
        </div>
        {onDismiss && (
          <button className={styles.dismissBtn} onClick={onDismiss} aria-label="Dismiss">
            <MIcon name="close" size="0.7rem" color="var(--text3)" />
          </button>
        )}
      </div>

      <p className={styles.greeting}>{greeting}</p>
      <p className={styles.summary}>{summaryLine}</p>

      {items.length > 0 && (
        <div className={styles.items}>
          {items.map((item, idx) => (
            <div
              key={item.key}
              className={`${styles.item} ${idx === 0 ? styles.itemFirst : ''} ${idx === items.length - 1 ? styles.itemLast : ''}`}
            >
              <div className={`${styles.itemIcon} ${styles[`icon_${item.mod}`]}`}>
                <MIcon name={item.icon} size="0.85rem" color="currentColor" />
              </div>
              <div className={styles.itemBody}>
                <p className={styles.itemTitle}>{item.title(item.count)}</p>
                <p className={styles.itemSub}>{item.sub(item.count)}</p>
              </div>
              <span className={styles.itemCount}>{item.count}</span>
            </div>
          ))}
        </div>
      )}

      {hasBirthdays && (
        <div className={styles.birthdayRow}>
          <MIcon name="cake" size="0.78rem" color="var(--text3)" />
          <span className={styles.birthdayText}>
            {brief.upcomingBirthdays.length === 1
              ? `${brief.upcomingBirthdays[0]}'s birthday is coming up this week`
              : brief.upcomingBirthdays.length === 2
                ? `${brief.upcomingBirthdays[0]} and ${brief.upcomingBirthdays[1]} have birthdays this week`
                : `${brief.upcomingBirthdays.slice(0, 2).join(', ')} and ${brief.upcomingBirthdays.length - 2} more have birthdays this week`
            }
          </span>
        </div>
      )}

    </div>
  )
}