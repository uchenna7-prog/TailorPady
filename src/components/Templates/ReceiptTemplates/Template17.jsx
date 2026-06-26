
import styles from "../styles/Template17.module.css"
import { calcTax } from "../utils/receiptUtils"
import { resolveCumulativePaid, buildPaymentRows } from "../../ReceiptViewer/utils"
import { formatMoney } from "../../../utils/moneyUtils"
import { EmailIcon, LocationIcon } from "../components/icons/icons"

const METHOD_EMOJI = {
  cash:     "💵",
  transfer: "🏦",
  card:     "💳",
}

function methodEmoji(method) {
  return METHOD_EMOJI[(method || "").toLowerCase()] ?? "🧾"
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ""
}


export function ReceiptTemplate17({ receipt, customer, receiptBrandSettings }) {
  const accentColor = receiptBrandSettings.colour || "#1a1a1a"
  const { currency, showTax, receiptTaxRate: receiptBrandSettingsTaxRate } = receiptBrandSettings

  const subtotal = receipt.items?.length > 0
    ? receipt.items.reduce((sum, item) => sum + ((item.qty ?? 1) * (parseFloat(item.price) || 0)), 0)
    : 0

  const shippingFee    = parseFloat(receipt.shippingFee)    || 0
  const discountAmount = parseFloat(receipt.discountAmount)  || 0
  const discountType   = receipt.discountType                || null
  const discountValue  = parseFloat(receipt.discountValue)   || 0
  const useTax         = receipt.taxRate != null ? receipt.taxRate > 0 : (showTax && receiptBrandSettingsTaxRate > 0)
  const taxRate        = receipt.taxRate != null ? receipt.taxRate : receiptBrandSettingsTaxRate
  const taxAmount      = parseFloat(receipt.taxAmount) || calcTax(subtotal, taxRate, useTax)
  const grandTotal     = receipt.totalAmount != null
    ? parseFloat(receipt.totalAmount)
    : subtotal + shippingFee - discountAmount + taxAmount

  const discountLabel = discountType === "percent" ? `Discount (${discountValue}%)` : "Discount"
  const hasExtras     = shippingFee > 0 || discountAmount > 0 || (useTax && taxAmount > 0)

  const paymentRows = buildPaymentRows(receipt)

  const previouslyPaid = paymentRows
    .filter(p => !p._isCurrent)
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

  const thisPaymentTotal = paymentRows
    .filter(p => p._isCurrent)
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

  const balanceRemaining = parseFloat(receipt.balance) >= 0
    ? parseFloat(receipt.balance)
    : Math.max(0, grandTotal - resolveCumulativePaid(receipt))

  const isFullyPaid = receipt.isFullPayment ?? (balanceRemaining <= 0)

  const hasContact     = receiptBrandSettings.email || receiptBrandSettings.address
  const hasPaymentInfo = receiptBrandSettings.accountBank || receiptBrandSettings.name

  return (
    <div className={styles.template}>

      <div className={styles.upperSection}>

        <div className={styles.leftPanel}>
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
              <div className={styles.brandName} style={{ color: accentColor }}>
                {receiptBrandSettings.name || receiptBrandSettings.ownerName}
              </div>
              {receiptBrandSettings.tagline && (
                <div className={styles.brandTagline}>{receiptBrandSettings.tagline}</div>
              )}
            </div>
          </div>

          <div className={styles.invoiceTitleBlock}>
            <div className={styles.invoiceTitle}>RECEIPT</div>
          </div>

          <div className={styles.invoiceMetaBox}>
            <div className={styles.metaBoxCell}>
              <div className={styles.metaBoxLabel}>Date</div>
              <div className={styles.metaBoxValue}>{receipt.date}</div>
            </div>
            <div className={styles.metaBoxDivider} />
            <div className={styles.metaBoxCell}>
              <div className={styles.metaBoxLabel}>Receipt No</div>
              <div className={styles.metaBoxValue}>#{receipt.number}</div>
            </div>
          </div>
        </div>

      </div>

      {receipt.orderDesc && (
        <div className={styles.orderDescRow}>
          <span className={styles.orderLabel}>Order:</span>
          <span className={styles.orderDesc}>{receipt.orderDesc}</span>
        </div>
      )}

      <table className={styles.tableSection}>

        <thead>

          <tr className={styles.tableHeader} style={{ background: accentColor }}>
            <th className={styles.thDesc}>Item Description</th>
            <th className={styles.thPrice}>Unit Price</th>
            <th className={styles.thQty}>Qty</th>
            <th className={styles.thSubtotal}>Total</th>
          </tr>

        </thead>


        <tbody className={styles.tableBody}>
          {receipt.items?.map((item, i) => {
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
        {hasExtras && (
          <>
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

            {discountAmount > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsLabel}>{discountLabel}</span>
                <span className={`${styles.totalsValue} ${styles.totalsValueDiscount}`}>−{formatMoney(currency, discountAmount)}</span>
              </div>
            )}

            {useTax && taxAmount > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsLabel}>Tax Vat ({taxRate}%)</span>
                <span className={styles.totalsValue}>{formatMoney(currency, taxAmount)}</span>
              </div>
            )}
          </>
        )}

        <div className={`${styles.totalsRow} ${styles.orderTotalsRow}`}>
          <span className={styles.totalsFinalLabel}>Order Total</span>
          <span className={styles.totalsFinalValue}>{formatMoney(currency, grandTotal)}</span>
        </div>
      </div>

      {paymentRows.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historySectionLabel} style={{ color: accentColor }}>Payment History</div>

          {paymentRows.map((payment, index) => {
            const isCurrent = payment._isCurrent
            const method    = payment.method || ""
            return (
              <div key={payment.id ?? index} className={styles.historyRow}>
                <span className={styles.historyEmoji}>{methodEmoji(method)}</span>
                <div className={styles.historyMeta}>
                  <div className={styles.historyMethod} style={{ color: accentColor }}>
                    {capitalize(method)}
                    {isCurrent && <span className={styles.latestBadge}>Latest</span>}
                  </div>
                  <div className={styles.historyDate}>
                    {payment.date}{payment.time ? ` · ${payment.time}` : ""}
                  </div>
                </div>
                <span className={styles.historyAmount}>
                  {formatMoney(currency, payment.amount)}
                </span>
              </div>
            )
          })}

          <div className={styles.paidSummaryRow}>
            {previouslyPaid > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsLabel}>Previously Paid</span>
                <span className={styles.totalsValue}>{formatMoney(currency, previouslyPaid)}</span>
              </div>
            )}

            {thisPaymentTotal > 0 && (
              <div className={styles.totalsRow} >
                <span className={styles.totalsLabel}>This Payment</span>
                <span className={styles.totalsValue} style={{ color: "#16a34a" }}>+ {formatMoney(currency, thisPaymentTotal)}</span>
              </div>
            )}  

            <div className={styles.totalsDivider} style={{ borderBottom : '1.5px solid var(--brand-primary-dark)' }} />

            <div className={styles.totalPaidRow}>
              <span className={styles.totalPaidKey} style={{ color : 'var(--brand-primary)' }}>
                Total Paid
              </span>
              <span className={styles.totalPaidVal}>
                {formatMoney(currency, thisPaymentTotal + previouslyPaid)}
              </span>
            </div>


            {!isFullyPaid ? (
              <div className={styles.totalsRow}>
                <span className={styles.totalsFinalLabel} style={{ color: "#dc2626" }}>Balance Due</span>
                <span className={styles.totalsFinalValue} style={{ color: "#dc2626" }}>{formatMoney(currency, balanceRemaining)}</span>
              </div>
            ) : (
              <div className={styles.totalsRow}>
                <span className={styles.totalsFinalLabel} style={{ color: "#16a34a" }}>Paid In Full</span>
                <span className={styles.totalsFinalValue} style={{ color: "#16a34a" }}>{formatMoney(currency, grandTotal)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {(hasPaymentInfo || hasContact) && (
        <div className={styles.footer}>

          <div className={styles.footerBlock}>
            <div className={styles.footerBlockHeading}>Payment Details</div>
            {hasPaymentInfo ? (
              <>
                {receiptBrandSettings.name   && <div className={styles.footerBlockLine}>Received By: {receiptBrandSettings.name}</div>}
               
              </>
            ) : (
              <div className={styles.footerBlockLine}>—</div>
            )}
          </div>

          <div className={styles.footerBlock}>
            <div className={styles.footerBlockHeading}>Contact</div>
            {receiptBrandSettings.email && (
              <div className={styles.footerContactItem}>
                <span className={styles.footerContactIcon}><EmailIcon /></span>
                <span className={styles.footerBlockLine}>{receiptBrandSettings.email}</span>
              </div>
            )}
            {receiptBrandSettings.address && (
              <div className={styles.footerContactItem}>
                <span className={styles.footerContactIcon}><LocationIcon /></span>
                <span className={styles.footerBlockLine}>{receiptBrandSettings.address}</span>
              </div>
            )}
            {receiptBrandSettings.footer && (
              <div className={styles.footerNote}>{receiptBrandSettings.footer}</div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}

