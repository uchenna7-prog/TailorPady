import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header, { BotIcon } from '../../components/Header/Header'
import BottomNav      from '../../components/BottomNav/BottomNav'
import InvoiceViewer  from '../../components/InvoiceViewer/InvoiceViewer'
import ReceiptViewer  from '../../components/ReceiptViewer/ReceiptViewer'
import OrderMosaic    from '../../components/OrderMosaic/OrderMosaic'
import { useAgent, useAutonomousAgent } from '../../contexts/AgentContext'
import { useOrders }          from '../../contexts/OrdersContext'
import { useInvoices }        from '../../contexts/InvoiceContext'
import { useReceipts }        from '../../contexts/ReceiptContext'
import { usePayments }        from '../../contexts/PaymentContext'
import { useCustomers }       from '../../contexts/CustomerContext'
import { useAuth }            from '../../contexts/AuthContext'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import styles from './Agent.module.css'

function AgentTitleIcon() {
  return <BotIcon size={28} />
}

const ICON_META = {
  invoice:  { icon: 'receipt_long',           color: 'var(--accent)'  },
  receipt:  { icon: 'payments',               color: '#22c55e'        },
  message:  { icon: 'chat_bubble',            color: '#3b82f6'        },
  reminder: { icon: 'notification_important', color: 'var(--accent)'  },
  brief:    { icon: 'summarize',              color: 'var(--text2)'   },
  flag:     { icon: 'flag',                   color: 'var(--accent)'  },
  pickup:   { icon: 'storefront',             color: '#a855f7'        },
  birthday: { icon: 'cake',                   color: '#ec4899'        },
  followup: { icon: 'person_search',          color: '#3b82f6'        },
}

const ICON_BG = {
  invoice:  'rgba(255,149,0,0.12)',
  receipt:  'rgba(34,197,94,0.12)',
  message:  'rgba(59,130,246,0.12)',
  reminder: 'rgba(255,149,0,0.12)',
  brief:    'rgba(120,120,128,0.14)',
  flag:     'rgba(255,149,0,0.12)',
  pickup:   'rgba(168,85,247,0.12)',
  birthday: 'rgba(236,72,153,0.12)',
  followup: 'rgba(59,130,246,0.12)',
}

