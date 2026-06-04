import styles from "../styles/Template7.module.css"
import { getDueDate, calcTax } from "../utils/invoiceUtils"
import { formatMoney } from "../../../utils/moneyUtils"
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from "../components/icons/icons"


export function InvoiceTemplate7({ invoice, customer, invoiceBrandSettings }) {
  const dueDate    = getDueDate(invoice, invoiceBrandSettings.dueDays)
  const { currency, showTax, invoiceTaxRate: invoiceBrandSettingsTaxRate } = invoiceBrandSettings

  const subtotal = invoice.items?.length > 0
    ? invoice.items.reduce((sum, item) => sum + ((item.qty ?? 1) * (parseFloat(item.price) || 0)), 0)
    : 0

  const shippingFee    = parseFloat(invoice.shippingFee)    || 0
  const discountAmount = parseFloat(invoice.discountAmount)  || 0
  const discountType   = invoice.discountType                || null
  const discountValue  = parseFloat(invoice.discountValue)   || 0
  const useTax         = invoice.taxRate != null ? invoice.taxRate > 0 : (showTax && invoiceBrandSettingsTaxRate > 0)
  const taxRate        = invoice.taxRate != null ? invoice.taxRate : invoiceBrandSettingsTaxRate
  const taxAmount      = parseFloat(invoice.taxAmount) || calcTax(subtotal, taxRate, useTax)
  const grandTotal     = invoice.totalAmount != null
    ? parseFloat(invoice.totalAmount)
    : subtotal + shippingFee - discountAmount + taxAmount

  const discountLabel = discountType === "percent" ? `Discount (${discountValue}%)` : "Discount"
  const hasExtras     = shippingFee > 0 || discountAmount > 0 || (useTax && taxAmount > 0)
  const brandName     = invoiceBrandSettings.name || invoiceBrandSettings.ownerName

  return (
    <div className={styles.template}>

      <div className={styles.topRow}>
        <div className={styles.titleBox}>
          <span className={styles.titleText}>Invoice</span>
        </div>
        <div className={styles.logoBox}>
          {invoiceBrandSettings.logo ? (
            <img src={invoiceBrandSettings.logo} alt="logo" className={styles.logoBoxImage} />
          ) : (
            <span className={styles.logoBoxText}>LOGO</span>
          )}
        </div>
      </div>

      <div className={styles.infoRow}>
        <div className={styles.infoBox}>
          <div className={styles.infoBoxLabel}>Issued to:</div>
          <div className={styles.infoBoxName}>{customer.name}</div>

          <div className={styles.infoBoxDetail}>

            {customer.phone && 
            <div>
              <span className={styles.infoBoxIcon}><PhoneIcon /></span>
              {customer.phone} 
            </div>
            }


            {customer.email  && 
            <div>
              <span className={styles.infoBoxIcon}><EmailIcon /></span>
              {customer.email } 
            </div>
            }


            {customer.address && 
            <div>
              <span className={styles.infoBoxIcon}><LocationIcon /></span>
              {customer.address} 
            </div>
            }


  
          </div>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoBoxMeta}>
            <span>Invoice No. {invoice.number}<br /></span>
            <span>Date: {invoice.date}</span>
            {dueDate        && <span><br />Due: {dueDate}</span>}
            {invoice.orderDesc && <span><br />Order: {invoice.orderDesc}</span>}
          </div>
        </div>
      </div>

      <div className={styles.tableBox}>
        <table>
              
          <thead className={styles.tableHeader}>
            <tr>

              <th className={styles.thDesc}>Description</th>
              <th className={styles.thPrice}>Unit Price</th>
              <th className={styles.thQty}>Qty</th>
              <th className={styles.thSub}>Subtotal</th>

            </tr>

          </thead>

          {invoice.items?.map((item, i) => {
            const qty = item.qty ?? 1
            const unitPrice  = parseFloat(item.price) || 0
            const lineAmount = qty * unitPrice
            return (
              <tr key={i} className={styles.tableRow}>
                <td className={styles.tdDesc}>{item.name}</td>
                <td className={styles.tdPrice}>{formatMoney(currency, unitPrice)}</td>
                <td className={styles.tdQty}>{qty}</td>
                <td className={styles.tdSub}>{formatMoney(currency, lineAmount)}</td>
              </tr>
            )
          })}

            </table>
        <div className={styles.totalsArea}>
          {hasExtras && (
            <>
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
            </>
          )}
          <div className={styles.grandTotalRow}>
            <span className={styles.grandTotalKey}>Total</span>
            <span className={styles.grandTotalVal}>{formatMoney(currency, grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <div className={styles.footerPayLabel}>Payment Information</div>
          <div className={styles.footerDetail}>
            {invoiceBrandSettings.accountBank   && <span>Bank: {invoiceBrandSettings.accountBank}</span>}<br />
             {invoiceBrandSettings.accountNumber && <span>Account Number: {invoiceBrandSettings.accountNumber}</span>}<br />
            {invoiceBrandSettings.accountName   && <span>Account Name: {invoiceBrandSettings.accountName}</span>}<br />
           
          </div>
        </div>

        <div className={styles.footerRight}>

          {(invoiceBrandSettings.name || invoiceBrandSettings.ownerName) && (
            <div className={styles.brandName}>
              {invoiceBrandSettings.name || invoiceBrandSettings.ownerName}
            </div>
          )}

          {invoiceBrandSettings.phone && (
            <div className={styles.footerContactRow}>
              <span className={styles.footerIcon}><PhoneIcon /></span>
              <span className={styles.footerContactText}>{invoiceBrandSettings.phone}</span>
            </div>
          )}
          {invoiceBrandSettings.email && (
            <div className={styles.footerContactRow}>
              <span className={styles.footerIcon}><EmailIcon /></span>
              <span className={styles.footerContactText}>{invoiceBrandSettings.email}</span>
            </div>
          )}

          {invoiceBrandSettings.website && (
            <div className={styles.footerContactRow}>
              <span className={styles.footerIcon}><WebsiteIcon /></span>
              <span className={styles.footerContactText}>{invoiceBrandSettings.website}</span>
            </div>
          )}

          {invoiceBrandSettings.address && (
            <div className={styles.footerContactRow}>
              <span className={styles.footerIcon}><LocationIcon /></span>
              <span className={styles.footerContactText}>{invoiceBrandSettings.address}</span>
            </div>
          )}
          

        </div>
      </div>

      {invoiceBrandSettings.footer && (
        <div className={styles.thankYou}>{invoiceBrandSettings.footer || "Thank You"}  </div>
      )}

    </div>
  )
}




