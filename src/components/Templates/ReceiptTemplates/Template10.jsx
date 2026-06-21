import styles from "../styles/Template10.module.css"
import { calcTax } from "../utils/receiptUtils"
import { resolveCumulativePaid, buildPaymentRows } from "../../ReceiptViewer/utils"
import { formatMoney } from "../../../utils/moneyUtils"
import { PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/icons"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"

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

export function ReceiptTemplate10({ receipt, customer, receiptBrandSettings }) {
  const accentColor = receiptBrandSettings.colour || "#1a1a2e"
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

  const discountLabel  = discountType === "percent" ? `Discount (${discountValue}%)` : "Discount"
  const hasExtras      = shippingFee > 0 || discountAmount > 0 || (useTax && taxAmount > 0)

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

  const hasBottomInfo = receiptBrandSettings.name
    || receiptBrandSettings.phone
    || receiptBrandSettings.email
    || receiptBrandSettings.address
    || receiptBrandSettings.website

  return (
    <div className={styles.template}>

      <div className={styles.header} style={{ background: accentColor }}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <LogoOrName receiptBrandSettings={receiptBrandSettings} darkBg={true} />
            <div className={styles.brandInfo}>
              <div className={styles.brandName}>{receiptBrandSettings.name || receiptBrandSettings.ownerName}</div>
              {receiptBrandSettings.tagline && (
                <div className={styles.brandTagline}>{receiptBrandSettings.tagline}</div>
              )}
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.invoiceLabel}>RECEIPT</div>
          </div>
        </div>

        <ThornBorder />
      </div>

      <div className={styles.clientRow}>
        <div className={styles.clientBlock}>
          <div className={styles.sectionLabel} style={{ color: accentColor }}>Received From</div>
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
              <span className={styles.metaKey}>Receipt #:</span>
              <span className={styles.metaVal}>{receipt.number}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Date:</span>
              <span className={styles.metaVal}>{receipt.date}</span>
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

      <div className={styles.tableWrapper}>
        <table className={styles.tableSection}>
          <thead>
            <tr className={styles.tableHeader} style={{ background: accentColor }}>
              <th className={styles.thDesc}>Description</th>
              <th className={styles.thQty}>Qty</th>
              <th className={styles.thPrice}>Unit Price</th>
              <th className={styles.thTotal}>Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items?.map((item, i) => {
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

      <div className={styles.orderTotalsBlock}>
        {hasExtras && (
          <div className={styles.breakdownSection}>
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownKey}>Subtotal</span>
              <span className={styles.breakdownVal}>{formatMoney(currency, subtotal)}</span>
            </div>
            {shippingFee > 0 && (
              <div className={styles.breakdownRow}>
                <span className={styles.breakdownKey}>Shipping &amp; Delivery</span>
                <span className={styles.breakdownVal}>{formatMoney(currency, shippingFee)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className={styles.breakdownRow}>
                <span className={`${styles.breakdownKey} ${styles.breakdownKeyDiscount}`}>{discountLabel}</span>
                <span className={`${styles.breakdownVal} ${styles.breakdownValDiscount}`}>−{formatMoney(currency, discountAmount)}</span>
              </div>
            )}
            {useTax && taxAmount > 0 && (
              <div className={styles.breakdownRow}>
                <span className={styles.breakdownKey}>Tax ({taxRate}%)</span>
                <span className={styles.breakdownVal}>{formatMoney(currency, taxAmount)}</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.orderTotalWrap}>
          <span className={styles.orderTotalLabel}>Order Total</span>
          <span className={styles.orderTotalValue}>{formatMoney(currency, grandTotal)}</span>
        </div>
      </div>

      {paymentRows.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.sectionLabel} style={{ color: accentColor }}>Payment History</div>
          {paymentRows.map((payment, index) => {
            const isCurrent = payment._isCurrent
            const method    = payment.method || ""
            return (
              <div
                key={payment.id ?? index}
                className={styles.paymentRow}
                style={{ borderBottom: "1px solid #eaeaea" }}
              >
                <span className={styles.emoji}>{methodEmoji(method)}</span>
                <div className={styles.paymentMeta}>
                  <div className={styles.paymentMethod} style={{ color: accentColor }}>
                    {capitalize(method)}
                    {isCurrent && <span className={styles.latestBadge}>Latest</span>}
                  </div>
                  <div className={styles.paymentDate}>
                    {payment.date}{payment.time ? ` · ${payment.time}` : ""}
                  </div>
                </div>
                <span
                  className={`${styles.paymentAmount} ${isCurrent ? styles.amountCurrent : ""}`}
                  style={{ color: accentColor }}
                >
                  {formatMoney(currency, payment.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.footerSection}>
        <div className={styles.footerLeft} />
        <div className={styles.footerRight}>
          <div className={styles.totalsBlock}>
            {previouslyPaid > 0 && (
              <div className={styles.totalRow}>
                <span className={styles.totalRowLabel}>Previously Paid</span>
                <span className={styles.totalRowValue}>{formatMoney(currency, previouslyPaid)}</span>
              </div>
            )}
            {thisPaymentTotal > 0 && (
              <div className={styles.totalRow}>
                <span className={styles.totalRowLabel}>This Payment</span>
                <span className={styles.totalRowValue}>+{formatMoney(currency, thisPaymentTotal)}</span>
              </div>
            )}
            <div className={styles.grandTotalRow} style={{ background: accentColor }}>
              <span className={styles.grandLabel}>Total Paid</span>
              <span className={styles.grandValue}>{formatMoney(currency, thisPaymentTotal + previouslyPaid)}</span>
            </div>
            {!isFullyPaid ? (
              <div className={styles.balanceRow}>
                <span className={styles.balanceLabel}>Balance</span>
                <span className={styles.balanceValue}>{formatMoney(currency, balanceRemaining)}</span>
              </div>
            ) : (
              <div className={styles.paidRow}>
                <span className={styles.paidLabel}>Paid In Full</span>
                <span className={styles.paidValue}>{formatMoney(currency, grandTotal)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasBottomInfo && (
        <div className={styles.bottomInfoSection}>
          {receiptBrandSettings.name && (
            <div className={styles.bottomInfoLeft}>
              <div className={styles.bottomInfoLabel}>Payment Details</div>
              {receiptBrandSettings.name && (
                <div className={styles.bottomInfoDetail}>Received By: {receiptBrandSettings.name}</div>
              )}
            </div>
          )}

          <div className={styles.bottomInfoRight}>
            <div className={styles.bottomInfoLabel}>Contact</div>
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
                <span className={styles.icon}><LocationIcon /></span>
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
      )}

      <div className={styles.thankYouText}>
        {receiptBrandSettings.footer || "Thank you for your business. Your payment has been received."}
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









