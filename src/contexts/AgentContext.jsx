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
import { useTasks }           from './TaskContext'
import { useGeneralSettings } from './GeneralSettingsContext'
import {
  saveAgentMessage,
  loadAgentMessages,
  clearAgentMessages,
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
  const unit = match[2]
  return `${amount} ${unit}${amount === 1 ? '' : 's'}`
}

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatMoney(amount, currencySymbol = '₦') {
  if (!amount) return `${currencySymbol}0`
  return `${currencySymbol}${Number(amount).toLocaleString()}`
}

function parseMoney(str) {
  if (!str) return null
  const cleaned = String(str).replace(/[₦,\s]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function parseDate(str) {
  if (!str) return null
  const s = str.toLowerCase().trim()
  const today = new Date()

  if (s === 'today') return todayISO()
  if (s === 'tomorrow') {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const nextMatch = s.match(/^next\s+(\w+)/)
  if (nextMatch) {
    const idx = dayNames.indexOf(nextMatch[1])
    if (idx !== -1) {
      const d = new Date(today)
      const diff = (idx - d.getDay() + 7) % 7 || 7
      d.setDate(d.getDate() + diff)
      return d.toISOString().slice(0, 10)
    }
  }

  const dayIdx = dayNames.indexOf(s)
  if (dayIdx !== -1) {
    const d = new Date(today)
    const diff = (dayIdx - d.getDay() + 7) % 7 || 7
    d.setDate(d.getDate() + diff)
    return d.toISOString().slice(0, 10)
  }

  const parsed = new Date(str)
  if (!isNaN(parsed)) return parsed.toISOString().slice(0, 10)
  return null
}

function formatDateNice(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatDateLabel(ms) {
  if (!ms) return 'Other'
  const date  = new Date(ms)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.getFullYear()
}

function formatClockLabel(ms) {
  if (!ms) return ''
  return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
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

function findCustomer(customers, nameHint) {
  if (!nameHint) return null
  const lower = nameHint.toLowerCase().trim()
  return (
    customers.find(c => c.name?.toLowerCase() === lower) ||
    customers.find(c => c.name?.toLowerCase().includes(lower)) ||
    customers.find(c => lower.includes(c.name?.toLowerCase() || ''))
  )
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

const INTENTS = [
  { intent: 'add_order',      patterns: [/add.*(order|job)/i, /new.*(order|job)/i, /creat.*(order|job)/i, /take.*order/i, /order for/i] },
  { intent: 'gen_invoice',    patterns: [/generat.*invoice/i, /creat.*invoice/i, /send.*invoice/i, /invoice for/i, /make.*invoice/i] },
  { intent: 'record_payment', patterns: [/paid/i, /record.*pay/i, /payment.*from/i, /just paid/i, /received.*payment/i, /mark.*paid/i] },
  { intent: 'add_task',       patterns: [/add.*task/i, /remind me/i, /creat.*task/i, /new.*task/i, /note to/i] },
  { intent: 'add_appt',       patterns: [/schedul/i, /book.*appt/i, /book.*appointment/i, /set.*appointment/i, /appt.*for/i, /fitting.*for/i] },
  { intent: 'query_customer', patterns: [/how much.*owe/i, /balance.*for/i, /what.*owe/i, /does.*owe/i, /owe.*me/i] },
  { intent: 'query_orders',   patterns: [/orders.*due/i, /what.*due/i, /pending.*order/i, /active.*order/i, /show.*order/i] },
  { intent: 'query_overdue',  patterns: [/overdue/i, /late.*invoice/i, /unpaid/i, /who.*not.*paid/i] },
  { intent: 'query_summary',  patterns: [/summar/i, /how.*doing/i, /today.*status/i, /what.*happening/i, /overview/i, /snapshot/i] },
  { intent: 'update_status',  patterns: [/mark.*as/i, /status.*to/i, /update.*status/i, /set.*status/i, /change.*to/i, /ready/i, /complet/i, /deliver/i] },
  { intent: 'check_measurements', patterns: [/measurement/i, /measure/i, /size.*for/i, /has.*measurement/i] },
]

function detectIntent(text) {
  for (const { intent, patterns } of INTENTS) {
    if (patterns.some(p => p.test(text))) return intent
  }
  return 'unknown'
}

function extractCustomerName(text) {
  const patterns = [
    /(?:for|from|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'s/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:paid|owes|order)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1].trim()
  }
  return null
}

const FLOWS = {
  add_order: [
    { key: 'customerName', question: "What's the customer's name?" },
    { key: 'desc',         question: "What are they ordering? (e.g. Agbada and trouser)" },
    {
      key: 'price', question: "What's the total price?",
      validate: v => parseMoney(v) !== null, errMsg: "Please enter a valid amount like 45000 or ₦45,000",
      transform: v => parseMoney(v),
    },
    {
      key: 'dueDate', question: "When is it due? (e.g. May 20, next Friday, tomorrow)",
      validate: v => parseDate(v) !== null, errMsg: "I didn't get that date. Try 'May 20' or 'next Friday'",
      transform: v => parseDate(v),
    },
    { key: 'deposit', question: "Has the customer paid a deposit? If yes, how much? (or say 'no')" },
    { key: 'hasMeasurements', question: "Do you already have their measurements? (yes / no)" },
  ],
  gen_invoice: [
    { key: 'customerName', question: "Which customer is this invoice for?" },
    { key: 'orderId', question: null },
  ],
  record_payment: [
    { key: 'customerName', question: "Which customer made the payment?" },
    {
      key: 'amount', question: "How much did they pay?",
      validate: v => parseMoney(v) !== null, errMsg: "Please enter a valid amount",
      transform: v => parseMoney(v),
    },
    { key: 'method', question: "How did they pay? (cash / transfer / card)" },
    { key: 'orderId', question: null },
  ],
  add_task: [
    { key: 'desc', question: "What's the task?" },
    {
      key: 'dueDate', question: "When is it due? (or say 'no date')",
      transform: v => /no date|none|skip/i.test(v) ? null : parseDate(v),
    },
    {
      key: 'customerName', question: "Is this for a specific customer? (name or 'no')",
      transform: v => /^no$/i.test(v.trim()) ? null : v.trim(),
    },
  ],
  add_appt: [
    { key: 'customerName', question: "Who is the appointment for?" },
    { key: 'type', question: "What type? (fitting / measurement / delivery / consultation / pickup / other)" },
    {
      key: 'date', question: "What date?",
      validate: v => parseDate(v) !== null, errMsg: "I didn't get that date. Try 'May 20' or 'next Friday'",
      transform: v => parseDate(v),
    },
    { key: 'time', question: "What time? (e.g. 2pm, 14:00)" },
  ],
}

const AgentContext = createContext(null)

export function AgentProvider({ children }) {
  const { user }             = useAuth()
  const { customers }        = useCustomers()
  const { allOrders, addOrder, updateOrderStatus } = useOrders()
  const { allInvoices }      = useInvoices()
  const { allPayments }      = usePayments()
  const { tasks, addTask }   = useTasks()
  const { generalSettings }  = useGeneralSettings()

  const [messages,   setMessages]   = useState([])
  const [isTyping,   setIsTyping]   = useState(false)
  const [isLoading,  setIsLoading]  = useState(true)
  const [activeFlow, setActiveFlow] = useState(null)

  useEffect(() => {
    if (!user) { setIsLoading(false); return }
    loadAgentMessages(user.uid).then(history => {
      setMessages(history)
      setIsLoading(false)
    })
  }, [user])

  const persistMsg = useCallback((msg) => {
    if (!user) return
    saveAgentMessage(user.uid, {
      role:    msg.role,
      text:    msg.text,
      meta:    msg.meta    || null,
      actions: msg.actions || null,
    }).catch(console.error)
  }, [user])

  function makeAgentMsg(text, meta = null, actions = null) {
    return { id: Date.now() + Math.random(), role: 'agent', text, meta, actions, time: now() }
  }

  function makeUserMsg(text) {
    return { id: Date.now() + Math.random(), role: 'user', text, time: now() }
  }

  function addMessage(msg) {
    setMessages(prev => [...prev, msg])
    persistMsg(msg)
  }

  async function agentReply(text, meta = null, actions = null, delay = 600) {
    setIsTyping(true)
    await new Promise(r => setTimeout(r, delay))
    setIsTyping(false)
    const msg = makeAgentMsg(text, meta, actions)
    addMessage(msg)
    return msg
  }

  async function startFlow(flowName, initialData = {}) {
    const steps = FLOWS[flowName]
    if (!steps) return

    let stepIdx = 0
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].question && initialData[steps[i].key] !== undefined) stepIdx = i + 1
      else break
    }

    const flow = { name: flowName, stepIdx, data: { ...initialData } }

    while (flow.stepIdx < steps.length && steps[flow.stepIdx].question === null) {
      flow.stepIdx++
    }

    if (flow.stepIdx >= steps.length) { await executeFlow(flow); return }

    setActiveFlow(flow)
    await agentReply(steps[flow.stepIdx].question)
  }

  async function advanceFlow(userText) {
    if (!activeFlow) return false

    const steps = FLOWS[activeFlow.name]
    const step  = steps[activeFlow.stepIdx]

    if (step.validate && !step.validate(userText)) {
      await agentReply(step.errMsg || "I didn't understand that. " + step.question)
      return true
    }

    const value   = step.transform ? step.transform(userText) : userText.trim()
    const newData = { ...activeFlow.data, [step.key]: value }

    let nextIdx = activeFlow.stepIdx + 1
    while (nextIdx < steps.length && steps[nextIdx].question === null) nextIdx++

    if (nextIdx >= steps.length) {
      setActiveFlow(null)
      await executeFlow({ ...activeFlow, data: newData })
    } else {
      setActiveFlow({ ...activeFlow, stepIdx: nextIdx, data: newData })
      await agentReply(steps[nextIdx].question)
    }

    return true
  }

  async function executeFlow(flow) {
    const { name, data } = flow
    switch (name) {
      case 'add_order':      return executeAddOrder(data)
      case 'gen_invoice':    return executeGenInvoice(data)
      case 'record_payment': return executeRecordPayment(data)
      case 'add_task':       return executeAddTask(data)
      case 'add_appt':       return executeAddAppt(data)
      default: break
    }
  }

  async function executeAddOrder(data) {
    const customer = findCustomer(customers, data.customerName)

    if (!customer) {
      await agentReply(
        `I couldn't find a customer named "${data.customerName}". Do you want me to create them first?`,
        null,
        [
          { label: 'Yes, create customer first', action: 'create_customer', payload: { name: data.customerName, pendingOrder: data } },
          { label: 'Cancel', action: 'cancel' },
        ]
      )
      return
    }

    const hasMeasurements = /yes|yeah|yep|have|got/i.test(data.hasMeasurements || '')
    const depositAmount   = parseMoney(data.deposit)
    const hasDeposit      = depositAmount !== null && depositAmount > 0
    const currencySymbol  = generalSettings.invoiceCurrency?.symbol || '₦'

    try {
      const orderData = {
        customerId:     customer.id,
        customerName:   customer.name,
        desc:           data.desc,
        price:          data.price,
        totalAmount:    data.price,
        dueDate:        data.dueDate,
        dueRaw:         data.dueDate,
        due:            formatDateNice(data.dueDate),
        status:         'pending',
        stage:          null,
        priority:       'normal',
        items:          [{ name: data.desc, price: data.price, qty: 1 }],
        notes:          '',
        measurementIds: [],
      }

      await addOrder(customer.id, orderData)

      const lines = [
        `✅ Order created for **${customer.name}**`,
        `📦 ${data.desc}`,
        `💰 ${formatMoney(data.price, currencySymbol)}`,
        `📅 Due ${formatDateNice(data.dueDate)}`,
      ]

      const actions = []

      if (!hasMeasurements) {
        lines.push(`📐 No measurements yet — I've added a reminder task`)
        await addTask({
          desc:         `Take measurements for ${customer.name}`,
          dueDate:      data.dueDate,
          customerName: customer.name,
          customerId:   customer.id,
          category:     'sewing',
          done:         false,
          priority:     'high',
        })
      }

      if (hasDeposit) {
        lines.push(`💵 Deposit of ${formatMoney(depositAmount, currencySymbol)} noted — record it in Payments`)
      }

      actions.push({ label: 'Generate invoice now', action: 'gen_invoice', payload: { customerName: customer.name } })
      actions.push({ label: 'View order', action: 'navigate', payload: { route: '/orders' } })

      await agentReply(lines.join('\n'), null, actions)
    } catch (err) {
      console.error('[AgentContext] executeAddOrder:', err)
      await agentReply(`Something went wrong creating that order. Please try again.`)
    }
  }

  async function executeGenInvoice(data) {
    const customer = findCustomer(customers, data.customerName)
    if (!customer) { await agentReply(`I couldn't find "${data.customerName}" in your customers.`); return }

    const customerOrders = allOrders.filter(o => o.customerId === customer.id && !['cancelled'].includes(o.status))
    if (!customerOrders.length) { await agentReply(`${customer.name} doesn't have any active orders to invoice.`); return }

    const invoicedOrderIds = allInvoices.filter(i => i.customerId === customer.id).map(i => i.orderId)
    const uninvoicedOrders = customerOrders.filter(o => !invoicedOrderIds.includes(o.id))

    if (!uninvoicedOrders.length) {
      await agentReply(
        `All of ${customer.name}'s orders already have invoices. Want to view them?`,
        null,
        [{ label: 'View invoices', action: 'navigate', payload: { route: '/invoices' } }]
      )
      return
    }

    const order = uninvoicedOrders[0]
    const currencySymbol = generalSettings.invoiceCurrency?.symbol || '₦'

    await agentReply(
      `I found an uninvoiced order for ${customer.name}:\n📦 **${order.desc}** · ${formatMoney(order.totalAmount || order.price, currencySymbol)}\n\nHead to the Invoices page to generate it.`,
      null,
      [
        { label: 'Go to Invoices', action: 'navigate', payload: { route: '/invoices' } },
        { label: 'Cancel', action: 'cancel' },
      ]
    )
  }

  async function executeRecordPayment(data) {
    const customer = findCustomer(customers, data.customerName)
    if (!customer) { await agentReply(`I couldn't find "${data.customerName}" in your customers.`); return }

    const method = /transfer/i.test(data.method) ? 'transfer' : /card/i.test(data.method) ? 'card' : 'cash'
    const currencySymbol = generalSettings.invoiceCurrency?.symbol || '₦'

    await agentReply(
      `Got it — ${formatMoney(data.amount, currencySymbol)} from **${customer.name}** via ${method}.\n\nHead to their profile to attach this payment to a specific order.`,
      null,
      [
        { label: 'Go to Payments', action: 'navigate', payload: { route: '/customers' } },
        { label: 'Cancel', action: 'cancel' },
      ]
    )
  }

  async function executeAddTask(data) {
    try {
      const customer = data.customerName ? findCustomer(customers, data.customerName) : null
      await addTask({
        desc:         data.desc,
        dueDate:      data.dueDate || null,
        customerName: customer?.name || data.customerName || null,
        customerId:   customer?.id   || null,
        category:     'general',
        done:         false,
        priority:     'normal',
      })

      const lines = [`✅ Task added: **${data.desc}**`]
      if (data.dueDate) lines.push(`📅 Due ${formatDateNice(data.dueDate)}`)
      if (customer)     lines.push(`👤 ${customer.name}`)

      await agentReply(lines.join('\n'), null, [
        { label: 'View tasks', action: 'navigate', payload: { route: '/tasks' } },
      ])
    } catch (err) {
      console.error('[AgentContext] executeAddTask:', err)
      await agentReply(`Couldn't add that task. Please try again.`)
    }
  }

  async function executeAddAppt(data) {
    await agentReply(
      `Got it — ${data.type} appointment for **${data.customerName}** on ${formatDateNice(data.date)} at ${data.time}.\n\nHead to Appointments to confirm and save it.`,
      null,
      [
        { label: 'Go to Appointments', action: 'navigate', payload: { route: '/appointments' } },
        { label: 'Cancel', action: 'cancel' },
      ]
    )
  }

  async function handleQuery(intent, text) {
    switch (intent) {

      case 'query_customer': {
        const nameHint = extractCustomerName(text)
        const customer = nameHint ? findCustomer(customers, nameHint) : null
        if (!customer) { await agentReply(`Which customer do you mean?`); return }

        const currencySymbol   = generalSettings.invoiceCurrency?.symbol || '₦'
        const customerInvoices = allInvoices.filter(i => i.customerId === customer.id && i.status !== 'paid')
        const customerPayments = allPayments.filter(p => p.customerId === customer.id)
        const totalPaid = customerPayments.reduce((sum, p) => sum + (p.installments || []).reduce((s, inst) => s + (Number(inst.amount) || 0), 0), 0)
        const totalOwed = customerInvoices.reduce((sum, i) => sum + (Number(i.totalAmount || i.price) || 0), 0)
        const balance   = totalOwed - totalPaid

        const lines = [
          `**${customer.name}**`,
          totalOwed > 0 ? `💰 Outstanding: ${formatMoney(balance, currencySymbol)}` : `✅ All paid up — no outstanding balance`,
        ]
        if (customerInvoices.length) lines.push(`🧾 ${customerInvoices.length} unpaid invoice${customerInvoices.length > 1 ? 's' : ''}`)

        await agentReply(lines.join('\n'), null, [
          { label: `View ${customer.name}'s profile`, action: 'navigate', payload: { route: '/customers' } },
        ])
        break
      }

      case 'query_orders': {
        const today    = todayISO()
        const dueToday = allOrders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status) && (o.dueDate || o.dueRaw) === today)
        const pending  = allOrders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status))

        if (!pending.length) { await agentReply(`No active orders right now. All caught up! 🎉`); return }

        const lines = [
          `You have **${pending.length} active order${pending.length > 1 ? 's' : ''}**`,
          dueToday.length ? `🔴 ${dueToday.length} due today: ${dueToday.map(o => o.desc).join(', ')}` : null,
        ].filter(Boolean)

        await agentReply(lines.join('\n'), null, [
          { label: 'View all orders', action: 'navigate', payload: { route: '/orders' } },
        ])
        break
      }

      case 'query_overdue': {
        const overdueInvoices = allInvoices.filter(i => {
          if (i.status === 'paid' || !i.due) return false
          return new Date(i.due + 'T23:59:59') < new Date()
        })

        if (!overdueInvoices.length) { await agentReply(`No overdue invoices! All payments are on track. ✅`); return }

        const names = [...new Set(overdueInvoices.map(i => i.customerName).filter(Boolean))]
        await agentReply(
          `🔴 **${overdueInvoices.length} overdue invoice${overdueInvoices.length > 1 ? 's' : ''}**\n${names.map(n => `• ${n}`).join('\n')}`,
          null,
          [{ label: 'View invoices', action: 'navigate', payload: { route: '/invoices' } }]
        )
        break
      }

      case 'query_summary': {
        const today    = todayISO()
        const pending  = allOrders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status))
        const dueToday = pending.filter(o => (o.dueDate || o.dueRaw) === today)
        const overdue  = allInvoices.filter(i => {
          if (i.status === 'paid' || !i.due) return false
          return new Date(i.due + 'T23:59:59') < new Date()
        })
        const pendingTasks = tasks.filter(t => !t.done)

        await agentReply([
          `Here's your shop snapshot 📊`,
          ``,
          `📦 **${pending.length}** active order${pending.length !== 1 ? 's' : ''}${dueToday.length ? ` · ${dueToday.length} due today` : ''}`,
          `🧾 **${overdue.length}** overdue invoice${overdue.length !== 1 ? 's' : ''}`,
          `✅ **${pendingTasks.length}** pending task${pendingTasks.length !== 1 ? 's' : ''}`,
          `👥 **${customers.length}** customer${customers.length !== 1 ? 's' : ''}`,
        ].join('\n'))
        break
      }

      case 'check_measurements': {
        const nameHint = extractCustomerName(text)
        const customer = nameHint ? findCustomer(customers, nameHint) : null
        if (!customer) { await agentReply(`Which customer's measurements do you want to check?`); return }

        await agentReply(
          `To check ${customer.name}'s measurements, head to their profile.`,
          null,
          [{ label: `View ${customer.name}'s profile`, action: 'navigate', payload: { route: '/customers' } }]
        )
        break
      }

      case 'update_status': {
        const nameHint = extractCustomerName(text)
        const customer = nameHint ? findCustomer(customers, nameHint) : null

        const statusMap = {
          ready: 'completed', complete: 'completed', completed: 'completed',
          deliver: 'delivered', delivered: 'delivered',
          cancel: 'cancelled', cancelled: 'cancelled',
          'in progress': 'in-progress', started: 'in-progress',
        }

        let newStatus = null
        for (const [keyword, status] of Object.entries(statusMap)) {
          if (text.toLowerCase().includes(keyword)) { newStatus = status; break }
        }

        if (!customer || !newStatus) {
          await agentReply(`I need a customer name and new status. For example: "Mark Emeka's order as ready"`)
          return
        }

        const customerOrders = allOrders.filter(o =>
          o.customerId === customer.id && !['completed', 'delivered', 'cancelled'].includes(o.status)
        )

        if (!customerOrders.length) { await agentReply(`${customer.name} doesn't have any active orders to update.`); return }

        const order = customerOrders[0]
        try {
          await updateOrderStatus(order.id, newStatus)
          await agentReply(`✅ **${order.desc}** for ${customer.name} marked as ${newStatus}.`)
        } catch {
          await agentReply(`Couldn't update that order. Please try from the Orders page.`)
        }
        break
      }

      default:
        await agentReply(
          `I'm not sure what you mean. Try:\n• "Add an order for Uchenna"\n• "How much does Bola owe?"\n• "Emeka just paid 15k"\n• "What's happening today?"`
        )
    }
  }

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return

    const userMsg = makeUserMsg(text.trim())
    addMessage(userMsg)

    if (activeFlow) {
      const handled = await advanceFlow(text.trim())
      if (handled) return
    }

    const intent = detectIntent(text)

    if (intent === 'unknown') { await handleQuery('unknown', text); return }

    if (['add_order', 'gen_invoice', 'record_payment', 'add_task', 'add_appt'].includes(intent)) {
      const initialData = {}
      const nameHint = extractCustomerName(text)
      if (nameHint) initialData.customerName = nameHint
      await startFlow(intent, initialData)
      return
    }

    await handleQuery(intent, text)
  }, [activeFlow, customers, allOrders, allInvoices, allPayments, tasks]) // eslint-disable-line

  const handleAction = useCallback(async (action, payload) => {
    switch (action) {
      case 'gen_invoice':
        await startFlow('gen_invoice', payload || {})
        break
      case 'cancel':
        setActiveFlow(null)
        await agentReply(`No problem. What else can I help with?`)
        break
      default:
        break
    }
  }, []) // eslint-disable-line

  const cancelFlow = useCallback(async () => {
    setActiveFlow(null)
    await agentReply(`Got it, cancelled. What else do you need?`)
  }, []) // eslint-disable-line

  const clearHistory = useCallback(async () => {
    if (!user) return
    await clearAgentMessages(user.uid)
    setMessages([])
  }, [user])

  return (
    <AgentContext.Provider value={{
      messages,
      isTyping,
      isLoading,
      activeFlow,
      sendMessage,
      handleAction,
      cancelFlow,
      clearHistory,
    }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useAgent must be used inside AgentProvider')
  return ctx
}

function buildCandidateItems({ generalSettings, customers, allOrders, allInvoices, allPayments, allReceipts }) {
  const nowMs = Date.now()
  const candidates = []

  if (generalSettings.agentAutoInvoice) {
    const thresholdMs      = timeframeToMs(generalSettings.agentAutoInvoiceTimeframe)
    const invoicedOrderIds = new Set(allInvoices.map(i => i.orderId))

    allOrders
      .filter(o => {
        if (invoicedOrderIds.has(o.id)) return false
        if (o.status === 'cancelled') return false
        const createdAtMs = timestampToMs(o.createdAt)
        return createdAtMs > 0 && (nowMs - createdAtMs) > thresholdMs
      })
      .forEach(order => {
        candidates.push({
          draftId:   `invoice-${order.id}`,
          type:      'invoice',
          title:     'Invoice drafted',
          preview:   `Invoice for ${order.desc || 'order'} · Total: ${formatMoney(order.totalAmount || order.price, generalSettings.invoiceCurrency?.symbol)} · Due: ${order.due || 'not set'}.`,
          reason:    `This order had no invoice after ${timeframeLabel(generalSettings.agentAutoInvoiceTimeframe)}, your auto-invoice timeframe.`,
          tag:       'Invoice',
        })
      })
  }

  if (generalSettings.agentAutoReceipt) {
    getPendingReceiptItems(allPayments, allReceipts).forEach(({ payment, installment }) => {
      const customer = customers.find(c => c.id === payment.customerId)
      candidates.push({
        draftId:    `receipt-${payment.id}-${installment.id}`,
        type:       'receipt',
        title:      'Receipt drafted',
        preview:    `Receipt for ${formatMoney(installment.amount, generalSettings.receiptCurrency?.symbol)} paid by ${customer?.name || payment.customerName || 'a customer'} via ${installment.method || 'cash'}.`,
        reason:     `A payment was recorded for ${customer?.name || payment.customerName || 'this customer'} and no receipt had been generated for it yet.`,
        tag:        'Receipt',
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
          draftId:    `birthday-${customer.id}-${today.getFullYear()}`,
          type:       'birthday',
          title:      'Birthday message drafted',
          preview:    `Hi ${customer.name.split(' ')[0]}! Wishing you a wonderful birthday. It's always a pleasure working with you. Hope to see you soon!`,
          reason:     diffDays === 0
            ? `Today is ${customer.name}'s birthday.`
            : `${customer.name}'s birthday is in ${diffDays} day${diffDays !== 1 ? 's' : ''}, within your ${durationLabel(noticeDays)} notice window.`,
          tag:        'Birthday',
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
          draftId:    `reminder-${invoice.id}`,
          type:       'reminder',
          title:      `Payment reminder drafted — ${invoice.customerName || 'Customer'}`,
          preview:    `Hi ${invoice.customerName || 'there'}, just a reminder that your balance of ${formatMoney(invoice.totalAmount || invoice.price, generalSettings.invoiceCurrency?.symbol)} is due on ${invoice.due}. Kindly make payment at your earliest convenience. Thank you!`,
          reason:     `The invoice due date is within ${durationLabel(generalSettings.agentPaymentReminderDays)}, your reminder window.`,
          tag:        'Reminder',
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
          draftId:    `followup-${customer.id}`,
          type:       'followup',
          title:      'Follow-up message drafted',
          preview:    `Hi ${customer.name.split(' ')[0]}! It's been a while since your last visit. We'd love to create something special for you again. Feel free to reach out anytime!`,
          reason:     `${customer.name} hasn't placed an order in over ${timeframeLabel(generalSettings.agentFollowUpInactivity)}, your follow-up window.`,
          tag:        'Follow-up',
        })
      }
    })
  }

  return candidates
}

