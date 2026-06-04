
import styles from "../styles/Template8.module.css"
import { ReceiptPaymentSummary } from "../components/ReceiptPaymentSummary/ReceiptPaymentSummary"
import { ItemsTable } from "../components/ReceiptItemsTable/ReceiptItemsTable"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"
import { calcTax } from "../utils/receiptUtils"
import { PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/icons"

export function ReceiptTemplate8({ receipt, customer, receiptBrandSettings }) {

  const bannerBg = receiptBrandSettings.colour || '#1C1814'

  return (

    <div className={styles.template} style={{ padding: 0 }}>

      <div className={styles.customBanner} style={{ background: bannerBg }}>

        <div className={styles.customBannerLogo}>
          <LogoOrName receiptBrandSettings={receiptBrandSettings} darkBg />
        </div>

        <div className={styles.customBannerRight}>
          <div className={styles.customBannerTitle}>RECEIPT</div>
        </div>

      </div>

      <div className={styles.metaStrip}>

        <div className={styles.metaStripItem}>
          <span className={styles.metaStripKey}># Receipt</span>
          <span className={styles.metaStripVal}>{receipt.number}</span>
        </div>

        <div className={styles.metaStripItem}>
          <span className={styles.metaStripKey}>Issued</span>
          <span className={styles.metaStripVal}>{receipt.date}</span>
        </div>
      </div>

      <div className={styles.body}>

        <div className={styles.metaRow} style={{ marginBottom: 16 }}>

          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>RECEIVED BY</div>
            <div className={styles.metaVal}>{receiptBrandSettings.name}</div>
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

          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>RECEIVED FROM</div>
            <div className={styles.metaVal}>{customer.name}</div>
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

        <ItemsTable receipt={receipt} receiptBrandSettings={receiptBrandSettings} />
        <ReceiptPaymentSummary receipt={receipt} receiptBrandSettings={receiptBrandSettings} />

        {receiptBrandSettings.accountBank && (
          <div className={styles.paymentRow}>
            <strong style={{ fontWeight: 900, color: "var(--brand-primary-dark)" }}>Payment Details</strong><br />
            <div>
              {receiptBrandSettings.name && (
                <div>Received By: {receiptBrandSettings.name}</div>
              )}
            </div>
          </div>
        )}

      </div>

      <div className={styles.footer}>
        <div className={styles.footerText}>{receiptBrandSettings.footer || 'Thank you for your patronage'}</div>
      </div>

    </div>
  )
}
