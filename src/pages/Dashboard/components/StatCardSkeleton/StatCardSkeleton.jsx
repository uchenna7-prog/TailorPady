import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import styles from "./StatCardSkeleton.module.css"


export function StatCardSkeleton() {
  return (
    <div className={styles.statCardSkeleton}>
      <Skeleton width={24} height={24} borderRadius={4} />
      <Skeleton width={48} height={28} borderRadius={5} style={{ marginTop: 12 }} />
      <Skeleton width={72} height={10} borderRadius={4} style={{ marginTop: 8 }} />
      <Skeleton width={56} height={9}  borderRadius={4} style={{ marginTop: 6 }} />
    </div>
  )
}