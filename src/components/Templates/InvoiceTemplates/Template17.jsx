import styles from "../styles/Template17.module.css"
import { getDueDate, calcTax } from "../utils/invoiceUtils"
import { formatMoney } from "../../../utils/moneyUtils"
import {
  PhoneIcon,
  EmailIcon,
  LocationIcon,
  WebsiteIcon,
} from "../components/icons/icons"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"


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

  const discountLabel = discountType === 'percent' ? `Discount (${discountValue}%)` : 'Discount'
  const brandInitial  = (invoiceBrandSettings.name || invoiceBrandSettings.ownerName || 'B').charAt(0).toUpperCase()

  const hasContact = invoiceBrandSettings.phone || invoiceBrandSettings.website || invoiceBrandSettings.address
   const paymentTerms  = invoiceBrandSettings.paymentTerms

  return (
    <div className={styles.template}>

      <div className={styles.topShapeWrap}>
        <svg viewBox="0 0 300 150" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 'auto' }}>
          <path fill={"var(--brand-primary)"} d="M0 0 H300 V150 H120 Q60 150 40 90 L0 0 Z" />
        </svg>
      </div>

      <div className={styles.content}>

        <div className={styles.logoBlock}>
          
          <LogoOrName invoiceBrandSettings={invoiceBrandSettings} darkBg={false} />
          
          <div className={styles.logoText}>
            <div className={styles.brandName} style={{ color: "var(--brand-primary)" }}>
              {invoiceBrandSettings.name || invoiceBrandSettings.ownerName}
            </div>
            {invoiceBrandSettings.tagline && (
              <div className={styles.brandTagline}>{invoiceBrandSettings.tagline}</div>
            )}
          </div>
        </div>

        <div className={styles.topInfo}>
          <div className={styles.billBlock}>
            <div className={styles.billLabel}>Billing To</div>
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
            <div className={styles.invoiceTitle} style={{ color: "var(--brand-primary)" }}>INVOICE</div>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Invoice:</span>
              <span className={styles.metaVal}>{invoice.number}</span>
            </div>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Date:</span>
              <span className={styles.metaVal}>{invoice.date}</span>
            </div>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Due Date:</span>
              <span className={styles.metaVal}>{dueDate}</span>
            </div>
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
                <th
                  colSpan={5}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    padding: 0, border: 'none',
                    zIndex: 0, overflow: 'hidden',
                    lineHeight: 0,
                  }}
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 1000 34"
                    preserveAspectRatio="none"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                  >
                    <path fill={"var(--brand-primary)"} d="M0 0 H420 L455 34 H0 Z" />
                    <path fill="var(--brand-muted)" d="M420 6 H1000 V34 H455 Z" />
                  </svg>
                </th>
                <th className={styles.colSn}    style={{ position: 'absolute', zIndex: 1 }}>SN</th>
                <th className={styles.colDesc}  style={{ position: 'absolute', zIndex: 1 }}>Item Description</th>
                <th className={styles.colPrice} style={{ position: 'absolute', zIndex: 1 }}>Unit Price</th>
                <th className={styles.colQty}   style={{ position: 'absolute', zIndex: 1 }}>Qty</th>
                <th className={styles.colTotal} style={{ position: 'absolute', zIndex: 1 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, i) => {
                const qty        = item.qty ?? 1
                const unitPrice  = parseFloat(item.price) || 0
                const lineAmount = qty * unitPrice
                return (
                  <tr key={i} className={styles.tableRow}>
                    <td className={styles.colSn}>{i + 1}</td>
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
                <div className={styles.paymentHeading} style={{ color: "var(--brand-primary)" }}>Payment Information</div>
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
                <span className={styles.totalsKey}>Shipping &amp; Delivery</span>
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
                <span className={styles.totalsKey}>VAT ({taxRate}%)</span>
                <span className={styles.totalsVal}>{formatMoney(currency, taxAmount)}</span>
              </div>
            )}

            <div className={styles.grandTotalBox}>
              <svg className={styles.grandTotalSvg} viewBox="0 0 400 34" preserveAspectRatio="none">
                <path fill="var(--brand-muted)" d="M0 6 H110 L135 34 H0 Z" />
                <path fill={"var(--brand-primary)"} d="M100 0 H400 V34 H135 Z" />
              </svg>
              <div className={styles.grandTotalContent}>
                <span className={styles.grandTotalLabel}>Total</span>
                <span className={styles.grandTotalVal}>{formatMoney(currency, grandTotal)}</span>
              </div>
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
              <span className={styles.contactStripItem}>
                <span className={styles.contactStripIcon}><PhoneIcon /></span>
                <span className={styles.contactStripText}>{invoiceBrandSettings.phone}</span>
              </span>
            )}
            {invoiceBrandSettings.website && (
              <span className={styles.contactStripItem}>
                <span className={styles.contactStripIcon}><WebsiteIcon /></span>
                <span className={styles.contactStripText}>{invoiceBrandSettings.website}</span>
              </span>
            )}
            {invoiceBrandSettings.address && (
              <span className={styles.contactStripItem}>
                <span className={styles.contactStripIcon}><LocationIcon /></span>
                <span className={styles.contactStripText}>{invoiceBrandSettings.address}</span>
              </span>
            )}
          </div>
        )}

      </div>

      <div className={styles.bottomShapeRow}>
        <div className={styles.bottomShapeSvgWrap}>
          <svg viewBox="0 0 500 100" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
            <path fill={"var(--brand-primary)"} d="M0 0 H280 Q345 0 365 50 L390 100 H0 Z" />
          </svg>
        </div>
        {invoiceBrandSettings.footer && (
          <div className={styles.bottomShapeNote}>
            {invoiceBrandSettings.footer}
          </div>
        )}
      </div>

    </div>
  )
}








