import { forwardRef } from "react"
import styles from "./Field.module.css"

export const Field = forwardRef(function Field({ label, hint, children }, ref) {

  return (
    <div ref={ref} className={styles.field}>

      <label className={styles.fieldLabel}>{label}</label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      {children}

    </div>
  )
})
