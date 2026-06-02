import styles from "../styles/Template2.module.css"
import { getDueDate } from "../utils/invoiceUtils"
import { ItemsTable } from "../components/InvoiceItemsTable/InvoiceItemsTable"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"
import { PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/icons"


export function InvoiceTemplate2({ invoice, customer, invoiceBrandSettings }) {

  const dueDate = getDueDate(invoice, invoiceBrandSettings.dueDays)
  const hasBank = !!invoiceBrandSettings.accountBank

  return (
    <div className={styles.template}>

      <div className={styles.header}>
        <div>
          <div className={styles.title}>INVOICE</div>
          <div className={styles.invoiceNumber}>{invoice.number}</div>
        </div>
        <div className={styles.logoBox}>
          <LogoOrName invoiceBrandSettings={invoiceBrandSettings} darkBg={false} />
        </div>
      </div>

      <div className={styles.dateMeta}>
        <div className={styles.dateMetaItem}>
          <span className={styles.dateMetaLabel}>Date</span>
          <span className={styles.dateMetaValue}>{invoice.date}</span>
        </div>
        {dueDate && (
          <div className={styles.dateMetaItem}>
            <span className={styles.dateMetaLabel}>Due</span>
            <span className={styles.dateMetaValue}>{dueDate}</span>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        <div className={styles.gridBox}>
          <strong>BILL FROM</strong>
          <div className={styles.gridName}>{invoiceBrandSettings.name}</div>
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

        <div className={styles.gridBox}>
          <strong>BILL TO</strong>
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

      <div className={styles.footerCenteredText}>
        {invoiceBrandSettings.footer || "Thank you!"}
      </div>

    </div>
  )
}
