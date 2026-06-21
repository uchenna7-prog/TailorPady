import styles from "../styles/Template2.module.css"
import { ReceiptPaymentSummary } from "../components/ReceiptPaymentSummary/ReceiptPaymentSummary"
import { ItemsTable } from "../components/ReceiptItemsTable/ReceiptItemsTable"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"
import { PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/icons"


export function ReceiptTemplate2({ receipt, customer, receiptBrandSettings }) {

  return (

    <div className={styles.template}>

      <div className={styles.header}>
        <div>
          <div className={styles.title}>RECEIPT</div>
          <div className={styles.receiptNumber}>{receipt.number}</div>
        </div>
        <div className={styles.logoBox}>
          <LogoOrName receiptBrandSettings={receiptBrandSettings} />
        </div>
      </div>

      <div className={styles.dateMeta}>
        <div className={styles.dateMetaItem}>
          <span className={styles.dateMetaLabel}>Date</span>
          <span className={styles.dateMetaValue}>{receipt.date}</span>
        </div>
      </div>

      <div className={styles.grid}>

        <div className={styles.gridBox}>
          <strong>RECEIVED BY</strong>
          <div className={styles.gridName}>{receiptBrandSettings.name}</div>
          {receiptBrandSettings.phone && (
            <div className={styles.iconRow}>
              <span className={styles.icon}><PhoneIcon /></span>
              <span>{receiptBrandSettings.phone}</span>
            </div>
          )}
          {receiptBrandSettings.email && (
            <div className={styles.iconRow}>
              <span className={styles.icon}><EmailIcon /></span>
              <span>{receiptBrandSettings.email}</span>
            </div>
          )}
          {receiptBrandSettings.address && (
            <div className={styles.iconRow}>
              <span className={styles.icon}><LocationIcon /></span>
              <span>{receiptBrandSettings.address}</span>
            </div>
          )}
        </div>

        <div className={styles.gridBox}>
          <strong>RECEIVED FROM</strong>
          <div className={styles.gridName}>{customer.name}</div>
          {customer.phone && (
            <div className={styles.iconRow}>
              <span className={styles.icon}><PhoneIcon /></span>
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.email && (
            <div className={styles.iconRow}>
              <span className={styles.icon}><EmailIcon /></span>
              <span>{customer.email}</span>
            </div>
          )}
          {customer.address && (
            <div className={styles.iconRow}>
              <span className={styles.icon}><LocationIcon /></span>
              <span>{customer.address}</span>
            </div>
          )}
        </div>

      </div>

      <div className={styles.body}>

        <ItemsTable receipt={receipt} receiptBrandSettings={receiptBrandSettings} />
        <ReceiptPaymentSummary receipt={receipt} receiptBrandSettings={receiptBrandSettings} />

        {receiptBrandSettings.name && (
          <div className={styles.paymentInfo}>
            <strong style={{ fontWeight: 900, color: "var(--brand-primary-dark)" }}>Payment Details</strong>
            <div className={styles.paymentBody}>
              {receiptBrandSettings.name && (
                <div>Received By: {receiptBrandSettings.name}</div>
              )}
            </div>
          </div>
        )}

      </div>

      <div className={styles.footerCenteredText}>{receiptBrandSettings.footer || "Thank you!"}</div>

    </div>
  )
}
