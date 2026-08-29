import { useEffect } from 'react'
import styles from './FirstRunFlow.module.css'

const DURATION_MS = 2200

function delayStyle(ms) {
  return { animationDelay: `${ms}ms, ${ms}ms` }
}

export default function Provisioning({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className={styles.provisioningPage}>
      <div className={styles.skeletonRail}>
        <span className={`${styles.skeletonBlock} ${styles.skeletonRailIcon}`} style={delayStyle(0)} />
        <span className={`${styles.skeletonBlock} ${styles.skeletonRailIcon}`} style={delayStyle(80)} />
        <span className={`${styles.skeletonBlock} ${styles.skeletonRailIcon}`} style={delayStyle(160)} />
        <span className={`${styles.skeletonBlock} ${styles.skeletonRailIcon}`} style={delayStyle(240)} />
        <span className={`${styles.skeletonBlock} ${styles.skeletonRailIcon}`} style={delayStyle(320)} />
      </div>

      <div className={styles.skeletonMain}>
        <div className={styles.skeletonTopBar}>
          <span className={`${styles.skeletonBlock} ${styles.skeletonTitleBar}`} style={delayStyle(60)} />
          <span className={`${styles.skeletonBlock} ${styles.skeletonAvatar}`} style={delayStyle(120)} />
        </div>

        <div className={styles.skeletonStatsRow}>
          <span className={`${styles.skeletonBlock} ${styles.skeletonStatCard}`} style={delayStyle(180)} />
          <span className={`${styles.skeletonBlock} ${styles.skeletonStatCard}`} style={delayStyle(250)} />
          <span className={`${styles.skeletonBlock} ${styles.skeletonStatCard}`} style={delayStyle(320)} />
        </div>

        <div className={styles.skeletonListArea}>
          {[0, 1, 2, 3, 4].map(i => (
            <div className={styles.skeletonListRow} key={i}>
              <span className={`${styles.skeletonBlock} ${styles.skeletonListIcon}`} style={delayStyle(400 + i * 90)} />
              <div className={styles.skeletonListText}>
                <span className={`${styles.skeletonBlock} ${styles.skeletonListLineWide}`} style={delayStyle(420 + i * 90)} />
                <span className={`${styles.skeletonBlock} ${styles.skeletonListLineNarrow}`} style={delayStyle(440 + i * 90)} />
              </div>
              <span className={`${styles.skeletonBlock} ${styles.skeletonPill}`} style={delayStyle(460 + i * 90)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
