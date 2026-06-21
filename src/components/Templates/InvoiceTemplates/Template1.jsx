import styles from "../styles/Template1.module.css"
import { ItemsTable } from "../components/InvoiceItemsTable/InvoiceItemsTable"
import { getDueDate } from "../utils/invoiceUtils"
import { PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/icons"


export function InvoiceTemplate1({ invoice, customer, invoiceBrandSettings }) {

  const dueDate   = getDueDate(invoice, invoiceBrandSettings.dueDays)
  const lineColor = invoiceBrandSettings.colour || "#0A0A0A"

  return (

    <div className={styles.template}>

      <div className={styles.header}>
        <div className={styles.brandName}>{invoiceBrandSettings.name || "Your Brand"}</div>
        {invoiceBrandSettings.tagline && <div className={styles.tagline}>{invoiceBrandSettings.tagline}</div>}

        <div className={styles.titleRow}>
          <div className={styles.titleLine} style={{ background: lineColor }} />
          <div className={styles.title}>INVOICE</div>
          <div className={styles.titleLine} style={{ background: lineColor }} />
        </div>
      </div>

      <div className={styles.metaRow}>

        <div>
          <div className={styles.metaLabel}>BILL TO</div>
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

        <div style={{ textAlign: "right" }} className={styles.invoiceInfos}>
          <div>
            <span className={styles.metaKey}>INVOICE # </span>
            <span className={styles.metaValue}>{invoice.number}</span>
          </div>
          <div>
            <span className={styles.metaKey}>Issue Date </span>
            <span className={styles.metaValue}>{invoice.date}</span>
          </div>
          <div>
            <span className={styles.metaKey}>Due Date </span>
            <span className={styles.metaValue}>{dueDate}</span>
          </div>
        </div>

      </div>

      <div className={styles.body}>
        <ItemsTable invoice={invoice} invoiceBrandSettings={invoiceBrandSettings} />
      </div>

      {(invoiceBrandSettings.accountBank || invoiceBrandSettings.phone || invoiceBrandSettings.email || invoiceBrandSettings.footer) && (

        <div className={styles.footer}>

          {invoiceBrandSettings.accountBank && (
            <div className={styles.footerLeft}>
              <strong style={{ fontWeight: 900, color: "var(--brand-primary-dark)" }}>Payment Information</strong>
              <div className={styles.footerBody}>
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
          )}

          {(invoiceBrandSettings.phone || invoiceBrandSettings.email || invoiceBrandSettings.footer) && (
            <div className={styles.footRight}>
              <strong style={{ fontWeight: 900, color: "var(--brand-primary-dark)" }}>Contact</strong>
              <div className={styles.footerBody}>
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
                {invoiceBrandSettings.footer && (
                  <div className={styles.footerNote}>{invoiceBrandSettings.footer}</div>
                )}
              </div>
            </div>
          )}

        </div>

      )}

    </div>

  )

}
