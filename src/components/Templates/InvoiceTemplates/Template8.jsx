
import styles from "../styles/Template8.module.css"
import { getDueDate, calcTax } from "../utils/invoiceUtils"
import { formatMoney } from "../../../utils/moneyUtils"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from "../components/icons/icons"


export function InvoiceTemplate8({ invoice, customer, invoiceBrandSettings }) {
  
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
  const brandName     = invoiceBrandSettings.name || invoiceBrandSettings.ownerName

  return (
    <div className={styles.template}>

      <div className={styles.topSection}>
        <div className={styles.heroTitle}>INVOICE</div>
        <div className={styles.logoBlock}>
          <LogoOrName invoiceBrandSettings={invoiceBrandSettings} />
        </div>
      </div>

      <div className={styles.metaSection}>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Invoice Number:</span>
          <span className={styles.metaVal}>{invoice.number}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Date:</span>
          <span className={styles.metaVal}>{invoice.date}</span>
        </div>
        {dueDate && (
          <div className={styles.metaRow}>
            <span className={styles.metaKey}>Due Date:</span>
            <span className={styles.metaVal}>{dueDate}</span>
          </div>
        )}
        {invoice.orderDesc && (
          <div className={styles.metaRow}>
            <span className={styles.metaKey}>Order:</span>
            <span className={styles.metaVal}>{invoice.orderDesc}</span>
          </div>
        )}
      </div>

      <div className={styles.billingSection}>
        <div className={styles.billToBox}>
          <div className={styles.billToLabel}>Bill To</div>
          <div className={styles.billToDetail}>

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
        </div>

        <div className={styles.payableToBlock}>
          <div className={styles.payableToLabel}>Payable To</div>
          <div className={styles.payableToDetail}>
            {brandName && <span  className={styles.brandName}>{brandName}<br /></span>}

            {invoiceBrandSettings.phone && (
              <div className={styles.payableIconRow}>
                <span className={styles.payableIcon}><PhoneIcon /></span>
                {invoiceBrandSettings.phone}
              </div>
            )}
            {invoiceBrandSettings.email && (
              <div className={styles.payableIconRow}>
                <span className={styles.payableIcon}><EmailIcon /></span>
                {invoiceBrandSettings.email}
              </div>
            )}

            {invoiceBrandSettings.address && (
              <div className={styles.payableIconRow}>
                <span className={styles.payableIcon}><LocationIcon /></span>
                {invoiceBrandSettings.address}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <table className={styles.tableGrid}>
          <thead>
            <tr>
              <th className={styles.colNo}>No.</th>
              <th className={styles.colDesc}>Item Description</th>
              <th className={styles.colQty}>Qty</th>
              <th className={styles.colPrice}>Price ({currency })</th>
              <th className={styles.colTotal}>Total ({currency })</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, i) => {
              const qty        = item.qty ?? 1
              const unitPrice  = parseFloat(item.price) || 0
              const lineAmount = qty * unitPrice
              return (
                <tr key={i}>
                  <td className={styles.colNo}>{i + 1}.</td>
                  <td className={styles.colDesc}>{item.name}</td>
                  <td className={styles.colQty}>{qty}</td>
                  <td className={styles.colPrice}>{formatMoney(currency, unitPrice)}</td>
                  <td className={styles.colTotal}>{formatMoney(currency, lineAmount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.totalsSection}>
        <div className={styles.totalsRow}>
          <span className={styles.totalsKey}>subtotal:</span>
          <span className={styles.totalsVal}>{formatMoney(currency, subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className={styles.totalsRow}>
            <span className={styles.totalsKey}>{discountLabel}:</span>
            <span className={`${styles.totalsVal} ${styles.discountVal}`}>-{formatMoney(currency, discountAmount)}</span>
          </div>
        )}

        {shippingFee > 0 && (
          <div className={styles.totalsRow}>
            <span className={styles.totalsKey}>shipping:</span>
            <span className={styles.totalsVal}>{formatMoney(currency, shippingFee)}</span>
          </div>
        )}

        {useTax && taxAmount > 0 && (
          <div className={styles.totalsRow}>
            <span className={styles.totalsKey}>Sales Tax ({taxRate}%):</span>
            <span className={styles.totalsVal}>{formatMoney(currency, taxAmount)}</span>
          </div>
        )}

        <div className={styles.grandTotalRow}>
          <span className={styles.grandTotalKey}>Total Amount:</span>
          <span className={styles.grandTotalVal}>{formatMoney(currency, grandTotal)}</span>
        </div>
      </div>

      <div className={styles.bottomSection}>
        {brandName && (
          <div className={styles.payeeName}>{brandName}</div>
        )}

        {invoiceBrandSettings.accountBank && (
          <>
            <div className={styles.bankRow}>
              <span className={styles.bankKey}>Bank:</span>
              <span className={styles.bankVal}>{invoiceBrandSettings.accountBank}</span>
            </div>
            {invoiceBrandSettings.accountNumber && (
              <div className={styles.bankRow}>
                <span className={styles.bankKey}>Account:</span>
                <span className={styles.bankVal}>{invoiceBrandSettings.accountNumber}</span>
              </div>
            )}
            {invoiceBrandSettings.accountName && (
              <div className={styles.bankRow}>
                <span className={styles.bankKey}>Acct Name:</span>
                <span className={styles.bankVal}>{invoiceBrandSettings.accountName}</span>
              </div>
            )}
          </>
        )}

        <div className={styles.thankYou}>
          {invoiceBrandSettings.footer || "Thank you for your purchase!"}
        </div>
      </div>

    </div>
  )
}