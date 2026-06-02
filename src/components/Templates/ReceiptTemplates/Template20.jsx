import styles from "../styles/Template20.module.css"
import { calcTax } from "../utils/receiptUtils"
import { resolveCumulativePaid, buildPaymentRows } from "../../ReceiptViewer/utils"
import { formatMoney } from "../../../utils/moneyUtils"
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from "../components/icons/icons"


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


export function ReceiptTemplate20({ receipt, customer, receiptBrandSettings }) {
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

      <div className={styles.topRow}>
        <div className={styles.titleBox}>
          <span className={styles.titleText}>Receipt</span>
        </div>
        <div className={styles.logoBox}>
          {receiptBrandSettings.logo ? (
            <img src={receiptBrandSettings.logo} alt="logo" className={styles.logoBoxImage} />
          ) : (
            <span className={styles.logoBoxText}>LOGO</span>
          )}
        </div>
      </div>

      <div className={styles.infoRow}>
        <div className={styles.infoBox}>
          <div className={styles.infoBoxLabel}>Issued to:</div>
          <div className={styles.infoBoxName}>{customer.name}</div>
          <div className={styles.infoBoxDetail}>

            {customer.phone && 
            <div>
              <span className={styles.infoBoxIcon}><PhoneIcon /></span>
              {customer.phone} 
            </div>
            }


            {customer.email  && 
            <div>
              <span className={styles.infoBoxIcon}><EmailIcon /></span>
              {customer.email } 
            </div>
            }
   

            {customer.address && 
            <div>
              <span className={styles.infoBoxIcon}><LocationIcon /></span>
              {customer.address} 
            </div>
            }




          </div>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoBoxMeta}>
            <span>Receipt No. {receipt.number}<br /></span>
            <span>Date: {receipt.date}</span>
            {receipt.orderDesc && <span><br />Order: {receipt.orderDesc}</span>}
          </div>
        </div>
      </div>

      <div className={styles.tableBox}>

        <table>
          
          <thead className={styles.tableHeader}>
            <tr>

              <th className={styles.thDesc}>Description</th>
              <th className={styles.thPrice}>Unit Price</th>
              <th className={styles.thQty}>Qty</th>
              <th className={styles.thSub}>Subtotal</th>

            </tr>

          </thead>

          {receipt.items?.map((item, i) => {
            const qty        = item.qty ?? 1
            const unitPrice  = parseFloat(item.price) || 0
            const lineAmount = qty * unitPrice
            return (
              <tr key={i} className={styles.tableRow}>
                <td className={styles.tdDesc}>{item.name}</td>
                <td className={styles.tdPrice}>{formatMoney(currency, unitPrice)}</td>
                <td className={styles.tdQty}>{qty}</td>
                <td className={styles.tdSub}>{formatMoney(currency, lineAmount)}</td>
              </tr>
            )
          })}

        </table>


        <div className={styles.totalsArea}>
          {hasExtras && (
            <>
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
                  <span className={`${styles.totalsVal} ${styles.discountVal}`}>-{formatMoney(currency, discountAmount)}</span>
                </div>
              )}
              {useTax && taxAmount > 0 && (
                <div className={styles.totalsRow}>
                  <span className={styles.totalsKey}>Tax ({taxRate}%)</span>
                  <span className={styles.totalsVal}>{formatMoney(currency, taxAmount)}</span>
                </div>
              )}
            </>
          )}
          <div className={styles.grandTotalRow}>
            <span className={styles.grandTotalKey}>Order Total</span>
            <span className={styles.grandTotalVal}>{formatMoney(currency, grandTotal)}</span>
          </div>
        </div>

        {paymentRows.length > 0 && (
          <>
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

            <div className={styles.paidSummary}>
              {previouslyPaid > 0 && (
                <div className={styles.paidSummaryRow}>
                  <span className={styles.paidSummaryKey}>Previously Paid</span>
                  <span className={styles.paidSummaryVal}>{formatMoney(currency, previouslyPaid)}</span>
                </div>
              )}
              {thisPaymentTotal > 0 && (
                <div className={styles.paidSummaryRow}>
                  <span className={styles.paidSummaryKey}>This Payment</span>
                  <span className={`${styles.paidSummaryVal} ${styles.thisPaymentVal}`}>+{formatMoney(currency, thisPaymentTotal)}</span>
                </div>
              )}
              <div className={styles.totalPaidRow}>
                <span className={styles.totalPaidKey}>Total Paid</span>
                <span className={styles.totalPaidVal}>{formatMoney(currency, thisPaymentTotal + previouslyPaid)}</span>
              </div>
              {isFullyPaid ? (
                <div className={styles.paidInFullRow}>
                  <span className={styles.paidInFullKey}>✓ Paid In Full</span>
                  <span className={styles.paidInFullVal}>{formatMoney(currency, grandTotal)}</span>
                </div>
              ) : (
                <div className={styles.paidInFullRow}>
                  <span className={styles.balanceDueKey}>Balance Due</span>
                  <span className={styles.balanceDueVal}>{formatMoney(currency, balanceRemaining)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <div className={styles.footerPayLabel}>Payment Details</div>
          <div className={styles.footerDetail}>
            {receiptBrandSettings.name   && <span>Received by: {receiptBrandSettings.name}</span>}<br />
  
          </div>
        </div>

        <div className={styles.footerRight}>

          {receiptBrandSettings.name && (
            <div className={styles.brandName}>{receiptBrandSettings.name || receiptBrandSettings.ownerName}</div>

          )}

          {receiptBrandSettings.phone && (
            <div className={styles.footerContactRow}>
              <span className={styles.footerIcon}><PhoneIcon /></span>
              <span className={styles.footerContactText}>{receiptBrandSettings.phone}</span>
            </div>
          )}
          {receiptBrandSettings.email && (
            <div className={styles.footerContactRow}>
              <span className={styles.footerIcon}><EmailIcon /></span>
              <span className={styles.footerContactText}>{receiptBrandSettings.email}</span>
            </div>
          )}
          {receiptBrandSettings.website && (
            <div className={styles.footerContactRow}>
              <span className={styles.footerIcon}><WebsiteIcon /></span>
              <span className={styles.footerContactText}>{receiptBrandSettings.website}</span>
            </div>
          )}


          {receiptBrandSettings.address && (
            <div className={styles.footerContactRow}>
              <span className={styles.footerIcon}><LocationIcon /></span>
              <span className={styles.footerContactText}>{receiptBrandSettings.address}</span>
            </div>
          )}

        </div>
      </div>

      {receiptBrandSettings.footer && (
        <div className={styles.thankYou}>{receiptBrandSettings.footer || "Thank You"}  </div>
      )}
    </div>
  )
}
