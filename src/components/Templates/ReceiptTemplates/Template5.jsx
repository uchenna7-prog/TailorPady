import styles from "../styles/Template5.module.css"
import { calcTax } from "../utils/receiptUtils"
import { ReceiptPaymentSummary } from "../components/ReceiptPaymentSummary/ReceiptPaymentSummary"
import { formatMoney } from "../../../utils/moneyUtils"
import { PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/icons"

export function ReceiptTemplate5({ receipt, customer, receiptBrandSettings }) {

  const barColor = receiptBrandSettings.colour || '#0A0A0A'
  const { currency, showTax, receiptTaxRate: receiptBrandSettingsTaxRate } = receiptBrandSettings

  const subtotal = receipt.items?.length > 0
    ? receipt.items.reduce((sum, item) => sum + ((item.qty ?? 1) * (parseFloat(item.price) || 0)), 0)
    : 0

  const shippingFee = parseFloat(receipt.shippingFee) || 0
  const discountAmount = parseFloat(receipt.discountAmount) || 0
  const discountType = receipt.discountType || null
  const discountValue = parseFloat(receipt.discountValue) || 0
  const useTax = receipt.taxRate != null ? receipt.taxRate > 0 : (showTax && receiptBrandSettingsTaxRate > 0)
  const taxRate = receipt.taxRate != null ? receipt.taxRate : receiptBrandSettingsTaxRate
  const taxAmount = parseFloat(receipt.taxAmount) || calcTax(subtotal, taxRate, useTax)
  const grandTotal = receipt.totalAmount != null
    ? parseFloat(receipt.totalAmount)
    : subtotal + shippingFee - discountAmount + taxAmount

  const discountLabel = discountType === 'percent'
    ? `Discount (${discountValue}%)`
    : 'Discount'

  const hasExtras = shippingFee > 0 || discountAmount > 0 || (useTax && taxAmount > 0)

  return (

    <div className={styles.template}>

      <div className={styles.bar}/>

        <div className={styles.body}>

          <div className={styles.headerSplit}>

            <div className={styles.title}>receipt</div>

            <div style={{ textAlign : 'right', fontSize : 9 }}>
              <div className={styles.receiptInfos}>
                <span>ISSUE DATE</span>
                <span><strong>{receipt.date}</strong></span>
              </div>
              <div className={styles.receiptInfos}>
                <span>receipt # </span>
                <span><strong>{receipt.number}</strong></span>
              </div>
            </div>

          </div>

          <div className={styles.metaRow}>

            <div className={styles.metaItem}>

              <div className={styles.metaLabel}>RECEIVED BY</div>
              <div className={styles.metaValName}>{receiptBrandSettings.name}</div>
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
              {receiptBrandSettings.address && (
                <div className={styles.iconRow}>
                  <span className={styles.icon}><LocationIcon /></span>
                  <span>{receiptBrandSettings.address}</span>
                </div>
              )}

            </div>

            <div className={styles.metaItem}>

              <div className={styles.metaLabel}>RECEIVED FROM</div>
              <div className={styles.metaValName}>{customer.name}</div>
              {customer.phone && (
                <div className={styles.iconRow}>
                  <span className={styles.icon}><PhoneIcon /></span>
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className={styles.iconRow} >
                  <span className={styles.icon}><EmailIcon /></span>
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className={styles.iconRow} >
                  <span className={styles.icon}><LocationIcon /></span>
                  <span>{customer.address}</span>
                </div>
              )}

            </div>

          </div>

          <div className={styles.table}>

            <div className={styles.orderDescriptionRow}>
              <div className={styles.orderText}>ORDER:</div>
              <div className={styles.orderDescLabel}>{receipt.orderDesc || 'Garment Order'}</div>
            </div>

            <table
              className={styles.tableEl}
              style={{ borderColor : barColor }}
            >
              <thead>
                <tr className={styles.tableHeader} style={{ borderColor : barColor }}>
                  <th className={styles.colDesc}>Item Description</th>
                  <th className={styles.colPrice}>Unit Price</th>
                  <th className={styles.colQty}>Qty</th>
                  <th className={styles.colTotal}>Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items?.map((item, i) => {
                  const qty = item.qty ?? 1;
                  const unitPrice = parseFloat(item.price) || 0;
                  const lineAmount = qty * unitPrice;

                  return (
                    <tr key={i} className={styles.tableRow}>
                      <td className={styles.colDesc}>{item.name}</td>
                      <td className={styles.colPrice}>{formatMoney(currency, unitPrice)}</td>
                      <td className={styles.colQty}>{qty}</td>
                      <td className={styles.colTotal}>{formatMoney(currency, lineAmount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div>

              <div className={styles.summarySection}>

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

            </div>

            <ReceiptPaymentSummary receipt={receipt} receiptBrandSettings={receiptBrandSettings} />

          </div>

          {receiptBrandSettings.accountBank && (

            <div className={styles.footer}>
              <div className={styles.footerSection}>
                <strong style={{fontWeight :900,color :"var(--brand-primary-dark)"}}>Payment Details</strong><br />

                <div>

                  {receiptBrandSettings.name && (
                    <div>Received By: {receiptBrandSettings.name}</div>
                  )}

                </div>

              </div>
              {receiptBrandSettings.footer && (
                <div className={styles.footerSection}>
                  <strong style={{fontWeight :900,color :"var(--brand-primary-dark)"}}>Notes</strong><br />{receiptBrandSettings.footer}
                </div>
              )}
            </div>
          )}

        </div>

    </div>
  )
}