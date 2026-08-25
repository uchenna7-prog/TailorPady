import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { useAuth }            from './AuthContext'
import { useCustomers }       from './CustomerContext'
import { useOrders }          from './OrdersContext'
import { useInvoices }        from './InvoiceContext'
import { usePayments }        from './PaymentContext'
import { useTasks }           from './TaskContext'
import { useGeneralSettings } from './GeneralSettingsContext'
import { useUsage }           from './UsageContext'
import {
  saveAgentMessage,
  loadAgentMessages,
  clearAgentMessages,
} from '../services/agentService'
import {
  classifyIntent,
  matchCustomer,
  matchCustomerCandidates,
  isAmbiguousMatch,
  containsPronoun,
  isCancelText,
  extractEntities,
  extractGarmentDescFallback,
  parseMoney,
  parseDate,
  formatMoney,
  formatDateNice,
  now,
  todayISO,
  timestampToMs,
  detectTimeWindow,
  buildHelpText,
} from '../services/localNLU'

const FLOW_INTENTS = ['add_order', 'gen_invoice', 'record_payment', 'add_task', 'add_appt']
const CUSTOMER_QUERY_INTENTS = ['query_customer', 'query_contact', 'check_measurements', 'update_status']
const FREE_TEXT_STEP_KEYS = ['customerName', 'desc']

const STATUS_MAP = {
  ready: 'completed',
  complete: 'completed',
  completed: 'completed',
  deliver: 'delivered',
  delivered: 'delivered',
  cancel: 'cancelled',
  cancelled: 'cancelled',
  'in progress': 'in-progress',
  started: 'in-progress',
}

function parseStatusKeyword(text) {
  const lower = text.toLowerCase()
  for (const [keyword, status] of Object.entries(STATUS_MAP)) {
    if (lower.includes(keyword)) return status
  }
  return null
}

function findCustomer(customers, nameHint) {
  if (!nameHint) return null
  const match = matchCustomer(customers, nameHint)
  return match ? match.customer : null
}

function nextQuestionIndex(steps, data, fromIdx) {
  let idx = fromIdx
  while (idx < steps.length) {
    const step = steps[idx]
    if (step.question === null) { idx++; continue }
    if (data[step.key] !== undefined) { idx++; continue }
    return idx
  }
  return steps.length
}

function buildInitialDataForFlow(intent, entities) {
  const data = {}
  if (entities.customerName) data.customerName = entities.customerName

  switch (intent) {
    case 'add_order':
      if (entities.desc) data.desc = entities.desc
      if (entities.money !== null) data.price = entities.money
      if (entities.date) data.dueDate = entities.date
      break
    case 'record_payment':
      if (entities.money !== null) data.amount = entities.money
      if (entities.method) data.method = entities.method
      break
    case 'add_task':
      if (entities.date) data.dueDate = entities.date
      break
    case 'add_appt':
      if (entities.apptType) data.type = entities.apptType
      if (entities.date) data.date = entities.date
      if (entities.time) data.time = entities.time
      break
    default:
      break
  }

  return data
}

function buildExtractionSummary(data, currencySymbol) {
  const lines = ["Here's what I got:"]
  if (data.customerName) lines.push(`👤 ${data.customerName}`)
  if (data.desc)          lines.push(`📦 ${data.desc}`)
  if (data.price !== undefined)  lines.push(`💰 ${formatMoney(data.price, currencySymbol)}`)
  if (data.amount !== undefined) lines.push(`💰 ${formatMoney(data.amount, currencySymbol)}`)
  if (data.dueDate) lines.push(`📅 Due ${formatDateNice(data.dueDate)}`)
  if (data.date)     lines.push(`📅 ${formatDateNice(data.date)}`)
  if (data.time)     lines.push(`🕐 ${data.time}`)
  if (data.method)   lines.push(`💳 ${data.method}`)
  if (data.type)     lines.push(`📌 ${data.type}`)
  lines.push('', 'Look right?')
  return lines.join('\n')
}

