import styles from "./SheetBase.module.css"


export function SheetBase({ onClose, children }) {
  return (
    <div className={styles.sheetOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheetPanel}>
        <div className={styles.sheetHandle} />
        {children}
      </div>
    </div>
  )
}
