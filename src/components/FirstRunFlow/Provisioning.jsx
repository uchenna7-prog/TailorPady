import { useEffect } from 'react'
import styles from './FirstRunFlow.module.css'

const DURATION_MS = 2600

function assemblePath(sx1, sy1, sx2, sy2, delayMs) {
  return {
    '--sx1': sx1,
    '--sy1': sy1,
    '--sx2': sx2,
    '--sy2': sy2,
    animationDelay: `${delayMs}ms, 0ms`,
  }
}

export default function Provisioning({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  const rows = [
    { fromX: '-90vw', fromY: '0vh', viaX: '-25vw', viaY: '4vh', delay: 460 },
    { fromX: '90vw', fromY: '0vh', viaX: '25vw', viaY: '-4vh', delay: 560 },
    { fromX: '-90vw', fromY: '0vh', viaX: '-25vw', viaY: '4vh', delay: 660 },
    { fromX: '90vw', fromY: '0vh', viaX: '25vw', viaY: '-4vh', delay: 760 },
  ]

  return (
    <div className={styles.provisioningPage}>
      <div className={styles.skeletonMain}>
        <div className={styles.skeletonTopBar}>
          <span
            className={`${styles.skeletonShimmer} ${styles.skeletonAssemble} ${styles.skeletonTitleBar}`}
            style={assemblePath('-90vw', '0vh', '-20vw', '20vh', 0)}
          />
          <span
            className={`${styles.skeletonShimmer} ${styles.skeletonAssemble} ${styles.skeletonAvatar}`}
            style={assemblePath('60vw', '-40vh', '15vw', '10vh', 90)}
          />
        </div>

        <div className={styles.skeletonStatsRow}>
          <span
            className={`${styles.skeletonShimmer} ${styles.skeletonAssemble} ${styles.skeletonStatCard}`}
            style={assemblePath('-70vw', '30vh', '-12vw', '-14vh', 180)}
          />
          <span
            className={`${styles.skeletonShimmer} ${styles.skeletonAssemble} ${styles.skeletonStatCard}`}
            style={assemblePath('0vw', '-70vh', '0vw', '14vh', 260)}
          />
          <span
            className={`${styles.skeletonShimmer} ${styles.skeletonAssemble} ${styles.skeletonStatCard}`}
            style={assemblePath('70vw', '30vh', '12vw', '-14vh', 340)}
          />
        </div>

        <div className={styles.skeletonListArea}>
          {rows.map((row, i) => (
            <div
              className={`${styles.skeletonAssemble} ${styles.skeletonListRow}`}
              key={i}
              style={assemblePath(row.fromX, row.fromY, row.viaX, row.viaY, row.delay)}
            >
              <span className={`${styles.skeletonShimmer} ${styles.skeletonListIcon}`} />
              <div className={styles.skeletonListText}>
                <span className={`${styles.skeletonShimmer} ${styles.skeletonListLineWide}`} />
                <span className={`${styles.skeletonShimmer} ${styles.skeletonListLineNarrow}`} />
              </div>
              <span className={`${styles.skeletonShimmer} ${styles.skeletonPill}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
