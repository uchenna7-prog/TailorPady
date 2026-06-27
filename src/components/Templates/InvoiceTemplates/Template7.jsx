import styles from '../styles/Template7.module.css'
import { getDueDate, calcTax } from '../utils/invoiceUtils'
import { formatMoney } from '../../../utils/moneyUtils'
import { LogoOrName } from '../components/LogoOrBrandName/LogoOrBrandName'
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from '../components/icons/icons'

export function InvoiceTemplate7({ invoice, customer, invoiceBrandSettings }) {
  const accentColor = invoiceBrandSettings.colour || '#a855f7'
  const dueDate     = getDueDate(invoice, invoiceBrandSettings.dueDays)

  const { currency, showTax, invoiceTaxRate: invoiceBrandSettingsTaxRate } = invoiceBrandSettings

  const subtotal       = invoice.items?.length > 0
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
  const amountPaid    = parseFloat(invoice.amountPaid) || parseFloat(invoice.paidAmount) || 0
  const balanceDue    = Math.max(0, grandTotal - amountPaid)
  const items         = invoice.items ?? []

  const gradientBackground = `linear-gradient(to bottom, #ffffff 40%, ${accentColor}38 100%)`

  return (
    <div className={styles.template} style={{ background: gradientBackground }}>
      <div className={styles.content}>

        <div className={styles.header}>
          <div className={styles.logoBlock}>
            <LogoOrName invoiceBrandSettings={invoiceBrandSettings} />
            <div className={styles.brandTextBlock}>
              <span className={styles.brandName}>
                {invoiceBrandSettings.name || invoiceBrandSettings.ownerName}
              </span>
              {invoiceBrandSettings.tagline && (
                <div className={styles.brandTagline}>{invoiceBrandSettings.tagline}</div>
              )}
            </div>
          </div>

          <div className={styles.titleBlock}>
            <div className={styles.docTitle}>INVOICE</div>
            <div className={styles.metaGroup}>
              <div className={styles.metaLine}>
                <span className={styles.metaKey}>Invoice #</span>
                <span>{invoice.number}</span>
              </div>
              <div className={styles.metaLine}>
                <span className={styles.metaKey}>Date</span>
                <span>{invoice.date}</span>
              </div>
              {dueDate && (
                <div className={styles.metaLine}>
                  <span className={styles.metaKey}>Date</span>
                  <span>{dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.companyCol}>
            {(invoiceBrandSettings.name || invoiceBrandSettings.ownerName) && (
              <div className={styles.companyName}>
                {invoiceBrandSettings.name || invoiceBrandSettings.ownerName}
              </div>
            )}
            {invoiceBrandSettings.email && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><EmailIcon /></span>
                <span>{invoiceBrandSettings.email}</span>
              </div>
            )}
            {invoiceBrandSettings.phone && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><PhoneIcon /></span>
                <span>{invoiceBrandSettings.phone}</span>
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

          <div className={styles.clientCol}>
            <div className={styles.clientLabel}>Bill to</div>
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

        {invoice.orderDesc && (
          <div className={styles.orderDesc}>
            <strong>Order:</strong> {invoice.orderDesc}
          </div>
        )}

        <table className={styles.tableSection}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.thItem}>Item</th>
              <th className={styles.thRate}>Unit Price</th>
              <th className={styles.thQty}>QTY</th>
              <th className={styles.thAmount}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const qty       = item.qty ?? 1
              const unitPrice = parseFloat(item.price) || 0
              const lineTotal = qty * unitPrice
              const isLast    = i === items.length - 1
              return (
                <tr key={i} className={isLast ? styles.tableLastRow : styles.tableRow}>
                  <td className={styles.tdItem}>
                    <div className={styles.itemName}>{item.name}</div>
                    {item.description && (
                      <div className={styles.itemDesc}>{item.description}</div>
                    )}
                  </td>
                  <td className={styles.tdRate}>{formatMoney(currency, unitPrice)}</td>
                  <td className={styles.tdQty}>{qty}</td>
                  <td className={styles.tdAmount}>{formatMoney(currency, lineTotal)}</td>
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
              <span className={`${styles.totalsVal} ${styles.discountVal}`}>
                -{formatMoney(currency, discountAmount)}
              </span>
            </div>
          )}

          {useTax && taxAmount > 0 && (
            <div className={styles.totalsRow}>
              <span className={styles.totalsKey}>Tax {taxRate}% (Exc.)</span>
              <span className={styles.totalsVal}>{formatMoney(currency, taxAmount)}</span>
            </div>
          )}

          <div className={`${styles.grandTotalRow} ${styles.grandTotalWithTopBorder}`}>
            <span className={styles.grandTotalKey}>Total</span>
            <span className={styles.grandTotalVal}>{formatMoney(currency, grandTotal)}</span>
          </div>
        </div>

        <div className={styles.footer}>
          {invoiceBrandSettings.accountBank && (
            <div className={styles.bankBlock}>
              <div className={styles.bankLabel}>Payment Information</div>
              <div className={styles.bankRow}>Bank: {invoiceBrandSettings.accountBank}</div>
              {invoiceBrandSettings.accountNumber && (
                <div className={styles.bankRow}>Account No: {invoiceBrandSettings.accountNumber}</div>
              )}
              {invoiceBrandSettings.accountName && (
                <div className={styles.bankRow}>Account Name: {invoiceBrandSettings.accountName}</div>
              )}
            </div>
          )}

          <div className={styles.signatureSection}>
            <div className={styles.signatureBlock}>
              <div className={styles.signatureLabel}>Client signature</div>
              <div className={styles.signatureLine} />
              <div className={styles.signerName}>{customer.name}</div>
            </div>
            <div className={styles.signatureBlock}>
              <div className={styles.signatureLabel}>Business signature</div>
              <div className={styles.signatureLine} />
            </div>
          </div>

          <div className={styles.footerBottom} />
        </div>

      </div>
    </div>
  )
}