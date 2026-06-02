import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import styles from "./SectionSkeleton.module.css"


export function SectionSkeleton() {
  return (
    <div className={styles.sectionSkeleton}>
      <div className={styles.sectionSkeletonHeader}>
        <Skeleton width={140} height={11} borderRadius={4} />
        <Skeleton width={44}  height={11} borderRadius={4} />
      </div>
      {[0, 1, 2].map(i => (
        <div key={i} className={styles.sectionSkeletonItem}>
          <Skeleton width={80} height={80} borderRadius={12} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Skeleton width="70%" height={13} borderRadius={4} />
            <Skeleton width="50%" height={10} borderRadius={4} />
            <Skeleton width="60%" height={10} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  )
}
