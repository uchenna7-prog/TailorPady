import styles from "../styles/Template12.module.css"
import { getDueDate, calcTax } from "../utils/invoiceUtils"
import { formatMoney } from "../../../utils/moneyUtils"
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from "../components/icons/icons"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"

export function InvoiceTemplate12({ invoice, customer, invoiceBrandSettings }) {

  const dueDate = getDueDate(invoice, invoiceBrandSettings.dueDays)
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

  const discountLabel  = discountType === "percent" ? `Discount (${discountValue}%)` : "Discount"
  const hasExtras      = shippingFee > 0 || discountAmount > 0 || (useTax && taxAmount > 0)
  const terms          = invoiceBrandSettings.paymentTerms || []

  const hasBottomInfo = invoiceBrandSettings.accountBank
    || invoiceBrandSettings.phone
    || invoiceBrandSettings.email
    || invoiceBrandSettings.address
    || invoiceBrandSettings.website

  return (
    <div className={styles.template}>

      <div className={styles.header} style={{ background: "var(--brand-primary)" }}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <LogoOrName invoiceBrandSettings={invoiceBrandSettings} darkBg={true} />
            <div className={styles.brandInfo}>
              <div className={styles.brandName}>{invoiceBrandSettings.name || invoiceBrandSettings.ownerName}</div>
              {invoiceBrandSettings.tagline && (
                <div className={styles.brandTagline}>{invoiceBrandSettings.tagline}</div>
              )}
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.invoiceLabel}>INVOICE</div>
          </div>
        </div>

        <ThornBorder />
      </div>

      <div className={styles.clientRow}>
        <div className={styles.clientBlock}>
          <div className={styles.sectionLabel} style={{ color: "var(--brand-primary)" }}>Bill To</div>
          <div className={styles.clientName}>{customer.name}</div>
          <div className={styles.clientDetails}>
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

        <div className={styles.invoiceMetaBlock}>
          <div className={styles.metaTable}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Invoice #:</span>
              <span className={styles.metaVal}>{invoice.number}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Date:</span>
              <span className={styles.metaVal}>{invoice.date}</span>
            </div>
            {dueDate && (
              <div className={styles.metaRow}>
                <span className={styles.metaKey}>Due:</span>
                <span className={styles.metaVal}>{dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {invoice.orderDesc && (
        <div className={styles.orderDescRow}>
          <span className={styles.orderLabel}>Order:</span>
          <span className={styles.orderDesc}>{invoice.orderDesc}</span>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.tableSection}>
          <thead>
            <tr className={styles.tableHeader} style={{ background: "var(--brand-primary)" }}>
              <th className={styles.thDesc}>Description</th>
              <th className={styles.thQty}>Qty</th>
              <th className={styles.thPrice}>Unit Price</th>
              <th className={styles.thTotal}>Total</th>
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
                  <td className={styles.tdQty}>{qty}</td>
                  <td className={styles.tdPrice}>{formatMoney(currency, unitPrice)}</td>
                  <td className={styles.tdTotal}>{formatMoney(currency, lineAmount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>


      <div className={styles.footerSection}>
        <div className={styles.footerLeft} />
        <div className={styles.footerRight}>
          <div className={styles.totalsBlock}>
            <div className={styles.totalRow}>
              <span className={styles.totalRowLabel}>Subtotal</span>
              <span className={styles.totalRowValue}>{formatMoney(currency, subtotal)}</span>
            </div>
            {shippingFee > 0 && (
              <div className={styles.totalRow}>
                <span className={styles.totalRowLabel}>Shipping</span>
                <span className={styles.totalRowValue}>{formatMoney(currency, shippingFee)}</span>
              </div>
            )}
            {useTax && taxAmount > 0 && (
              <div className={styles.totalRow}>
                <span className={styles.totalRowLabel}>Tax ({taxRate}%)</span>
                <span className={styles.totalRowValue}>{formatMoney(currency, taxAmount)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className={styles.totalRow}>
                <span className={styles.totalRowLabel}>{discountLabel}</span>
                <span className={styles.totalRowValueDiscount}>−{formatMoney(currency, discountAmount)}</span>
              </div>
            )}
            <div className={styles.grandTotalRow} style={{ background: "var(--brand-primary)" }}>
              <span className={styles.grandLabel}>Total Due</span>
              <span className={styles.grandValue}>{formatMoney(currency, grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      

      {hasBottomInfo && (
        <div className={styles.bottomInfoSection}>
          {invoiceBrandSettings.accountBank && (
            <div className={styles.bottomInfoLeft}>
              <div className={styles.bottomInfoLabel}>Payment Information</div>
              {invoiceBrandSettings.accountBank && (
                <div className={styles.bottomInfoDetail}>Bank: {invoiceBrandSettings.accountBank}</div>
              )}

              {invoiceBrandSettings.accountNumber && (
                <div className={styles.bottomInfoDetail}>Account No: {invoiceBrandSettings.accountNumber}</div>
              )}

              {invoiceBrandSettings.accountName && (
                <div className={styles.bottomInfoDetail}>Account Name: {invoiceBrandSettings.accountName}</div>
              )}
            </div>
          )}

          <div className={styles.bottomInfoRight}>
            <div className={styles.bottomInfoLabel}>Contact</div>
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
      )}

      <div className={styles.thankYouText}>
        {invoiceBrandSettings.footer || "Thank you for your business. Payment is due within the agreed terms."}
      </div>

    </div>
  )
}

function ThornBorder() {
  const thorns = Array.from({ length: 40 })
  return (
    <svg
      className={styles.thornBorder}
      viewBox="0 0 800 24"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        fill="#ffffff"
        points={thorns.map((_, i) => {
          const w    = 800 / thorns.length
          const x0   = i * w
          const xMid = x0 + w / 2
          const x1   = x0 + w
          return `${x0},24 ${xMid},0 ${x1},24`
        }).join(" ")}
      />
    </svg>
  )
}



