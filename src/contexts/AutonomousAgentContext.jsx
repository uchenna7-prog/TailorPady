import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { useAuth }            from './AuthContext'
import { useCustomers }       from './CustomerContext'
import { useOrders }          from './OrdersContext'
import { useInvoices }        from './InvoiceContext'
import { usePayments }        from './PaymentContext'
import { useReceipts }        from './ReceiptContext'
import { useGeneralSettings } from './GeneralSettingsContext'
import {
  loadAgentDrafts,
  createAgentDraftIfMissing,
  updateAgentDraftStatus,
} from '../services/agentService'

const DAY_MS = 86_400_000

function daysToMs(days) {
  return (Number(days) || 0) * DAY_MS
}

function durationLabel(days) {
  const n = Number(days) || 0
  return `${n} day${n === 1 ? '' : 's'}`
}

function timeframeToMs(timeframe) {
  const match = String(timeframe || '').match(/^(\d+)(day|hour|week)s?$/)
  if (!match) return DAY_MS
  const amount = Number(match[1]) || 1
  const unitMs = { hour: 3_600_000, day: DAY_MS, week: 604_800_000 }
  return amount * (unitMs[match[2]] || DAY_MS)
}

function timeframeLabel(timeframe) {
  const match = String(timeframe || '').match(/^(\d+)(day|hour|week)s?$/)
  if (!match) return '1 day'
  const amount = Number(match[1]) || 1
  const unit   = match[2]
  return `${amount} ${unit}${amount === 1 ? '' : 's'}`
}

function formatMoney(amount, currencySymbol = '₦') {
  if (!amount) return `${currencySymbol}0`
  return `${currencySymbol}${Number(amount).toLocaleString()}`
}

function timestampToMs(value) {
  if (!value) return 0
  if (typeof value === 'number') return value
  if (typeof value.toDate === 'function') return value.toDate().getTime()
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return isNaN(parsed) ? 0 : parsed.getTime()
  }
  return 0
}

function formatDateLabel(ms) {
  if (!ms) return 'Other'
  const date      = new Date(ms)
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()

  if (isSameDay(date, today))     return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'

  return (
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' +
    date.getFullYear()
  )
}

