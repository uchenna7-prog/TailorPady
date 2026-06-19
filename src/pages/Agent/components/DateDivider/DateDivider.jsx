import styles from "./DateDivider.module.css"


export function DateDivider({ label }) {
  return <div className={styles.dateDivider}>{label}</div>
}
