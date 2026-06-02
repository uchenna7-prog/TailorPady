import styles from "../styles/Template18.module.css"
import { getDueDate, calcTax } from "../utils/invoiceUtils"
import { formatMoney } from "../../../utils/moneyUtils"
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from "../components/icons/icons"


export function InvoiceTemplate18({ invoice, customer, invoiceBrandSettings }) {
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

  const discountLabel = discountType === 'percent' ? `Discount (${discountValue}%)` : 'Discount'
  const hasExtras     = shippingFee > 0 || discountAmount > 0 || (useTax && taxAmount > 0)
  const terms         = invoiceBrandSettings.paymentTerms || []

  return (
    <div className={styles.template}>

      <div className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          {(invoiceBrandSettings.name || invoiceBrandSettings.ownerName || 'Your Business').toUpperCase()}
        </div>
        <div className={styles.sidebarBottom}>Invoice</div>
      </div>

      <div className={styles.main}>

        <div className={styles.topSection}>
          <div className={styles.billTo}>
            <div className={styles.billToLabel}>Bill To</div>
            <div className={styles.billToName}>{customer.name}</div>
            {customer.phone && (
              <div className={`${styles.billToDetail} ${styles.noWrap}`}>
                <span className={styles.icon}><PhoneIcon /></span>
                {customer.phone}
              </div>
            )}
            {customer.address && (
              <div className={styles.billToDetail}>
                <span className={styles.icon}><LocationIcon /></span>
                {customer.address}
              </div>
            )}
            {customer.email && (
              <div className={styles.billToDetail}>
                <span className={styles.icon}><EmailIcon /></span>
                {customer.email}
              </div>
            )}
          </div>

          <div className={styles.metaBlock}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Date:</span>
              <span className={styles.metaVal}>{invoice.date}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Due Date:</span>
              <span className={styles.metaVal}>{dueDate}</span>
            </div>
            <div className={styles.metaInvoiceRow}>
              <span className={styles.metaInvoiceKey}>Invoice No:</span>
              <span className={styles.metaInvoiceVal}>{invoice.number}</span>
            </div>
          </div>
        </div>

        {invoice.orderDesc && (
          <div className={styles.orderDescRow}>
            <span className={styles.orderDescLabel}>Order:</span>
            <span className={styles.orderDescVal}>{invoice.orderDesc}</span>
          </div>
        )}

        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHead}>
              <th className={styles.colDesc}>Description</th>
              <th className={styles.colPrice}>Price</th>
              <th className={styles.colQty}>Qty</th>
              <th className={styles.colTotal}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, i) => {
              const qty        = item.qty ?? 1
              const unitPrice  = parseFloat(item.price) || 0
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

        <div className={styles.totalsSection}>
          {hasExtras && (
            <>
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey}>Subtotal</span>
                <span className={styles.totalsVal}>{formatMoney(currency, subtotal)}</span>
              </div>
              {shippingFee > 0 && (
                <div className={styles.totalsRow}>
                  <span className={styles.totalsKey}>Shipping &amp; Delivery</span>
                  <span className={styles.totalsVal}>{formatMoney(currency, shippingFee)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className={styles.totalsRow}>
                  <span className={`${styles.totalsKey} ${styles.totalsKeyDiscount}`}>{discountLabel}</span>
                  <span className={`${styles.totalsVal} ${styles.totalsValDiscount}`}>−{formatMoney(currency, discountAmount)}</span>
                </div>
              )}
              {useTax && taxAmount > 0 && (
                <div className={styles.totalsRow}>
                  <span className={styles.totalsKey}>VAT ({taxRate}%)</span>
                  <span className={styles.totalsVal}>{formatMoney(currency, taxAmount)}</span>
                </div>
              )}
            </>
          )}
          <div className={styles.orderTotalRow}>
            <span className={styles.totalsKeyFinal}>Order Total</span>
            <span className={styles.totalsValFinal}>{formatMoney(currency, grandTotal)}</span>
          </div>
        </div>

        <div className={styles.bottomSection}>
          {(invoiceBrandSettings.accountBank || invoiceBrandSettings.name || invoiceBrandSettings.ownerName) && (
            <div>
              <div className={styles.payableLabel}>Payable To</div>
              <div className={styles.payableName}>{invoiceBrandSettings.name || invoiceBrandSettings.ownerName}</div>

              {invoiceBrandSettings.accountBank && (
                <div className={styles.payableDetail}>Bank: {invoiceBrandSettings.accountBank}</div>
              )}
              {invoiceBrandSettings.accountNumber && (
                <div className={styles.payableDetail}>Account Number: {invoiceBrandSettings.accountNumber}</div>
              )}

              {invoiceBrandSettings.accountName && (
                <div className={styles.payableDetail}>Account Name: {invoiceBrandSettings.accountName}</div>
              )}
              {invoiceBrandSettings.phone && (
                <div className={`${styles.payableDetail} ${styles.noWrap}`}>
                  <span className={styles.icon}><PhoneIcon /></span>
                  {invoiceBrandSettings.phone}
                </div>
              )}
              {invoiceBrandSettings.email && (
                <div className={styles.payableDetail}>
                  <span className={styles.icon}><EmailIcon /></span>
                  {invoiceBrandSettings.email}
                </div>
              )}
              {invoiceBrandSettings.website && (
                <div className={styles.payableDetail}>
                  <span className={styles.icon}><WebsiteIcon /></span>
                  {invoiceBrandSettings.website}
                </div>
              )}
              {invoiceBrandSettings.address && (
                <div className={styles.payableDetail}>
                  <span className={styles.icon}><LocationIcon /></span>
                  {invoiceBrandSettings.address}
                </div>
              )}
            </div>
          )}

          {terms.length > 0 && (
            <div className={styles.termsBlock}>
              <div className={styles.termsLabel}>Notes</div>
              {terms.map((term, i) => (
                <div key={i} className={styles.termItem}>
                  <span className={styles.termBullet}>◆</span>
                  <span>{term}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {invoiceBrandSettings.footer || 'Thank you for your business.'}
        </div>

      </div>
    </div>
  )
}