const FLOWS = {
  add_order: [
    { key: 'customerName',    question: "What's the customer's name?" },
    { key: 'desc',            question: 'What are they ordering? (e.g. Agbada and trouser)' },
    {
      key:      'price',
      question: "What's the total price?",
      validate: v => parseMoney(v) !== null,
      errMsg:   'Please enter a valid amount, e.g. 45000 or 50k.',
      transform: v => parseMoney(v),
    },
    {
      key:      'dueDate',
      question: "When is it due? (e.g. May 20, next Friday, in 3 days)",
      validate: v => parseDate(v) !== null,
      errMsg:   "I didn't catch that date. Try something like 'May 20' or 'next Friday'.",
      transform: v => parseDate(v),
    },
    { key: 'deposit',         question: "Has the customer paid a deposit? If yes, how much? (or say 'no')" },
    { key: 'hasMeasurements', question: 'Do you already have their measurements? (yes / no)' },
  ],
  gen_invoice: [
    { key: 'customerName', question: 'Which customer is this invoice for?' },
    { key: 'orderId',      question: null },
  ],
  record_payment: [
    { key: 'customerName', question: 'Which customer made the payment?' },
    {
      key:      'amount',
      question: 'How much did they pay?',
      validate: v => parseMoney(v) !== null,
      errMsg:   'Please enter a valid amount, e.g. 10000 or 10k.',
      transform: v => parseMoney(v),
    },
    { key: 'method',  question: 'How did they pay? (cash / transfer / card)' },
    { key: 'orderId', question: null },
  ],
  add_task: [
    { key: 'desc', question: "What's the task?" },
    {
      key:      'dueDate',
      question: "When is it due? (or say 'no date')",
      transform: v => /no date|none|skip/i.test(v) ? null : parseDate(v),
    },
    {
      key:      'customerName',
      question: "Is this linked to a specific customer? (name or 'no')",
      transform: v => /^no$/i.test(v.trim()) ? null : v.trim(),
    },
  ],
  add_appt: [
    { key: 'customerName', question: 'Who is the appointment for?' },
    { key: 'type',         question: 'What type of appointment? (fitting / measurement / delivery / consultation / pickup / other)' },
    {
      key:      'date',
      question: 'What date?',
      validate: v => parseDate(v) !== null,
      errMsg:   "I didn't catch that date. Try something like 'May 20' or 'next Friday'.",
      transform: v => parseDate(v),
    },
    { key: 'time', question: 'What time? (e.g. 2pm, 14:00)' },
  ],
}

const AgentContext = createContext(null)