export function useAutonomousAgent() {
  const { user }             = useAuth()
  const { generalSettings }  = useGeneralSettings()
  const { customers }        = useCustomers()
  const { allOrders }        = useOrders()
  const { allInvoices }      = useInvoices()
  const { allPayments }      = usePayments()
  const { allReceipts }      = useReceipts()

  const enabled = generalSettings.agentEnabled

  const [persistedDrafts, setPersistedDrafts] = useState([])
  const [knownDraftIds,   setKnownDraftIds]   = useState(new Set())
  const [cancelledUpcomingIds, setCancelledUpcomingIds] = useState([])

  useEffect(() => {
    if (!user || !enabled) { setPersistedDrafts([]); setKnownDraftIds(new Set()); return }
    loadAgentDrafts(user.uid).then(drafts => {
      setPersistedDrafts(drafts)
      setKnownDraftIds(new Set(drafts.map(d => d.id)))
    })
  }, [user, enabled])

  const candidates = useMemo(() => {
    if (!enabled) return []
    return buildCandidateItems({ generalSettings, customers, allOrders, allInvoices, allPayments, allReceipts })
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
        reason:  candidate.reason,
        tag:     candidate.tag,
        status:  'pending',
      }).then(created => {
        if (!created) return
        setPersistedDrafts(prev => [
          { id: candidate.draftId, type: candidate.type, title: candidate.title, preview: candidate.preview, reason: candidate.reason, tag: candidate.tag, status: 'pending', createdAt: Date.now() },
          ...prev,
        ])
      }).catch(console.error)
    })
  }, [user, enabled, candidates, knownDraftIds])

  const activeDrafts = useMemo(
    () => persistedDrafts.filter(d => d.status !== 'discarded'),
    [persistedDrafts]
  )

  const doneTasks = useMemo(() => activeDrafts.map(draft => {
    const createdAtMs = timestampToMs(draft.createdAt)
    const dateLabel    = formatDateLabel(createdAtMs)
    const clockLabel   = formatClockLabel(createdAtMs)
    return {
      id:     draft.id,
      type:   draft.type,
      title:  draft.title,
      desc:   draft.preview,
      reason: draft.reason,
      tag:    draft.tag,
      date:   dateLabel,
      time:   clockLabel ? `${dateLabel}, ${clockLabel}` : dateLabel,
    }
  }), [activeDrafts])

  const drafts = useMemo(() => activeDrafts.map(draft => {
    const createdAtMs = timestampToMs(draft.createdAt)
    const dateLabel    = formatDateLabel(createdAtMs)
    const clockLabel   = formatClockLabel(createdAtMs)
    return {
      id:      draft.id,
      type:    draft.type,
      title:   draft.title,
      preview: draft.preview,
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
          if (o.status === 'cancelled') return false
          const createdAtMs = timestampToMs(o.createdAt)
          const age = nowMs - createdAtMs
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
    updateAgentDraftStatus(user.uid, id, 'discarded').catch(console.error)
  }, [user])

  return { enabled, doneTasks, upcomingTasks, drafts, cancelUpcoming, discardDraft }
}