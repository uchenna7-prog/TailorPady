import styles from "../styles/Template17.module.css"
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


export function ReceiptTemplate17({ receipt, customer, receiptBrandSettings }) {
  const accentColor = receiptBrandSettings.colour || '#3131A7'
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

  const isFullyPaid  = receipt.isFullPayment ?? (balanceRemaining <= 0)
  const brandInitial = (receiptBrandSettings.name || receiptBrandSettings.ownerName || 'B').charAt(0).toUpperCase()

  const hasContact = receiptBrandSettings.phone || receiptBrandSettings.email || receiptBrandSettings.website || receiptBrandSettings.address

  return (
    <div className={styles.template}>

      <div className={styles.topShapeWrap}>
        <svg viewBox="0 0 300 150" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 'auto' }}>
          <path fill={accentColor} d="M0 0 H300 V150 H120 Q60 150 40 90 L0 0 Z" />
        </svg>
      </div>

      <div className={styles.content}>

        <div className={styles.logoBlock}>

          <LogoOrName receiptBrandSettings={receiptBrandSettings} darkBg={false} />

          <div className={styles.logoText}>
            <div className={styles.brandName} style={{ color: accentColor }}>
              {receiptBrandSettings.name || receiptBrandSettings.ownerName}
            </div>
            {receiptBrandSettings.tagline && (
              <div className={styles.brandTagline}>{receiptBrandSettings.tagline}</div>
            )}
          </div>
        </div>

        <div className={styles.topInfo}>
          <div className={styles.billBlock}>
            
            <div className={styles.billLabel}>Receipt To</div>
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
            <div className={styles.invoiceTitle} style={{ color: accentColor }}>RECEIPT</div>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Receipt:</span>
              <span className={styles.metaVal}>{receipt.number}</span>
            </div>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Date:</span>
              <span className={styles.metaVal}>{receipt.date}</span>
            </div>
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
                    <path fill={accentColor} d="M0 0 H420 L455 34 H0 Z" />
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
            <tbody className={styles.tableBody}>
              {receipt.items?.map((item, i) => {
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
                <span className={`${styles.breakdownKey} ${styles.discountKey}`}>{discountLabel}</span>
                <span className={`${styles.breakdownVal} ${styles.discountVal}`}>-{formatMoney(currency, discountAmount)}</span>
              </div>
            )}
            {useTax && taxAmount > 0 && (
              <div className={styles.breakdownRow}>
                <span className={styles.breakdownKey}>VAT ({taxRate}%)</span>
                <span className={styles.breakdownVal}>{formatMoney(currency, taxAmount)}</span>
              </div>
            )}
            <div className={styles.orderTotalRow}>
              <span className={styles.orderTotalKey}>Order Total</span>
              <span className={styles.orderTotalVal}>{formatMoney(currency, grandTotal)}</span>
            </div>
          </div>
        )}

        {!hasExtras && (
          <div className={styles.orderTotalRowStandalone}>
            <span className={styles.orderTotalKey}>Order Total</span>
            <span className={styles.orderTotalVal}>{formatMoney(currency, grandTotal)}</span>
          </div>
        )}

        {paymentRows.length > 0 && (
          <div className={styles.historySection}>
            <div className={styles.historySectionLabel} style={{ color: accentColor }}>
              Payment History
            </div>
            {paymentRows.map((payment, index) => {
              const isCurrent = payment._isCurrent
              const method    = payment.method || ''
              return (
                <div key={payment.id ?? index} className={styles.paymentHistoryRow}>
                  <span className={styles.paymentMethodIcon}>
                    {methodEmoji(method)}
                  </span>
                  <div className={styles.paymentHistoryMeta}>
                    <div className={styles.paymentHistoryMethod} style={{ color: accentColor }}>
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
                <div className={styles.paymentHeading} style={{ color: accentColor }}>Payment Details</div>
                <div className={styles.paymentDetails}>
                  {receiptBrandSettings.name && <span>Received By: {receiptBrandSettings.name}</span>}
                </div>
              </>
            )}
          </div>

          <div className={styles.totalsBlock}>
            {showTax && taxRate > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey}>Tax ({taxRate}%)</span>
                <span className={styles.totalsVal}>{formatMoney(currency, tax)}</span>
              </div>
            )}
            {paymentRows.length > 0 && previouslyPaid > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey} style={{ color: accentColor }}>Previously Paid</span>
                <span className={styles.totalsVal} style={{ color: accentColor }}>{formatMoney(currency, previouslyPaid)}</span>
              </div>
            )}
            {paymentRows.length > 0 && thisPaymentTotal > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey} style={{ color: accentColor }}>This Payment</span>
                <span className={`${styles.totalsVal} ${styles.amountPaid}`}>+{formatMoney(currency, thisPaymentTotal)}</span>
              </div>
            )}

            <div className={styles.grandTotalBox}>
              <svg className={styles.grandTotalSvg} viewBox="0 0 400 34" preserveAspectRatio="none">
                <path fill="var(--brand-muted)" d="M0 6 H110 L135 34 H0 Z" />
                <path fill={accentColor} d="M100 0 H400 V34 H135 Z" />
              </svg>
              <div className={styles.grandTotalContent}>
                <span className={styles.grandTotalLabel}>Total</span>
                <span className={styles.grandTotalVal}>{formatMoney(currency, thisPaymentTotal + previouslyPaid)}</span>
              </div>
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
              <span className={styles.contactStripItem}>
                <span className={styles.contactStripIcon}><PhoneIcon /></span>
                <span className={styles.contactStripText}>{receiptBrandSettings.phone}</span>
              </span>
            )}
            {receiptBrandSettings.email && (
              <span className={styles.contactStripItem}>
                <span className={styles.contactStripIcon}><EmailIcon /></span>
                <span className={styles.contactStripText}>{receiptBrandSettings.email}</span>
              </span>
            )}
            {receiptBrandSettings.website && (
              <span className={styles.contactStripItem}>
                <span className={styles.contactStripIcon}><WebsiteIcon /></span>
                <span className={styles.contactStripText}>{receiptBrandSettings.website}</span>
              </span>
            )}
            {receiptBrandSettings.address && (
              <span className={styles.contactStripItem}>
                <span className={styles.contactStripIcon}><LocationIcon /></span>
                <span className={styles.contactStripText}>{receiptBrandSettings.address}</span>
              </span>
            )}
          </div>
        )}

      </div>

      <div className={styles.bottomShapeRow}>
        <div className={styles.bottomShapeSvgWrap}>
          <svg viewBox="0 0 500 100" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
            <path fill={accentColor} d="M0 0 H280 Q345 0 365 50 L390 100 H0 Z" />
          </svg>
        </div>
        {receiptBrandSettings.footer && (
          <div className={styles.bottomShapeNote}>
            {receiptBrandSettings.footer}
          </div>
        )}
      </div>

    </div>
  )
}

