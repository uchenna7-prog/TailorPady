import styles from "./EmptyState.module.css"

export function EmptyState(){
    return(
        <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><span className="mi" style={{ fontSize: '3rem', color: 'var(--text3)' }}>person_outline</span></div>
            <p>No customer yet.</p>
            <span>Tap + to add your first customer</span>
        </div>
    )
}