const TAG_COLORS = {
  Invoice:     { bg: 'rgba(255,149,0,0.12)',   color: 'var(--accent)'  },
  Receipt:     { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e'        },
  Message:     { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6'        },
  Reminder:    { bg: 'rgba(255,149,0,0.12)',   color: 'var(--accent)'  },
  Brief:       { bg: 'rgba(120,120,128,0.15)', color: 'var(--text2)'   },
  Flag:        { bg: 'rgba(255,149,0,0.12)',   color: 'var(--accent)'  },
  'Follow-up': { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6'        },
  Birthday:    { bg: 'rgba(236,72,153,0.12)',  color: '#ec4899'        },
}

const SUGGESTION_CHIPS = [
  { label: 'Add order',        prompt: 'Add an order for '       },
  { label: 'Record payment',   prompt: 'just paid ₦'             },
  { label: "Who owes me?",     prompt: 'How much does  owe?'     },
  { label: 'Add task',         prompt: 'Remind me to '           },
  { label: 'Book appointment', prompt: 'Schedule a fitting for ' },
  { label: "Today's summary",  prompt: "What's happening today?" },
]

function getGreeting(name) {
  const h = new Date().getHours()
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${salutation}${name ? `, ${name}` : ''}! 👋`
}

function haptic(type = 'light') {
  if (!navigator.vibrate) return
  if (type === 'light')  navigator.vibrate(10)
  if (type === 'medium') navigator.vibrate(20)
}

function formatTitle(title) {
  return (title || '').replace(/\s*[—–]\s*/g, ' · ')
}

function extractTime(timeStr) {
  if (!timeStr) return ''
  const commaIdx = timeStr.indexOf(', ')
  if (commaIdx !== -1) return timeStr.slice(commaIdx + 2)
  return timeStr
}

function groupByDate(items, getDate) {
  const groups = []
  const seen   = {}
  items.forEach(item => {
    const key = getDate(item) || 'Other'
    if (!seen[key]) {
      seen[key] = true
      groups.push({ date: key, items: [] })
    }
    groups[groups.length - 1].items.push(item)
  })
  return groups
}

function resolveCustomerName(item, allOrders, allInvoices, customers) {
  if (!customers?.length) return null

  let customerId = null
  const id = item.id || ''

  if (item.orderId) {
    const order = allOrders?.find(o => String(o.id) === String(item.orderId))
    customerId = order?.customerId ?? null
  }

  if (!customerId) {
    for (const prefix of ['draft-invoice-', 'invoice-', 'upcoming-invoice-']) {
      if (id.startsWith(prefix)) {
        const orderId = id.slice(prefix.length)
        const order   = allOrders?.find(o => String(o.id) === String(orderId))
        customerId    = order?.customerId ?? null
        break
      }
    }
  }

  if (!customerId) {
    for (const prefix of ['draft-receipt-', 'receipt-']) {
      if (id.startsWith(prefix)) {
        const invoiceId = id.slice(prefix.length).split('::')[0]
        const invoice   = allInvoices?.find(inv => String(inv.id) === String(invoiceId))
        customerId      = invoice?.customerId ?? null
        break
      }
    }
  }

  if (!customerId) {
    for (const prefix of ['upcoming-reminder-', 'draft-reminder-', 'reminder-']) {
      if (id.startsWith(prefix)) {
        const invoiceId = id.slice(prefix.length)
        const invoice   = allInvoices?.find(inv => String(inv.id) === String(invoiceId))
        customerId      = invoice?.customerId ?? null
        break
      }
    }
  }

  if (!customerId) {
    for (const prefix of ['draft-followup-', 'followup-']) {
      if (id.startsWith(prefix)) {
        customerId = id.slice(prefix.length)
        break
      }
    }
  }

  if (!customerId) return null
  return customers.find(c => String(c.id) === String(customerId))?.name ?? null
}

function resolveOrderName(item, allOrders, allInvoices) {
  if (!allOrders?.length) return null

  let orderId = item.orderId || null
  const id    = item.id || ''

  if (!orderId) {
    for (const prefix of ['draft-invoice-', 'invoice-', 'upcoming-invoice-']) {
      if (id.startsWith(prefix)) {
        orderId = id.slice(prefix.length)
        break
      }
    }
  }

  if (!orderId && allInvoices?.length) {
    let invoiceId = null
    for (const prefix of ['draft-receipt-', 'receipt-']) {
      if (id.startsWith(prefix)) {
        invoiceId = id.slice(prefix.length).split('::')[0]
        break
      }
    }
    if (!invoiceId) {
      for (const prefix of ['upcoming-reminder-', 'draft-reminder-', 'reminder-']) {
        if (id.startsWith(prefix)) {
          invoiceId = id.slice(prefix.length)
          break
        }
      }
    }
    if (invoiceId) {
      const invoice = allInvoices.find(inv => String(inv.id) === String(invoiceId))
      orderId = invoice?.orderId ?? null
    }
  }

  if (!orderId) return null
  const order = allOrders.find(o => String(o.id) === String(orderId))
  return order?.name || null
}

function fmt(currency, value) {
  return `${currency.symbol || currency}${parseFloat(value || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function buildInvoiceMessage(invoice, customer, brand) {
  const cur       = brand?.currency || '₦'
  const firstName = customer?.name?.split(' ')[0] || customer?.name || 'there'
  const items     = Array.isArray(invoice.items) ? invoice.items : []
  const discount  = parseFloat(invoice.discountAmount) || 0
  const shipping  = parseFloat(invoice.shippingFee) || 0
  const tax       = parseFloat(invoice.taxAmount) || 0
  const total     = parseFloat(invoice.totalAmount) || parseFloat(invoice.price) || 0
  const L = []
  L.push(`Hi ${firstName},`, '')
  L.push(`Here is your invoice from *${brand?.name || 'us'}*. 🧾`, '')
  L.push('*📋 Invoice Details*')
  L.push(`Invoice No: *${invoice.number}*`)
  L.push(`Date: ${invoice.date}`)
  if (invoice.due) L.push(`Due Date: *${invoice.due}*`)
  if (items.length > 0) {
    L.push('', '*🛍 Order Breakdown*')
    items.forEach(item => {
      const qty = item.qty && item.qty > 1 ? ` ×${item.qty}` : ''
      L.push(`• ${item.name}${qty}: ${fmt(cur, item.price)}`)
    })
  }
  if (discount > 0 || shipping > 0 || tax > 0) {
    L.push('')
    if (discount > 0) L.push(`Discount: -${fmt(cur, discount)}`)
    if (shipping > 0) L.push(`Shipping: +${fmt(cur, shipping)}`)
    if (tax > 0)      L.push(`Tax: +${fmt(cur, tax)}`)
  }
  L.push('', `*Total Due: ${fmt(cur, total)}*`, '')
  if (invoice.due) {
    L.push(`Please make payment before *${invoice.due}* to avoid delays. ⏳`)
  } else {
    L.push('Kindly make payment at your earliest convenience. ⏳')
  }
  L.push('')
  if (brand?.phone) L.push(`For any questions, reach us at *${brand.phone}*.`)
  if (brand?.email) L.push(`Email: ${brand.email}`)
  L.push('', `Thank you for choosing *${brand?.name || 'us'}*! 🙏`)
  return L.join('\n')
}

function buildReceiptMessage(receipt, customer, brand) {
  const cur           = brand?.currency || '₦'
  const firstName     = customer?.name?.split(' ')[0] || customer?.name || 'there'
  const items         = Array.isArray(receipt.items) ? receipt.items : []
  const discount      = parseFloat(receipt.discountAmount) || 0
  const shipping      = parseFloat(receipt.shippingFee) || 0
  const tax           = parseFloat(receipt.taxAmount) || 0
  const total         = parseFloat(receipt.totalAmount) || parseFloat(receipt.orderPrice) || 0
  const cumPaid       = parseFloat(receipt.cumulativePaid) || 0
  const balance       = receipt.balance !== undefined ? parseFloat(receipt.balance) : Math.max(0, total - cumPaid)
  const isFullPay     = receipt.isFullPayment ?? (balance <= 0)
  const prevInst      = Array.isArray(receipt.previousInstallments) ? receipt.previousInstallments : []
  const currPay       = Array.isArray(receipt.payments) ? receipt.payments : []
  const allPayments   = [...prevInst, ...currPay]
  const L = []
  L.push(`Hi ${firstName},`, '')
  L.push(`Here is your payment receipt from *${brand?.name || 'us'}*. ✅`, '')
  L.push('*📋 Receipt Details*')
  L.push(`Receipt No: *${receipt.number}*`)
  L.push(`Date: ${receipt.date}`)
  if (items.length > 0) {
    L.push('', '*🛍 Order Breakdown*')
    items.forEach(item => {
      const qty = item.qty && item.qty > 1 ? ` ×${item.qty}` : ''
      L.push(`• ${item.name}${qty}: ${fmt(cur, item.price)}`)
    })
    if (discount > 0 || shipping > 0 || tax > 0) {
      if (discount > 0) L.push(`Discount: -${fmt(cur, discount)}`)
      if (shipping > 0) L.push(`Shipping: +${fmt(cur, shipping)}`)
      if (tax > 0)      L.push(`Tax: +${fmt(cur, tax)}`)
    }
    L.push(`Order Total: *${fmt(cur, total)}*`)
  }
  if (allPayments.length > 0) {
    L.push('', `*💳 Payment${allPayments.length > 1 ? ' History' : ' Received'}*`)
    allPayments.forEach((p, i) => {
      const num    = allPayments.length > 1 ? `Payment ${i + 1}` : 'Amount Paid'
      const method = p.method ? ` via ${p.method.charAt(0).toUpperCase() + p.method.slice(1)}` : ''
      const date   = p.date   ? ` on ${p.date}` : ''
      L.push(`${num}${method}: *${fmt(cur, p.amount)}*${date}`)
    })
    if (allPayments.length > 1) {
      L.push(`Total Paid: *${fmt(cur, cumPaid)}*`)
    }
  }
  L.push('')
  if (isFullPay) {
    L.push('✅ *Your order is fully paid. Thank you!*')
  } else {
    L.push(`Balance Remaining: *${fmt(cur, balance)}*`)
    L.push('Kindly settle the outstanding balance at your earliest convenience.')
  }
  L.push('')
  if (brand?.phone) L.push(`For any questions, reach us at *${brand.phone}*.`)
  if (brand?.email) L.push(`Email: ${brand.email}`)
  L.push('', `Thank you for choosing *${brand?.name || 'us'}*! 🙏`)
  return L.join('\n')
}

function buildBrandSnapshot(profileSettings, generalSettings, docType = 'invoice') {
  const footer   = docType === 'invoice' ? generalSettings.invoiceFooter   : generalSettings.receiptFooter
  const currency = docType === 'invoice' ? generalSettings.invoiceCurrency : generalSettings.receiptCurrency
  const showTax  = docType === 'invoice' ? generalSettings.invoiceShowTax  : generalSettings.receiptShowTax
  const taxRate  = docType === 'invoice' ? generalSettings.invoiceTaxRate  : generalSettings.receiptTaxRate
  return {
    name:     profileSettings.brandName     || '',
    tagline:  profileSettings.brandTagline  || '',
    colour:   profileSettings.brandColour   || '',
    colourId: profileSettings.brandColourId || '',
    phone:    profileSettings.brandPhone    || '',
    email:    profileSettings.brandEmail    || '',
    address:  profileSettings.brandAddress  || '',
    logo:     profileSettings.brandLogo     || '',
    website:  profileSettings.brandWebsite  || '',
    footer:   footer   || 'Thank you for your patronage 🙏',
    currency: currency || '₦',
    showTax:  showTax  || false,
    taxRate:  taxRate  || 0,
    ...(docType === 'invoice' ? { dueDays: generalSettings.invoiceDueDays || 7 } : {}),
  }
}


// ── Primitive components ────────────────────────────────────────

function MIcon({ name, size = '1.1rem', color }) {
  return (
    <span
      className="mi"
      style={{ fontSize: size, color: color || 'inherit', lineHeight: 1, display: 'flex', alignItems: 'center' }}
    >
      {name}
    </span>
  )
}

function RichText({ text }) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        return part.split('\n').map((line, j, arr) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))
      })}
    </>
  )
}

