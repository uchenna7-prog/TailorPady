import { SectionHeader } from "../SectionHeader/SectionHeader"
import { OrderRow } from "../../../../components/OrderRow/OrderRow"
import styles from "./RecentOrdersSection.module.css"


export function RecentOrdersSection({ orders, onSeeAll, onSelectOrder }) {
  return (
    <section className={styles.section}>
      <SectionHeader title="Recent Orders" onSeeAll={onSeeAll} />
      <div className={styles.listSection}>
        <div className={styles.listDivider} />
        {orders.map((order, index) => (
          <OrderRow
            key={order.id}
            order={order}
            isLast={index === orders.length - 1}
            onTap={() => onSelectOrder(order)}
          />
        ))}
      </div>
    </section>
  )
}