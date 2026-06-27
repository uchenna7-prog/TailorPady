import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
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
  createAgentDraft,
  updateAgentDraftStatus,
  loadScheduledItems,
  upsertScheduledItem,
  removeScheduledItem,
} from '../services/agentService'

const DAY_MS  = 86_400_000
const HOUR_MS = 3_600_000
const WEEK_MS = 604_800_000

function durationToMs(duration) {
  if (!duration || typeof duration !== 'object') return DAY_MS
  const amount = Number(duration.amount) || 1
  const unitMs = { hours: HOUR_MS, days: DAY_MS, weeks: WEEK_MS, months: DAY_MS * 30 }
  return amount * (unitMs[duration.unit] || DAY_MS)
}

function durationLabel(duration) {
  if (!duration || typeof duration !== 'object') return '1 day'
  const amount = Number(duration.amount) || 1
  const unit   = duration.unit || 'days'
  const base   = unit.replace(/s$/, '')
  return `${amount} ${amount === 1 ? base : unit}`
}

function timestampToMs(value) {
  if (!value) return 0
  if (typeof value === 'number') return value
  if (typeof value.toDate === 'function') return value.toDate().getTime()
  if (value.seconds !== undefined) return value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1_000_000)
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return isNaN(parsed) ? 0 : parsed.getTime()
  }
  return 0
}

