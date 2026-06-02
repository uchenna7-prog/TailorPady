import styles from "../styles/Template17.module.css"
import { calcTax } from "../utils/receiptUtils"
import { resolveCumulativePaid, buildPaymentRows } from "../../ReceiptViewer/utils"
import { formatMoney } from "../../../utils/moneyUtils"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"
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


export function ReceiptTemplate17({ receipt, customer, receiptBrandSettings }) {
  const accentColor = receiptBrandSettings.colour || "#7a1a1a"
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

  const totalPaid = previouslyPaid + thisPaymentTotal

  const balanceRemaining = parseFloat(receipt.balance) >= 0
    ? parseFloat(receipt.balance)
    : Math.max(0, grandTotal - resolveCumulativePaid(receipt))

  const isFullyPaid = receipt.isFullPayment ?? (balanceRemaining <= 0)

  return (
    <div className={styles.template}>

      <div className={styles.sidebar}>
        <div className={styles.sidebarTitle} style={{ color: accentColor }}>RECEIPT</div>
      </div>

      <div className={styles.main}>

        <div className={styles.topSection}>

          <div className={styles.headerRow}>

            <div className={styles.logoBlock}>
              <LogoOrName receiptBrandSettings={receiptBrandSettings} />
              <div className={styles.brandTextBlock}>
                <div className={styles.brandName} style={{ color: "var(--brand-primary-dark)" }}>
                  {receiptBrandSettings.name || receiptBrandSettings.ownerName}
                </div>
                {receiptBrandSettings.tagline && (
                  <div className={styles.brandTagline}>{receiptBrandSettings.tagline}</div>
                )}
              </div>
            </div>

            <div className={styles.metaBlock}>
              <div className={styles.invoiceMetaLine}>
                <span className={styles.metaKey}>Receipt #:</span>
                <span className={styles.metaVal}>{receipt.number}</span>
              </div>
              <div className={styles.invoiceMetaLine}>
                <span className={styles.metaKey}>Date:</span>
                <span className={styles.metaVal}>{receipt.date}</span>
              </div>
            </div>
          </div>

          <div className={styles.clientRow}>
            <strong style={{ color: "var(--brand-primary-dark)" }}>RECEIVED FROM</strong>
            <div className={styles.clientBlock}>
              <div className={styles.clientName}>{customer.name}</div>
              <div className={styles.clientDetail}>
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
          </div>

        </div>

        {receipt.orderDesc && (
          <div className={styles.orderDescriptionRow}>
            <strong style={{ color: "#1a1a1a" }}>Order: </strong>{receipt.orderDesc}
          </div>
        )}

        <table className={styles.tableSection}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.thDesc}>Description</th>
              <th className={styles.thQty}>Qty</th>
              <th className={styles.thRate}>Unit Price</th>
              <th className={styles.thTotal}>Total</th>
            </tr>
          </thead>

          <tbody className={styles.tableBody}>
            {receipt.items?.map((item, i) => {
              const qty        = item.qty ?? 1
              const unitPrice  = parseFloat(item.price) || 0
              const lineAmount = qty * unitPrice
              return (
                <tr key={i} className={styles.tableRow}>
                  <td className={styles.tdItemName}>{item.name}</td>
                  <td className={styles.tdQty}>{qty}</td>
                  <td className={styles.tdRate}>{formatMoney(currency, unitPrice)}</td>
                  <td className={styles.tdTotal}>{formatMoney(currency, lineAmount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className={styles.totalsSection}>
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
            <span className={styles.grandTotalKey}>Total</span>
            <span className={styles.grandTotalVal}>{formatMoney(currency, grandTotal)}</span>
          </div>
        </div>

        {paymentRows.length > 0 && (
          <div className={styles.historySection}>
            <div className={styles.historySectionLabel} style={{ color: accentColor }}>
              Payment History
            </div>
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
            {previouslyPaid > 0 && (
              <div>
                <span className={styles.totalsKey}>Previously Paid</span>
                <span className={styles.totalsVal}>{formatMoney(currency, previouslyPaid)}</span>
              </div>
            )}
            {thisPaymentTotal > 0 && (
              <div>
                <span className={styles.totalsKey}>This Payment</span>
                <span className={styles.totalsVal}>+{formatMoney(currency, thisPaymentTotal)}</span>
              </div>
            )}
            {(previouslyPaid > 0 || thisPaymentTotal > 0) && (
              <div className={styles.totalPaidRow}>
                <span className={styles.totalPaidKey}>Total Paid</span>
                <span className={styles.totalPaidVal}>{formatMoney(currency, totalPaid)}</span>
              </div>
            )}
            {!isFullyPaid ? (
              <div className={styles.balanceCallout}>
                <span className={styles.balanceKey}>Balance Due</span>
                <span className={styles.balanceVal}>{formatMoney(currency, balanceRemaining)}</span>
              </div>
            ) : (
              <div className={styles.paidCallout}>
                <span className={styles.paidKey}>Paid In Full</span>
                <span className={styles.paidVal}>{formatMoney(currency, grandTotal)}</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.footer}>

          {receiptBrandSettings.accountBank && (
            <div className={styles.footerLeft}>
              <div className={styles.footerPayLabel}>Payment Details</div>
              {receiptBrandSettings.accountName && (
                <span>Received By: {receiptBrandSettings.accountName}<br /></span>
              )}
            </div>
          )}

          <div className={styles.footerRight}>
            {(receiptBrandSettings.name || receiptBrandSettings.ownerName) && (
              <div className={styles.footerBrand}>
                {receiptBrandSettings.name || receiptBrandSettings.ownerName}
              </div>
            )}
            {receiptBrandSettings.phone && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><PhoneIcon /></span>
                <span>{receiptBrandSettings.phone}</span>
              </div>
            )}
            {receiptBrandSettings.email && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><EmailIcon /></span>
                <span>{receiptBrandSettings.email}</span>
              </div>
            )}
            {receiptBrandSettings.website && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><WebsiteIcon /></span>
                <span>{receiptBrandSettings.website}</span>
              </div>
            )}
            {receiptBrandSettings.address && (
              <div className={styles.iconRow}>
                <span className={styles.icon}><LocationIcon /></span>
                <span>{receiptBrandSettings.address}</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}