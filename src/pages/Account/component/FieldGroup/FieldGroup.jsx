import styles from "./FieldGroup.module.css"

export function FieldGroup({ children }) {

  return <div className={styles.fieldGroup}>{children}</div>
}