function formatMoney(amount, currencySymbol = '₦') {
  if (!amount) return `${currencySymbol}0`
  return `${currencySymbol}${Number(amount).toLocaleString()}`
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

function whenLabel(remainingMs) {
  if (remainingMs <= 0) return 'Soon'
  const totalMins  = remainingMs / (1000 * 60)
  const totalHours = remainingMs / HOUR_MS
  const totalDays  = remainingMs / DAY_MS
  const totalWeeks = remainingMs / WEEK_MS

  if (totalMins  < 60)  return `In ${Math.round(totalMins)}m`
  if (totalHours < 24)  return `In ${Math.floor(totalHours)}h ${Math.round(totalMins % 60)}m`
  if (totalDays  < 7)   return `In ${Math.floor(totalDays)}d`
  if (totalWeeks < 5)   return `In ${Math.floor(totalWeeks)}w ${Math.floor(totalDays % 7)}d`
  return `In ${Math.floor(remainingMs / (DAY_MS * 30))}mo`
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

function buildDailyBrief({
  generalSettings,
  customers,
  allOrders,
  allInvoices,
  allPayments,
  allReceipts,
  pendingDraftsCount,
  scheduledCount,
}) {
  const nowMs   = Date.now()
  const todayMs = new Date().setHours(0, 0, 0, 0)

  const activeOrders = allOrders.filter(
    o => !['completed', 'delivered', 'cancelled'].includes(o.status)
  )

  const ordersDueToday = activeOrders.filter(o => {
    const due = o.dueDate || o.dueRaw
    if (!due) return false
    return new Date(due + 'T00:00:00').getTime() === todayMs
  })

  const overdueInvoices = allInvoices.filter(i => {
    if (i.status === 'paid' || !i.due) return false
    return new Date(i.due + 'T23:59:59').getTime() < nowMs
  })

  const pendingReceiptItems = generalSettings.agentAutoReceipt
    ? getPendingReceiptItems(allPayments, allReceipts)
    : []

  const upcomingBirthdays = (() => {
    if (!generalSettings.agentBirthdayMessages) return []
    const today    = new Date()
    const windowMs = DAY_MS * 7
    return customers.filter(c => {
      if (!c.birthday) return false
      const bday     = new Date(c.birthday)
      const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
      const diffMs   = thisYear - today
      return diffMs >= 0 && diffMs <= windowMs
    })
  })()

  const lines = []
  if (pendingDraftsCount > 0)         lines.push(`${pendingDraftsCount} draft${pendingDraftsCount !== 1 ? 's' : ''} waiting for your review`)
  if (ordersDueToday.length > 0)      lines.push(`${ordersDueToday.length} order${ordersDueToday.length !== 1 ? 's' : ''} due today`)
  if (overdueInvoices.length > 0)     lines.push(`${overdueInvoices.length} overdue invoice${overdueInvoices.length !== 1 ? 's' : ''}`)
  if (pendingReceiptItems.length > 0) lines.push(`${pendingReceiptItems.length} payment${pendingReceiptItems.length !== 1 ? 's' : ''} without a receipt`)
  if (upcomingBirthdays.length > 0)   lines.push(`${upcomingBirthdays.length} birthday${upcomingBirthdays.length !== 1 ? 's' : ''} coming up this week`)
  if (scheduledCount > 0)             lines.push(`${scheduledCount} action${scheduledCount !== 1 ? 's' : ''} scheduled`)

  return {
    lines,
    isEmpty:           lines.length === 0,
    activeOrders:      activeOrders.length,
    ordersDueToday:    ordersDueToday.length,
    overdueInvoices:   overdueInvoices.length,
    pendingReceipts:   pendingReceiptItems.length,
    upcomingBirthdays: upcomingBirthdays.map(c => c.name),
    pendingDrafts:     pendingDraftsCount,
    upcomingCount:     scheduledCount,
  }
}

function detectCandidates({
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
    const thresholdMs      = durationToMs(generalSettings.agentAutoInvoiceTimeframe)
    const invoicedOrderIds = new Set(allInvoices.map(i => i.orderId))

    allOrders
      .filter(o => {
        if (invoicedOrderIds.has(o.id)) return false
        if (o.status === 'cancelled')   return false
        return timestampToMs(o.createdAt) > 0
      })
      .forEach(order => {
        const detectedAt = timestampToMs(order.createdAt)
        const fireAt     = detectedAt + thresholdMs
        const visibleAt  = detectedAt
        const orderName  = order.desc || 'order'
        const amount     = formatMoney(order.totalAmount || order.price, generalSettings.invoiceCurrency?.symbol)

        candidates.push({
          id:        `invoice-${order.id}`,
          type:      'invoice',
          tag:       'Invoice',
          title:     'Generate invoice',
          desc:      `${order.customerName || 'Customer'} — ${orderName}, ${amount}`,
          detectedAt,
          fireAt,
          visibleAt,
          draftData: {
            type:    'invoice',
            title:   'Invoice drafted',
            preview: `Drafted invoice for ${orderName} — ${amount}${order.due ? `, due ${order.due}` : ''}`,
            summary: { icon: 'shopping_cart', name: orderName, amount, due: order.due || null },
            reason:  `This order had no invoice ${durationLabel(generalSettings.agentAutoInvoiceTimeframe)} after it was created.`,
            tag:     'Invoice',
            status:  'pending',
          },
        })
      })
  }

  if (generalSettings.agentAutoReceipt) {
    const thresholdMs = durationToMs(generalSettings.agentAutoReceiptTimeframe)

    getPendingReceiptItems(allPayments, allReceipts).forEach(({ payment, installment }) => {
      const customer   = customers.find(c => c.id === payment.customerId)
      const detectedAt = installment.createdAtMs || timestampToMs(payment.createdAt) || nowMs
      const fireAt     = detectedAt + thresholdMs
      const visibleAt  = detectedAt

      candidates.push({
        id:        `receipt-${payment.id}::${installment.id}`,
        type:      'receipt',
        tag:       'Receipt',
        title:     'Generate receipt',
        desc:      `${customer?.name || payment.customerName || 'Customer'} — ${formatMoney(installment.amount, generalSettings.receiptCurrency?.symbol)} via ${installment.method || 'cash'}`,
        detectedAt,
        fireAt,
        visibleAt,
        draftData: {
          type:    'receipt',
          title:   'Receipt drafted',
          preview: `Receipt for ${formatMoney(installment.amount, generalSettings.receiptCurrency?.symbol)} paid by ${customer?.name || payment.customerName || 'a customer'} via ${installment.method || 'cash'}.`,
          reason:  `A payment was recorded and no receipt had been generated for it yet. Draft created after ${durationLabel(generalSettings.agentAutoReceiptTimeframe)}.`,
          tag:     'Receipt',
          status:  'pending',
        },
      })
    })
  }

  if (generalSettings.agentPaymentReminder) {
    const reminderMs = durationToMs(generalSettings.agentPaymentReminderBefore)

    allInvoices
      .filter(i => i.status !== 'paid' && i.due)
      .forEach(invoice => {
        const dueMs     = new Date(invoice.due + 'T23:59:59').getTime()
        const fireAt    = dueMs - reminderMs
        const visibleAt = fireAt

        if (fireAt < nowMs - DAY_MS) return

        candidates.push({
          id:        `reminder-${invoice.id}`,
          type:      'reminder',
          tag:       'Reminder',
          title:     'Payment reminder',
          desc:      `${invoice.customerName || 'Customer'} — due ${invoice.due}`,
          detectedAt: nowMs,
          fireAt,
          visibleAt,
          draftData: {
            type:    'reminder',
            title:   `Payment reminder drafted — ${invoice.customerName || 'Customer'}`,
            preview: `Hi ${invoice.customerName || 'there'}, just a reminder that your balance of ${formatMoney(invoice.totalAmount || invoice.price, generalSettings.invoiceCurrency?.symbol)} is due on ${invoice.due}. Kindly make payment at your earliest convenience. Thank you!`,
            reason:  `The invoice due date is within ${durationLabel(generalSettings.agentPaymentReminderBefore)}, your reminder window.`,
            tag:     'Reminder',
            status:  'pending',
          },
        })
      })
  }

  if (generalSettings.agentOverdueAlert) {
    const gracePeriodMs = durationToMs(generalSettings.agentOverdueGracePeriod)

    allInvoices
      .filter(i => i.status !== 'paid' && i.due)
      .forEach(invoice => {
        const dueMs     = new Date(invoice.due + 'T23:59:59').getTime()
        const fireAt    = dueMs + gracePeriodMs
        const visibleAt = dueMs

        candidates.push({
          id:        `overdue-${invoice.id}`,
          type:      'overdue',
          tag:       'Overdue',
          title:     'Overdue alert',
          desc:      `${invoice.customerName || 'Customer'} — due ${invoice.due}`,
          detectedAt: dueMs,
          fireAt,
          visibleAt,
          draftData: {
            type:    'overdue',
            title:   `Overdue invoice — ${invoice.customerName || 'Customer'}`,
            preview: `Invoice for ${formatMoney(invoice.totalAmount || invoice.price, generalSettings.invoiceCurrency?.symbol)} from ${invoice.customerName || 'a customer'} is overdue by more than ${durationLabel(generalSettings.agentOverdueGracePeriod)}.`,
            reason:  `This invoice passed its due date of ${invoice.due} and has been unpaid for longer than your grace period of ${durationLabel(generalSettings.agentOverdueGracePeriod)}.`,
            tag:     'Overdue',
            status:  'pending',
          },
        })
      })
  }

  if (generalSettings.agentOrderReadyReminder) {
    const windowMs = durationToMs(generalSettings.agentOrderReadyWindow)

    allOrders
      .filter(o => o.status === 'completed')
      .forEach(order => {
        const completedAtMs = timestampToMs(order.completedAt || order.updatedAt)
        if (!completedAtMs) return
        const fireAt    = completedAtMs + windowMs
        const visibleAt = completedAtMs

        candidates.push({
          id:        `orderready-${order.id}`,
          type:      'orderready',
          tag:       'Ready',
          title:     'Ready order not picked up',
          desc:      `${order.customerName || 'Customer'} — ${order.desc || 'item'}`,
          detectedAt: completedAtMs,
          fireAt,
          visibleAt,
          draftData: {
            type:    'orderready',
            title:   `Ready order not picked up — ${order.customerName || 'Customer'}`,
            preview: `${order.customerName || 'A customer'}'s order (${order.desc || 'item'}) has been ready for over ${durationLabel(generalSettings.agentOrderReadyWindow)} and hasn't been picked up.`,
            summary: { icon: 'inventory_2', name: order.desc || 'order', amount: formatMoney(order.totalAmount || order.price, generalSettings.invoiceCurrency?.symbol), due: null },
            reason:  `The order was marked complete more than ${durationLabel(generalSettings.agentOrderReadyWindow)} ago.`,
            tag:     'Ready',
            status:  'pending',
          },
        })
      })
  }

  if (generalSettings.agentBirthdayMessages) {
    const noticeDurationMs = durationToMs(generalSettings.agentBirthdayNotice)
    const today            = new Date()

    customers.forEach(customer => {
      if (!customer.birthday) return
      const bday     = new Date(customer.birthday)
      const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
      const bdayMs   = new Date(today.getFullYear(), bday.getMonth(), bday.getDate(), 23, 59, 59).getTime()
      const diffDays = Math.round((bdayMs - nowMs) / DAY_MS)

      if (diffDays < -1) return

      const fireAt    = bdayMs
      const visibleAt = bdayMs - noticeDurationMs

      candidates.push({
        id:        `birthday-${customer.id}-${today.getFullYear()}`,
        type:      'birthday',
        tag:       'Birthday',
        title:     `Birthday — ${customer.name}`,
        desc:      diffDays <= 0
          ? `Today is ${customer.name}'s birthday`
          : `${customer.name}'s birthday in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
        detectedAt: nowMs,
        fireAt,
        visibleAt,
        draftData: {
          type:    'birthday',
          title:   'Birthday message drafted',
          preview: `Hi ${customer.name.split(' ')[0]}! Wishing you a wonderful birthday. It's always a pleasure working with you. Hope to see you soon!`,
          reason:  diffDays <= 0
            ? `Today is ${customer.name}'s birthday.`
            : `${customer.name}'s birthday is in ${diffDays} day${diffDays !== 1 ? 's' : ''}. Draft prepared ${durationLabel(generalSettings.agentBirthdayNotice)} in advance.`,
          tag:    'Birthday',
          status: 'pending',
        },
      })
    })
  }

  if (generalSettings.agentFollowUp) {
    const inactivityMs = durationToMs(generalSettings.agentFollowUpInactivity)

    customers.forEach(customer => {
      const customerOrders = allOrders.filter(o => o.customerId === customer.id)
      if (!customerOrders.length) return

      const lastOrder = customerOrders.reduce((latest, o) =>
        timestampToMs(o.createdAt) > timestampToMs(latest.createdAt) ? o : latest
      , customerOrders[0])

      const lastActivityMs = timestampToMs(lastOrder.createdAt)
      if (!lastActivityMs) return

      const fireAt      = lastActivityMs + inactivityMs
      const visibleAt   = lastActivityMs + (inactivityMs * 0.75)
      const inactiveDays = Math.floor((nowMs - lastActivityMs) / DAY_MS)

      candidates.push({
        id:        `followup-${customer.id}`,
        type:      'followup',
        tag:       'Follow-up',
        title:     `Win-back — ${customer.name}`,
        desc:      `Last order ${inactiveDays}d ago`,
        detectedAt: lastActivityMs,
        fireAt,
        visibleAt,
        draftData: {
          type:    'followup',
          title:   'Win-back message drafted',
          preview: `Hi ${customer.name.split(' ')[0]}! It's been a while since your last visit. We'd love to create something special for you again. Feel free to reach out anytime!`,
          reason:  `${customer.name} hasn't placed an order in over ${durationLabel(generalSettings.agentFollowUpInactivity)}, your follow-up window.`,
          tag:     'Follow-up',
          status:  'pending',
        },
      })
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

  const [persistedDrafts,   setPersistedDrafts]  = useState([])
  const [scheduledItems,    setScheduledItems]    = useState([])
  const [knownDraftIds,     setKnownDraftIds]     = useState(new Set())
  const [knownScheduledIds, setKnownScheduledIds] = useState(new Set())
  const processingRef = useRef(new Set())

  useEffect(() => {
    if (!user || !enabled) {
      setPersistedDrafts([])
      setScheduledItems([])
      setKnownDraftIds(new Set())
      setKnownScheduledIds(new Set())
      return
    }
    Promise.all([
      loadAgentDrafts(user.uid),
      loadScheduledItems(user.uid),
    ]).then(([drafts, scheduled]) => {
      setPersistedDrafts(drafts)
      setScheduledItems(scheduled)
      setKnownDraftIds(new Set(drafts.map(d => d.id)))
      setKnownScheduledIds(new Set(scheduled.map(s => s.id)))
    })
  }, [user, enabled])

  useEffect(() => {
    if (!user || !enabled) return

    const candidates = detectCandidates({
      generalSettings,
      customers,
      allOrders,
      allInvoices,
      allPayments,
      allReceipts,
    })

    const nowMs = Date.now()

    candidates.forEach(candidate => {
      if (processingRef.current.has(candidate.id)) return

      const alreadyDraft     = knownDraftIds.has(candidate.id)
      const alreadyScheduled = knownScheduledIds.has(candidate.id)

      if (alreadyDraft) return

      if (candidate.fireAt <= nowMs) {
        processingRef.current.add(candidate.id)
        setKnownDraftIds(prev => new Set(prev).add(candidate.id))

        createAgentDraft(user.uid, candidate.id, candidate.draftData).then(created => {
          processingRef.current.delete(candidate.id)
          if (!created) return
          setPersistedDrafts(prev => [{
            id:        candidate.id,
            ...candidate.draftData,
            createdAt: Date.now(),
          }, ...prev])

          if (alreadyScheduled) {
            removeScheduledItem(user.uid, candidate.id)
            setScheduledItems(prev => prev.filter(s => s.id !== candidate.id))
            setKnownScheduledIds(prev => {
              const next = new Set(prev)
              next.delete(candidate.id)
              return next
            })
          }
        })
        return
      }

      if (candidate.visibleAt > nowMs) return

      if (!alreadyScheduled) {
        processingRef.current.add(candidate.id)
        setKnownScheduledIds(prev => new Set(prev).add(candidate.id))

        const scheduledData = {
          id:         candidate.id,
          type:       candidate.type,
          tag:        candidate.tag,
          title:      candidate.title,
          desc:       candidate.desc,
          detectedAt: candidate.detectedAt,
          fireAt:     candidate.fireAt,
          visibleAt:  candidate.visibleAt,
        }

        upsertScheduledItem(user.uid, candidate.id, scheduledData).then(() => {
          processingRef.current.delete(candidate.id)
          setScheduledItems(prev => {
            if (prev.find(s => s.id === candidate.id)) return prev
            return [...prev, scheduledData].sort((a, b) => a.fireAt - b.fireAt)
          })
        })
        return
      }

      const existing = scheduledItems.find(s => s.id === candidate.id)
      if (existing && existing.fireAt !== candidate.fireAt) {
        upsertScheduledItem(user.uid, candidate.id, { fireAt: candidate.fireAt })
        setScheduledItems(prev =>
          prev
            .map(s => s.id === candidate.id
              ? { ...s, fireAt: candidate.fireAt, desc: candidate.desc }
              : s
            )
            .sort((a, b) => a.fireAt - b.fireAt)
        )
      }
    })

    const candidateIds = new Set(candidates.map(c => c.id))
    scheduledItems.forEach(item => {
      if (!candidateIds.has(item.id) && !knownDraftIds.has(item.id)) {
        removeScheduledItem(user.uid, item.id)
        setScheduledItems(prev => prev.filter(s => s.id !== item.id))
        setKnownScheduledIds(prev => {
          const next = new Set(prev)
          next.delete(item.id)
          return next
        })
      }
    })

  }, [user, enabled, generalSettings, customers, allOrders, allInvoices, allPayments, allReceipts, knownDraftIds, knownScheduledIds, scheduledItems])

  useEffect(() => {
    if (!scheduledItems.length) return
    const next  = scheduledItems.find(s => s.fireAt > Date.now())
    if (!next)  return
    const delay = Math.min(next.fireAt - Date.now(), 60_000)
    const tid   = setTimeout(() => setScheduledItems(prev => [...prev]), delay)
    return () => clearTimeout(tid)
  }, [scheduledItems])

  const activeDrafts = useMemo(
    () => persistedDrafts.filter(d => d.status !== 'discarded'),
    [persistedDrafts]
  )

  const drafts = useMemo(() => activeDrafts.map(draft => {
    const createdAtMs = timestampToMs(draft.createdAt)
    const dateLabel   = formatDateLabel(createdAtMs)
    const clockLabel  = formatClockLabel(createdAtMs)
    return {
      id:      draft.id,
      type:    draft.type,
      status:  draft.status,
      title:   draft.title,
      preview: draft.preview,
      summary: draft.summary || null,
      reason:  draft.reason,
      tag:     draft.tag,
      date:    dateLabel,
      time:    clockLabel ? `${dateLabel}, ${clockLabel}` : dateLabel,
    }
  }), [activeDrafts])

  const pendingDrafts  = useMemo(() => drafts.filter(d => d.status === 'pending'),  [drafts])
  const approvedDrafts = useMemo(() => drafts.filter(d => d.status === 'approved'), [drafts])

  const upcomingTasks = useMemo(() => {
    const nowMs = Date.now()
    return scheduledItems
      .filter(s => !knownDraftIds.has(s.id))
      .map(s => ({
        id:     s.id,
        type:   s.type,
        tag:    s.tag,
        title:  s.title,
        desc:   s.desc,
        when:   whenLabel(s.fireAt - nowMs),
        fireAt: s.fireAt,
      }))
      .sort((a, b) => a.fireAt - b.fireAt)
  }, [scheduledItems, knownDraftIds])

  const dailyBrief = useMemo(() => {
    if (!enabled || !generalSettings.agentDailyBrief) return null
    return buildDailyBrief({
      generalSettings,
      customers,
      allOrders,
      allInvoices,
      allPayments,
      allReceipts,
      pendingDraftsCount: pendingDrafts.length,
      scheduledCount:     upcomingTasks.length,
    })
  }, [enabled, generalSettings, customers, allOrders, allInvoices, allPayments, allReceipts, pendingDrafts.length, upcomingTasks.length])

  const cancelUpcoming = useCallback((id) => {
    if (!user) return
    removeScheduledItem(user.uid, id)
    setScheduledItems(prev => prev.filter(s => s.id !== id))
    setKnownScheduledIds(prev => { const n = new Set(prev); n.delete(id); return n })
    setKnownDraftIds(prev => new Set(prev).add(id))
  }, [user])

  const approveDraft = useCallback((id) => {
    if (!user) return
    setPersistedDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d))
    updateAgentDraftStatus(user.uid, id, 'approved')
  }, [user])

  const discardDraft = useCallback((id) => {
    if (!user) return
    setPersistedDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'discarded' } : d))
    updateAgentDraftStatus(user.uid, id, 'discarded')
  }, [user])

  return (
    <AutonomousAgentContext.Provider value={{
      enabled,
      drafts,
      pendingDrafts,
      approvedDrafts,
      pendingCount:  pendingDrafts.length,
      approvedCount: approvedDrafts.length,
      upcomingTasks,
      dailyBrief,
      cancelUpcoming,
      approveDraft,
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