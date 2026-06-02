import styles from "./Field.module.css"


export function Field({ label, hint, children }) {

  return (
    <div className={styles.field}>

      <label className={styles.fieldLabel}>{label}</label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      {children}
      
    </div>
  )
}