import { MIcon } from "../MIcon/MIcon"
import styles from "./SheetSection.module.css"

export function SheetSection({ icon, label, children, hideIcon, noDivider, headerAction }) {
  return (
    <div className={styles.section}>
      <div className={`${styles.sectionHeader} ${noDivider ? styles.sectionHeaderNoDivider : ""}`}>
        {!hideIcon && <MIcon name={icon} size="0.72rem" color="var(--text3)" />}
        <span className={styles.sectionLabel}>{label}</span>
        {headerAction && <div className={styles.sectionHeaderAction}>{headerAction}</div>}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  )
}
