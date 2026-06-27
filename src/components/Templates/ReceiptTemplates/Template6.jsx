import styles from '../styles/Template6.module.css'
import { calcTax } from '../utils/receiptUtils'
import { resolveCumulativePaid, buildPaymentRows } from '../../ReceiptViewer/utils'
import { formatMoney } from '../../../utils/moneyUtils'
import { LogoOrName } from '../components/LogoOrBrandName/LogoOrBrandName'
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from '../components/icons/icons'

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

export function ReceiptTemplate6({ receipt, customer, receiptBrandSettings }) {
  const accentColor = receiptBrandSettings.colour || '#7c3aed'

  const { currency, showTax, receiptTaxRate: receiptBrandSettingsTaxRate } = receiptBrandSettings

  const subtotal       = receipt.items?.length > 0
    ? receipt.items.reduce((sum, item) => sum + ((item.qty ?? 1) * (parseFloat(item.price) || 0)), 0)
    : 0
  const shippingFee    = parseFloat(receipt.shippingFee)   || 0
  const discountAmount = parseFloat(receipt.discountAmount) || 0
  const discountType   = receipt.discountType               || null
  const discountValue  = parseFloat(receipt.discountValue)  || 0
  const useTax         = receipt.taxRate != null ? receipt.taxRate > 0 : (showTax && receiptBrandSettingsTaxRate > 0)
  const taxRate        = receipt.taxRate != null ? receipt.taxRate : receiptBrandSettingsTaxRate
  const taxAmount      = parseFloat(receipt.taxAmount) || calcTax(subtotal, taxRate, useTax)
  const grandTotal     = receipt.totalAmount != null
    ? parseFloat(receipt.totalAmount)
    : subtotal + shippingFee - discountAmount + taxAmount

  const discountLabel = discountType === 'percent' ? `Discount (${discountValue}%)` : 'Discount'
  const hasExtras     = shippingFee > 0 || discountAmount > 0 || (useTax && taxAmount > 0)
  const items         = receipt.items ?? []

  const paymentRows      = buildPaymentRows(receipt)
  const previouslyPaid   = paymentRows.filter(p => !p._isCurrent).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  const thisPaymentTotal = paymentRows.filter(p => p._isCurrent).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  const totalPaid        = previouslyPaid + thisPaymentTotal

  const balanceRemaining = parseFloat(receipt.balance) >= 0
    ? parseFloat(receipt.balance)
    : Math.max(0, grandTotal - resolveCumulativePaid(receipt))

  const isFullyPaid = receipt.isFullPayment ?? (balanceRemaining <= 0)

  const gradientBackground = `
    radial-gradient(ellipse at top right, ${accentColor}45 0%, transparent 55%),
    radial-gradient(ellipse at bottom left, ${accentColor}38 0%, transparent 50%),
    #ffffff
  `

  return (
    <div className={styles.template} style={{ background: gradientBackground, '--accent-color': accentColor }}>
      <div className={styles.content}>

        <div className={styles.header}>
          <div className={styles.logoBlock}>
            <LogoOrName receiptBrandSettings={receiptBrandSettings} />
            <div>
              
              {(receiptBrandSettings.name || receiptBrandSettings.ownerName) && (
                <div className={styles.brandName}>
                  {receiptBrandSettings.name || receiptBrandSettings.ownerName}
                </div>
              )}

              {receiptBrandSettings.tagline && (
              <div className={styles.brandTagline}>{receiptBrandSettings.tagline}</div>
            )}
            </div>
          </div>

          <div className={styles.metaBlock}>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Receipt #</span>
              <span>{receipt.number}</span>
            </div>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Date</span>
              <span>{receipt.date}</span>
            </div>
          </div>
        </div>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>Receipt</h1>
        </div>

        <div className={styles.clientSection}>
          <div className={styles.clientColLeft}>
            <div className={styles.clientLabel}>Received from</div>
            <div className={styles.clientName}>{customer.name}</div>
          </div>

          <div className={styles.clientColRight}>
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

        {receipt.orderDesc && (
          <div className={styles.orderDesc}>
            <strong>Order:</strong> {receipt.orderDesc}
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
            </>
          )}

          <div className={`${styles.grandTotalRow} ${hasExtras ? styles.grandTotalWithTopBorder : ''}`}>
            <span className={styles.grandTotalKey}>Total</span>
            <span className={styles.grandTotalVal}>{formatMoney(currency, grandTotal)}</span>
          </div>
        </div>

        {paymentRows.length > 0 && (
          <div className={styles.historySection}>
            <div className={styles.historySectionLabel}>Payment History</div>
            {paymentRows.map((payment, index) => {
              const isCurrent = payment._isCurrent
              const method    = payment.method || ''
              return (
                <div key={payment.id ?? index} className={styles.historyRow}>
                  <span className={styles.historyEmoji}>{methodEmoji(method)}</span>
                  <div className={styles.historyMeta}>
                    <div className={styles.historyMethod}>
                      {capitalize(method)}
                      {isCurrent && <span className={styles.latestBadge}>Latest</span>}
                    </div>
                    <div className={styles.historyDate}>
                      {payment.date}{payment.time ? ` · ${payment.time}` : ''}
                    </div>
                  </div>
                  <span className={styles.historyAmount}>
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
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey}>Previously Paid</span>
                <span className={styles.totalsVal}>{formatMoney(currency, previouslyPaid)}</span>
              </div>
            )}
            {thisPaymentTotal > 0 && (
              <div className={styles.totalsRow}>
                <span className={styles.totalsKey}>This Payment</span>
                <span className={`${styles.totalsVal} ${styles.thisPaymentVal}`}>
                  +{formatMoney(currency, thisPaymentTotal)}
                </span>
              </div>
            )}
            {(previouslyPaid > 0 || thisPaymentTotal > 0) && (
              <div className={styles.totalPaidRow}>
                <span className={styles.totalPaidKey}>Total Paid</span>
                <span className={styles.totalPaidVal}>{formatMoney(currency, totalPaid)}</span>
              </div>
            )}
            {!isFullyPaid ? (
              <div className={styles.balanceRow}>
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
          <div className={styles.footerBrandBlock}>

            <div>
              {(receiptBrandSettings.name || receiptBrandSettings.ownerName) && (
              <div className={styles.footerBrandName}>
                {receiptBrandSettings.name || receiptBrandSettings.ownerName}
              </div>
              )}
              {receiptBrandSettings.email && (
                <div className={styles.iconRow}>
                  <span className={styles.icon}><EmailIcon /></span>
                  <span>{receiptBrandSettings.email}</span>
                </div>
              )}
              {receiptBrandSettings.phone && (
                <div className={styles.iconRow}>
                  <span className={styles.icon}><PhoneIcon /></span>
                  <span>{receiptBrandSettings.phone}</span>
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
           
            {receiptBrandSettings.name && (
              
              <div className={styles.footerRight}>
                <div className={styles.footerPayLabel}>Payment Details</div>
                Received By: {receiptBrandSettings.name}
              </div>
            )}
          </div>

          <div className={styles.signatureSection}>
            <div className={styles.signatureBlock}>
              <div className={styles.signatureLine} />
              <div className={styles.signatureLabel}>Business signature</div>
            </div>
            <div className={styles.signatureBlock}>
              <div className={styles.signatureLine} />
              <div className={styles.signatureLabel}>Client signature</div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.customerName}>{customer.name}</div>
          </div>
        </div>

      </div>
    </div>
  )
}
