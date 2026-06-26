
import styles from "../styles/Template11.module.css"
import { getDueDate, calcTax } from "../utils/invoiceUtils"
import { formatMoney } from "../../../utils/moneyUtils"
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon, UserIcon, HashIcon } from "../components/icons/icons"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"


export function InvoiceTemplate11({ invoice, customer, invoiceBrandSettings }) {
  const dueDate = getDueDate(invoice, invoiceBrandSettings.dueDays)
  const accentColor = invoiceBrandSettings.colour || '#0A0A0A'
  const { currency, showTax, invoiceTaxRate: invoiceBrandSettingsTaxRate } = invoiceBrandSettings

  const subtotal = invoice.items?.length > 0
    ? invoice.items.reduce((sum, item) => sum + ((item.qty ?? 1) * (parseFloat(item.price) || 0)), 0)
    : 0

  const shippingFee = parseFloat(invoice.shippingFee) || 0
  const discountAmount = parseFloat(invoice.discountAmount) || 0
  const discountType = invoice.discountType || null
  const discountValue = parseFloat(invoice.discountValue) || 0
  const useTax = invoice.taxRate != null ? invoice.taxRate > 0 : (showTax && invoiceBrandSettingsTaxRate > 0)
  const taxRate = invoice.taxRate != null ? invoice.taxRate : invoiceBrandSettingsTaxRate
  const taxAmount = parseFloat(invoice.taxAmount) || calcTax(subtotal, taxRate, useTax)
  const grandTotal = invoice.totalAmount != null
    ? parseFloat(invoice.totalAmount)
    : subtotal + shippingFee - discountAmount + taxAmount

  const discountLabel = discountType === 'percent'
    ? `Discount (${discountValue}%)`
    : 'Discount'

  return (
    <div className={styles.template}>

      <div className={styles.header}>
        <div className={styles.logoArea}>
          
          <LogoOrName invoiceBrandSettings={invoiceBrandSettings} darkBg={true} />

          <div>
            <div className={styles.companyName}>{(invoiceBrandSettings.name || invoiceBrandSettings.ownerName || 'YOUR BUSINESS').toUpperCase()}</div>
            {invoiceBrandSettings.tagline && <div className={styles.tagline}>{invoiceBrandSettings.tagline}</div>}
          </div>
        </div>

        <div className={styles.headerRight}>
          {invoiceBrandSettings.phone && (
            <div className={styles.iconRow}>
              <span className={styles.icon}><PhoneIcon /></span>
              <span className={styles.noWrap}>{invoiceBrandSettings.phone}</span>
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
        </div>
      </div>

      <div className={styles.invoiceRow}>
        <div className={styles.invoiceLeft}>
          <span className={styles.invoiceWord}>INVOICE </span>
          <span className={styles.invoiceNum}>#{invoice.number}</span>
        </div>
        <div className={styles.invoiceRight}>
          <div><span className={styles.label}>ISSUE DATE </span>{invoice.date}</div>
          <div><span className={styles.label}>DUE DATE </span>{dueDate}</div>
        </div>
      </div>

      <div className={styles.infoRow}>
        {invoiceBrandSettings.accountBank && (
          <div>
            <div className={styles.infoLabel}>PAYMENT</div>
            <strong>{invoiceBrandSettings.accountBank}</strong><br />
            {invoiceBrandSettings.accountName && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><UserIcon /></span>
                <span>{invoiceBrandSettings.accountName}</span>
              </div>
            )}
            {invoiceBrandSettings.accountNumber && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><HashIcon /></span>
                <span className={styles.noWrap}>{invoiceBrandSettings.accountNumber}</span>
              </div>
            )}
          </div>
        )}
        <div>
          <div className={styles.infoLabel}>BILL FROM</div>
          <strong>{invoiceBrandSettings.name || invoiceBrandSettings.ownerName}</strong><br />
          {invoiceBrandSettings.phone && (
            <div className={styles.iconRow}>
              <span className={styles.icon}><PhoneIcon /></span>
              <span className={styles.noWrap}>{invoiceBrandSettings.phone}</span>
            </div>
          )}
          {invoiceBrandSettings.address && (
            <div className={styles.iconRow}>
              <span className={styles.icon}><LocationIcon /></span>
              <span>{invoiceBrandSettings.address}</span>
            </div>
          )}
        </div>
        <div>
          <div className={`${styles.infoLabel} ${styles.infoLabelRight}`}>BILL TO</div>
          <strong>{customer.name}</strong><br />
          {customer.phone && (
            <div className={styles.iconRow}>
              <span className={styles.icon}><PhoneIcon /></span>
              <span className={styles.noWrap}>{customer.phone}</span>
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

      <div className={styles.tableWrapper}>
        <div className={styles.orderDescriptionRow}>
          <div className={styles.orderText}>ORDER:</div>
          <div className={styles.orderDescLabel}>{invoice.orderDesc || 'Garment Order'}</div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHead}>
              <th className={styles.colDesc}>Item Description</th>
              <th className={styles.colPrice}>Unit Price</th>
              <th className={styles.colQty}>Qty</th>
              <th className={styles.colTotal}>Total</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {invoice.items?.map((item, i) => {
              const qty = item.qty ?? 1
              const unitPrice = parseFloat(item.price) || 0
              const lineAmount = qty * unitPrice
              return (
                <tr key={i} className={styles.tableRow}>
                  <td className={styles.colDesc}>{item.name}</td>
                  <td className={styles.colPrice}>{formatMoney(currency, unitPrice)}</td>
                  <td className={styles.colQty}>{qty}</td>
                  <td className={styles.colTotal}>{formatMoney(currency, lineAmount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className={styles.summaryBlock}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Subtotal</span>
            <span className={styles.summaryVal}>{formatMoney(currency, subtotal)}</span>
          </div>

          {shippingFee > 0 && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Shipping &amp; Delivery</span>
              <span className={styles.summaryVal}>{formatMoney(currency, shippingFee)}</span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className={styles.summaryRow}>
              <span className={`${styles.summaryKey} ${styles.summaryKeyDiscount}`}>{discountLabel}</span>
              <span className={`${styles.summaryVal} ${styles.summaryValDiscount}`}>−{formatMoney(currency, discountAmount)}</span>
            </div>
          )}

          {useTax && taxAmount > 0 && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>VAT ({taxRate}%)</span>
              <span className={styles.summaryVal}>{formatMoney(currency, taxAmount)}</span>
            </div>
          )}
        </div>

        <div className={styles.totalBar} style={{ background: accentColor }}>
          <span>TOTAL</span>
          <span className={styles.summaryTotalVal}>{formatMoney(currency, grandTotal)}</span>
        </div>
      </div>

      <div className={styles.thankYou}>{invoiceBrandSettings.footer || 'THANK YOU FOR YOUR BUSINESS'}</div>
    </div>
  )
}
