import { MIcon } from "../MIcon/MIcon"
import styles from "./SheetHeader.module.css"


export function SheetHeader({ title, onClose }) {
  return (
    <div className={styles.sheetHeader}>
      <button className={styles.sheetCloseBtn} onClick={onClose}>
        <MIcon name="close" size="1.1rem" color="var(--text2)" />
      </button>
      <span className={styles.sheetHeaderTitle}>{title}</span>
      <div style={{ width: 30 }} />
    </div>
  )
}