function TagPill({ label }) {
  const c = TAG_COLORS[label] || TAG_COLORS.Message
  return (
    <span className={styles.pill} style={{ background: c.bg, color: c.color }}>
      {label}
    </span>
  )
}


// ── Item icon / mosaic ──────────────────────────────────────────

function ItemIconBox({ type, itemId, orderId, allOrders, allInvoices }) {
  const meta = ICON_META[type] || ICON_META.brief
  let resolvedOrderId = orderId || null

  if (!resolvedOrderId && itemId) {
    for (const prefix of ['draft-invoice-', 'invoice-', 'upcoming-invoice-']) {
      if (itemId.startsWith(prefix)) {
        resolvedOrderId = itemId.slice(prefix.length)
        break
      }
    }
  }

  if (!resolvedOrderId && itemId && allInvoices) {
    let invoiceId = null
    for (const prefix of ['draft-receipt-', 'receipt-']) {
      if (itemId.startsWith(prefix)) {
        invoiceId = itemId.slice(prefix.length).split('::')[0]
        break
      }
    }
    if (!invoiceId) {
      for (const prefix of ['upcoming-reminder-', 'draft-reminder-', 'reminder-']) {
        if (itemId.startsWith(prefix)) {
          invoiceId = itemId.slice(prefix.length)
          break
        }
      }
    }
    if (invoiceId) {
      const invoice = allInvoices.find(inv => String(inv.id) === String(invoiceId))
      resolvedOrderId = invoice?.orderId ?? null
    }
  }

  if (!resolvedOrderId && itemId && allOrders) {
    let customerId = null
    for (const prefix of ['draft-followup-', 'followup-']) {
      if (itemId.startsWith(prefix)) {
        customerId = itemId.slice(prefix.length)
        break
      }
    }
    if (customerId) {
      const customerOrders = allOrders
        .filter(o => String(o.customerId) === String(customerId) && o.items?.length > 0)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      resolvedOrderId = customerOrders[0]?.id ?? null
    }
  }

  const linkedOrder = resolvedOrderId
    ? allOrders?.find(o => String(o.id) === String(resolvedOrderId))
    : null

  if (linkedOrder) {
    return <OrderMosaic items={linkedOrder.items ?? []} size="md" />
  }

  return (
    <div className={styles.rowIconOuter}>
      <div className={styles.rowIconInner} style={{ background: ICON_BG[type] || 'var(--surface2)' }}>
        <MIcon name={meta.icon} size="1.3rem" color={meta.color} />
      </div>
    </div>
  )
}

function DateDivider({ label }) {
  return <div className={styles.dateDivider}>{label}</div>
}


// ── Row cards ───────────────────────────────────────────────────

function ActivityRow({ item, isLast, allOrders, allInvoices, customers, onOpen }) {
  const customerName = resolveCustomerName(item, allOrders, allInvoices, customers)
  const orderName    = resolveOrderName(item, allOrders, allInvoices)
  const displayTitle = orderName || formatTitle(item.title)
  const displayTime  = extractTime(item.time)

  return (
    <div
      className={`${styles.row} ${isLast ? styles.rowLast : ''}`}
      onClick={() => { haptic('light'); onOpen(item) }}
    >
      <ItemIconBox
        type={item.type}
        itemId={item.id}
        orderId={item.orderId}
        allOrders={allOrders}
        allInvoices={allInvoices}
      />

      <div className={styles.rowBody}>
        <div className={styles.rowTitle}>{displayTitle}</div>

        {customerName && (
          <div className={styles.rowMeta}>
            <MIcon name="person" size="0.72rem" color="var(--text3)" />
            <span className={styles.rowMetaText}>{customerName}</span>
          </div>
        )}

        <div className={styles.rowMeta}>
          <MIcon name="schedule" size="0.72rem" color="var(--text3)" />
          <span className={styles.rowMetaText}>{displayTime}</span>
        </div>
      </div>

      <TagPill label={item.tag} />
    </div>
  )
}

function ScheduledRow({ item, isLast, allOrders, allInvoices, customers, onOpen }) {
  const customerName = resolveCustomerName(item, allOrders, allInvoices, customers)
  const orderName    = resolveOrderName(item, allOrders, allInvoices)
  const displayTitle = orderName || formatTitle(item.title)

  return (
    <div
      className={`${styles.row} ${isLast ? styles.rowLast : ''}`}
      onClick={() => { haptic('light'); onOpen(item) }}
    >
      <ItemIconBox
        type={item.type}
        itemId={item.id}
        orderId={item.orderId}
        allOrders={allOrders}
        allInvoices={allInvoices}
      />

      <div className={styles.rowBody}>
        <div className={styles.rowTitle}>{displayTitle}</div>

        {customerName && (
          <div className={styles.rowMeta}>
            <MIcon name="person" size="0.72rem" color="var(--text3)" />
            <span className={styles.rowMetaText}>{customerName}</span>
          </div>
        )}

        <div className={styles.rowMeta}>
          <MIcon name="schedule" size="0.72rem" color="var(--accent)" />
          <span className={`${styles.rowMetaText} ${styles.rowMetaAccent}`}>{item.when}</span>
        </div>
      </div>

      <TagPill label={item.tag} />
    </div>
  )
}

