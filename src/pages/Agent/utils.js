export function getGreeting(name) {
  const h = new Date().getHours()
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${salutation}${name ? `, ${name}` : ''}! 👋`
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
  if (commaIdx !== -1) return timeStr.slice(commaIdx + 2)
  return timeStr
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

export function resolveCustomerName(item, allOrders, allInvoices, customers) {
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

export function resolveOrderName(item, allOrders, allInvoices) {
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
  return order?.desc || order?.name || null
}

export function fmt(currency, value) {
  return `${currency.symbol || currency}${parseFloat(value || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function buildInvoiceMessage(invoice, customer, brand) {
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

export function buildReceiptMessage(receipt, customer, brand) {
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

export function buildBrandSnapshot(profileSettings, generalSettings, docType = 'invoice') {
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

