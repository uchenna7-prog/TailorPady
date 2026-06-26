
import styles from "../styles/Template17.module.css"
import { getDueDate, calcTax } from "../utils/invoiceUtils"
import { formatMoney } from "../../../utils/moneyUtils"
import { EmailIcon, LocationIcon } from "../components/icons/icons"



export function InvoiceTemplate17({ invoice, customer, invoiceBrandSettings }) {
  
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

  const discountLabel = discountType === "percent" ? `Discount (${discountValue}%)` : "Discount"

  const hasContact     = invoiceBrandSettings.email || invoiceBrandSettings.address
  const hasPaymentInfo = invoiceBrandSettings.accountBank || invoiceBrandSettings.accountName
   const paymentTerms  = invoiceBrandSettings.paymentTerms

  return (
    <div className={styles.template}>

      <div className={styles.upperSection}>

        <div className={styles.leftPanel} >
          <div className={styles.leftMeta}>
            <div className={styles.metaGroup}>
              <div className={styles.metaLabel}>TO</div>
              <div className={styles.clientName}>{customer.name}</div>
              <div className={styles.clientDetails}>
                {customer.phone   && <span>{customer.phone}<br /></span>}
                {customer.email   && <span>{customer.email}<br /></span>}
                {customer.address && <span>{customer.address}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.brandRow}>

            <div className={styles.brandInfo}>
              <div className={styles.brandName} style={{ color: "var(--brand-primary)" }}>
                {invoiceBrandSettings.name || invoiceBrandSettings.ownerName}
              </div>
              {invoiceBrandSettings.tagline && (
                <div className={styles.brandTagline}>{invoiceBrandSettings.tagline}</div>
              )}
            </div>
          </div>

          <div className={styles.invoiceTitleBlock}>
            <div className={styles.invoiceTitle}>INVOICE</div>
          </div>

          <div className={styles.invoiceMetaBox}>
            <div className={styles.metaBoxCell}>
              {dueDate && (
                <>
                  <div className={styles.metaBoxLabel}>Due Date</div>
                  <div className={styles.metaBoxValue}>{dueDate}</div>
                </>
              )}
            </div>
            <div className={styles.metaBoxDivider} />
            <div className={styles.metaBoxCell}>
              <div className={styles.metaBoxLabel}>Invoice No</div>
              <div className={styles.metaBoxValue}>#{invoice.number}</div>
            </div>
          </div>
        </div>

      </div>

      {invoice.orderDesc && (
        <div className={styles.orderDescRow}>
          <span className={styles.orderLabel}>Order:</span>
          <span className={styles.orderDesc}>{invoice.orderDesc}</span>
        </div>
      )}

      <table className={styles.tableSection}>

        <thead>

          <tr className={styles.tableHeader} style={{ background: "var(--brand-primary)" }}>
            <th className={styles.thDesc}>Item Description</th>
            <th className={styles.thPrice}>Unit Price</th>
            <th className={styles.thQty}>Qty</th>
            <th className={styles.thSubtotal}>Subtotal</th>
          </tr>

        </thead>


        <tbody className={styles.tableBody}>
          {invoice.items?.map((item, i) => {
            const qty        = item.qty ?? 1
            const unitPrice  = parseFloat(item.price) || 0
            const lineAmount = qty * unitPrice
            return (
              <tr key={i} className={styles.tableRow}>
                <td className={styles.tdDesc}>{item.name}</td>
                <td className={styles.tdPrice}>{formatMoney(currency, unitPrice)}</td>
                <td className={styles.tdQty}>{qty}</td>
                <td className={styles.tdSubtotal}>{formatMoney(currency, lineAmount)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className={styles.totalsSection}>
        <div className={styles.totalsRow}>
          <span className={styles.totalsLabel}>Subtotal</span>
          <span className={styles.totalsValue}>{formatMoney(currency, subtotal)}</span>
        </div>

        {shippingFee > 0 && (
          <div className={styles.totalsRow}>
            <span className={styles.totalsLabel}>Shipping</span>
            <span className={styles.totalsValue}>{formatMoney(currency, shippingFee)}</span>
          </div>
        )}

        {useTax && taxAmount > 0 && (
          <div className={styles.totalsRow}>
            <span className={styles.totalsLabel}>Tax Vat ({taxRate}%)</span>
            <span className={styles.totalsValue}>{formatMoney(currency, taxAmount)}</span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className={styles.totalsRow}>
            <span className={styles.totalsLabel}>{discountLabel}</span>
            <span className={`${styles.totalsValue} ${styles.totalsValueDiscount}`}>−{formatMoney(currency, discountAmount)}</span>
          </div>
        )}

        <div className={`${styles.totalsRow} ${styles.orderTotalsRow}`}>
          <span className={styles.totalsFinalLabel}>Total</span>
          <span className={styles.totalsFinalValue}>{formatMoney(currency, grandTotal)}</span>
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

      {(hasPaymentInfo || hasContact) && (
        <div className={styles.footer}>

          <div className={styles.footerBlock}>
            <div className={styles.footerBlockHeading}>Payment Information</div>
            {hasPaymentInfo ? (
              <>
                {invoiceBrandSettings.accountBank   && <div className={styles.footerBlockLine}>Bank: {invoiceBrandSettings.accountBank}</div>}
                {invoiceBrandSettings.accountNumber && <div className={styles.footerBlockLine}>Acc No: {invoiceBrandSettings.accountNumber}</div>}
                 {invoiceBrandSettings.accountName   && <div className={styles.footerBlockLine}>Name: {invoiceBrandSettings.accountName}</div>}
              </>
            ) : (
              <div className={styles.footerBlockLine}>—</div>
            )}
          </div>

          <div className={styles.footerBlock}>
            <div className={styles.footerBlockHeading}>Contact</div>
            {invoiceBrandSettings.email && (
              <div className={styles.footerContactItem}>
                <span className={styles.footerContactIcon}><EmailIcon /></span>
                <span className={styles.footerBlockLine}>{invoiceBrandSettings.email}</span>
              </div>
            )}
            {invoiceBrandSettings.address && (
              <div className={styles.footerContactItem}>
                <span className={styles.footerContactIcon}><LocationIcon /></span>
                <span className={styles.footerBlockLine}>{invoiceBrandSettings.address}</span>
              </div>
            )}
            {invoiceBrandSettings.footer && (
              <div className={styles.footerNote}>{invoiceBrandSettings.footer}</div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}

