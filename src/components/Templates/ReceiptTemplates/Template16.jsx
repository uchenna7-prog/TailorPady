import styles from "../styles/Template16.module.css"
import { calcTax } from "../utils/receiptUtils"
import { resolveCumulativePaid, buildPaymentRows } from "../../ReceiptViewer/utils"
import { formatMoney } from "../../../utils/moneyUtils"
import {
  PhoneIcon,
  EmailIcon,
  LocationIcon,
  WebsiteIcon,
} from "../components/icons/icons"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"


function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

const METHOD_EMOJI = {
  cash:     '💵',
  transfer: '🏦',
  card:     '💳',
}

function methodEmoji(method) {
  return METHOD_EMOJI[(method || '').toLowerCase()] ?? '🧾'
}


export function ReceiptTemplate16({ receipt, customer, receiptBrandSettings }) {
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

  const discountLabel  = discountType === 'percent' ? `Discount (${discountValue}%)` : 'Discount'
  const hasExtras      = shippingFee > 0 || discountAmount > 0 || (useTax && taxAmount > 0)
  const tax            = calcTax(grandTotal, taxRate, showTax)

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

  const hasContact = receiptBrandSettings.phone || receiptBrandSettings.email || receiptBrandSettings.website || receiptBrandSettings.address

  return (
    <div className={styles.template}>

      <div className={styles.topBar} />

      <div className={styles.content}>

        <div className={styles.headerRow}>
          <div className={styles.logoBlock}>
           
           <LogoOrName receiptBrandSettings={receiptBrandSettings} darkBg={false} />

            <div >
              <div className={styles.brandName}>
                {receiptBrandSettings.name || receiptBrandSettings.ownerName}
              </div>
              {receiptBrandSettings.tagline && (
                <div className={styles.brandTagline}>{receiptBrandSettings.tagline}</div>
              )}
            </div>
          </div>
          <div className={styles.invoiceTitle}>RECEIPT</div>
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
            <div className={styles.invoiceNumLabel}>Receipt#</div>
            <div className={styles.invoiceNum}>{receipt.number}</div>
            {receipt.date && (
              <div className={styles.metaLine}>
                <span className={styles.metaKey}>Date:</span>
                <span className={styles.metaVal}>{receipt.date}</span>
              </div>
            )}
          </div>
        </div>

        {receipt.orderDesc && (
          <div className={styles.orderDescRow}>
            <span className={styles.orderLabel}>ORDER:</span>
            <span className={styles.orderDesc}>{receipt.orderDesc}</span>
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
              {receipt.items?.map((item, i) => {
                const qty        = item.qty ?? 1
                const unitPrice  = parseFloat(item.price) || 0
                const lineAmount = qty * unitPrice
                return (
                  <tr className={styles.tableRow} key={i} >
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

         {hasExtras && (

          <div>
            <div className={styles.orderTotalRow}>
              <span >Subtotal</span>
              <span >{formatMoney(currency, subtotal)}</span>
            </div>
            {shippingFee > 0 && (
              <div className={styles.orderTotalRow} >
                <span >Shipping</span>
                <span >{formatMoney(currency, shippingFee)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className={styles.orderTotalRow}>
                <span >{discountLabel}</span>
                <span >-{formatMoney(currency, discountAmount)}</span>
              </div>
            )}
            {useTax && taxAmount > 0 && (
              <div >
                <span >Tax ({taxRate}%)</span>
                <span >{formatMoney(currency, taxAmount)}</span>
              </div>
            )}
          </div>
        )}
        {showTax && taxRate > 0 && !hasExtras && (
          <div >
            <span >Tax ({taxRate}%)</span>
            <span >{formatMoney(currency, tax)}</span>
          </div>
        )}

        <div className={styles.orderTotalWrap}>
          <span className={styles.orderTotalLabel}>Order Total</span>
          <span className={styles.orderTotalValue}>{formatMoney(currency, grandTotal)}</span>
        </div>

        {paymentRows.length > 0 && (
          <div className={styles.historySection}>
            <div className={styles.historySectionLabel}>Payment History</div>
            {paymentRows.map((payment, index) => {
              const isCurrent = payment._isCurrent
              const method    = payment.method || ''
              return (
                <div key={payment.id ?? index} className={styles.paymentHistoryRow}>
                  <span className={styles.paymentMethodIcon}>
                    {methodEmoji(method)}
                  </span>
                  <div className={styles.paymentHistoryMeta}>
                    <div className={styles.paymentHistoryMethod}>
                      {capitalize(method)}
                      {isCurrent && <span className={styles.latestBadge}>Latest</span>}
                    </div>
                    <div className={styles.paymentHistoryDate}>
                      {payment.date}{payment.time ? ` · ${payment.time}` : ''}
                    </div>
                  </div>
                  <span className={`${styles.paymentHistoryAmount} ${isCurrent ? styles.amountCurrent : ''}`}>
                    {formatMoney(currency, payment.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div className={styles.bottomArea}>
          <div className={styles.paymentBlock}>
            {receiptBrandSettings.accountBank && (
              <>
                <div className={styles.paymentHeading}>Payment Details</div>
                <div className={styles.paymentDetails}>
                  {receiptBrandSettings.name && <span>Received By: {receiptBrandSettings.name}<br /></span>}
                </div>
              </>
            )}
          </div>

          <div className={styles.totalsBlock}>
           
            {paymentRows.length > 0 && previouslyPaid > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey}>Previously Paid</span>
                <span className={styles.totalsVal}>{formatMoney(currency, previouslyPaid)}</span>
              </div>
            )}
            {paymentRows.length > 0 && thisPaymentTotal > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey}>This Payment</span>
                <span className={`${styles.totalsVal} ${styles.amountCurrent}`}>+{formatMoney(currency, thisPaymentTotal)}</span>
              </div>
            )}
            <div className={styles.grandTotalRow}>
              <span className={styles.grandTotalKey}>Total</span>
              <span className={styles.grandTotalVal}>
                {formatMoney(currency, paymentRows.length > 0 ? thisPaymentTotal + previouslyPaid : grandTotal)}
              </span>
            </div>
            {!isFullyPaid ? (
              <div className={styles.balanceCallout}>
                <span className={styles.balanceLabel}>Balance Remaining</span>
                <span className={styles.balanceAmount}>{formatMoney(currency, balanceRemaining)}</span>
              </div>
            ) : (
              <div className={styles.paidCallout}>
                <span className={styles.paidLabel}>Paid In Full</span>
                <span className={styles.paidAmount}>{formatMoney(currency, grandTotal)}</span>
              </div>
            )}
          </div>
        </div>

        {hasContact && (
          <div className={styles.contactStrip}>
            {receiptBrandSettings.phone && (
              <div className={styles.contactStripItem}>
                <span className={styles.contactStripLabel}>Phone</span>
                <span className={styles.contactStripText}>{receiptBrandSettings.phone}</span>
              </div>
            )}
            {receiptBrandSettings.email && (
              <div className={styles.contactStripItem}>
                <span className={styles.contactStripLabel}>Email</span>
                <span className={styles.contactStripText}>{receiptBrandSettings.email}</span>
              </div>
            )}
            {receiptBrandSettings.website && (
              <div className={styles.contactStripItem}>
                <span className={styles.contactStripLabel}>Website</span>
                <span className={styles.contactStripText}>{receiptBrandSettings.website}</span>
              </div>
            )}
            {receiptBrandSettings.address && (
              <div className={styles.contactStripItem}>
                <span className={styles.contactStripLabel}>Address</span>
                <span className={styles.contactStripText}>{receiptBrandSettings.address}</span>
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
