import { QUICK_ACTIONS } from "../../datas"
import { useTour } from '../../../../contexts/TourContext'
import styles from "./QuickActionsSection.module.css"

const ICON_COLORS = ['#fb923c', '#3b82f6', '#22c55e', '#ec4899', '#8b5cf6', '#06b6d4']

export function QuickActionsSection({ onNavigate }) {
  const { completeStep } = useTour()

  function handleActionClick(action) {
    if (action.tourId === 'add-customer-quick-action') {
      completeStep('goto-customers-nav')
    }
    onNavigate(action.route)
  }

  return (
    <section className={styles.quickActions}>
      <h3 className={styles.sectionTitle}>Quick Actions</h3>
      <div className={styles.scrollRow}>
        {QUICK_ACTIONS.map((action, i) => (
          <div
            key={action.label}
            className={styles.actionCard}
            onClick={() => handleActionClick(action)}
            data-tour={action.tourId}
          >
            <div
              className={styles.iconCircle}
              style={{ background: `${ICON_COLORS[i % ICON_COLORS.length]}1a` }}
            >
              <span
                className="mi-outlined"
                style={{ fontSize: '1.4rem', color: ICON_COLORS[i % ICON_COLORS.length] }}
              >
                {action.icon}
              </span>
            </div>
            <div className={styles.actionLabel}>{action.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
