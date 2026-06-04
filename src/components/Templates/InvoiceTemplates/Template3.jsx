
import styles from "../styles/Template3.module.css"
import { getDueDate, calcTax } from "../utils/invoiceUtils"
import { formatMoney } from "../../../utils/moneyUtils"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from "../components/icons/icons"


export function InvoiceTemplate3({ invoice, customer, invoiceBrandSettings }) {

  const dueDate = getDueDate(invoice, invoiceBrandSettings.dueDays)
  const { currency, showTax, invoiceTaxRate: invoiceBrandSettingsTaxRate } = invoiceBrandSettings

  const subtotal = invoice.items?.length > 0
    ? invoice.items.reduce((sum, item) => sum + ((item.qty ?? 1) * (parseFloat(item.price) || 0)), 0)
    : 0

  const shippingFee    = parseFloat(invoice.shippingFee)   || 0
  const discountAmount = parseFloat(invoice.discountAmount) || 0
  const discountType   = invoice.discountType               || null
  const discountValue  = parseFloat(invoice.discountValue)  || 0
  const useTax         = invoice.taxRate != null ? invoice.taxRate > 0 : (showTax && invoiceBrandSettingsTaxRate > 0)
  const taxRate        = invoice.taxRate != null ? invoice.taxRate : invoiceBrandSettingsTaxRate
  const taxAmount      = parseFloat(invoice.taxAmount) || calcTax(subtotal, taxRate, useTax)
  const grandTotal     = invoice.totalAmount != null
    ? parseFloat(invoice.totalAmount)
    : subtotal + shippingFee - discountAmount + taxAmount

  const discountLabel = discountType === "percent" ? `Discount (${discountValue}%)` : "Discount"
  const paymentTerms  = invoiceBrandSettings.paymentTerms

  return (
    <div className={styles.template}>

      <div className={styles.sidebar}>
        <div className={styles.sidebarTitle} style={{ color: "var(--brand-primary-dark)" }}>INVOICE</div>
      </div>

      <div className={styles.main}>

        <div className={styles.topSection}>

          <div className={styles.headerRow}>
           
           <div className={styles.logoBlock}>
            <LogoOrName invoiceBrandSettings={invoiceBrandSettings} />
            <div className={styles.brandTextBlock}>
              <div className={styles.brandName} style={{ color: "var(--brand-primary-dark)" }}>
                {invoiceBrandSettings.name || invoiceBrandSettings.ownerName}
              </div>
              {invoiceBrandSettings.tagline && (
                <div className={styles.brandTagline}>{invoiceBrandSettings.tagline}</div>
              )}
            </div>
          </div>

            <div className={styles.metaBlock}>
              <div className={styles.invoiceMetaLine}>
                <span className={styles.metaKey}>Invoice #:</span>
                <span className={styles.metaVal}>{invoice.number}</span>
              </div>
              <div className={styles.invoiceMetaLine}>
                <span className={styles.metaKey}>Date:</span>
                <span className={styles.metaVal}>{invoice.date}</span>
              </div>
            </div>
          </div>

          <div className={styles.clientRow}>
            <strong style={{ color: "var(--brand-primary-dark)" }}>BILL TO</strong>
            <div className={styles.clientBlock}>
              <div className={styles.clientName}>{customer.name}</div>
              <div className={styles.clientDetail}>
                {customer.phone && (
                  <div className={styles.iconRow}>
                    <span className={styles.icon}><PhoneIcon /></span>
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className={styles.iconRow}>
                    <span className={styles.icon}><LocationIcon /></span>
                    <span>{customer.address}</span>
                  </div>
                )}
                {customer.email && (
                  <div className={styles.iconRow}>
                    <span className={styles.icon}><EmailIcon /></span>
                    <span>{customer.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {invoice.orderDesc && (
          <div className={styles.orderDescriptionRow}>
            <strong style={{ color: "#1a1a1a" }}>Order: </strong>{invoice.orderDesc}
          </div>
        )}

        <table className={styles.tableSection}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.thDesc}>Description</th>
              <th className={styles.thQty}>Qty</th>
              <th className={styles.thRate}>Unit Price</th>
              <th className={styles.thTotal}>Total</th>
            </tr>
          </thead>

          <tbody className={styles.tableBody}>
            {invoice.items?.map((item, i) => {
              const qty        = item.qty ?? 1
              const unitPrice  = parseFloat(item.price) || 0
              const lineAmount = qty * unitPrice
              return (
                <tr key={i} className={styles.tableRow}>
                  <td className={styles.tdItemName}>{item.name}</td>
                  <td className={styles.tdQty}>{qty}</td>
                  <td className={styles.tdRate}>{formatMoney(currency, unitPrice)}</td>
                  <td className={styles.tdTotal}>{formatMoney(currency, lineAmount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className={styles.totalsSection}>
          <div className={styles.totalsRow}>
            <span className={styles.totalsKey}>Subtotal</span>
            <span className={styles.totalsVal}>{formatMoney(currency, subtotal)}</span>
          </div>

          {shippingFee > 0 && (
            <div className={styles.totalsRow}>
              <span className={styles.totalsKey}>Shipping</span>
              <span className={styles.totalsVal}>{formatMoney(currency, shippingFee)}</span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className={styles.totalsRow}>
              <span className={styles.totalsKey}>{discountLabel}</span>
              <span className={`${styles.totalsVal} ${styles.discountVal}`}>-{formatMoney(currency, discountAmount)}</span>
            </div>
          )}

          {useTax && taxAmount > 0 && (
            <div className={styles.totalsRow}>
              <span className={styles.totalsKey}>Tax ({taxRate}%)</span>
              <span className={styles.totalsVal}>{formatMoney(currency, taxAmount)}</span>
            </div>
          )}

          <div className={styles.grandTotalRow}>
            <span className={styles.grandTotalKey}>Total</span>
            <span className={styles.grandTotalVal}>{formatMoney(currency, grandTotal)}</span>
          </div>
        </div>

        {dueDate && (
          <div className={styles.dueDateRow}>
            {invoiceBrandSettings.dueDays
              ? `Due ${invoiceBrandSettings.dueDays} days from invoice date`
              : "Due date"
            }
            <br />
            {dueDate}
          </div>
        )}

        {paymentTerms?.length > 0 && (
          <div className={styles.termsSection}>
            <div className={styles.termsSectionLabel}>Notes</div>
            <ul className={styles.termsList}>
              {paymentTerms.map((term, i) => (
                <li key={i} className={styles.termsItem}>{term}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.footer}>

          {invoiceBrandSettings.accountBank && (
            <div className={styles.footerLeft}>
              <div className={styles.footerPayLabel}>Payment Information</div>
              {invoiceBrandSettings.accountBank   && <span>Bank: {invoiceBrandSettings.accountBank}<br /></span>}
               {invoiceBrandSettings.accountNumber && <span>Account No: {invoiceBrandSettings.accountNumber}<br/></span>}
              {invoiceBrandSettings.accountName   && <span>Account Name: {invoiceBrandSettings.accountName}<br /></span>}
             
            </div>
          )}

          <div className={styles.footerRight}>
            {(invoiceBrandSettings.name || invoiceBrandSettings.ownerName) && (
              <div className={styles.footerBrand}>
                {invoiceBrandSettings.name || invoiceBrandSettings.ownerName}
              </div>
            )}
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
            {invoiceBrandSettings.website && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><WebsiteIcon /></span>
                <span>{invoiceBrandSettings.website}</span>
              </div>
            )}
            {invoiceBrandSettings.address && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><LocationIcon /></span>
                <span>{invoiceBrandSettings.address}</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}