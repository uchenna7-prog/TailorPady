import { useEffect } from 'react'
import styles from './FirstRunFlow.module.css'

const DURATION_MS = 1800

export default function Provisioning({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className={styles.page}>
      <div className={styles.provisioningContent}>
        <div className={styles.brandMark}>
          <img src="/icons/icon512.png" alt="TailorPady" />
        </div>
        <p className={styles.provisioningLabel}>Setting up your studio…</p>
        <div className={styles.skeletonGroup}>
          <span className={styles.skeletonRow} style={{ width: '78%' }} />
          <span className={styles.skeletonRow} style={{ width: '55%' }} />
          <span className={styles.skeletonRow} style={{ width: '68%' }} />
          <span className={styles.skeletonRow} style={{ width: '40%' }} />
        </div>
      </div>
    </div>
  )
}
