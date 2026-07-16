import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import styles from "./RevenueGoalCardSkeleton.module.css"


export function RevenueGoalCardSkeleton() {
  return (
    <div className={styles.card}>

      <div className={styles.left}>
        <Skeleton width={90} height={9} borderRadius={4} />
        <Skeleton width={130} height={26} borderRadius={5} style={{ marginTop: 10 }} />
        <Skeleton width={100} height={10} borderRadius={4} style={{ marginTop: 8 }} />
        <Skeleton width={140} height={9} borderRadius={4} style={{ marginTop: 8 }} />
      </div>

      <div className={styles.right}>
        <Skeleton circle width={88} height={88} />
        <Skeleton width={24} height={24} borderRadius={6} style={{ marginTop: 6 }} />
      </div>

    </div>
  )
}