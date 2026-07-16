import styles from "./PlanBadge.module.css"


export function PlanBadge({ isPremium }) {

  return (
    <span className={isPremium ? styles.badgePro : styles.badgeFree}>
      {isPremium
        ? <><span className="mi" style={{ fontSize: '0.75rem' }}>workspace_premium</span> PRO</>
        : 'FREE'}
    </span>
  )
}
