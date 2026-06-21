import styles from "../styles/Template4.module.css"
import { calcTax } from "../utils/receiptUtils"
import { resolveCumulativePaid, buildPaymentRows } from "../../ReceiptViewer/utils"
import { formatMoney } from "../../../utils/moneyUtils"
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from "../components/icons/icons"
import { LogoOrName } from "../components/LogoOrBrandName/LogoOrBrandName"

const METHOD_EMOJI = {
  cash:     '💵',
  transfer: '🏦',
  card:     '💳',
}

function methodEmoji(method) {
  return METHOD_EMOJI[(method || '').toLowerCase()] ?? '🧾'
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

export function ReceiptTemplate4({ receipt, customer, receiptBrandSettings }) {

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

  const discountLabel = discountType === 'percent' ? `Discount (${discountValue}%)` : 'Discount'
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

  const hasPaymentInfo = receiptBrandSettings.name
  const hasContact     = receiptBrandSettings.phone || receiptBrandSettings.email || receiptBrandSettings.website || receiptBrandSettings.address
  const hasFooter      = hasPaymentInfo || hasContact

  return (
    <div className={styles.template}>

      <div className={styles.logoBlock}>

        <LogoOrName receiptBrandSettings={receiptBrandSettings} darkBg={false} />

      </div>

      <div className={styles.invoiceTitle} >
        Receipt
      </div>

      <div className={styles.metaRow}>
        <div className={styles.billedBlock}>
          <div className={styles.billedLabel}>Received From</div>
          <div className={styles.billedName}>{customer.name}</div>
          <div className={styles.billedDetails}>
            {customer.address && (
              <div className={styles.billedDetailLine}>
                <span className={styles.billedDetailIcon} >
                  <LocationIcon />
                </span>
                <span>{customer.address}</span>
              </div>
            )}
            {customer.phone && (
              <div className={styles.billedDetailLine}>
                <span className={styles.billedDetailIcon}>
                  <PhoneIcon />
                </span>
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className={styles.billedDetailLine}>
                <span className={styles.billedDetailIcon} >
                  <EmailIcon />
                </span>
                <span>{customer.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.invoiceNumBlock}>
          <div >Receipt #: <span className={styles.numValue}>{receipt.number}</span></div>
          <div><span className={styles.numValue}>Date: </span>{receipt.date}</div>
        </div>
      </div>

      {receipt.orderDesc && (
        <div className={styles.orderDescRow} >
          <span className={styles.orderLabel}>Order:</span>
          <span className={styles.orderDesc}>{receipt.orderDesc}</span>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr
              className={styles.tableHeadRow}
              style={{ borderTopColor: "var(--brand-primary-dark)", borderBottomColor: "var(--brand-primary-dark)" }}
            >
              <th className={styles.thDesc}  style={{ color: "var(--brand-primary-dark)" }}>Description</th>
              <th className={styles.thQty}   style={{ color: "var(--brand-primary-dark)", borderLeftColor: "var(--brand-primary-dark)" }}>Qty</th>
              <th className={styles.thPrice} style={{ color: "var(--brand-primary-dark)", borderLeftColor: "var(--brand-primary-dark)" }}>Unit Price</th>
              <th className={styles.thTotal} style={{ color: "var(--brand-primary-dark)", borderLeftColor: "var(--brand-primary-dark)" }}>Total</th>
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
                  <td className={styles.tdQty}   style={{ borderLeftColor: "var(--brand-primary-dark)" }}>{qty}</td>
                  <td className={styles.tdPrice} style={{ borderLeftColor: "var(--brand-primary-dark)" }}>{formatMoney(currency, unitPrice)}</td>
                  <td className={styles.tdTotal} style={{ borderLeftColor: "var(--brand-primary-dark)" }}>{formatMoney(currency, lineAmount)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className={styles.tableFooterRule} style={{ borderTopColor: "var(--brand-primary-dark)" }} />
            </tr>
          </tfoot>
        </table>

        {hasExtras && (
          <div className={styles.breakdownBlock}>
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
                <span className={styles.breakdownKey}>VAT ({taxRate}%)</span>
                <span className={styles.breakdownVal}>{formatMoney(currency, taxAmount)}</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.orderTotalWrap}>
          <div className={styles.orderTotalLabel}>Order Total</div>
          <div className={styles.orderTotalValue}>{formatMoney(currency, grandTotal)}</div>
        </div>
      </div>

      {paymentRows.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historyHeading} style={{ color: "var(--brand-primary-dark)" }}>
            Payment History
          </div>
          {paymentRows.map((payment, index) => {
            const isCurrent = payment._isCurrent
            const method    = payment.method || ''

            return (
              <div key={payment.id ?? index} className={styles.historyRow}>
                <span className={styles.emoji}>{methodEmoji(method)}</span>
                <div className={styles.paymentMeta}>
                  <div className={styles.paymentMethod} style={{ color: "var(--brand-primary-dark)" }}>
                    {capitalize(method)}
                    {isCurrent && <span className={styles.latestBadge}>Latest</span>}
                  </div>
                  <div className={styles.paymentDate}>
                    {payment.date}{payment.time ? ` · ${payment.time}` : ''}
                  </div>
                </div>
                <span className={`${styles.historyAmount} ${isCurrent ? styles.amountCurrent : ''}`}>
                  {formatMoney(currency, payment.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.totalsSection}>
        <div className={styles.totalsBlock}>
          {previouslyPaid > 0 && (
            <div className={styles.totalsRow}>
              <span className={styles.tLabel} style={{ color: "var(--brand-primary-dark)" }}>Previously Paid</span>
              <span className={styles.tVal}>{formatMoney(currency, previouslyPaid)}</span>
            </div>
          )}
          {thisPaymentTotal > 0 && (
            <div className={styles.totalsRow}>
              <span className={styles.tLabel} style={{ color: "var(--brand-primary-dark)" }}>This Payment</span>
              <span className={`${styles.tVal} ${styles.tValPaid}`}>+{formatMoney(currency, thisPaymentTotal)}</span>
            </div>
          )}
          <div className={styles.totalDueRow} >
            <span className={styles.grandTotalLabel}>Total Paid</span>
            <span className={styles.tdVal}>{formatMoney(currency, thisPaymentTotal + previouslyPaid)}</span>
          </div>

          {!isFullyPaid ? (
            <div className={styles.balanceRow}>
              <span className={styles.balanceLabel}>Balance</span>
              <span className={styles.balanceVal}>{formatMoney(currency, balanceRemaining)}</span>
            </div>
          ) : (
            <div className={styles.paidRow}>
              <span className={styles.paidLabel}>Paid In Full</span>
              <span className={styles.paidVal}>{formatMoney(currency, grandTotal)}</span>
            </div>
          )}

        </div>
      </div>

      {hasFooter && (
        <div className={styles.footer}>
          {hasPaymentInfo ? (
            <div className={styles.footerItem}>
              <div className={styles.footerHeading}>Payment Details</div>
              {receiptBrandSettings.name  && <div >Received By: {receiptBrandSettings.name}</div>}
            </div>
          ) : (
            <div />
          )}

          {hasContact && (
            <div className={styles.footerItem}>
          
              <div className={styles.brandName}>{receiptBrandSettings.name || receiptBrandSettings.ownerName}</div>
              {receiptBrandSettings.phone && (
                <div className={styles.iconRow}>
                  <span className={styles.icon} style={{ color: "var(--brand-primary-dark)" }}><PhoneIcon /></span>
                  <span>{receiptBrandSettings.phone}</span>
                </div>
              )}
              {receiptBrandSettings.email && (
                <div className={styles.iconRow}>
                  <span className={styles.icon} style={{ color: "var(--brand-primary-dark)" }}><EmailIcon /></span>
                  <span>{receiptBrandSettings.email}</span>
                </div>
              )}
              {receiptBrandSettings.website && (
                <div className={styles.iconRow}>
                  <span className={styles.icon} style={{ color: "var(--brand-primary-dark)" }}><WebsiteIcon /></span>
                  <span>{receiptBrandSettings.website}</span>
                </div>
              )}
              {receiptBrandSettings.address && (
                <div className={styles.iconRow}>
                  <span className={styles.icon} style={{ color: "var(--brand-primary-dark)" }}><LocationIcon /></span>
                  <span>{receiptBrandSettings.address}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}