function formatClockLabel(ms) {
  if (!ms) return ''
  return new Date(ms).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function getPendingReceiptItems(allPayments, allReceipts) {
  const items = []

  allPayments.forEach(payment => {
    if (!Array.isArray(payment.installments) || !payment.installments.length) return

    const receiptedIds = new Set(
      allReceipts
        .filter(r => String(r.paymentId) === String(payment.id))
        .flatMap(r => r.installmentIds || [])
        .map(String)
    )

    payment.installments.forEach(installment => {
      if (receiptedIds.has(String(installment.id))) return
      items.push({ payment, installment })
    })
  })

  return items
}

function buildCandidateItems({
  generalSettings,
  customers,
  allOrders,
  allInvoices,
  allPayments,
  allReceipts,
}) {
  const nowMs      = Date.now()
  const candidates = []

  if (generalSettings.agentAutoInvoice) {
    const thresholdMs      = timeframeToMs(generalSettings.agentAutoInvoiceTimeframe)
    const invoicedOrderIds = new Set(allInvoices.map(i => i.orderId))

    allOrders
      .filter(o => {
        if (invoicedOrderIds.has(o.id)) return false
        if (o.status === 'cancelled')   return false
        const createdAtMs = timestampToMs(o.createdAt)
        return createdAtMs > 0 && (nowMs - createdAtMs) > thresholdMs
      })
      .forEach(order => {
        const orderName = order.desc || 'order'
        const amount    = formatMoney(order.totalAmount || order.price, generalSettings.invoiceCurrency?.symbol)
        const due       = order.due || null

        candidates.push({
          draftId: `invoice-${order.id}`,
          type:    'invoice',
          title:   'Invoice drafted',
          preview: `Drafted invoice for ${orderName} — ${amount}${due ? `, due ${due}` : ''}`,
          summary: { icon: 'shopping_cart', name: orderName, amount, due },
          reason:  `This order had no invoice ${timeframeLabel(generalSettings.agentAutoInvoiceTimeframe)} after it was created. That matches your auto-invoice rule, so Pady drafted one for you to review.`,
          tag:     'Invoice',
        })
      })
  }

  if (generalSettings.agentAutoReceipt) {
    getPendingReceiptItems(allPayments, allReceipts).forEach(({ payment, installment }) => {
      const customer = customers.find(c => c.id === payment.customerId)
      candidates.push({
        draftId: `receipt-${payment.id}::${installment.id}`,
        type:    'receipt',
        title:   'Receipt drafted',
        preview: `Receipt for ${formatMoney(installment.amount, generalSettings.receiptCurrency?.symbol)} paid by ${customer?.name || payment.customerName || 'a customer'} via ${installment.method || 'cash'}.`,
        reason:  `A payment was recorded for ${customer?.name || payment.customerName || 'this customer'} and no receipt had been generated for it yet.`,
        tag:     'Receipt',
      })
    })
  }

  if (generalSettings.agentBirthdayMessages) {
    const noticeDays = Number(generalSettings.agentBirthdayNoticeDays) || 1
    const today      = new Date()

    customers.forEach(customer => {
      if (!customer.birthday) return
      const bday     = new Date(customer.birthday)
      const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
      const diffDays = Math.round((thisYear - today) / DAY_MS)

      if (diffDays >= 0 && diffDays <= noticeDays) {
        candidates.push({
          draftId: `birthday-${customer.id}-${today.getFullYear()}`,
          type:    'birthday',
          title:   'Birthday message drafted',
          preview: `Hi ${customer.name.split(' ')[0]}! Wishing you a wonderful birthday. It's always a pleasure working with you. Hope to see you soon!`,
          reason:  diffDays === 0
            ? `Today is ${customer.name}'s birthday.`
            : `${customer.name}'s birthday is in ${diffDays} day${diffDays !== 1 ? 's' : ''}, within your ${durationLabel(noticeDays)} notice window.`,
          tag: 'Birthday',
        })
      }
    })
  }

  if (generalSettings.agentPaymentReminder) {
    const reminderMs = daysToMs(generalSettings.agentPaymentReminderDays)

    allInvoices
      .filter(i => {
        if (i.status === 'paid' || !i.due) return false
        const dueTime      = new Date(i.due + 'T23:59:59').getTime()
        const timeUntilDue = dueTime - nowMs
        return timeUntilDue > 0 && timeUntilDue <= reminderMs
      })
      .forEach(invoice => {
        candidates.push({
          draftId: `reminder-${invoice.id}`,
          type:    'reminder',
          title:   `Payment reminder drafted — ${invoice.customerName || 'Customer'}`,
          preview: `Hi ${invoice.customerName || 'there'}, just a reminder that your balance of ${formatMoney(invoice.totalAmount || invoice.price, generalSettings.invoiceCurrency?.symbol)} is due on ${invoice.due}. Kindly make payment at your earliest convenience. Thank you!`,
          reason:  `The invoice due date is within ${durationLabel(generalSettings.agentPaymentReminderDays)}, your reminder window.`,
          tag:     'Reminder',
        })
      })
  }

  if (generalSettings.agentFollowUp) {
    const inactivityMs = timeframeToMs(generalSettings.agentFollowUpInactivity)

    customers.forEach(customer => {
      const customerOrders = allOrders.filter(o => o.customerId === customer.id)
      if (!customerOrders.length) return

      const lastOrder = customerOrders.reduce((latest, o) => {
        const ms = timestampToMs(o.createdAt)
        return ms > timestampToMs(latest?.createdAt) ? o : latest
      }, customerOrders[0])

      const lastActivityMs = timestampToMs(lastOrder.createdAt)
      if (lastActivityMs > 0 && (nowMs - lastActivityMs) >= inactivityMs) {
        candidates.push({
          draftId: `followup-${customer.id}`,
          type:    'followup',
          title:   'Follow-up message drafted',
          preview: `Hi ${customer.name.split(' ')[0]}! It's been a while since your last visit. We'd love to create something special for you again. Feel free to reach out anytime!`,
          reason:  `${customer.name} hasn't placed an order in over ${timeframeLabel(generalSettings.agentFollowUpInactivity)}, your follow-up window.`,
          tag:     'Follow-up',
        })
      }
    })
  }

  return candidates
}

const AutonomousAgentContext = createContext(null)

export function AutonomousAgentProvider({ children }) {
  const { user }            = useAuth()
  const { generalSettings } = useGeneralSettings()
  const { customers }       = useCustomers()
  const { allOrders }       = useOrders()
  const { allInvoices }     = useInvoices()
  const { allPayments }     = usePayments()
  const { allReceipts }     = useReceipts()

  const enabled = generalSettings.agentEnabled

  const [persistedDrafts,      setPersistedDrafts]      = useState([])
  const [knownDraftIds,        setKnownDraftIds]        = useState(new Set())
  const [cancelledUpcomingIds, setCancelledUpcomingIds] = useState([])

  useEffect(() => {
    if (!user || !enabled) {
      setPersistedDrafts([])
      setKnownDraftIds(new Set())
      return
    }
    loadAgentDrafts(user.uid).then(drafts => {
      setPersistedDrafts(drafts)
      setKnownDraftIds(new Set(drafts.map(d => d.id)))
    })
  }, [user, enabled])

  const candidates = useMemo(() => {
    if (!enabled) return []
    return buildCandidateItems({
      generalSettings,
      customers,
      allOrders,
      allInvoices,
      allPayments,
      allReceipts,
    })
  }, [enabled, generalSettings, customers, allOrders, allInvoices, allPayments, allReceipts])

  useEffect(() => {
    if (!user || !enabled || !candidates.length) return

    candidates.forEach(candidate => {
      if (knownDraftIds.has(candidate.draftId)) return

      setKnownDraftIds(prev => new Set(prev).add(candidate.draftId))

      createAgentDraftIfMissing(user.uid, candidate.draftId, {
        type:    candidate.type,
        title:   candidate.title,
        preview: candidate.preview,
        summary: candidate.summary || null,
        reason:  candidate.reason,
        tag:     candidate.tag,
        status:  'pending',
      }).then(created => {
        if (!created) return
        setPersistedDrafts(prev => [
          {
            id:        candidate.draftId,
            type:      candidate.type,
            title:     candidate.title,
            preview:   candidate.preview,
            summary:   candidate.summary || null,
            reason:    candidate.reason,
            tag:       candidate.tag,
            status:    'pending',
            createdAt: Date.now(),
          },
          ...prev,
        ])
      })
    })
  }, [user, enabled, candidates, knownDraftIds])

  const activeDrafts = useMemo(
    () => persistedDrafts.filter(d => d.status !== 'discarded'),
    [persistedDrafts]
  )

  const doneTasks = useMemo(() => activeDrafts.map(draft => {
    const createdAtMs = timestampToMs(draft.createdAt)
    const dateLabel   = formatDateLabel(createdAtMs)
    const clockLabel  = formatClockLabel(createdAtMs)
    return {
      id:      draft.id,
      type:    draft.type,
      title:   draft.title,
      desc:    draft.preview,
      summary: draft.summary || null,
      reason:  draft.reason,
      tag:     draft.tag,
      date:    dateLabel,
      time:    clockLabel ? `${dateLabel}, ${clockLabel}` : dateLabel,
    }
  }), [activeDrafts])

  const drafts = useMemo(() => activeDrafts.map(draft => {
    const createdAtMs = timestampToMs(draft.createdAt)
    const dateLabel   = formatDateLabel(createdAtMs)
    const clockLabel  = formatClockLabel(createdAtMs)
    return {
      id:      draft.id,
      type:    draft.type,
      title:   draft.title,
      preview: draft.preview,
      summary: draft.summary || null,
      tag:     draft.tag,
      date:    dateLabel,
      time:    clockLabel ? `${dateLabel}, ${clockLabel}` : dateLabel,
    }
  }), [activeDrafts])

  const upcomingTasks = useMemo(() => {
    if (!enabled) return []
    const nowMs = Date.now()
    const items = []

    if (generalSettings.agentAutoInvoice) {
      const thresholdMs      = timeframeToMs(generalSettings.agentAutoInvoiceTimeframe)
      const invoicedOrderIds = new Set(allInvoices.map(i => i.orderId))

      allOrders
        .filter(o => {
          if (invoicedOrderIds.has(o.id)) return false
          if (o.status === 'cancelled')   return false
          const createdAtMs = timestampToMs(o.createdAt)
          const age         = nowMs - createdAtMs
          return createdAtMs > 0 && age > 0 && age <= thresholdMs
        })
        .forEach(order => {
          const createdAtMs = timestampToMs(order.createdAt)
          const remaining   = thresholdMs - (nowMs - createdAtMs)
          const hours       = Math.ceil(remaining / 3_600_000)
          const whenLabel   = hours < 1 ? 'Soon' : hours < 24 ? `In ${hours}h` : `In ${Math.ceil(hours / 24)}d`

          items.push({
            id:    `upcoming-invoice-${order.id}`,
            type:  'invoice',
            title: 'Will auto-generate invoice',
            desc:  `Order for ${order.customerName || 'unknown'} — ${order.desc || ''}.`,
            when:  whenLabel,
            tag:   'Invoice',
          })
        })
    }

    if (generalSettings.agentPaymentReminder) {
      const reminderMs = daysToMs(generalSettings.agentPaymentReminderDays)

      allInvoices
        .filter(i => {
          if (i.status === 'paid' || !i.due) return false
          const dueTime      = new Date(i.due + 'T23:59:59').getTime()
          const timeUntilDue = dueTime - nowMs
          return timeUntilDue > reminderMs && timeUntilDue <= reminderMs * 3
        })
        .forEach(invoice => {
          items.push({
            id:    `upcoming-reminder-${invoice.id}`,
            type:  'reminder',
            title: 'Will draft payment reminder',
            desc:  `Invoice for ${invoice.customerName || 'a customer'} is due ${invoice.due}.`,
            when:  `Before ${invoice.due}`,
            tag:   'Reminder',
          })
        })
    }

    if (generalSettings.agentBirthdayMessages) {
      const noticeDays = Number(generalSettings.agentBirthdayNoticeDays) || 1
      const today      = new Date()

      customers
        .filter(c => {
          if (!c.birthday) return false
          const bday     = new Date(c.birthday)
          const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
          const diffDays = Math.round((thisYear - today) / DAY_MS)
          return diffDays > noticeDays && diffDays <= noticeDays + 7
        })
        .forEach(customer => {
          const bday     = new Date(customer.birthday)
          const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
          const diffDays = Math.round((thisYear - today) / DAY_MS)
          items.push({
            id:    `upcoming-birthday-${customer.id}`,
            type:  'birthday',
            title: 'Will draft birthday message',
            desc:  `${customer.name}'s birthday is in ${diffDays} day${diffDays !== 1 ? 's' : ''}.`,
            when:  `In ${diffDays} days`,
            tag:   'Birthday',
          })
        })
    }

    return items.filter(item => !cancelledUpcomingIds.includes(item.id))
  }, [enabled, generalSettings, allOrders, allInvoices, customers, cancelledUpcomingIds])

  const cancelUpcoming = useCallback((id) => {
    setCancelledUpcomingIds(prev => [...prev, id])
  }, [])

  const discardDraft = useCallback((id) => {
    if (!user) return
    setPersistedDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'discarded' } : d))
    updateAgentDraftStatus(user.uid, id, 'discarded')
  }, [user])

  return (
    <AutonomousAgentContext.Provider value={{
      enabled,
      doneTasks,
      upcomingTasks,
      drafts,
      cancelUpcoming,
      discardDraft,
    }}>
      {children}
    </AutonomousAgentContext.Provider>
  )
}

export function useAutonomousAgent() {
  const ctx = useContext(AutonomousAgentContext)
  if (!ctx) throw new Error('useAutonomousAgent must be used inside AutonomousAgentProvider')
  return ctx
}