function DraftRow({ item, isLast, allOrders, allInvoices, customers, onOpen }) {
  const customerName = resolveCustomerName(item, allOrders, allInvoices, customers)
  const orderName    = resolveOrderName(item, allOrders, allInvoices)
  const displayTitle = orderName || formatTitle(item.title)
  const isDoc        = item.type === 'invoice' || item.type === 'receipt'

  return (
    <div
      className={`${styles.row} ${isLast ? styles.rowLast : ''}`}
      onClick={() => { haptic('light'); onOpen(item) }}
    >
      <ItemIconBox
        type={item.type}
        itemId={item.id}
        orderId={item.orderId}
        allOrders={allOrders}
        allInvoices={allInvoices}
      />

      <div className={styles.rowBody}>
        <div className={styles.rowTitle}>{displayTitle}</div>

        {customerName && (
          <div className={styles.rowMeta}>
            <MIcon name="person" size="0.72rem" color="var(--text3)" />
            <span className={styles.rowMetaText}>{customerName}</span>
          </div>
        )}

        {!isDoc && item.preview ? (
          <div className={styles.rowPreview}>{item.preview}</div>
        ) : (
          <div className={styles.rowMeta}>
            <MIcon
              name={isDoc ? 'check_circle' : 'chat_bubble'}
              size="0.72rem"
              color="var(--text3)"
            />
            <span className={styles.rowMetaText}>
              {isDoc ? 'Ready to send' : 'Message ready'}
            </span>
          </div>
        )}
      </div>

      <div className={styles.rowRight}>
        <TagPill label={item.tag} />
        <MIcon name="chevron_right" size="0.9rem" color="var(--text3)" />
      </div>
    </div>
  )
}


// ── Detail modals ───────────────────────────────────────────────

function SheetBase({ onClose, children }) {
  return (
    <div className={styles.sheetOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheetPanel}>
        <div className={styles.sheetHandle} />
        {children}
      </div>
    </div>
  )
}

function SheetHeader({ title, onClose }) {
  return (
    <div className={styles.sheetHeader}>
      <button className={styles.sheetCloseBtn} onClick={onClose}>
        <MIcon name="close" size="1.1rem" color="var(--text2)" />
      </button>
      <span className={styles.sheetHeaderTitle}>{title}</span>
      <div style={{ width: 30 }} />
    </div>
  )
}

