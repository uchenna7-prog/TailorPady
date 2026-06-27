import { MIcon } from '../../../../components/MIcon/MIcon'
import { getGreeting, getGreetingEmoji, getDisplayName, getBriefSubtext } from '../../../../utils'
import { AGENT_BRIEF_SUBTEXTS } from '../../../../datas'
import styles from './DailyBriefCard.module.css'

const STAT_CONFIG = {
  pendingDrafts:     { icon: 'edit_note',      label: 'draft',           labelPlural: 'drafts'            },
  ordersDueToday:    { icon: 'calendar_today', label: 'due today',       labelPlural: 'due today'         },
  overdueInvoices:   { icon: 'warning_amber',  label: 'overdue invoice', labelPlural: 'overdue invoices'  },
  pendingReceipts:   { icon: 'receipt_long',   label: 'missing receipt', labelPlural: 'missing receipts'  },
  upcomingCount:     { icon: 'schedule',       label: 'scheduled',       labelPlural: 'scheduled'         },
}

/**
 * @param {object} props
 * @param {object} props.user - current auth user, used to personalize the greeting
 * @param {object} props.brief
 * @param {() => void} [props.onDismiss] - if provided, shows a close button that dismisses the brief for today
 * @param {(key: string) => void} [props.onStatClick] - if provided, stat rows become clickable and call this with the stat key
 */
export function DailyBriefCard({ user, brief, onDismiss, onStatClick }) {
  if (!brief || brief.isEmpty) return null

  const stats = Object.entries(STAT_CONFIG)
    .map(([key, config]) => ({ key, value: brief[key], ...config }))
    .filter(s => s.value > 0)

  const hasBirthdays = brief.upcomingBirthdays?.length > 0
  const clickable = typeof onStatClick === 'function'

  const name = getDisplayName(user)
  const greeting = `${getGreeting()}, ${name} ${getGreetingEmoji()}`
  const subtext = getBriefSubtext(AGENT_BRIEF_SUBTEXTS)

  return (
    <div className={styles.brief}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <div className={styles.greeting}>{greeting}</div>
          {subtext && <div className={styles.subtext}>{subtext}</div>}
        </div>

        {onDismiss && (
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={onDismiss}
            aria-label="Dismiss today's brief"
          >
            <MIcon name="close" size="0.8rem" color="var(--text3)" />
          </button>
        )}
      </div>

      {stats.length > 0 && (
        <div className={styles.stats}>
          {stats.map(stat => {
            const Tag = clickable ? 'button' : 'div'
            return (
              <Tag
                key={stat.key}
                type={clickable ? 'button' : undefined}
                className={`${styles.stat} ${clickable ? styles.statClickable : ''}`}
                onClick={clickable ? () => onStatClick(stat.key) : undefined}
              >
                <MIcon name={stat.icon} size="0.75rem" color="var(--text2)" />
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>
                  {stat.value === 1 ? stat.label : stat.labelPlural}
                </span>
              </Tag>
            )
          })}
        </div>
      )}

      {hasBirthdays && (
        <div className={styles.birthdays}>
          <MIcon name="cake" size="0.72rem" color="var(--text3)" />
          <span className={styles.birthdayText}>
            {brief.upcomingBirthdays.length === 1
              ? `${brief.upcomingBirthdays[0]}'s birthday this week`
              : `${brief.upcomingBirthdays.slice(0, 2).join(', ')}${brief.upcomingBirthdays.length > 2 ? ` +${brief.upcomingBirthdays.length - 2}` : ''} — birthdays this week`
            }
          </span>
        </div>
      )}
    </div>
  )
}