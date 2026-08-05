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
  removeScheduledItem,
  commitScheduledChanges,
} from '../services/agentService'

const DAY_MS  = 86_400_000
const HOUR_MS = 3_600_000
const WEEK_MS = 604_800_000
const TICK_MS = 30_000
const DEBOUNCE_MS = 2_500

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
  if (!Number.isFinite(remainingMs)) return '—'
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
    return new Date((i.dueRaw || i.due) + 'T23:59:59').getTime() < nowMs
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
          desc:      `Invoice for ${order.customerName || 'Customer'}'s order of ${orderName}, priced at ${amount}`,
          detail:    `An invoice will be generated for ${order.customerName || 'a customer'}'s order of ${orderName} (${amount})${order.due ? `, due on ${order.due}` : ''}.`,
          detectedAt,
          fireAt,
          visibleAt,
          draftData: {
            type:    'invoice',
            title:   'Invoice ready for review',
            preview: `Invoice drafted for ${order.customerName || 'a customer'}'s order of ${orderName}, totaling ${amount}${order.due ? `, due on ${order.due}` : ''}.`,
            summary: {
              icon: 'shopping_cart',
              name: orderName,
              amount,
              due: order.due || null
            },
            reason:  `This order was created ${durationLabel(generalSettings.agentAutoInvoiceTimeframe)} ago without an invoice attached. Your assistant drafted one automatically.`,
            tag:     'Invoice',
            status:  'pending',
          },
        })
      })
  }

  if (generalSettings.agentAutoReceipt) {
    const thresholdMs = durationToMs(generalSettings.agentAutoReceiptTimeframe)

    getPendingReceiptItems(allPayments, allReceipts).forEach(({ payment, installment }) => {
      const customer      = customers.find(c => c.id === payment.customerId)
      const customerName  = customer?.name || payment.customerName || 'a customer'
      const amount        = formatMoney(installment.amount, generalSettings.receiptCurrency?.symbol)
      const method        = installment.method || 'cash'
      const detectedAt    = installment.createdAtMs || timestampToMs(payment.createdAt) || nowMs
      const fireAt        = detectedAt + thresholdMs
      const visibleAt     = detectedAt

      candidates.push({
        id:        `receipt-${payment.id}::${installment.id}`,
        type:      'receipt',
        tag:       'Receipt',
        title:     'Generate receipt',
        desc:      `Receipt for ${customerName || 'Customer'}'s order of ${payment.orderDesc}, priced at ${amount}, paid via ${method}`,
        detail:    `A receipt will be generated for the ${amount} ${method} payment recorded from ${customerName}.`,
        detectedAt,
        fireAt,
        visibleAt,
        draftData: {
          type:    'receipt',
          title:   'Receipt ready for review',
          preview: `Receipt for payment of ${amount} by ${customerName}, paid via ${method}.`,
          reason:  `A payment of ${amount} was recorded ${durationLabel(generalSettings.agentAutoReceiptTimeframe)} ago with no receipt generated. Your assistant drafted one automatically.`,
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
        const dueMs = new Date((invoice.dueRaw || invoice.due) + 'T23:59:59').getTime()
        if (!Number.isFinite(dueMs)) return

        const fireAt     = dueMs - reminderMs
        const visibleAt  = fireAt
        const firstName  = invoice.customerName?.split(' ')[0] || 'there'
        const amount     = formatMoney(invoice.totalAmount || invoice.price, generalSettings.invoiceCurrency?.symbol)

        if (fireAt < nowMs - DAY_MS) return

        candidates.push({
          id:        `reminder-${invoice.id}`,
          type:      'reminder',
          tag:       'Reminder',
          title:     `Payment reminder `,
          desc:      `Payment reminder for ${invoice.customerName || 'Customer'} for an invoice due on ${invoice.due}`,
          detail:    `A payment reminder will be sent to ${invoice.customerName || 'a customer'} for their outstanding balance of ${amount}, for an invoice due on ${invoice.due}.`,
          detectedAt: nowMs,
          fireAt,
          visibleAt,
          draftData: {
            type:    'reminder',
            title:   `Payment reminder ready for review`,
            preview: `Hi ${firstName}, this is a friendly reminder that your balance of ${amount} is due on ${invoice.due}. Kindly make payment at your earliest convenience. Thank you!`,
            reason:  `${invoice.customerName || 'This customer'}'s invoice falls due within ${durationLabel(generalSettings.agentPaymentReminderBefore)}, which is within your configured reminder window.`,
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
        const dueMs = new Date((invoice.dueRaw || invoice.due) + 'T23:59:59').getTime()
        if (!Number.isFinite(dueMs)) return

        const fireAt    = dueMs + gracePeriodMs
        const visibleAt = dueMs
        const amount    = formatMoney(invoice.totalAmount || invoice.price, generalSettings.invoiceCurrency?.symbol)

        candidates.push({
          id:        `overdue-${invoice.id}`,
          type:      'overdue',
          tag:       'Overdue',
          title:     `Overdue alert for ${invoice.customerName || 'Customer'}`,
          desc:      `Overdue invoice notice for order ${invoice.orderDesc || 'Order'}, placed by ${invoice.customerName || 'Customer'} and due on ${invoice.due}`,
          detail:    `An overdue notice will be raised for ${invoice.customerName || 'a customer'}'s unpaid invoice of ${amount}, which was due on ${invoice.due}.`,
          detectedAt: dueMs,
          fireAt,
          visibleAt,
          draftData: {
            type:    'overdue',
            title:   `Overdue invoice message ready for review`,
            preview: `${invoice.customerName || 'A customer'}'s invoice for ${amount} is overdue. It was due on ${invoice.due} and has not been settled beyond your grace period of ${durationLabel(generalSettings.agentOverdueGracePeriod)}.`,
            reason:  `This invoice passed its due date of ${invoice.due} and has remained unpaid beyond your grace period of ${durationLabel(generalSettings.agentOverdueGracePeriod)}.`,
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
        const completedAtMs = timestampToMs(order.completedAt)
        if (!completedAtMs) return
        const fireAt    = completedAtMs + windowMs
        const visibleAt = completedAtMs
        const amount    = formatMoney(order.totalAmount || order.price, generalSettings.invoiceCurrency?.symbol)

        candidates.push({
          id:        `orderready-${order.id}`,
          type:      'orderready',
          tag:       'Ready',
          title:     `Order ready for pickup reminder for ${order.customerName || 'Customer'} ready for review`,
          desc:      `${order.customerName || 'Customer'}'s order of ${order.desc || 'item'} is ready for pickup, but has not been collected for over ${durationLabel(generalSettings.agentOrderReadyWindow)}`,
          detail:    `A pickup reminder will be raised for ${order.customerName || 'a customer'}'s order (${order.desc || 'item'}), which has been ready for over ${durationLabel(generalSettings.agentOrderReadyWindow)}.`,
          detectedAt: completedAtMs,
          fireAt,
          visibleAt,
          draftData: {
            type:    'orderready',
            title:   `Order ready for pickup reminder ready for review`,
            preview: `${order.customerName || 'A customer'}'s order (${order.desc || 'item'}) has been ready for pickup for over ${durationLabel(generalSettings.agentOrderReadyWindow)} with no collection recorded yet.`,
            summary: { icon: 'inventory_2', name: order.desc || 'order', amount, due: null },
            reason:  `This order was marked as completed more than ${durationLabel(generalSettings.agentOrderReadyWindow)} ago without the order being marked as delivered.`,
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
      const bdayMs   = new Date(today.getFullYear(), bday.getMonth(), bday.getDate(), 23, 59, 59).getTime()
      const diffDays = Math.round((bdayMs - nowMs) / DAY_MS)
      const firstName = customer.name.split(' ')[0]

      if (diffDays < -1) return

      const fireAt    = bdayMs
      const visibleAt = bdayMs - noticeDurationMs

      candidates.push({
        id:        `birthday-${customer.id}-${today.getFullYear()}`,
        type:      'birthday',
        tag:       'Birthday',
        title:     `Draft birthday message`,
        desc:      diffDays <= 0
          ? `Today is ${customer.name}'s birthday`
          : `${customer.name}'s birthday is in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
        detail:    diffDays <= 0
          ? `A birthday message will be drafted for ${customer.name}, since today is their birthday.`
          : `A birthday message will be drafted for ${customer.name} in ${diffDays} day${diffDays !== 1 ? 's' : ''}.`,
        detectedAt: nowMs,
        fireAt,
        visibleAt,
        draftData: {
          type:    'birthday',
          title:   'Birthday message ready for review',
          preview: `Hi ${firstName}! Wishing you a very happy birthday today. It's been such a pleasure working with you, hope your day is everything you deserve! 🎂`,
          reason:  diffDays <= 0
            ? `Today is ${customer.name}'s birthday. The message is ready to send.`
            : `${customer.name}'s birthday is in ${diffDays} day${diffDays !== 1 ? 's' : ''}. This draft was prepared ${durationLabel(generalSettings.agentBirthdayNotice)} in advance.`,
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

      const fireAt       = lastActivityMs + inactivityMs
      const visibleAt    = lastActivityMs + (inactivityMs * 0.75)
      const inactiveDays = Math.floor((nowMs - lastActivityMs) / DAY_MS)
      const firstName    = customer.name.split(' ')[0]

      candidates.push({
        id:        `followup-${customer.id}`,
        type:      'followup',
        tag:       'Follow-up',
        title:     `Win-back for ${customer.name}`,
        desc:      `Last order ${inactiveDays} day${inactiveDays !== 1 ? 's' : ''} ago`,
        detail:    `A win-back message will be sent to ${customer.name}, who last placed an order ${inactiveDays} day${inactiveDays !== 1 ? 's' : ''} ago.`,
        detectedAt: lastActivityMs,
        fireAt,
        visibleAt,
        draftData: {
          type:    'followup',
          title:   'Win-back message ready for review',
          preview: `Hi ${firstName}! It's been a while since your last visit. We'd love to create something new for you, reach out whenever you're ready!`,
          reason:  `${customer.name} hasn't placed an order in over ${durationLabel(generalSettings.agentFollowUpInactivity)}, exceeding your configured follow-up inactivity window.`,
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
  const [nowTick,           setNowTick]           = useState(() => Date.now())
  const [agentDataLoaded,   setAgentDataLoaded]   = useState(false)
  const processingRef = useRef(new Set())

  useEffect(() => {
    if (!user || !enabled) {
      setPersistedDrafts([])
      setScheduledItems([])
      setKnownDraftIds(new Set())
      setKnownScheduledIds(new Set())
      setAgentDataLoaded(false)
      return
    }

    let cancelled = false
    setAgentDataLoaded(false)

    function load() {
      Promise.all([
        loadAgentDrafts(user.uid),
        loadScheduledItems(user.uid),
      ]).then(([drafts, scheduled]) => {
        if (cancelled) return
        setPersistedDrafts(drafts)
        setScheduledItems([...scheduled].sort((a, b) => a.fireAt - b.fireAt))
        setKnownDraftIds(new Set(drafts.map(d => d.id)))
        setKnownScheduledIds(new Set(scheduled.map(s => s.id)))
        setAgentDataLoaded(true)
      }).catch(err => {
        console.error('[AutonomousAgentContext] failed to load agent data, will retry:', err)
        if (cancelled) return
        setTimeout(load, 15_000)
      })
    }

    load()
    return () => { cancelled = true }
  }, [user, enabled])

  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => setNowTick(Date.now()), TICK_MS)
    return () => clearInterval(id)
  }, [enabled])

  const candidates = useMemo(() => {
    if (!enabled) return []
    return detectCandidates({
      generalSettings,
      customers,
      allOrders,
      allInvoices,
      allPayments,
      allReceipts,
    })
  }, [enabled, generalSettings, customers, allOrders, allInvoices, allPayments, allReceipts])

  useEffect(() => {
    if (!user || !enabled || !agentDataLoaded) return

    const timer = setTimeout(() => {
      const nowMs           = Date.now()
      const scheduleUpserts = []
      const scheduleRemovals = []
      const draftsToCreate  = []

      candidates.forEach(candidate => {
        if (processingRef.current.has(candidate.id)) return

        const alreadyDraft     = knownDraftIds.has(candidate.id)
        const alreadyScheduled = knownScheduledIds.has(candidate.id)

        if (alreadyDraft) return

        if (candidate.fireAt <= nowMs) {
          draftsToCreate.push({ candidate, alreadyScheduled })
          return
        }

        if (candidate.visibleAt > nowMs) return

        if (!alreadyScheduled) {
          scheduleUpserts.push({
            id:   candidate.id,
            data: {
              id:         candidate.id,
              type:       candidate.type,
              tag:        candidate.tag,
              title:      candidate.title,
              desc:       candidate.desc,
              detail:     candidate.detail,
              detectedAt: candidate.detectedAt,
              fireAt:     candidate.fireAt,
              visibleAt:  candidate.visibleAt,
            },
          })
          return
        }

        const existing = scheduledItems.find(s => s.id === candidate.id)
        if (existing && existing.fireAt !== candidate.fireAt) {
          scheduleUpserts.push({
            id:   candidate.id,
            data: { fireAt: candidate.fireAt, desc: candidate.desc, detail: candidate.detail },
          })
        }
      })

      const candidateIds = new Set(candidates.map(c => c.id))
      scheduledItems.forEach(item => {
        if (!candidateIds.has(item.id) && !knownDraftIds.has(item.id)) {
          scheduleRemovals.push(item.id)
        }
      })

      draftsToCreate.forEach(({ candidate, alreadyScheduled }) => {
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
        }).catch(err => {
          console.error('[AutonomousAgentContext] createAgentDraft failed for', candidate.id, err)
          processingRef.current.delete(candidate.id)
          setKnownDraftIds(prev => {
            const next = new Set(prev)
            next.delete(candidate.id)
            return next
          })
        })
      })

      if (!scheduleUpserts.length && !scheduleRemovals.length) return

      const upsertIds = scheduleUpserts.map(u => u.id)
      upsertIds.forEach(id => processingRef.current.add(id))
      scheduleRemovals.forEach(id => processingRef.current.add(id))

      commitScheduledChanges(user.uid, { upserts: scheduleUpserts, removals: scheduleRemovals }).then(() => {
        upsertIds.forEach(id => processingRef.current.delete(id))
        scheduleRemovals.forEach(id => processingRef.current.delete(id))

        setKnownScheduledIds(prev => {
          const next = new Set(prev)
          upsertIds.forEach(id => next.add(id))
          scheduleRemovals.forEach(id => next.delete(id))
          return next
        })

        setScheduledItems(prev => {
          const kept = prev.filter(s => !scheduleRemovals.includes(s.id))
          const map  = new Map(kept.map(s => [s.id, s]))
          scheduleUpserts.forEach(({ id, data }) => {
            map.set(id, { ...(map.get(id) || {}), ...data })
          })
          return [...map.values()].sort((a, b) => a.fireAt - b.fireAt)
        })
      }).catch(err => {
        console.error('[AutonomousAgentContext] commitScheduledChanges failed:', err)
        upsertIds.forEach(id => processingRef.current.delete(id))
        scheduleRemovals.forEach(id => processingRef.current.delete(id))
      })
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [user, enabled, agentDataLoaded, candidates, knownDraftIds, knownScheduledIds, scheduledItems])

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
    return scheduledItems
      .filter(s => !knownDraftIds.has(s.id))
      .map(s => ({
        id:     s.id,
        type:   s.type,
        tag:    s.tag,
        title:  s.title,
        desc:   s.desc,
        detail: s.detail || s.desc,
        when:   whenLabel(s.fireAt - nowTick),
        fireAt: s.fireAt,
      }))
      .sort((a, b) => a.fireAt - b.fireAt)
  }, [scheduledItems, knownDraftIds, nowTick])

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