function SheetHero({ item, customerName }) {
  const meta   = ICON_META[item.type] || ICON_META.brief
  const iconBg = ICON_BG[item.type]   || 'var(--surface2)'

  return (
    <div className={styles.sheetHero}>
      <div className={styles.sheetHeroIcon} style={{ background: iconBg }}>
        <MIcon name={meta.icon} size="1.4rem" color={meta.color} />
      </div>
      <div className={styles.sheetHeroBody}>
        <TagPill label={item.tag} />
        <p className={styles.sheetHeroTitle}>{formatTitle(item.title)}</p>
        {customerName && (
          <div className={styles.sheetHeroMeta}>
            <MIcon name="person" size="0.7rem" color="var(--text3)" />
            <span>{customerName}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function SheetSection({ icon, label, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <MIcon name={icon} size="0.72rem" color="var(--text3)" />
        <span className={styles.sectionLabel}>{label}</span>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  )
}

function ActivityDetailSheet({ item, onClose, allOrders, allInvoices, customers }) {
  if (!item) return null
  const customerName = resolveCustomerName(item, allOrders, allInvoices, customers)

  return (
    <SheetBase onClose={onClose}>
      <SheetHeader title="Activity" onClose={onClose} />
      <SheetHero item={item} customerName={customerName} />

      <div className={styles.sheetBody}>
        <SheetSection icon="info" label="What happened">
          <p className={styles.sectionText}>{item.desc}</p>
        </SheetSection>

        <div className={styles.sheetMeta}>
          <div className={styles.sheetMetaRow}>
            <MIcon name="schedule" size="0.78rem" color="var(--text3)" />
            <span className={styles.sheetMetaLabel}>Time</span>
            <span className={styles.sheetMetaValue}>{item.time}</span>
          </div>
        </div>

        {item.reason && (
          <SheetSection icon="psychology" label="Why the assistant did this">
            <p className={styles.sectionText}>{item.reason}</p>
          </SheetSection>
        )}
      </div>
    </SheetBase>
  )
}

function ScheduledDetailSheet({ item, onClose, onCancel, allOrders, allInvoices, customers }) {
  if (!item) return null
  const customerName = resolveCustomerName(item, allOrders, allInvoices, customers)

  return (
    <SheetBase onClose={onClose}>
      <SheetHeader title="Scheduled" onClose={onClose} />
      <SheetHero item={item} customerName={customerName} />

      <div className={styles.sheetBody}>
        <SheetSection icon="event_note" label="What will happen">
          <p className={styles.sectionText}>{item.desc}</p>
        </SheetSection>

        <div className={styles.sheetMeta}>
          <div className={styles.sheetMetaRow}>
            <MIcon name="schedule" size="0.78rem" color="var(--accent)" />
            <span className={styles.sheetMetaLabel}>Scheduled for</span>
            <span className={`${styles.sheetMetaValue} ${styles.sheetMetaAccent}`}>{item.when}</span>
          </div>
        </div>

        <button
          className={styles.btnDanger}
          onClick={() => { haptic('medium'); onCancel(item.id); onClose() }}
        >
          <MIcon name="cancel" size="0.9rem" color="#ef4444" />
          Cancel this action
        </button>
      </div>
    </SheetBase>
  )
}

function DraftDetailSheet({
  item,
  onClose,
  onDiscard,
  allOrders,
  allInvoices,
  allReceipts,
  allPayments,
  customers,
  generalSettings,
  profileSettings,
  showToast,
  onSaveDoc,
}) {
  const [viewerInvoice, setViewerInvoice] = useState(null)
  const [viewerReceipt, setViewerReceipt] = useState(null)
  const [confirmSave,   setConfirmSave]   = useState(false)

  if (!item) return null

  const isDoc        = item.type === 'invoice' || item.type === 'receipt'
  const customerName = resolveCustomerName(item, allOrders, allInvoices, customers)

  function getOrderIdFromDraftId(draftId) {
    return draftId?.replace('draft-invoice-', '') || null
  }

  function getInvoiceIdFromDraftId(draftId) {
    if (!draftId?.startsWith('draft-receipt-')) return null
    return draftId.replace('draft-receipt-', '').split('::')[0] || null
  }

  function getInstallmentIdFromDraftId(draftId) {
    if (!draftId?.startsWith('draft-receipt-')) return null
    const parts = draftId.replace('draft-receipt-', '').split('::')
    return parts[1] || null
  }

  function getInvoiceForDraft() {
    const orderId  = getOrderIdFromDraftId(item.id)
    if (!orderId) return null

    const existing = allInvoices.find(inv => String(inv.orderId) === String(orderId))
    if (existing) return existing

    const order = allOrders.find(o => String(o.id) === String(orderId))
    if (!order) return null

    const prefix        = generalSettings.invoicePrefix   || 'INV'
    const template      = generalSettings.invoiceTemplate || 'invoiceTemplate1'
    const dueDays       = generalSettings.invoiceDueDays  || 7
    const invoiceNumber = `${prefix}-${String(allInvoices.length + 1).padStart(3, '0')}`
    const today         = new Date()
    const dateStr       = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const dueDate       = new Date(today)
    dueDate.setDate(dueDate.getDate() + dueDays)
    const dueDateStr    = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const brandSnapshot = buildBrandSnapshot(profileSettings, generalSettings, 'invoice')

    return {
      id:             `preview-${order.id}`,
      orderId:        order.id,
      customerId:     order.customerId,
      number:         invoiceNumber,
      date:           dateStr,
      status:         'unpaid',
      template,
      orderDesc:      order.desc,
      price:          order.price,
      qty:            order.qty,
      items:          Array.isArray(order.items) ? order.items : [],
      due:            dueDateStr,
      notes:          order.notes || '',
      shippingFee:    order.shippingFee    ?? 0,
      discountType:   order.discountType   ?? null,
      discountValue:  order.discountValue  ?? 0,
      discountAmount: order.discountAmount ?? 0,
      taxRate:        order.taxRate        ?? 0,
      taxAmount:      order.taxAmount      ?? 0,
      totalAmount:    order.totalAmount    ?? order.price ?? 0,
      brandSnapshot,
      _isPreview: true,
    }
  }

  function getReceiptForDraft() {
    const invoiceId     = getInvoiceIdFromDraftId(item.id)
    const installmentId = getInstallmentIdFromDraftId(item.id)
    if (!invoiceId || !installmentId) return null

    const invoice = allInvoices.find(inv => String(inv.id) === String(invoiceId))
    if (!invoice) return null

    const payment = allPayments.find(p => String(p.orderId) === String(invoice.orderId))
    if (!payment || !Array.isArray(payment.installments)) return null

    const existing = allReceipts.find(r =>
      String(r.paymentId) === String(payment.id) &&
      (r.installmentIds || []).map(String).includes(String(installmentId))
    )
    if (existing) return { ...existing, _isPreview: false }

    const allInstallments = payment.installments
    const thisIndex       = allInstallments.findIndex(inst => String(inst.id) === String(installmentId))
    if (thisIndex === -1) return null

    const thisInstallment      = allInstallments[thisIndex]
    const previousInstallments = allInstallments.slice(0, thisIndex).map(inst => ({
      id:     inst.id,
      amount: inst.amount,
      method: inst.method || 'cash',
      date:   inst.date,
      time:   inst.time || null,
    }))

    const orderTotal     = parseFloat(invoice.totalAmount ?? invoice.price) || 0
    const cumulativePaid = allInstallments
      .slice(0, thisIndex + 1)
      .reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0)
    const balance       = Math.max(0, orderTotal - cumulativePaid)
    const isFullPayment = balance <= 0

    const prefix                 = generalSettings.receiptPrefix   || 'RCP'
    const template               = generalSettings.receiptTemplate || 'receiptTemplate1'
    const today                  = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const brandSnapshot          = buildBrandSnapshot(profileSettings, generalSettings, 'receipt')
    const globalReceiptCount     = allReceipts.length + 1
    const receiptsForThisPayment = allReceipts.filter(r => String(r.paymentId) === String(payment.id)).length + 1
    const receiptNumber = `${prefix}-${String(receiptsForThisPayment).padStart(2, '0')}-${String(globalReceiptCount).padStart(3, '0')}`

    return {
      id:                   `preview-receipt-${invoice.id}-${thisInstallment.id}`,
      paymentId:            payment.id,
      orderId:              invoice.orderId,
      customerId:           invoice.customerId,
      orderDesc:            invoice.orderDesc || invoice.desc,
      orderPrice:           invoice.totalAmount || invoice.price,
      items:                invoice.items || [],
      number:               receiptNumber,
      date:                 today,
      template,
      payments: [{
        id:     thisInstallment.id,
        amount: thisInstallment.amount,
        method: thisInstallment.method || 'cash',
        date:   thisInstallment.date,
        time:   thisInstallment.time || null,
      }],
      previousInstallments,
      previousPaid:         previousInstallments.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0),
      cumulativePaid,
      isFullPayment,
      balance,
      installmentIds:       [String(thisInstallment.id)],
      notes:                payment.notes || '',
      shippingFee:          invoice.shippingFee    ?? 0,
      discountType:         invoice.discountType   ?? null,
      discountValue:        invoice.discountValue  ?? 0,
      discountAmount:       invoice.discountAmount ?? 0,
      taxRate:              invoice.taxRate        ?? 0,
      taxAmount:            invoice.taxAmount      ?? 0,
      totalAmount:          invoice.totalAmount    ?? invoice.price ?? 0,
      brandSnapshot,
      _isPreview: true,
    }
  }

  function getCustomerForDraft() {
    if (item.type === 'invoice') {
      const orderId = getOrderIdFromDraftId(item.id)
      const order   = allOrders.find(o => String(o.id) === String(orderId))
      if (!order) return null
      return customers.find(c => String(c.id) === String(order.customerId)) || null
    }
    if (item.type === 'receipt') {
      const invoiceId = getInvoiceIdFromDraftId(item.id)
      const invoice   = allInvoices.find(inv => String(inv.id) === String(invoiceId))
      if (!invoice) return null
      return customers.find(c => String(c.id) === String(invoice.customerId)) || null
    }
    return null
  }

  async function handleShareBreakdown() {
    haptic('medium')
    const doc      = item.type === 'invoice' ? getInvoiceForDraft() : getReceiptForDraft()
    const customer = getCustomerForDraft()
    if (!doc || !customer) { showToast?.('Could not build message'); return }
    const brand   = doc.brandSnapshot
    const message = item.type === 'invoice'
      ? buildInvoiceMessage(doc, customer, brand)
      : buildReceiptMessage(doc, customer, brand)
    if (navigator.share) {
      try {
        await navigator.share({ text: message })
      } catch (err) {
        if (err?.name !== 'AbortError') {
          navigator.clipboard?.writeText(message).catch(() => {})
          showToast?.('Copied to clipboard')
        }
      }
    } else {
      navigator.clipboard?.writeText(message).catch(() => {})
      showToast?.('Copied to clipboard — paste to send')
    }
  }

  async function handleShareMessage() {
    haptic('medium')
    if (navigator.share) {
      try {
        await navigator.share({ text: item.preview })
      } catch (err) {
        if (err?.name !== 'AbortError') {
          navigator.clipboard?.writeText(item.preview).catch(() => {})
          showToast?.('Copied to clipboard')
        }
      }
    } else {
      navigator.clipboard?.writeText(item.preview).catch(() => {})
      showToast?.('Copied to clipboard')
    }
  }

  function handleViewDoc() {
    haptic('light')
    if (item.type === 'invoice') {
      const invoice  = getInvoiceForDraft()
      const customer = getCustomerForDraft()
      if (!invoice || !customer) { showToast?.('Could not load invoice data'); return }
      setViewerInvoice({ invoice, customer })
    } else {
      const receipt  = getReceiptForDraft()
      const customer = getCustomerForDraft()
      if (!receipt || !customer) { showToast?.('Could not load receipt data'); return }
      setViewerReceipt({ receipt, customer })
    }
  }

  async function handleConfirmSave() {
    setConfirmSave(false)
    if (item.type === 'invoice') {
      const invoice = getInvoiceForDraft()
      if (!invoice) { showToast?.('Could not save invoice'); return }
      if (invoice._isPreview) {
        const { _isPreview, ...data } = invoice
        onSaveDoc?.('invoice', data, item.id)
      } else {
        showToast?.('Invoice already exists')
        onDiscard(item.id)
      }
    } else if (item.type === 'receipt') {
      const receipt = getReceiptForDraft()
      if (!receipt) { showToast?.('Could not save receipt'); return }
      if (receipt._isPreview) {
        const { _isPreview, ...data } = receipt
        onSaveDoc?.('receipt', data, item.id)
      } else {
        showToast?.('Receipt already exists')
        onDiscard(item.id)
      }
    }
    onClose()
  }

  const sheetTitle = isDoc
    ? (item.type === 'invoice' ? 'Invoice Draft' : 'Receipt Draft')
    : 'Message Draft'

  const isReceipt = item.type === 'receipt'

  return (
    <>
      <div className={styles.sheetOverlay} onClick={e => e.target === e.currentTarget && !confirmSave && onClose()}>
        <div className={styles.sheetPanel}>
          <div className={styles.sheetHandle} />
          <SheetHeader title={sheetTitle} onClose={onClose} />
          <SheetHero item={item} customerName={customerName} />

          <div className={styles.sheetBody}>
            <SheetSection icon="preview" label={isDoc ? 'Breakdown preview' : 'Message'}>
              <p className={`${styles.sectionText} ${styles.sectionTextItalic}`}>{item.preview}</p>
            </SheetSection>

            {isDoc ? (
              <div className={styles.sheetActions}>
                <button className={styles.btnPrimary} onClick={handleShareBreakdown}>
                  <MIcon name="ios_share" size="0.9rem" color="var(--bg)" />
                  Send breakdown to client
                </button>

                <div className={styles.btnRow}>
                  <button className={styles.btnSecondary} onClick={handleViewDoc}>
                    <MIcon name="open_in_new" size="0.82rem" />
                    View {item.type}
                  </button>
                  <button
                    className={`${styles.btnGreen}`}
                    onClick={() => { haptic('light'); setConfirmSave(true) }}
                  >
                    <MIcon name="add_circle" size="0.82rem" color="#22c55e" />
                    Save {item.type}
                  </button>
                </div>

                <button
                  className={styles.btnGhost}
                  onClick={() => { haptic('light'); onDiscard(item.id); onClose() }}
                >
                  <MIcon name="delete_outline" size="0.9rem" color="#ef4444" />
                  Discard draft
                </button>
              </div>
            ) : (
              <div className={styles.sheetActions}>
                <button className={styles.btnPrimary} onClick={handleShareMessage}>
                  <MIcon name="ios_share" size="0.9rem" color="var(--bg)" />
                  Share message
                </button>
                <button
                  className={styles.btnGhost}
                  onClick={() => { haptic('light'); onDiscard(item.id); onClose() }}
                >
                  <MIcon name="delete_outline" size="0.9rem" color="#ef4444" />
                  Discard draft
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmSave && (
        <div className={styles.confirmOverlay} onClick={() => setConfirmSave(false)}>
          <div className={styles.confirmSheet} onClick={e => e.stopPropagation()}>
            <div className={`${styles.confirmIcon} ${isReceipt ? styles.confirmIconGreen : ''}`}>
              <MIcon
                name={isReceipt ? 'payments' : 'receipt_long'}
                size="1.3rem"
                color={isReceipt ? '#22c55e' : 'var(--accent)'}
              />
            </div>
            <p className={styles.confirmTitle}>Save this {item.type}?</p>
            <p className={styles.confirmSub}>
              This will add the {item.type} to your {isReceipt ? 'Receipts' : 'Invoices'} list
              where you can view, edit, and share it anytime.
            </p>
            <div className={styles.confirmBtns}>
              <button className={styles.confirmBtnCancel} onClick={() => setConfirmSave(false)}>
                Not now
              </button>
              <button
                className={`${styles.confirmBtnSave} ${isReceipt ? styles.confirmBtnSaveGreen : ''}`}
                onClick={handleConfirmSave}
              >
                <MIcon name="check" size="0.82rem" color="var(--bg)" />
                Save {item.type}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewerInvoice && (
        <InvoiceViewer
          invoice={viewerInvoice.invoice}
          customer={viewerInvoice.customer}
          onClose={() => setViewerInvoice(null)}
          onDelete={viewerInvoice.invoice?._isPreview ? null : () => {
            setViewerInvoice(null)
            showToast?.('Invoice deleted')
          }}
          showToast={showToast}
        />
      )}

      {viewerReceipt && (
        <ReceiptViewer
          receipt={viewerReceipt.receipt}
          customer={viewerReceipt.customer}
          onClose={() => setViewerReceipt(null)}
          onDelete={viewerReceipt.receipt?._isPreview ? null : () => {
            setViewerReceipt(null)
            showToast?.('Receipt deleted')
          }}
          showToast={showToast}
        />
      )}
    </>
  )
}


// ── Tab containers ──────────────────────────────────────────────

function ActivityTab({ items, allOrders, allInvoices, customers }) {
  const [selected, setSelected] = useState(null)

  if (!items.length) return (
    <div className={styles.emptyTab}>
      <MIcon name="check_circle" size="2rem" color="var(--border2)" />
      <p className={styles.emptyTabTitle}>No activity yet today</p>
      <p className={styles.emptyTabSub}>Your assistant will log its actions here as it works</p>
    </div>
  )

  const groups = groupByDate(items, i => i.date || i.time?.split(',')[0] || 'Today')

  return (
    <>
      <div className={styles.listWrap}>
        {groups.map(group => (
          <div key={group.date} className={styles.dateGroup}>
            <DateDivider label={group.date} />
            <div className={styles.groupRows}>
              {group.items.map((item, idx) => (
                <ActivityRow
                  key={item.id}
                  item={item}
                  isLast={idx === group.items.length - 1}
                  allOrders={allOrders}
                  allInvoices={allInvoices}
                  customers={customers}
                  onOpen={setSelected}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ActivityDetailSheet
          item={selected}
          onClose={() => setSelected(null)}
          allOrders={allOrders}
          allInvoices={allInvoices}
          customers={customers}
        />
      )}
    </>
  )
}

function ScheduledTab({ items, allOrders, allInvoices, customers, onCancel }) {
  const [selected, setSelected] = useState(null)

  if (!items.length) return (
    <div className={styles.emptyTab}>
      <MIcon name="schedule" size="2rem" color="var(--border2)" />
      <p className={styles.emptyTabTitle}>Nothing scheduled</p>
      <p className={styles.emptyTabSub}>Upcoming assistant actions will appear here</p>
    </div>
  )

  const groups = groupByDate(items, i => i.whenDate || i.when?.split(' ')[0] || 'Upcoming')

  return (
    <>
      <div className={styles.listWrap}>
        {groups.map(group => (
          <div key={group.date} className={styles.dateGroup}>
            <DateDivider label={group.date} />
            <div className={styles.groupRows}>
              {group.items.map((item, idx) => (
                <ScheduledRow
                  key={item.id}
                  item={item}
                  isLast={idx === group.items.length - 1}
                  allOrders={allOrders}
                  allInvoices={allInvoices}
                  customers={customers}
                  onOpen={setSelected}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ScheduledDetailSheet
          item={selected}
          onClose={() => setSelected(null)}
          onCancel={onCancel}
          allOrders={allOrders}
          allInvoices={allInvoices}
          customers={customers}
        />
      )}
    </>
  )
}

function DraftsTab({
  items,
  onDiscard,
  allOrders,
  allInvoices,
  allReceipts,
  allPayments,
  customers,
  generalSettings,
  profileSettings,
  showToast,
  onSaveDoc,
}) {
  const [selected, setSelected] = useState(null)

  if (!items.length) return (
    <div className={styles.emptyTab}>
      <MIcon name="edit_note" size="2rem" color="var(--border2)" />
      <p className={styles.emptyTabTitle}>Nothing ready yet</p>
      <p className={styles.emptyTabSub}>Documents and messages your assistant prepares will appear here</p>
    </div>
  )

  const groups = groupByDate(items, i => i.date || 'Today')

  return (
    <>
      <div className={styles.listWrap}>
        {groups.map(group => (
          <div key={group.date} className={styles.dateGroup}>
            <DateDivider label={group.date} />
            <div className={styles.groupRows}>
              {group.items.map((item, idx) => (
                <DraftRow
                  key={item.id}
                  item={item}
                  isLast={idx === group.items.length - 1}
                  allOrders={allOrders}
                  allInvoices={allInvoices}
                  customers={customers}
                  onOpen={setSelected}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <DraftDetailSheet
          item={selected}
          onClose={() => setSelected(null)}
          onDiscard={onDiscard}
          allOrders={allOrders}
          allInvoices={allInvoices}
          allReceipts={allReceipts}
          allPayments={allPayments}
          customers={customers}
          generalSettings={generalSettings}
          profileSettings={profileSettings}
          showToast={showToast}
          onSaveDoc={onSaveDoc}
        />
      )}
    </>
  )
}


// ── Chat components ─────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className={styles.typingWrap}>
      <div className={styles.agentAvatarSm}>
        <MIcon name="smart_toy" size="0.75rem" />
      </div>
      <div className={styles.typingBubble}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </div>
    </div>
  )
}

function ChatMessage({ msg, onAction, onNavigate }) {
  const isAgent = msg.role === 'agent'
  return (
    <div className={`${styles.msgRow} ${isAgent ? styles.msgRowAgent : styles.msgRowUser}`}>
      {isAgent && (
        <div className={styles.agentAvatarSm}>
          <MIcon name="smart_toy" size="0.75rem" />
        </div>
      )}
      <div className={styles.msgContent}>
        <div className={`${styles.bubble} ${isAgent ? styles.bubbleAgent : styles.bubbleUser}`}>
          <RichText text={msg.text} />
        </div>
        {isAgent && msg.actions?.length > 0 && (
          <div className={styles.msgActions}>
            {msg.actions.map((action, i) => (
              <button
                key={i}
                className={`${styles.msgActionBtn} ${action.action === 'cancel' ? styles.msgActionBtnGhost : ''}`}
                onClick={() => {
                  haptic('light')
                  if (action.action === 'navigate') onNavigate(action.payload.route)
                  else onAction(action.action, action.payload)
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div className={`${styles.msgTime} ${isAgent ? '' : styles.msgTimeUser}`}>
          {msg.time}
        </div>
      </div>
    </div>
  )
}

function ChatPanel({
  open,
  onClose,
  messages,
  isTyping,
  isLoading,
  activeFlow,
  inputValue,
  setInputValue,
  onSend,
  onAction,
  onNavigate,
  onCancelFlow,
  greeting,
}) {
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, open])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  function handleChipTap(prompt) {
    haptic('light')
    setInputValue(prompt)
    inputRef.current?.focus()
  }

  const FLOW_LABELS = {
    add_order:      'Adding order',
    gen_invoice:    'Creating invoice',
    record_payment: 'Recording payment',
    add_task:       'Adding task',
    add_appt:       'Booking appointment',
  }

  const showChips = !activeFlow && messages.length === 0 && !isLoading

  return (
    <>
      {open && <div className={styles.chatBackdrop} onClick={onClose} />}

      <div className={`${styles.chatPanel} ${open ? styles.chatPanelOpen : ''}`}>
        <div className={styles.chatPanelHeader}>
          <div>
            <p className={styles.chatPanelTitle}>Assistant</p>
            <p className={styles.chatPanelSub}>Ask anything about your business</p>
          </div>
          <button className={styles.chatCloseBtn} onClick={onClose}>
            <MIcon name="close" size="1.1rem" color="var(--text2)" />
          </button>
        </div>

        {activeFlow && (
          <div className={styles.chatFlowBar}>
            <MIcon name="pending" size="0.75rem" color="var(--accent)" />
            <span className={styles.chatFlowLabel}>
              {FLOW_LABELS[activeFlow.name] || 'In progress'}
            </span>
            <button className={styles.chatFlowCancel} onClick={() => { haptic('light'); onCancelFlow() }}>
              Cancel
            </button>
          </div>
        )}

        <div className={styles.chatMessages}>
          {isLoading && (
            <div className={styles.chatLoadingWrap}>
              <div className={styles.loadingDots}><span /><span /><span /></div>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className={styles.chatEmpty}>
              <div className={styles.chatEmptyAvatar}>
                <MIcon name="smart_toy" size="1.4rem" color="var(--bg)" />
              </div>
              <p className={styles.chatEmptyGreeting}>{greeting}</p>
              <p className={styles.chatEmptySub}>I'm your shop assistant.</p>
            </div>
          )}

          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              msg={msg}
              onAction={onAction}
              onNavigate={onNavigate}
            />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatInputRow}>
          {showChips && (
            <div className={styles.chipsRow}>
              {SUGGESTION_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  className={styles.chip}
                  onClick={() => handleChipTap(chip.prompt)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          <div className={styles.chatInputWrap}>
            <MIcon name="smart_toy" size="0.9rem" color="var(--text3)" />
            <textarea
              ref={inputRef}
              className={styles.chatInputField}
              placeholder={activeFlow ? 'Type your answer...' : 'Message...'}
              value={inputValue}
              rows={1}
              onChange={e => {
                setInputValue(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              className={`${styles.chatSendBtn} ${inputValue.trim() ? styles.chatSendBtnActive : ''}`}
              onClick={onSend}
              disabled={!inputValue.trim()}
            >
              <MIcon name="arrow_upward" size="0.85rem" color="var(--bg)" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}


// ── Main page ───────────────────────────────────────────────────

function Agent({ onMenuClick }) {
  const navigate = useNavigate()

  const {
    messages,
    isTyping,
    isLoading,
    activeFlow,
    sendMessage,
    handleAction,
    cancelFlow,
  } = useAgent()

  const {
    enabled,
    doneTasks,
    upcomingTasks,
    drafts,
    cancelUpcoming,
    discardDraft,
  } = useAutonomousAgent()

  const { allOrders }               = useOrders()
  const { allInvoices, addInvoice } = useInvoices()
  const { allReceipts, addReceipt } = useReceipts()
  const { allPayments }             = usePayments()
  const { customers }               = useCustomers()
  const { user }                    = useAuth()
  const { generalSettings }         = useGeneralSettings()
  const { profileSettings }         = useProfileSettings()

  const [tab,        setTab]        = useState('done')
  const [chatOpen,   setChatOpen]   = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [toast,      setToast]      = useState(null)
  const [greeting]                  = useState(() => {
    const firstName = user?.displayName?.split(' ')[0] || ''
    return getGreeting(firstName)
  })

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleSend() {
    const v = inputValue.trim()
    if (!v) return
    haptic('light')
    setInputValue('')
    sendMessage(v)
  }

  async function handleSaveDoc(type, data, draftId) {
    try {
      if (type === 'invoice') {
        await addInvoice(data)
      } else {
        await addReceipt(data)
      }
      discardDraft(draftId)
      showToast(`${type === 'invoice' ? 'Invoice' : 'Receipt'} saved!`)
    } catch {
      showToast('Failed to save — please try again')
    }
  }

  const handleActionBtn = useCallback((action, payload) => {
    if (action === 'navigate') { navigate(payload.route); return }
    handleAction(action, payload)
  }, [handleAction, navigate])

  const TABS = [
    { key: 'done',     label: 'Activity'                        },
    { key: 'upcoming', label: 'Scheduled'                       },
    { key: 'drafts',   label: 'Prepared', badge: drafts.length  },
  ]

  return (
    <div className={styles.pageWrapper}>
      <Header
        type="back"
        customTitle={{ iconComponent: AgentTitleIcon, title: 'Pady' }}
        onBackClick={() => navigate('/')}
        agentActive={enabled}
        customActions={[
          {
            icon: 'chat',
            onClick: () => { haptic('light'); setChatOpen(true) },
            color: 'var(--text)',
          },
        ]}
      />

      <div className={styles.tabRow}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ''}`}
            onClick={() => { haptic('light'); setTab(t.key) }}
          >
            {t.label}
            {t.badge > 0 && (
              <span className={styles.tabBadge}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {tab === 'done' && (
          <ActivityTab
            items={doneTasks}
            allOrders={allOrders}
            allInvoices={allInvoices}
            customers={customers}
          />
        )}
        {tab === 'upcoming' && (
          <ScheduledTab
            items={upcomingTasks}
            allOrders={allOrders}
            allInvoices={allInvoices}
            customers={customers}
            onCancel={cancelUpcoming}
          />
        )}
        {tab === 'drafts' && (
          <DraftsTab
            items={drafts}
            onDiscard={discardDraft}
            allOrders={allOrders}
            allInvoices={allInvoices}
            allReceipts={allReceipts}
            allPayments={allPayments}
            customers={customers}
            generalSettings={generalSettings}
            profileSettings={profileSettings}
            showToast={showToast}
            onSaveDoc={handleSaveDoc}
          />
        )}
      </div>

      {toast && (
        <div className={styles.toast}>{toast}</div>
      )}

      <BottomNav />

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        isTyping={isTyping}
        isLoading={isLoading}
        activeFlow={activeFlow}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSend={handleSend}
        onAction={handleActionBtn}
        onNavigate={navigate}
        onCancelFlow={cancelFlow}
        greeting={greeting}
      />
    </div>
  )
}

export default Agent
