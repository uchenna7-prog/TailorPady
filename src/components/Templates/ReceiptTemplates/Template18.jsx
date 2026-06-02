import styles from "../styles/Template18.module.css"
import { calcTax } from "../utils/receiptUtils"
import { ReceiptPaymentSummary } from "../components/ReceiptPaymentSummary/ReceiptPaymentSummary"
import { formatMoney } from "../../../utils/moneyUtils"
import { PhoneIcon, EmailIcon, LocationIcon, WebsiteIcon } from "../components/icons/icons"


export function ReceiptTemplate18({ receipt, customer, receiptBrandSettings }) {
  const { currency, showTax, receiptTaxRate: receiptBrandSettingsTaxRate } = receiptBrandSettings

  const subtotal = receipt.items?.length > 0
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

  return (
    <div className={styles.template}>

      <div className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          {(receiptBrandSettings.name || receiptBrandSettings.ownerName || 'Your Business').toUpperCase()}
        </div>
        <div className={styles.sidebarBottom}>Receipt</div>
      </div>

      <div className={styles.main}>

        <div className={styles.topSection}>
          <div className={styles.billTo}>
            <div className={styles.billToLabel}>Received From</div>
            <div className={styles.billToName}>{customer.name}</div>
            {customer.phone && (
              <div className={`${styles.billToDetail} ${styles.noWrap}`}>
                <span className={styles.icon}><PhoneIcon /></span>
                {customer.phone}
              </div>
            )}
            {customer.address && (
              <div className={styles.billToDetail}>
                <span className={styles.icon}><LocationIcon /></span>
                {customer.address}
              </div>
            )}
            {customer.email && (
              <div className={styles.billToDetail}>
                <span className={styles.icon}><EmailIcon /></span>
                {customer.email}
              </div>
            )}
          </div>

          <div className={styles.metaBlock}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Date:</span>
              <span className={styles.metaVal}>{receipt.date}</span>
            </div>
            <div className={styles.metaInvoiceRow}>
              <span className={styles.metaInvoiceKey}>Receipt No:</span>
              <span className={styles.metaInvoiceVal}>{receipt.number}</span>
            </div>
          </div>
        </div>

        {receipt.orderDesc && (
          <div className={styles.orderDescRow}>
            <span className={styles.orderDescLabel}>Order:</span>
            <span className={styles.orderDescVal}>{receipt.orderDesc}</span>
          </div>
        )}

        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHead}>
              <th className={styles.colDesc}>Description</th>
              <th className={styles.colPrice}>Price</th>
              <th className={styles.colQty}>Qty</th>
              <th className={styles.colTotal}>Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items?.map((item, i) => {
              const qty        = item.qty ?? 1
              const unitPrice  = parseFloat(item.price) || 0
              const lineAmount = qty * unitPrice
              return (
                <tr key={i} className={styles.tableRow}>
                  <td className={styles.colDesc}>{item.name}</td>
                  <td className={styles.colPrice}>{formatMoney(currency, unitPrice)}</td>
                  <td className={styles.colQty}>{qty}</td>
                  <td className={styles.colTotal}>{formatMoney(currency, lineAmount)}</td>
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
                  <span className={styles.totalsKey}>Shipping &amp; Delivery</span>
                  <span className={styles.totalsVal}>{formatMoney(currency, shippingFee)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className={styles.totalsRow}>
                  <span className={`${styles.totalsKey} ${styles.totalsKeyDiscount}`}>{discountLabel}</span>
                  <span className={`${styles.totalsVal} ${styles.totalsValDiscount}`}>−{formatMoney(currency, discountAmount)}</span>
                </div>
              )}
              {useTax && taxAmount > 0 && (
                <div className={styles.totalsRow}>
                  <span className={styles.totalsKey}>VAT ({taxRate}%)</span>
                  <span className={styles.totalsVal}>{formatMoney(currency, taxAmount)}</span>
                </div>
              )}
            </>
          )}
          <div className={styles.orderTotalRow}>
            <span className={styles.totalsKeyFinal}>Order Total</span>
            <span className={styles.totalsValFinal}>{formatMoney(currency, grandTotal)}</span>
          </div>
        </div>

        <ReceiptPaymentSummary receipt={receipt} receiptBrandSettings={receiptBrandSettings} isDark />

        <div className={styles.bottomSection}>
          {(receiptBrandSettings.accountBank || receiptBrandSettings.name || receiptBrandSettings.ownerName) && (
            <div>
              <div className={styles.payableLabel}>Received By</div>
              <div className={styles.payableName}>{receiptBrandSettings.name || receiptBrandSettings.ownerName}</div>
             
              {receiptBrandSettings.phone && (
                <div className={`${styles.payableDetail} ${styles.noWrap}`}>
                  <span className={styles.icon}><PhoneIcon /></span>
                  {receiptBrandSettings.phone}
                </div>
              )}
              {receiptBrandSettings.email && (
                <div className={styles.payableDetail}>
                  <span className={styles.icon}><EmailIcon /></span>
                  {receiptBrandSettings.email}
                </div>
              )}
              {receiptBrandSettings.website && (
                <div className={styles.payableDetail}>
                  <span className={styles.icon}><WebsiteIcon /></span>
                  {receiptBrandSettings.website}
                </div>
              )}
              {receiptBrandSettings.address && (
                <div className={styles.payableDetail}>
                  <span className={styles.icon}><LocationIcon /></span>
                  {receiptBrandSettings.address}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {receiptBrandSettings.footer || 'Thank you for your business.'}
        </div>

      </div>
    </div>
  )
}