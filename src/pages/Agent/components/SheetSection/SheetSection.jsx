import { MIcon } from "../MIcon/MIcon"
import styles from "./SheetSection.module.css"


export function SheetSection({ icon, label, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <MIcon name={icon} size="0.72rem" color="var(--text3)" />
        <span className={styles.sectionLabel}>{label}</span>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  )
}
