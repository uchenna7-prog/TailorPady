import styles from "../styles/Template16.module.css"
import { getDueDate, calcTax } from "../utils/invoiceUtils"
import { formatMoney } from "../../../utils/moneyUtils"
import {
  PhoneIcon,
  EmailIcon,
  LocationIcon,
  WebsiteIcon,
} from "../components/icons/icons"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"


export function InvoiceTemplate16({ invoice, customer, invoiceBrandSettings }) {
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
  const paymentTerms  = invoiceBrandSettings.paymentTerms

  const hasContact = invoiceBrandSettings.phone || invoiceBrandSettings.email || invoiceBrandSettings.website || invoiceBrandSettings.address

  return (
    <div className={styles.template}>

      <div className={styles.topBar} />

      <div className={styles.content}>

        <div className={styles.headerRow}>
          <div className={styles.logoBlock}>
            <LogoOrName invoiceBrandSettings={invoiceBrandSettings} darkBg={false} />
            <div>
              <div className={styles.brandName}>
                {invoiceBrandSettings.name || invoiceBrandSettings.ownerName}
              </div>
              {invoiceBrandSettings.tagline && (
                <div className={styles.brandTagline}>{invoiceBrandSettings.tagline}</div>
              )}
            </div>
          </div>
          <div className={styles.invoiceTitle}>INVOICE</div>
        </div>

        <div className={styles.dividerLine} />

        <div className={styles.topInfo}>
          <div className={styles.billBlock}>
            <div className={styles.billName}>{customer.name}</div>
            <div className={styles.billDetails}>
              {customer.phone && (
                <span className={styles.billDetailLine}>
                  <span className={styles.billDetailIcon}><PhoneIcon /></span>
                  {customer.phone}
                </span>
              )}
              {customer.email && (
                <span className={styles.billDetailLine}>
                  <span className={styles.billDetailIcon}><EmailIcon /></span>
                  {customer.email}
                </span>
              )}
              {customer.address && (
                <span className={styles.billDetailLine}>
                  <span className={styles.billDetailIconAddress}><LocationIcon /></span>
                  {customer.address}
                </span>
              )}
            </div>
          </div>
          <div className={styles.invoiceMeta}>
            <div className={styles.invoiceNumLabel}>Invoice#</div>
            <div className={styles.invoiceNum}>{invoice.number}</div>
            {invoice.date && (
              <div className={styles.metaLine}>
                <span className={styles.metaKey}>Date:</span>
                <span className={styles.metaVal}>{invoice.date}</span>
              </div>
            )}
            {dueDate && (
              <div className={styles.metaLine}>
                <span className={styles.metaKey}>Due:</span>
                <span className={styles.metaVal}>{dueDate}</span>
              </div>
            )}
          </div>
        </div>

        {invoice.orderDesc && (
          <div className={styles.orderDescRow}>
            <span className={styles.orderLabel}>ORDER:</span>
            <span className={styles.orderDesc}>{invoice.orderDesc}</span>
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.colDesc}>Item Description</th>
                <th className={styles.colPrice}>Unit Price</th>
                <th className={styles.colQty}>Qty</th>
                <th className={styles.colTotal}>Amount</th>
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
        </div>

        <div className={styles.bottomArea}>
          <div className={styles.paymentBlock}>
            {invoiceBrandSettings.accountBank && (
              <>
                <div className={styles.paymentHeading}>Payment Information</div>
                <div className={styles.paymentDetails}>
                  {invoiceBrandSettings.accountNumber && <span>Account: {invoiceBrandSettings.accountNumber}<br /></span>}
                  {invoiceBrandSettings.accountBank   && <span>Bank: {invoiceBrandSettings.accountBank}<br /></span>}
                  {invoiceBrandSettings.accountName   && <span>Account Name: {invoiceBrandSettings.accountName}<br /></span>}
                </div>
              </>
            )}
          </div>

          <div className={styles.totalsBlock}>
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
                <span className={`${styles.totalsKey} ${styles.discountKey}`}>{discountLabel}</span>
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
        </div>

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

        {hasContact && (
          <div className={styles.contactStrip}>
            {invoiceBrandSettings.phone && (
              <div className={styles.contactStripItem}>
                <span className={styles.contactStripLabel}>Phone</span>
                <span className={styles.contactStripText}>{invoiceBrandSettings.phone}</span>
              </div>
            )}
            {invoiceBrandSettings.email && (
              <div className={styles.contactStripItem}>
                <span className={styles.contactStripLabel}>Email</span>
                <span className={styles.contactStripText}>{invoiceBrandSettings.email}</span>
              </div>
            )}
            {invoiceBrandSettings.website && (
              <div className={styles.contactStripItem}>
                <span className={styles.contactStripLabel}>Website</span>
                <span className={styles.contactStripText}>{invoiceBrandSettings.website}</span>
              </div>
            )}
            {invoiceBrandSettings.address && (
              <div className={styles.contactStripItem}>
                <span className={styles.contactStripLabel}>Address</span>
                <span className={styles.contactStripText}>{invoiceBrandSettings.address}</span>
              </div>
            )}
          </div>
        )}

      </div>

      <div className={styles.footerBar}>
        <svg viewBox="0 0 1000 36" preserveAspectRatio="none">
          <polygon points="0,36 0,0 520,0 480,36" fill="var(--brand-muted)" />
          <polygon points="480,36 520,0 1000,0 1000,36" fill="var(--brand-primary)" />
        </svg>
      </div>

    </div>
  )
}
