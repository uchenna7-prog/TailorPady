import { TAG_COLORS } from "../../datas"
import styles from "./TagPill.module.css"

export function TagPill({ label }) {
  const c = TAG_COLORS[label] || TAG_COLORS.Message
  return (
    <span className={styles.pill} style={{ background: c.bg, color: c.color }}>
      {label}
    </span>
  )
}
