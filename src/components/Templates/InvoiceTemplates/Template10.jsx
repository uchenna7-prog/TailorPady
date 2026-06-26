
import styles from "../styles/Template10.module.css"
import { getDueDate } from "../utils/invoiceUtils"
import { ItemsTable } from "../components/InvoiceItemsTable/InvoiceItemsTable"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"
import { PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/icons"

export function InvoiceTemplate10({ invoice, customer, invoiceBrandSettings }) {

  const bannerBg = invoiceBrandSettings.colour || '#0A0A0A'
  const dueDate  = getDueDate(invoice, invoiceBrandSettings.dueDays)
  const hasBank  = !!invoiceBrandSettings.accountBank

  return (
    <div className={styles.template} style={{ padding: 0 }}>

      <div className={styles.customBanner} style={{ background: bannerBg }}>
        <div className={styles.customBannerLogo}>
          <LogoOrName invoiceBrandSettings={invoiceBrandSettings} darkBg={true} />
        </div>
        <div className={styles.customBannerRight}>
          <div className={styles.customBannerTitle}>INVOICE</div>
        </div>
      </div>

      <div className={styles.metaStrip}>
        <div className={styles.metaStripItem}>
          <span className={styles.metaStripKey}>Invoice# </span>
          <span className={styles.metaStripVal}>{invoice.number}</span>
        </div>
        <div className={styles.metaStripItem}>
          <span className={styles.metaStripKey}>Issued</span>
          <span className={styles.metaStripVal}>{invoice.date}</span>
        </div>
        <div className={styles.metaStripItem}>
          <span className={styles.metaStripKey}>Due</span>
          <span className={styles.metaStripVal}>{dueDate}</span>
        </div>
      </div>

      <div className={styles.body}>

        <div className={styles.metaRow} style={{ marginBottom: 16 }}>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>BILL FROM</div>
            <div className={styles.metaVal}>{invoiceBrandSettings.name}</div>
            {invoiceBrandSettings.phone && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><PhoneIcon /></span>
                <span>{invoiceBrandSettings.phone}</span>
              </div>
            )}
            {invoiceBrandSettings.email && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><EmailIcon /></span>
                <span>{invoiceBrandSettings.email}</span>
              </div>
            )}
            {invoiceBrandSettings.address && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><LocationIcon /></span>
                <span>{invoiceBrandSettings.address}</span>
              </div>
            )}
          </div>

          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>BILL TO</div>
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

        <ItemsTable invoice={invoice} invoiceBrandSettings={invoiceBrandSettings} />

        {hasBank && (
          <div className={styles.bottomRow}>
            <div className={styles.paymentInfo}>
              <div className={styles.paymentInfoLabel}>Payment Information</div>
              <div className={styles.paymentBody}>
                {invoiceBrandSettings.accountBank && (
                  <div>Bank: {invoiceBrandSettings.accountBank}</div>
                )}
                {invoiceBrandSettings.accountNumber && (
                  <div>Account Number: {invoiceBrandSettings.accountNumber}</div>
                )}
                {invoiceBrandSettings.accountName && (
                  <div>Account Name: {invoiceBrandSettings.accountName}</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <div className={styles.footer}>
        <div className={styles.footerText}>{invoiceBrandSettings.footer || 'Thank you for your patronage'}</div>
      </div>

    </div>
  )
}

