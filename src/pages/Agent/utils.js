export function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5  && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}

export function getGreetingEmoji() {
  const hour = new Date().getHours()
  if (hour >= 5  && hour < 12) return '☀️'
  if (hour >= 12 && hour < 17) return '👋'
  if (hour >= 17 && hour < 21) return '🌙'
  return '😴'
}

export function getDisplayName(user) {
  const fullName = user?.displayName?.trim()
  if (fullName) {
    const parts = fullName.split(/\s+/)
    return parts.length >= 1 ? parts[0] : 'there'
  }
  return 'there'
}

export function getBriefSubtext(subtexts) {
  const day = new Date().getDay()
  const dayMatch = subtexts.find(s => s.day === day)
  if (dayMatch) return dayMatch.text

  const pool = subtexts.filter(s => s.day === undefined)
  return pool[Math.floor(Math.random() * pool.length)]?.text || ''
}

export function haptic(type = 'light') {
  if (!navigator.vibrate) return
  if (type === 'light')  navigator.vibrate(10)
  if (type === 'medium') navigator.vibrate(20)
}

export function formatTitle(title) {
  return (title || '').replace(/\s*[—–]\s*/g, ' · ')
}

export function extractTime(timeStr) {
  if (!timeStr) return ''
  const commaIdx = timeStr.indexOf(', ')
  return commaIdx !== -1 ? timeStr.slice(commaIdx + 2) : timeStr
}

