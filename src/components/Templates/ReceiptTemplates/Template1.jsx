import styles from "../styles/Template1.module.css"
import { ReceiptPaymentSummary } from "../components/ReceiptPaymentSummary/ReceiptPaymentSummary"
import { ItemsTable } from "../components/ReceiptItemsTable/ReceiptItemsTable"
import { PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/icons"


export function ReceiptTemplate1({ receipt, customer, receiptBrandSettings }) {

  const lineColor = receiptBrandSettings.colour || "#1C1814"

  return (

    <div className={styles.template}>

      <div className={styles.header}>
        <div className={styles.brandName}>{receiptBrandSettings.name || "Your Brand"}</div>
        {receiptBrandSettings.tagline && <div className={styles.tagline}>{receiptBrandSettings.tagline}</div>}

        <div className={styles.titleRow}>
          <div className={styles.titleLine} style={{ background: lineColor }} />
          <div className={styles.title}>RECEIPT</div>
          <div className={styles.titleLine} style={{ background: lineColor }} />
        </div>
      </div>

      <div className={styles.metaRow}>

        <div>
          <div className={styles.metaLabel}>RECEIVED FROM</div>
          <div className={styles.clientName}>{customer.name}</div>
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

        <div style={{ textAlign: "right" }} className={styles.receiptInfos}>
          <div>
            <span className={styles.metaKey}>RECEIPT # </span>
            <span className={styles.metaValue}>{receipt.number}</span>
          </div>
          <div>
            <span className={styles.metaKey}>Issue Date </span>
            <span className={styles.metaValue}>{receipt.date}</span>
          </div>
        </div>

      </div>

      <div className={styles.body}>
        <ItemsTable receipt={receipt} receiptBrandSettings={receiptBrandSettings} />
        <ReceiptPaymentSummary receipt={receipt} receiptBrandSettings={receiptBrandSettings} />
      </div>

      {(receiptBrandSettings.accountBank || receiptBrandSettings.phone || receiptBrandSettings.email || receiptBrandSettings.footer) && (

        <div className={styles.footer}>

          {receiptBrandSettings.accountBank && (
            <div className={styles.footerLeft}>
              <strong style={{ fontWeight: 900, color: "var(--brand-primary-dark)" }}>Payment Details</strong>
              <div className={styles.footerBody}>
                {receiptBrandSettings.name && (
                  <div>Received By: {receiptBrandSettings.name}</div>
                )}
                {receiptBrandSettings.accountBank && (
                  <div>Bank Name: {receiptBrandSettings.accountBank}</div>
                )}
                {receiptBrandSettings.accountNumber && (
                  <div>Account Number: {receiptBrandSettings.accountNumber}</div>
                )}
              </div>
            </div>
          )}

          {(receiptBrandSettings.phone || receiptBrandSettings.email || receiptBrandSettings.footer) && (
            <div className={styles.footRight}>
              <strong style={{ fontWeight: 900, color: "var(--brand-primary-dark)" }}>Notes</strong>
              <div className={styles.footerBody}>
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
                {receiptBrandSettings.footer && (
                  <div className={styles.footerNote}>{receiptBrandSettings.footer}</div>
                )}
              </div>
            </div>
          )}

        </div>

      )}

    </div>

  )

}