import styles from "../styles/Template14.module.css"
import { getDueDate, calcTax } from "../utils/invoiceUtils"
import { formatMoney } from "../../../utils/moneyUtils"
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from "../components/icons/icons"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"

export function InvoiceTemplate14({ invoice, customer, invoiceBrandSettings }) {
  
  const dueDate     = getDueDate(invoice, invoiceBrandSettings.dueDays)
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

  const discountLabel = discountType === 'percent' ? `Discount (${discountValue}%)` : 'Discount'

  const hasPaymentInfo = invoiceBrandSettings.accountBank
  const hasContact     = invoiceBrandSettings.phone || invoiceBrandSettings.email || invoiceBrandSettings.website || invoiceBrandSettings.address
  const hasFooter      = hasPaymentInfo || hasContact

  return (
    <div className={styles.template}>

      <div className={styles.logoBlock}>
        
          <LogoOrName invoiceBrandSettings={invoiceBrandSettings} darkBg={false} />
  
      </div>

      <div className={styles.invoiceTitle} >
        Invoice
      </div>

      <div className={styles.metaRow}>
        <div className={styles.billedBlock}>
          <div className={styles.billedLabel}>Billed To</div>
          <div className={styles.billedName}>{customer.name}</div>
          <div className={styles.billedDetails}>
            {customer.address && (
              <div className={styles.billedDetailLine}>
                <span className={styles.billedDetailIcon} >
                  <LocationIcon />
                </span>
                <span>{customer.address}</span>
              </div>
            )}
            {customer.phone && (
              <div className={styles.billedDetailLine}>
                <span className={styles.billedDetailIcon}>
                  <PhoneIcon />
                </span>
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className={styles.billedDetailLine}>
                <span className={styles.billedDetailIcon} >
                  <EmailIcon />
                </span>
                <span>{customer.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.invoiceNumBlock}>
          <div>Invoice #: <span className={styles.numValue} >{invoice.number}</span> </div>
          <div>Date: <span className={styles.numValue}>{invoice.date}</span></div>
          {dueDate && (
              <div>Due Date: <span className={styles.numValue}>{dueDate}</span></div>
          )}
        </div>
      </div>

      {invoice.orderDesc && (
        <div className={styles.orderDescRow} >
          <span className={styles.orderLabel}>Order:</span>
          <span className={styles.orderDesc}>{invoice.orderDesc}</span>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr
              className={styles.tableHeadRow}
              style={{ borderTopColor: "var(--brand-primary-dark)", borderBottomColor: "var(--brand-primary-dark)" }}
            >
              <th className={styles.thDesc}  style={{ color: "var(--brand-primary-dark)" }}>Description</th>
              <th className={styles.thQty}   style={{ color: "var(--brand-primary-dark)", borderLeftColor: "var(--brand-primary-dark)" }}>Qty</th>
              <th className={styles.thPrice} style={{ color: "var(--brand-primary-dark)", borderLeftColor: "var(--brand-primary-dark)" }}>Unit Price</th>
              <th className={styles.thTotal} style={{ color: "var(--brand-primary-dark)", borderLeftColor: "var(--brand-primary-dark)" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, i) => {
              const qty        = item.qty ?? 1
              const unitPrice  = parseFloat(item.price) || 0
              const lineAmount = qty * unitPrice

              return (
                <tr key={i} className={styles.tableRow}>
                  <td className={styles.tdDesc}>{item.name}</td>
                  <td className={styles.tdQty}  style={{ borderLeftColor: "var(--brand-primary-dark)" }}>{qty}</td>
                  <td className={styles.tdPrice} style={{ borderLeftColor: "var(--brand-primary-dark)" }}>{formatMoney(currency, unitPrice)}</td>
                  <td className={styles.tdTotal} style={{ borderLeftColor: "var(--brand-primary-dark)" }}>{formatMoney(currency, lineAmount)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className={styles.tableFooterRule} style={{ borderTopColor: "var(--brand-primary-dark)" }} />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={styles.totalsSection}>
        <div className={styles.totalsBlock}>
          <div className={styles.totalsRow}>
            <span className={styles.tLabel} style={{ color: "var(--brand-primary-dark)" }}>Subtotal</span>
            <span className={styles.tVal}>{formatMoney(currency, subtotal)}</span>
          </div>

          {shippingFee > 0 && (
            <div className={styles.totalsRow}>
              <span className={styles.tLabel} style={{ color: "var(--brand-primary-dark)" }}>Shipping</span>
              <span className={styles.tVal}>{formatMoney(currency, shippingFee)}</span>
            </div>
          )}

          {useTax && taxAmount > 0 && (
            <div className={styles.totalsRow}>
              <span className={styles.tLabel} style={{ color: "var(--brand-primary-dark)" }}>Tax ({taxRate}%)</span>
              <span className={styles.tVal}>{formatMoney(currency, taxAmount)}</span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className={styles.totalsRow}>
              <span className={styles.tLabel} style={{ color: "var(--brand-primary-dark)" }}>{discountLabel}</span>
              <span className={`${styles.tVal} ${styles.tValDiscount}`}>−{formatMoney(currency, discountAmount)}</span>
            </div>
          )}

          <div className={styles.totalDueRow} >
            <span className={styles.tdLabel}>Total Due</span>
            <span className={styles.tdVal}>{formatMoney(currency, grandTotal)}</span>
          </div>
        </div>
      </div>

      {hasFooter && (
        <div className={styles.footer}>
          {hasPaymentInfo ? (
            <div className={styles.footerItem}>
              <div className={styles.footerHeading}>Payment Information</div>
              {invoiceBrandSettings.accountBank   && <div >Bank: {invoiceBrandSettings.accountBank}</div>}
              {invoiceBrandSettings.accountNumber && <div >Account No: {invoiceBrandSettings.accountNumber}</div>}
              {invoiceBrandSettings.accountName   && <div >Name: {invoiceBrandSettings.accountName}</div>}
            </div>
          ) : (
            <div />
          )}

          {hasContact && (
            <div className={styles.footerItem}>

              <div className={styles.brandName}>{invoiceBrandSettings.name || invoiceBrandSettings.ownerName}</div>
              {invoiceBrandSettings.phone && (
                <div className={styles.iconRow}>
                  <span className={styles.icon} style={{ color: "var(--brand-primary-dark)" }}><PhoneIcon /></span>
                  <span>{invoiceBrandSettings.phone}</span>
                </div>
              )}
              {invoiceBrandSettings.email && (
                <div className={styles.iconRow}>
                  <span className={styles.icon} style={{ color: "var(--brand-primary-dark)" }}><EmailIcon /></span>
                  <span>{invoiceBrandSettings.email}</span>
                </div>
              )}
              {invoiceBrandSettings.website && (
                <div className={styles.iconRow}>
                  <span className={styles.icon} style={{ color: "var(--brand-primary-dark)" }}><WebsiteIcon /></span>
                  <span>{invoiceBrandSettings.website}</span>
                </div>
              )}
              {invoiceBrandSettings.address && (
                <div className={styles.iconRow}>
                  <span className={styles.icon} style={{ color: "var(--brand-primary-dark)" }}><LocationIcon /></span>
                  <span>{invoiceBrandSettings.address}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}