export function groupByDate(items, getDate) {
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

function extractIdFromDraftId(id, prefixes) {
  for (const prefix of prefixes) {
    if (id.startsWith(prefix)) return id.slice(prefix.length).split('::')[0]
  }
  return null
}

export function resolveCustomerName(item, allOrders, allInvoices, allPayments, customers) {
  if (!customers?.length) return null

  const id = item.id || ''
  let customerId = null

  const orderId = extractIdFromDraftId(id, ['invoice-', 'upcoming-invoice-'])
  if (orderId) {
    customerId = allOrders?.find(o => String(o.id) === String(orderId))?.customerId ?? null
  }

  if (!customerId) {
    const paymentId = extractIdFromDraftId(id, ['receipt-'])
    if (paymentId) {
      customerId = allPayments?.find(p => String(p.id) === String(paymentId))?.customerId ?? null
    }
  }

  if (!customerId) {
    const invoiceId = extractIdFromDraftId(id, ['reminder-', 'overdue-'])
    if (invoiceId) {
      customerId = allInvoices?.find(i => String(i.id) === String(invoiceId))?.customerId ?? null
    }
  }

  if (!customerId) {
    customerId = extractIdFromDraftId(id, ['followup-', 'birthday-', 'orderready-'])
  }

  if (!customerId) return null
  return customers.find(c => String(c.id) === String(customerId))?.name ?? null
}

export function resolveOrderName(item, allOrders, allInvoices, allPayments) {
  if (!allOrders?.length) return null

  const id = item.id || ''
  let orderId = null

  orderId = extractIdFromDraftId(id, ['invoice-', 'upcoming-invoice-', 'orderready-'])

  if (!orderId) {
    const paymentId = extractIdFromDraftId(id, ['receipt-'])
    if (paymentId) {
      orderId = allPayments?.find(p => String(p.id) === String(paymentId))?.orderId ?? null
    }
  }

  if (!orderId) {
    const invoiceId = extractIdFromDraftId(id, ['reminder-', 'overdue-'])
    if (invoiceId) {
      orderId = allInvoices?.find(i => String(i.id) === String(invoiceId))?.orderId ?? null
    }
  }

  if (!orderId) return null
  const order = allOrders.find(o => String(o.id) === String(orderId))
  return order?.desc || order?.name || null
}

export function fmt(currency, value) {
  return `${currency?.symbol || currency || '₦'}${parseFloat(value || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function buildInvoiceMessage(invoice, customer, brand) {
  const cur       = brand?.currency || '₦'
  const firstName = customer?.name?.split(' ')[0] || 'there'
  const items     = Array.isArray(invoice.items) ? invoice.items : []
  const discount  = parseFloat(invoice.discountAmount) || 0
  const shipping  = parseFloat(invoice.shippingFee)    || 0
  const tax       = parseFloat(invoice.taxAmount)       || 0
  const total     = parseFloat(invoice.totalAmount)     || parseFloat(invoice.price) || 0
  const lines     = []

  lines.push(`Hi ${firstName},`, '')
  lines.push(`Here is your invoice from *${brand?.name || 'us'}*. 🧾`, '')
  lines.push('*📋 Invoice Details*')
  lines.push(`Invoice No: *${invoice.number}*`)
  lines.push(`Date: ${invoice.date}`)
  if (invoice.due) lines.push(`Due Date: *${invoice.due}*`)

  if (items.length > 0) {
    lines.push('', '*🛍 Order Breakdown*')
    items.forEach(item => {
      const qty = item.qty > 1 ? ` ×${item.qty}` : ''
      lines.push(`• ${item.name}${qty}: ${fmt(cur, item.price)}`)
    })
  }

  if (discount > 0 || shipping > 0 || tax > 0) {
    lines.push('')
    if (discount > 0) lines.push(`Discount: -${fmt(cur, discount)}`)
    if (shipping > 0) lines.push(`Shipping: +${fmt(cur, shipping)}`)
    if (tax > 0)      lines.push(`Tax: +${fmt(cur, tax)}`)
  }

  lines.push('', `*Total Due: ${fmt(cur, total)}*`, '')
  lines.push(
    invoice.due
      ? `Please make payment before *${invoice.due}* to avoid delays. ⏳`
      : 'Kindly make payment at your earliest convenience. ⏳'
  )
  lines.push('')
  if (brand?.phone) lines.push(`For any questions, reach us at *${brand.phone}*.`)
  if (brand?.email) lines.push(`Email: ${brand.email}`)
  lines.push('', `Thank you for choosing *${brand?.name || 'us'}*! 🙏`)

  return lines.join('\n')
}

export function buildReceiptMessage(receipt, customer, brand) {
  const cur                  = brand?.currency || '₦'
  const firstName            = customer?.name?.split(' ')[0] || 'there'
  const items                = Array.isArray(receipt.items) ? receipt.items : []
  const discount             = parseFloat(receipt.discountAmount) || 0
  const shipping             = parseFloat(receipt.shippingFee)    || 0
  const tax                  = parseFloat(receipt.taxAmount)       || 0
  const total                = parseFloat(receipt.totalAmount)     || parseFloat(receipt.orderPrice) || 0
  const cumulativePaid       = parseFloat(receipt.cumulativePaid)  || 0
  const balance              = receipt.balance !== undefined ? parseFloat(receipt.balance) : Math.max(0, total - cumulativePaid)
  const isFullPayment        = receipt.isFullPayment ?? balance <= 0
  const previousInstallments = Array.isArray(receipt.previousInstallments) ? receipt.previousInstallments : []
  const currentPayments      = Array.isArray(receipt.payments)              ? receipt.payments              : []
  const allInstallments      = [...previousInstallments, ...currentPayments]
  const lines                = []

  lines.push(`Hi ${firstName},`, '')
  lines.push(`Here is your payment receipt from *${brand?.name || 'us'}*. ✅`, '')
  lines.push('*📋 Receipt Details*')
  lines.push(`Receipt No: *${receipt.number}*`)
  lines.push(`Date: ${receipt.date}`)

  if (items.length > 0) {
    lines.push('', '*🛍 Order Breakdown*')
    items.forEach(item => {
      const qty = item.qty > 1 ? ` ×${item.qty}` : ''
      lines.push(`• ${item.name}${qty}: ${fmt(cur, item.price)}`)
    })
    if (discount > 0 || shipping > 0 || tax > 0) {
      if (discount > 0) lines.push(`Discount: -${fmt(cur, discount)}`)
      if (shipping > 0) lines.push(`Shipping: +${fmt(cur, shipping)}`)
      if (tax > 0)      lines.push(`Tax: +${fmt(cur, tax)}`)
    }
    lines.push(`Order Total: *${fmt(cur, total)}*`)
  }

  if (allInstallments.length > 0) {
    lines.push('', `*💳 Payment${allInstallments.length > 1 ? ' History' : ' Received'}*`)
    allInstallments.forEach((installment, i) => {
      const label  = allInstallments.length > 1 ? `Payment ${i + 1}` : 'Amount Paid'
      const method = installment.method ? ` via ${installment.method.charAt(0).toUpperCase()}${installment.method.slice(1)}` : ''
      const date   = installment.date   ? ` on ${installment.date}` : ''
      lines.push(`${label}${method}: *${fmt(cur, installment.amount)}*${date}`)
    })
    if (allInstallments.length > 1) {
      lines.push(`Total Paid: *${fmt(cur, cumulativePaid)}*`)
    }
  }

  lines.push('')
  if (isFullPayment) {
    lines.push('✅ *Your order is fully paid. Thank you!*')
  } else {
    lines.push(`Balance Remaining: *${fmt(cur, balance)}*`)
    lines.push('Kindly settle the outstanding balance at your earliest convenience.')
  }

  lines.push('')
  if (brand?.phone) lines.push(`For any questions, reach us at *${brand.phone}*.`)
  if (brand?.email) lines.push(`Email: ${brand.email}`)
  lines.push('', `Thank you for choosing *${brand?.name || 'us'}*! 🙏`)

  return lines.join('\n')
}

export function buildBrandSnapshot(profileSettings, generalSettings, docType = 'invoice') {
  const isInvoice = docType === 'invoice'
  return {
    name:      profileSettings.brandName     || '',
    tagline:   profileSettings.brandTagline  || '',
    colour:    profileSettings.brandColour   || '',
    colourId:  profileSettings.brandColourId || '',
    phone:     profileSettings.brandPhone    || '',
    email:     profileSettings.brandEmail    || '',
    address:   profileSettings.brandAddress  || '',
    logo:      profileSettings.brandLogo     || '',
    website:   profileSettings.brandWebsite  || '',
    footer:    (isInvoice ? generalSettings.invoiceFooter  : generalSettings.receiptFooter)  || 'Thank you for your patronage 🙏',
    currency:  (isInvoice ? generalSettings.invoiceCurrency : generalSettings.receiptCurrency) || '₦',
    showTax:   (isInvoice ? generalSettings.invoiceShowTax  : generalSettings.receiptShowTax)  || false,
    taxRate:   (isInvoice ? generalSettings.invoiceTaxRate  : generalSettings.receiptTaxRate)  || 0,
    ...(isInvoice ? { dueDays: generalSettings.invoiceDueDays || 7 } : {}),
  }
}