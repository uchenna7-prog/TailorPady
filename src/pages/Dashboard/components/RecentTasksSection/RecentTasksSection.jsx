import { SectionHeader } from "../SectionHeader/SectionHeader"
import { TaskRow } from "../../../../components/TaskRow/TaskRow"
import styles from "./RecentTasksSection.module.css"


export function RecentTasksSection({ tasks, allOrders = [], onSeeAll, onSelectTask }) {
  return (
    <section className={styles.section}>
      <SectionHeader title="Recent Tasks" onSeeAll={onSeeAll} />
      <div className={styles.listSection}>
        <div className={styles.listDivider} />
        {tasks.map((task, index) => (
          <TaskRow
            key={task.id}
            task={task}
            isLast={index === tasks.length - 1}
            allOrders={allOrders}
            onToggle={() => {}}
            onOpen={() => onSelectTask?.(task)}
          />
        ))}
      </div>
    </section>
  )
}