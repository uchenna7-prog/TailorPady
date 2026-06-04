import styles from "../styles/Template6.module.css"
import { calcTax } from "../utils/receiptUtils"
import { resolveCumulativePaid, buildPaymentRows } from "../../ReceiptViewer/utils"
import { formatMoney } from "../../../utils/moneyUtils"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"
import { PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/icons"


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


export function ReceiptTemplate6({ receipt, customer, receiptBrandSettings }) {
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
  const brandName     = receiptBrandSettings.name || receiptBrandSettings.ownerName

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

  return (
    <div className={styles.template}>

      <div className={styles.topSection}>
        <div className={styles.heroTitle}>RECEIPT</div>
        <div className={styles.logoBlock}>
          <LogoOrName receiptBrandSettings={receiptBrandSettings} />
        </div>
      </div>

      <div className={styles.metaSection}>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Receipt Number:</span>
          <span className={styles.metaVal}>{receipt.number}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Date:</span>
          <span className={styles.metaVal}>{receipt.date}</span>
        </div>
        {receipt.orderDesc && (
          <div className={styles.metaRow}>
            <span className={styles.metaKey}>Order:</span>
            <span className={styles.metaVal}>{receipt.orderDesc}</span>
          </div>
        )}
      </div>

      <div className={styles.billingSection}>
        <div className={styles.billToBox}>
          <div className={styles.billToLabel}>Received From:</div>
          <div className={styles.billToDetail}>

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

        <div className={styles.payableToBlock}>
          <div className={styles.payableToLabel}>Received By</div>
          <div className={styles.payableToDetail}>
            {brandName && <span  className={styles.brandName} >{brandName}<br /></span>}

            {receiptBrandSettings.phone && (
              <span className={styles.payableIconRow}>
                <span className={styles.payableIcon}><PhoneIcon /></span>
                {receiptBrandSettings.phone}
              </span>
            )}
            {receiptBrandSettings.email && (
              <span className={styles.payableIconRow}>
                <span className={styles.payableIcon}><EmailIcon /></span>
                {receiptBrandSettings.email}
              </span>
            )}

            {receiptBrandSettings.address && (
              <span className={styles.payableIconRow}>
                <span className={styles.payableIcon}><LocationIcon /></span>
                {receiptBrandSettings.address}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <table className={styles.tableGrid}>
          <thead>
            <tr>
              <th className={styles.colNo}>No.</th>
              <th className={styles.colDesc}>Item Description</th>
              <th className={styles.colQty}>Qty</th>
              <th className={styles.colPrice}>Price ({currency || "$"})</th>
              <th className={styles.colTotal}>Total ({currency || "$"})</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items?.map((item, i) => {
              const qty        = item.qty ?? 1
              const unitPrice  = parseFloat(item.price) || 0
              const lineAmount = qty * unitPrice
              return (
                <tr key={i}>
                  <td className={styles.colNo}>{i + 1}.</td>
                  <td className={styles.colDesc}>{item.name}</td>
                  <td className={styles.colQty}>{qty}</td>
                  <td className={styles.colPrice}>{formatMoney(currency, unitPrice)}</td>
                  <td className={styles.colTotal}>{formatMoney(currency, lineAmount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.totalsSection}>
        {hasExtras && (
          <>
            <div className={styles.totalsRow}>
              <span className={styles.totalsKey}>subtotal:</span>
              <span className={styles.totalsVal}>{formatMoney(currency, subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey}>{discountLabel}:</span>
                <span className={`${styles.totalsVal} ${styles.discountVal}`}>-{formatMoney(currency, discountAmount)}</span>
              </div>
            )}

            {shippingFee > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey}>shipping:</span>
                <span className={styles.totalsVal}>{formatMoney(currency, shippingFee)}</span>
              </div>
            )}

            {useTax && taxAmount > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey}>Sales Tax ({taxRate}%):</span>
                <span className={styles.totalsVal}>{formatMoney(currency, taxAmount)}</span>
              </div>
            )}
          </>
        )}

        
        <div className={styles.grandTotalRow}>
          <span className={styles.grandTotalKey}>Total Amount:</span>
          <span className={styles.grandTotalVal}>
            {formatMoney(currency, paymentRows.length > 0 ? thisPaymentTotal + previouslyPaid : grandTotal)}
          </span>
        </div>
      </div>

      {paymentRows.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historySectionLabel}>Payment History</div>
          {paymentRows.map((payment, index) => {
            const isCurrent = payment._isCurrent
            const method    = payment.method || ""
            return (
              <div key={payment.id ?? index} className={styles.historyRow}>
                <span className={styles.historyEmoji}>{methodEmoji(method)}</span>
                <div className={styles.historyMeta}>
                  <div className={styles.historyMethod}>
                    {capitalize(method)}
                    {isCurrent && <span className={styles.latestBadge}>Latest</span>}
                  </div>
                  <div className={styles.historyDate}>
                    {payment.date}{payment.time ? ` · ${payment.time}` : ""}
                  </div>
                </div>
                <span className={`${styles.historyAmount} ${isCurrent ? styles.historyAmountCurrent : ""}`}>
                  {formatMoney(currency, payment.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {paymentRows.length > 0 && (
        <div className={styles.paidSummarySection}>

          {paymentRows.length > 0 && previouslyPaid > 0 && (
          <div className={styles.totalsRow}>
            <span className={styles.totalsKey}>previously paid:</span>
            <span className={styles.totalsVal}>{formatMoney(currency, previouslyPaid)}</span>
          </div>
        )}

        {paymentRows.length > 0 && thisPaymentTotal > 0 && (
          <div className={styles.totalsRow}>
            <span className={styles.totalsKey}>this payment:</span>
            <span className={styles.totalsVal}>+{formatMoney(currency, thisPaymentTotal)}</span>
          </div>
        )}

      <div className={styles.totalPaidRow}>
        <span className={styles.totalPaidKey} style={{ color : 'var(--brand-primary)' }}>
          Total Paid
        </span>
        <span className={styles.totalPaidVal}>
          {formatMoney(currency, thisPaymentTotal + previouslyPaid)}
        </span>
      </div>

          <div className={styles.balanceRow}>

            {!isFullyPaid ? (
              <div className={styles.totalsRow}>
                <span className={styles.balanceKey} style={{ color: "#dc2626" }}>Balance Due</span>
                <span className={styles.balanceVal} style={{ color: "#dc2626" }}>{formatMoney(currency, balanceRemaining)}</span>
              </div>
            ) : (
              <div className={styles.totalsRow}>
                <span className={styles.balanceKey} style={{ color: "#16a34a" }}>Paid In Full</span>
                <span className={styles.balanceVal} style={{ color: "#16a34a" }}>{formatMoney(currency, grandTotal)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.bottomSection}>
        {brandName && (
          <div className={styles.payeeName}>{brandName}</div>
        )}

        {receiptBrandSettings.accountBank && (
          <>
            {receiptBrandSettings.accountName && (
              <div className={styles.bankRow}>
                <span className={styles.bankKey}>Received By:</span>
                <span className={styles.bankVal}>{receiptBrandSettings.accountName}</span>
              </div>
            )}
          </>
        )}

        <div className={styles.thankYou}>
          {receiptBrandSettings.footer || "Thank you for your purchase!"}
        </div>
      </div>

    </div>
  )
}







