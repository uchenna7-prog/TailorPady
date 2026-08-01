import { QUICK_ACTIONS } from "../../datas"
import { useTour } from '../../../../contexts/TourContext'
import styles from "./QuickActionsSection.module.css"

export function QuickActionsSection({ onNavigate }) {
  const { completeStep } = useTour()

  function handleActionClick(action) {
    if (action.tourId === 'add-customer-quick-action') {
      completeStep('goto-customers-nav')
    }
    onNavigate(action.route)
  }

  return (
    <section className={styles.quickActionsDesktop}>
      <h3 className={styles.sectionTitle}>Quick Actions</h3>
      <div className={styles.statsGrid}>
        {QUICK_ACTIONS.map(action => (
          <div
            key={action.label}
            className={styles.actionCard}
            onClick={() => handleActionClick(action)}
            data-tour={action.tourId}
          >
            <div className={styles.statIconWrap}>
              <span className="mi" style={{ fontSize: '1.75rem', color: 'var(--accent)' }}>
                {action.icon}
              </span>
            </div>
            <div className={styles.actionCardText}>
              <div className={styles.actionLabel}>{action.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}