export function AgentProvider({ children }) {
  const { user }                                   = useAuth()
  const { customers }                              = useCustomers()
  const { allOrders, addOrder, updateOrderStatus } = useOrders()
  const { allInvoices }                            = useInvoices()
  const { allPayments }                            = usePayments()
  const { tasks, addTask }                         = useTasks()
  const { generalSettings }                        = useGeneralSettings()
  const { hasReachedLimit, recordUsage, limits }   = useUsage()

  const [messages,      setMessages]      = useState([])
  const [isTyping,      setIsTyping]      = useState(false)
  const [isLoading,     setIsLoading]     = useState(true)
  const [activeFlow,    setActiveFlow]    = useState(null)
  const [pendingChoice, setPendingChoice] = useState(null)
  const lastCustomerRef = useRef(null)
  const busyRef         = useRef(false)

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
    })
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

    const flow = { name: flowName, stepIdx: nextQuestionIndex(steps, initialData, 0), data: { ...initialData } }

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
    const nextIdx = nextQuestionIndex(steps, newData, activeFlow.stepIdx + 1)

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
      case 'add_order':      await executeAddOrder(data); break
      case 'gen_invoice':    await executeGenInvoice(data); break
      case 'record_payment': await executeRecordPayment(data); break
      case 'add_task':       await executeAddTask(data); break
      case 'add_appt':       await executeAddAppt(data); break
      default: return
    }

    recordUsage('aiActionsPerMonth').catch(() => {})
  }

  async function executeAddOrder(data) {
    const customer = findCustomer(customers, data.customerName)

    if (!customer) {
      await agentReply(
        `I couldn't find a customer named "${data.customerName}". Would you like me to create them first?`,
        null,
        [
          { label: 'Yes, create customer first', action: 'create_customer', payload: { name: data.customerName, pendingOrder: data } },
          { label: 'Cancel', action: 'cancel' },
        ]
      )
      return
    }

    lastCustomerRef.current = customer.id

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
        lines.push("📐 No measurements on file — I've added a reminder task so it doesn't slip through.")
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
        lines.push(`💵 Deposit of ${formatMoney(depositAmount, currencySymbol)} noted — head to Payments to record it against their order.`)
      }

      actions.push({ label: 'Generate invoice now', action: 'gen_invoice', payload: { customerName: customer.name } })
      actions.push({ label: 'View order', action: 'navigate', payload: { route: '/orders' } })

      await agentReply(lines.join('\n'), null, actions)
    } catch (err) {
      if (err?.code === 'limit-reached') {
        await agentReply(
          `You've hit the free plan limit of ${limits.ordersPerMonth} orders this month. Upgrade to Premium for unlimited orders.`,
          null,
          [{ label: 'Upgrade to Premium', action: 'navigate', payload: { route: '/upgrade' } }]
        )
      } else {
        await agentReply('Something went wrong while creating that order. Please try again.')
      }
    }
  }

  async function executeGenInvoiceForOrder(order, customer) {
    const currencySymbol = generalSettings.invoiceCurrency?.symbol || '₦'
    await agentReply(
      `Found an uninvoiced order for ${customer.name}:\n📦 **${order.desc}** · ${formatMoney(order.totalAmount || order.price, currencySymbol)}\n\nHead to the Invoices page to generate and send it.`,
      null,
      [
        { label: 'Go to Invoices', action: 'navigate', payload: { route: '/invoices' } },
        { label: 'Cancel',         action: 'cancel' },
      ]
    )
  }

  async function executeGenInvoice(data) {
    const customer = findCustomer(customers, data.customerName)
    if (!customer) {
      await agentReply(`I couldn't find "${data.customerName}" in your customer list.`)
      return
    }

    lastCustomerRef.current = customer.id

    const customerOrders = allOrders.filter(o => o.customerId === customer.id && o.status !== 'cancelled')
    if (!customerOrders.length) {
      await agentReply(`${customer.name} doesn't have any active orders to invoice right now.`)
      return
    }

    const invoicedOrderIds = allInvoices.filter(i => i.customerId === customer.id).map(i => i.orderId)
    const uninvoicedOrders = customerOrders.filter(o => !invoicedOrderIds.includes(o.id))

    if (!uninvoicedOrders.length) {
      await agentReply(
        `All of ${customer.name}'s orders already have invoices. Would you like to view them?`,
        null,
        [{ label: 'View invoices', action: 'navigate', payload: { route: '/invoices' } }]
      )
      return
    }

    if (uninvoicedOrders.length > 1) {
      const candidates = uninvoicedOrders.slice(0, 5)
      setPendingChoice({ kind: 'order_disambiguation', resumeKind: 'gen_invoice', customerId: customer.id, candidates })
      await agentReply(
        `${customer.name} has more than one uninvoiced order — which one?`,
        null,
        candidates.map(o => ({ label: o.desc || 'Order', action: 'select_order', payload: { orderId: o.id } }))
      )
      return
    }

    await executeGenInvoiceForOrder(uninvoicedOrders[0], customer)
  }

  async function executeRecordPayment(data) {
    const customer = findCustomer(customers, data.customerName)
    if (!customer) {
      await agentReply(`I couldn't find "${data.customerName}" in your customer list.`)
      return
    }

    lastCustomerRef.current = customer.id

    const method         = /transfer/i.test(data.method) ? 'transfer' : /card/i.test(data.method) ? 'card' : 'cash'
    const currencySymbol = generalSettings.invoiceCurrency?.symbol || '₦'

    await agentReply(
      `Got it — ${formatMoney(data.amount, currencySymbol)} from **${customer.name}** via ${method}.\n\nHead to their profile to attach this payment to a specific order.`,
      null,
      [
        { label: 'Go to Payments', action: 'navigate', payload: { route: '/customers' } },
        { label: 'Cancel',         action: 'cancel' },
      ]
    )
  }

  async function executeAddTask(data) {
    try {
      const customer = data.customerName ? findCustomer(customers, data.customerName) : null
      if (customer) lastCustomerRef.current = customer.id
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
    } catch {
      await agentReply("Couldn't add that task. Please try again.")
    }
  }

  async function executeAddAppt(data) {
    await agentReply(
      `Got it — **${data.type}** appointment for **${data.customerName}** on ${formatDateNice(data.date)} at ${data.time}.\n\nHead to Appointments to confirm and save it.`,
      null,
      [
        { label: 'Go to Appointments', action: 'navigate', payload: { route: '/appointments' } },
        { label: 'Cancel',             action: 'cancel' },
      ]
    )
  }

  function customerBalance(customer) {
    const customerInvoices = allInvoices.filter(i => i.customerId === customer.id && i.status !== 'paid')
    const customerPayments = allPayments.filter(p => p.customerId === customer.id)
    const totalPaid = customerPayments.reduce((sum, p) =>
      sum + (p.installments || []).reduce((s, inst) => s + (Number(inst.amount) || 0), 0), 0)
    const totalOwed = customerInvoices.reduce((sum, i) => sum + (Number(i.totalAmount || i.price) || 0), 0)
    return { totalOwed, totalPaid, balance: totalOwed - totalPaid, unpaidCount: customerInvoices.length }
  }

  async function executeStatusUpdateOnOrder(order, customerName, newStatus) {
    try {
      await updateOrderStatus(order.id, newStatus)
      await agentReply(`✅ **${order.desc}** for ${customerName} has been marked as ${newStatus}.`)
    } catch {
      await agentReply("Couldn't update that order. Please try from the Orders page.")
    }
  }

  async function performStatusUpdate(customer, newStatus) {
    lastCustomerRef.current = customer.id
    const customerOrders = allOrders.filter(o =>
      o.customerId === customer.id && !['completed', 'delivered', 'cancelled'].includes(o.status)
    )

    if (!customerOrders.length) {
      await agentReply(`${customer.name} doesn't have any active orders to update.`)
      return
    }

    if (customerOrders.length > 1) {
      const candidates = customerOrders.slice(0, 5)
      setPendingChoice({ kind: 'order_disambiguation', resumeKind: 'update_status', customerId: customer.id, newStatus, candidates })
      await agentReply(
        `${customer.name} has more than one active order — which one?`,
        null,
        candidates.map(o => ({ label: o.desc || 'Order', action: 'select_order', payload: { orderId: o.id } }))
      )
      return
    }

    const order = customerOrders[0]

    if (newStatus === 'cancelled') {
      setPendingChoice({ kind: 'confirm_status_update', orderId: order.id, orderDesc: order.desc, customerName: customer.name, newStatus })
      await agentReply(
        `Mark **${order.desc}** for ${customer.name} as cancelled? This can't be undone from here.`,
        null,
        [
          { label: 'Yes, cancel it', action: 'confirm_status_update' },
          { label: 'No, keep it', action: 'cancel' },
        ]
      )
      return
    }

    await executeStatusUpdateOnOrder(order, customer.name, newStatus)
  }

  async function handleQuery(intent, text, context = {}) {
    const currencySymbol = generalSettings.invoiceCurrency?.symbol || '₦'

    switch (intent) {

      case 'greeting': {
        await agentReply('Hey! What can I help you with today?')
        break
      }

      case 'thanks': {
        await agentReply("Anytime! Let me know if there's anything else.")
        break
      }

      case 'identity': {
        await agentReply("I'm Pady, your shop assistant here in TailorPady.")
        break
      }

      case 'wellbeing': {
        await agentReply("Doing great and ready to help! What do you need?")
        break
      }

      case 'date_time': {
        const dateLabel = new Date().toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        })
        await agentReply(`Today is ${dateLabel}.`)
        break
      }

      case 'help': {
        await agentReply(buildHelpText(customers))
        break
      }

      case 'query_customer': {
        const customer = context.customer || matchCustomer(customers, text)?.customer
        if (!customer) {
          setPendingChoice({ kind: 'awaiting_customer_name', intent: 'query_customer' })
          await agentReply('Which customer are you asking about?')
          return
        }
        lastCustomerRef.current = customer.id
        const { balance, totalOwed, unpaidCount } = customerBalance(customer)

        const lines = [
          `**${customer.name}**`,
          totalOwed > 0
            ? `💰 Outstanding balance: ${formatMoney(balance, currencySymbol)}`
            : '✅ No outstanding balance — all paid up.',
        ]
        if (unpaidCount) lines.push(`🧾 ${unpaidCount} unpaid invoice${unpaidCount > 1 ? 's' : ''}`)

        await agentReply(lines.join('\n'), null, [
          { label: `View ${customer.name}'s profile`, action: 'navigate', payload: { route: '/customers' } },
        ])
        break
      }

      case 'query_debtors': {
        const debtors = customers
          .map(c => ({ customer: c, ...customerBalance(c) }))
          .filter(d => d.balance > 0)
          .sort((a, b) => b.balance - a.balance)

        if (!debtors.length) {
          await agentReply('Nobody owes you money right now — everyone is paid up! 🎉')
          return
        }

        const top = debtors.slice(0, 5)
        const lines = [
          `🔴 **${debtors.length} customer${debtors.length > 1 ? 's' : ''} owe${debtors.length === 1 ? 's' : ''} you money**`,
          ...top.map(d => `• ${d.customer.name} — ${formatMoney(d.balance, currencySymbol)}`),
        ]
        if (debtors.length > top.length) lines.push(`…and ${debtors.length - top.length} more`)

        await agentReply(lines.join('\n'), null, [
          { label: 'View customers', action: 'navigate', payload: { route: '/customers' } },
        ])
        break
      }

      case 'query_top_customers': {
        const ranked = customers
          .map(c => {
            const paid = allPayments
              .filter(p => p.customerId === c.id)
              .reduce((sum, p) => sum + (p.installments || []).reduce((s, i) => s + (Number(i.amount) || 0), 0), 0)
            return { customer: c, paid }
          })
          .filter(r => r.paid > 0)
          .sort((a, b) => b.paid - a.paid)
          .slice(0, 5)

        if (!ranked.length) {
          await agentReply("I don't have enough payment history yet to rank your customers.")
          return
        }

        await agentReply(
          ['🏆 **Top customers by total spend**', ...ranked.map((r, i) => `${i + 1}. ${r.customer.name} — ${formatMoney(r.paid, currencySymbol)}`)].join('\n'),
          null,
          [{ label: 'View customers', action: 'navigate', payload: { route: '/customers' } }]
        )
        break
      }

      case 'query_new_customers': {
        const withDates = customers
          .map(c => ({ customer: c, createdAtMs: timestampToMs(c.createdAt) }))
          .filter(c => c.createdAtMs > 0)

        if (!withDates.length) {
          await agentReply("I don't have signup dates on file for your customers yet, so I can't tell how many are new. You can check the Customers page for the full list.")
          return
        }

        let window = detectTimeWindow(text)
        if (window.label === 'all time') {
          const today = new Date()
          window = { label: 'this month', startMs: new Date(today.getFullYear(), today.getMonth(), 1).getTime(), endMs: Date.now() }
        }

        const newOnes = withDates.filter(c => c.createdAtMs >= window.startMs && c.createdAtMs <= window.endMs)

        if (!newOnes.length) {
          await agentReply(`No new customers ${window.label}.`)
          return
        }

        await agentReply(
          [`👥 **${newOnes.length} new customer${newOnes.length > 1 ? 's' : ''} ${window.label}**`, ...newOnes.map(c => `• ${c.customer.name}`)].join('\n')
        )
        break
      }

      case 'query_contact': {
        const customer = context.customer || matchCustomer(customers, text)?.customer
        if (!customer) {
          setPendingChoice({ kind: 'awaiting_customer_name', intent: 'query_contact' })
          await agentReply("Which customer's contact do you need?")
          return
        }
        lastCustomerRef.current = customer.id
        if (!customer.phone) {
          await agentReply(`I don't have a phone number on file for ${customer.name}.`, null, [
            { label: `View ${customer.name}'s profile`, action: 'navigate', payload: { route: '/customers' } },
          ])
          return
        }
        await agentReply(`📞 **${customer.name}**: ${customer.phone}`)
        break
      }

      case 'query_revenue': {
        const window = detectTimeWindow(text)
        const total = allPayments.reduce((sum, p) => {
          const installments = p.installments || []
          return sum + installments.reduce((s, inst) => {
            const paidAt = inst.createdAtMs || timestampToMs(p.createdAt)
            if (paidAt < window.startMs || paidAt > window.endMs) return s
            return s + (Number(inst.amount) || 0)
          }, 0)
        }, 0)

        await agentReply(`💰 You've made **${formatMoney(total, currencySymbol)}** ${window.label}.`)
        break
      }

      case 'query_orders': {
        const today    = todayISO()
        const pending  = allOrders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status))
        const dueToday = pending.filter(o => (o.dueDate || o.dueRaw) === today)

        if (!pending.length) { await agentReply('No active orders right now — all caught up! 🎉'); return }

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
          return new Date((i.dueRaw || i.due) + 'T23:59:59') < new Date()
        })

        if (!overdueInvoices.length) {
          await agentReply('No overdue invoices — all payments are on track. ✅')
          return
        }

        const names = [...new Set(overdueInvoices.map(i => i.customerName).filter(Boolean))]
        await agentReply(
          `🔴 **${overdueInvoices.length} overdue invoice${overdueInvoices.length > 1 ? 's' : ''}**\n${names.map(n => `• ${n}`).join('\n')}`,
          null,
          [{ label: 'View invoices', action: 'navigate', payload: { route: '/invoices' } }]
        )
        break
      }

      case 'query_tasks_overdue': {
        const today = todayISO()
        const overdueTasks = tasks.filter(t => !t.done && t.dueDate && t.dueDate < today)

        if (!overdueTasks.length) {
          await agentReply('No overdue tasks — you\'re on top of things! ✅')
          return
        }

        await agentReply(
          [`🔴 **${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}**`, ...overdueTasks.map(t => `• ${t.desc}${t.customerName ? ` (${t.customerName})` : ''}`)].join('\n'),
          null,
          [{ label: 'View tasks', action: 'navigate', payload: { route: '/tasks' } }]
        )
        break
      }

      case 'query_schedule': {
        const today     = todayISO()
        const dueTasks  = tasks.filter(t => !t.done && t.dueDate === today)
        const dueOrders = allOrders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status) && (o.dueDate || o.dueRaw) === today)

        if (!dueTasks.length && !dueOrders.length) {
          await agentReply("Nothing on today's schedule. 🎉")
          return
        }

        const lines = ["📅 **Today's schedule**"]
        if (dueOrders.length) lines.push(...dueOrders.map(o => `• Order: ${o.desc} (${o.customerName || 'customer'})`))
        if (dueTasks.length)  lines.push(...dueTasks.map(t => `• Task: ${t.desc}${t.customerName ? ` (${t.customerName})` : ''}`))

        await agentReply(lines.join('\n'))
        break
      }

      case 'query_summary': {
        const today        = todayISO()
        const pending      = allOrders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status))
        const dueToday     = pending.filter(o => (o.dueDate || o.dueRaw) === today)
        const overdue      = allInvoices.filter(i => {
          if (i.status === 'paid' || !i.due) return false
          return new Date(i.due + 'T23:59:59') < new Date()
        })
        const pendingTasks = tasks.filter(t => !t.done)

        await agentReply([
          "Here's a quick overview of your shop 📊",
          '',
          `📦 **${pending.length}** active order${pending.length !== 1 ? 's' : ''}${dueToday.length ? ` · ${dueToday.length} due today` : ''}`,
          `🧾 **${overdue.length}** overdue invoice${overdue.length !== 1 ? 's' : ''}`,
          `✅ **${pendingTasks.length}** pending task${pendingTasks.length !== 1 ? 's' : ''}`,
          `👥 **${customers.length}** customer${customers.length !== 1 ? 's' : ''}`,
        ].join('\n'))
        break
      }

      case 'check_measurements': {
        const customer = context.customer || matchCustomer(customers, text)?.customer
        if (!customer) {
          setPendingChoice({ kind: 'awaiting_customer_name', intent: 'check_measurements' })
          await agentReply("Which customer's measurements do you want to check?")
          return
        }
        lastCustomerRef.current = customer.id

        await agentReply(
          `To view ${customer.name}'s measurements, head to their profile.`,
          null,
          [{ label: `View ${customer.name}'s profile`, action: 'navigate', payload: { route: '/customers' } }]
        )
        break
      }

      case 'update_status': {
        const customer  = context.customer || matchCustomer(customers, text)?.customer
        const newStatus = parseStatusKeyword(text)

        if (!customer) {
          setPendingChoice({ kind: 'awaiting_customer_name', intent: 'update_status' })
          await agentReply("Which customer's order would you like to update?")
          return
        }

        if (!newStatus) {
          setPendingChoice({ kind: 'awaiting_status', customerId: customer.id })
          await agentReply(`What should ${customer.name}'s order status be? (ready / delivered / in progress / cancelled)`)
          return
        }

        await performStatusUpdate(customer, newStatus)
        break
      }

      default:
        await agentReply(buildHelpText(customers))
    }
  }

  async function routeIntent(trimmed) {
    const { intent } = classifyIntent(trimmed)

    if (intent === 'unknown') { await handleQuery('unknown', trimmed); return }

    if (FLOW_INTENTS.includes(intent)) {
      if (hasReachedLimit('aiActionsPerMonth', 'aiActionsPerMonth')) {
        await agentReply(
          `You've hit the free plan limit of ${limits.aiActionsPerMonth} AI assistant actions this month. Upgrade to Premium for unlimited actions.`,
          null,
          [{ label: 'Upgrade to Premium', action: 'navigate', payload: { route: '/upgrade' } }]
        )
        return
      }

      const entities = extractEntities(trimmed, customers)

      if (intent === 'add_order' && !entities.desc) {
        const fallbackDesc = extractGarmentDescFallback(trimmed, entities.customerName)
        if (fallbackDesc) entities.desc = fallbackDesc
      }

      if (isAmbiguousMatch(entities.customerCandidates)) {
        const candidates = entities.customerCandidates.slice(0, 4)
        setPendingChoice({ kind: 'customer_disambiguation', resumeKind: 'flow', intent, entities, candidates })
        await agentReply(
          "I found a few customers that could match — who did you mean?",
          null,
          candidates.map(c => ({ label: c.customer.name, action: 'select_customer', payload: { customerId: c.customer.id } }))
        )
        return
      }

      const initialData = buildInitialDataForFlow(intent, entities)
      const richKeys = Object.keys(initialData).filter(k => k !== 'customerName')
      const needsConfirm = richKeys.length >= 2 || initialData.desc !== undefined

      if (needsConfirm) {
        const currencySymbol = generalSettings.invoiceCurrency?.symbol || '₦'
        setPendingChoice({ kind: 'flow_confirm', intent, initialData })
        await agentReply(buildExtractionSummary(initialData, currencySymbol), null, [
          { label: 'Yes, continue', action: 'confirm_extracted_flow' },
          { label: "No, ask me step by step", action: 'discard_extracted_flow' },
        ])
        return
      }

      await startFlow(intent, initialData)
      return
    }

    if (CUSTOMER_QUERY_INTENTS.includes(intent)) {
      const candidates = matchCustomerCandidates(customers, trimmed)

      if (isAmbiguousMatch(candidates)) {
        const top = candidates.slice(0, 4)
        setPendingChoice({ kind: 'customer_disambiguation', resumeKind: 'query', intent, text: trimmed, candidates: top })
        await agentReply(
          "I found a few customers that could match — who did you mean?",
          null,
          top.map(c => ({ label: c.customer.name, action: 'select_customer', payload: { customerId: c.customer.id } }))
        )
        return
      }

      let customer = candidates.length ? candidates[0].customer : null
      if (!customer && containsPronoun(trimmed) && lastCustomerRef.current) {
        customer = customers.find(c => c.id === lastCustomerRef.current) || null
      }

      await handleQuery(intent, trimmed, { customer })
      return
    }

    await handleQuery(intent, trimmed)
  }

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || busyRef.current) return
    busyRef.current = true

    try {
      const trimmed = text.trim()
      const priorPendingChoice = pendingChoice

      addMessage(makeUserMsg(trimmed))
      setPendingChoice(null)

      if (activeFlow) {
        if (isCancelText(trimmed)) {
          setActiveFlow(null)
          await agentReply('No problem — cancelled. What else can I help with?')
          return
        }

        const step = FLOWS[activeFlow.name][activeFlow.stepIdx]

        if (FREE_TEXT_STEP_KEYS.includes(step.key)) {
          const { intent: interruptIntent, score } = classifyIntent(trimmed)
          const isInterrupt = score >= 8 && (FLOW_INTENTS.includes(interruptIntent) || CUSTOMER_QUERY_INTENTS.includes(interruptIntent))

          if (isInterrupt) {
            setPendingChoice({ kind: 'flow_interrupt', pendingText: trimmed })
            await agentReply(
              "You're partway through something — want to continue that, or handle this new request instead?",
              null,
              [
                { label: 'Continue', action: 'continue_flow' },
                { label: 'Handle this instead', action: 'switch_flow' },
              ]
            )
            return
          }
        }

        const handled = await advanceFlow(trimmed)
        if (handled) return
      }

      if (priorPendingChoice?.kind === 'awaiting_customer_name') {
        const { intent } = priorPendingChoice
        const candidates = matchCustomerCandidates(customers, trimmed)

        if (isAmbiguousMatch(candidates)) {
          const top = candidates.slice(0, 4)
          setPendingChoice({ kind: 'customer_disambiguation', resumeKind: 'query', intent, text: trimmed, candidates: top })
          await agentReply(
            "I found a few customers that could match — who did you mean?",
            null,
            top.map(c => ({ label: c.customer.name, action: 'select_customer', payload: { customerId: c.customer.id } }))
          )
          return
        }

        const customer = candidates.length ? candidates[0].customer : null

        if (!customer) {
          setPendingChoice({ kind: 'awaiting_customer_name', intent })
          await agentReply(`I couldn't find a customer called "${trimmed}". Try their full name, or check the Customers page.`)
          return
        }

        await handleQuery(intent, trimmed, { customer })
        return
      }

      if (priorPendingChoice?.kind === 'awaiting_status') {
        const customer = customers.find(c => c.id === priorPendingChoice.customerId)

        if (!customer) {
          setPendingChoice({ kind: 'awaiting_customer_name', intent: 'update_status' })
          await agentReply("I lost track of which customer that was — which customer's order would you like to update?")
          return
        }

        const newStatus = parseStatusKeyword(trimmed)

        if (!newStatus) {
          setPendingChoice({ kind: 'awaiting_status', customerId: customer.id })
          await agentReply("I didn't catch that. Try: ready, delivered, in progress, or cancelled.")
          return
        }

        await performStatusUpdate(customer, newStatus)
        return
      }

      await routeIntent(trimmed)
    } finally {
      busyRef.current = false
    }
  }, [pendingChoice, activeFlow, customers, allOrders, allInvoices, allPayments, tasks, generalSettings])

  const handleAction = useCallback(async (action, payload) => {
    switch (action) {
      case 'gen_invoice':
        await startFlow('gen_invoice', payload || {})
        break
      case 'cancel':
        setActiveFlow(null)
        setPendingChoice(null)
        await agentReply('No problem — cancelled. What else can I help with?')
        break
      case 'confirm_extracted_flow': {
        if (!pendingChoice) break
        const { intent, initialData } = pendingChoice
        setPendingChoice(null)
        await startFlow(intent, initialData)
        break
      }
      case 'discard_extracted_flow': {
        if (!pendingChoice) break
        const { intent, initialData } = pendingChoice
        setPendingChoice(null)
        await startFlow(intent, initialData.customerName ? { customerName: initialData.customerName } : {})
        break
      }
      case 'select_customer': {
        if (!pendingChoice) break
        const choice = pendingChoice
        setPendingChoice(null)
        const customer = customers.find(c => c.id === payload.customerId)
        if (!customer) break
        lastCustomerRef.current = customer.id

        if (choice.resumeKind === 'query') {
          await handleQuery(choice.intent, choice.text, { customer })
        } else if (choice.resumeKind === 'flow') {
          const initialData = buildInitialDataForFlow(choice.intent, { ...choice.entities, customerName: customer.name })
          await startFlow(choice.intent, initialData)
        }
        break
      }
      case 'select_order': {
        if (!pendingChoice || pendingChoice.kind !== 'order_disambiguation') break
        const choice = pendingChoice
        setPendingChoice(null)
        const order = choice.candidates.find(o => o.id === payload.orderId)
        const customer = customers.find(c => c.id === choice.customerId)
        if (!order || !customer) break

        if (choice.resumeKind === 'gen_invoice') {
          await executeGenInvoiceForOrder(order, customer)
        } else if (choice.resumeKind === 'update_status') {
          if (choice.newStatus === 'cancelled') {
            setPendingChoice({ kind: 'confirm_status_update', orderId: order.id, orderDesc: order.desc, customerName: customer.name, newStatus: choice.newStatus })
            await agentReply(
              `Mark **${order.desc}** for ${customer.name} as cancelled? This can't be undone from here.`,
              null,
              [
                { label: 'Yes, cancel it', action: 'confirm_status_update' },
                { label: 'No, keep it', action: 'cancel' },
              ]
            )
          } else {
            await executeStatusUpdateOnOrder(order, customer.name, choice.newStatus)
          }
        }
        break
      }
      case 'confirm_status_update': {
        if (!pendingChoice || pendingChoice.kind !== 'confirm_status_update') break
        const { orderId, customerName, newStatus } = pendingChoice
        setPendingChoice(null)
        try {
          await updateOrderStatus(orderId, newStatus)
          await agentReply(`✅ Order for ${customerName} has been marked as ${newStatus}.`)
        } catch {
          await agentReply("Couldn't update that order. Please try from the Orders page.")
        }
        break
      }
      case 'continue_flow': {
        if (!pendingChoice || pendingChoice.kind !== 'flow_interrupt') break
        const { pendingText } = pendingChoice
        setPendingChoice(null)
        await advanceFlow(pendingText)
        break
      }
      case 'switch_flow': {
        if (!pendingChoice || pendingChoice.kind !== 'flow_interrupt') break
        const { pendingText } = pendingChoice
        setPendingChoice(null)
        setActiveFlow(null)
        await routeIntent(pendingText)
        break
      }
      default:
        break
    }
  }, [pendingChoice, customers])

  const cancelFlow = useCallback(async () => {
    setActiveFlow(null)
    setPendingChoice(null)
    await agentReply('Got it, cancelled. What else do you need?')
  }, [])

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
