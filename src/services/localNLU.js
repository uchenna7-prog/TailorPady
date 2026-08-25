const SHORTHAND = {
  wat: 'what', wats: 'what is', whats: 'what is',
  hw: 'how', hws: 'how is',
  u: 'you', ur: 'your', r: 'are',
  '2day': 'today', '2moro': 'tomorrow', '2morrow': 'tomorrow',
  dis: 'this', dat: 'that', dem: 'them',
  pls: 'please', plz: 'please',
  bal: 'balance', inv: 'invoice', cust: 'customer',
  yh: 'yes', yea: 'yes', yeah: 'yes', nah: 'no', nope: 'no',
  wk: 'week', mo: 'month', mth: 'month',
  amt: 'amount', pymt: 'payment', pmt: 'payment',
}

export function normalizeText(text) {
  if (!text) return ''
  const lower = String(text).toLowerCase().trim().replace(/\s+/g, ' ')
  return lower
    .split(' ')
    .map(w => {
      const stripped = w.replace(/[?!.,]+$/g, '')
      return SHORTHAND[stripped] || stripped
    })
    .join(' ')
}

export function tokenize(text) {
  return normalizeText(text).split(/\s+/).filter(Boolean)
}

export function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const prev = new Array(b.length + 1)
  const curr = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      )
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]
  }
  return prev[b.length]
}

function allowedDistance(word) {
  if (word.length <= 3) return 0
  if (word.length <= 6) return 1
  return 2
}

export function fuzzyTokenMatch(token, target) {
  if (token === target) return true
  const dist = allowedDistance(target)
  if (dist === 0) return false
  if (Math.abs(token.length - target.length) > dist + 1) return false
  return levenshtein(token, target) <= dist
}

function phraseMatches(tokens, phraseWords) {
  return phraseWords.every(pw => tokens.some(t => fuzzyTokenMatch(t, pw)))
}

export function matchCustomerCandidates(customers, text) {
  if (!text || !customers?.length) return []
  const norm = normalizeText(text)
  const textTokens = tokenize(text)
  const results = []

  for (const c of customers) {
    if (!c.name) continue
    const nameNorm = normalizeText(c.name)

    let score = 0
    if (norm === nameNorm) {
      score = 100
    } else if (norm.includes(nameNorm) || nameNorm.includes(norm)) {
      score = 85
    } else {
      const nameTokens = nameNorm.split(' ')
      const matchedCount = nameTokens.filter(nt =>
        textTokens.some(tt => fuzzyTokenMatch(tt, nt))
      ).length
      score = matchedCount > 0 ? 50 + (matchedCount / nameTokens.length) * 50 : 0
    }

    if (score > 45) results.push({ customer: c, score })
  }

  return results.sort((a, b) => b.score - a.score)
}

export function matchCustomer(customers, text) {
  const candidates = matchCustomerCandidates(customers, text)
  return candidates.length ? candidates[0] : null
}

export function isAmbiguousMatch(candidates) {
  return candidates.length >= 2 &&
    candidates[1].score > 45 &&
    candidates[0].score - candidates[1].score < 15
}

export function containsPronoun(text) {
  return /\b(he|she|they|him|her|them|his|hers|their)\b/i.test(text)
}

export function isCancelText(text) {
  const s = normalizeText(text)
  return /^(cancel|stop|nevermind|never mind|forget it|quit|exit|nvm)\b/.test(s)
}

export function parseMoney(str) {
  if (str === null || str === undefined) return null
  let s = String(str).toLowerCase().trim()
  if (!s) return null

  s = s.replace(/naira|ngn|₦/g, '').trim()

  const kMatch = s.match(/^([\d,]+(?:\.\d+)?)\s*k$/)
  if (kMatch) {
    const n = parseFloat(kMatch[1].replace(/,/g, ''))
    return isNaN(n) ? null : n * 1000
  }

  const cleaned = s.replace(/[,\s]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

export function formatMoney(amount, currencySymbol = '₦') {
  if (!amount) return `${currencySymbol}0`
  return `${currencySymbol}${Number(amount).toLocaleString()}`
}

const NUMBER_ONES = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
}
const NUMBER_TENS = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
}
const NUMBER_SCALES = { thousand: 1000, million: 1_000_000 }

function isNumberWord(word) {
  return word in NUMBER_ONES || word in NUMBER_TENS || word === 'hundred' || word in NUMBER_SCALES || word === 'and'
}

export function wordsToNumber(tokens) {
  let total = 0
  let current = 0
  let found = false

  for (const t of tokens) {
    if (t === 'and') continue
    if (t in NUMBER_ONES) { current += NUMBER_ONES[t]; found = true; continue }
    if (t in NUMBER_TENS) { current += NUMBER_TENS[t]; found = true; continue }
    if (t === 'hundred') { current = (current || 1) * 100; found = true; continue }
    if (t in NUMBER_SCALES) { total += (current || 1) * NUMBER_SCALES[t]; current = 0; found = true; continue }
    break
  }

  if (!found) return null
  return total + current
}

export function extractMoneyMention(text) {
  const norm = normalizeText(text)

  const kMatch = norm.match(/(\d[\d,]*(?:\.\d+)?)\s*k\b/)
  if (kMatch) {
    const n = parseFloat(kMatch[1].replace(/,/g, ''))
    if (!isNaN(n)) return n * 1000
  }

  const currencyMatch = norm.match(/₦\s*([\d,]+(?:\.\d+)?)/) || norm.match(/([\d,]+(?:\.\d+)?)\s*(?:naira|ngn)\b/)
  if (currencyMatch) {
    const n = parseFloat(currencyMatch[1].replace(/,/g, ''))
    if (!isNaN(n)) return n
  }

  const tokens = tokenize(text)
  const magnitudeWords = new Set(['hundred', 'thousand', 'million'])
  for (let i = 0; i < tokens.length; i++) {
    if (!(tokens[i] in NUMBER_ONES) && !(tokens[i] in NUMBER_TENS)) continue
    let j = i
    let sawMagnitude = false
    while (j < tokens.length && isNumberWord(tokens[j])) {
      if (magnitudeWords.has(tokens[j])) sawMagnitude = true
      j++
    }
    if (sawMagnitude) {
      const value = wordsToNumber(tokens.slice(i, j))
      if (value !== null) return value
    }
    i = j
  }

  return null
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function parseDate(str) {
  if (!str) return null
  const s = normalizeText(str)
  const today = new Date()

  if (s === 'today') return todayISO()
  if (s === 'tomorrow') return addDays(today, 1).toISOString().slice(0, 10)
  if (s === 'yesterday') return addDays(today, -1).toISOString().slice(0, 10)

  if (/this weekend/.test(s)) {
    const diff = (6 - today.getDay() + 7) % 7 || 6
    return addDays(today, diff).toISOString().slice(0, 10)
  }

  if (/end of (the )?month/.test(s)) {
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return d.toISOString().slice(0, 10)
  }

  const inMatch = s.match(/^in\s+(\d+)\s*(day|days|week|weeks)$/)
  if (inMatch) {
    const amount = parseInt(inMatch[1], 10)
    const unit = inMatch[2].startsWith('week') ? 7 : 1
    return addDays(today, amount * unit).toISOString().slice(0, 10)
  }

  const nextMatch = s.match(/^next\s+(\w+)/)
  if (nextMatch) {
    const idx = DAY_NAMES.indexOf(nextMatch[1])
    if (idx !== -1) {
      const diff = (idx - today.getDay() + 7) % 7 || 7
      return addDays(today, diff).toISOString().slice(0, 10)
    }
    if (nextMatch[1] === 'week') return addDays(today, 7).toISOString().slice(0, 10)
  }

  const dayIdx = DAY_NAMES.indexOf(s)
  if (dayIdx !== -1) {
    const diff = (dayIdx - today.getDay() + 7) % 7 || 7
    return addDays(today, diff).toISOString().slice(0, 10)
  }

  const parsed = new Date(str)
  if (!isNaN(parsed)) return parsed.toISOString().slice(0, 10)
  return null
}

const DATE_MENTION_PATTERNS = [
  /\btoday\b/,
  /\btomorrow\b/,
  /\byesterday\b/,
  /\bthis weekend\b/,
  /\bend of (?:the )?month\b/,
  /\bin\s+\d+\s*(?:day|days|week|weeks)\b/,
  /\bnext\s+(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday|week)\b/,
  /\b(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/,
  /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?\b/,
]

export function extractDateMention(text) {
  const norm = normalizeText(text)
  for (const re of DATE_MENTION_PATTERNS) {
    const m = norm.match(re)
    if (m) {
      const parsed = parseDate(m[0])
      if (parsed) return parsed
    }
  }
  return null
}

const GARMENT_WORDS = new Set([
  'agbada', 'kaftan', 'caftan', 'gown', 'suit', 'trouser', 'trousers', 'skirt',
  'blouse', 'dress', 'shirt', 'top', 'ankara', 'senator', 'buba', 'iro',
  'wrapper', 'jacket', 'kimono', 'jumpsuit', 'native', 'dashiki', 'agabada',
])

const DESC_STOPWORDS = new Set([
  'for', 'due', 'by', 'at', 'on', 'cost', 'price', 'worth', 'is', 'was',
  'paid', 'deposit', 'naira', 'ngn', 'today', 'tomorrow',
])

export function extractGarmentDesc(text) {
  const tokens = tokenize(text)
  const startIdx = tokens.findIndex(t =>
    GARMENT_WORDS.has(t) || [...GARMENT_WORDS].some(g => fuzzyTokenMatch(t, g))
  )
  if (startIdx === -1) return null

  let end = startIdx
  while (end < tokens.length) {
    const t = tokens[end]
    if (DESC_STOPWORDS.has(t) || /^\d/.test(t) || end - startIdx >= 6) break
    end++
  }

  const words = tokens.slice(startIdx, end)
  return words.length ? words.join(' ') : null
}

const ORDER_FILLER_WORDS = new Set([
  'add', 'an', 'a', 'the', 'new', 'create', 'take', 'order', 'orders', 'job',
  'for', 'ordering', 'make', 'put', 'and', 'with', 'of', 'is', 'was',
])

export function extractGarmentDescFallback(text, customerName) {
  const nameTokens = customerName ? tokenize(customerName) : []
  const tokens = tokenize(text).filter(t => {
    if (ORDER_FILLER_WORDS.has(t)) return false
    if (nameTokens.includes(t)) return false
    if (/^\d/.test(t)) return false
    if (['k', 'naira', 'ngn', 'today', 'tomorrow', 'due', 'by'].includes(t)) return false
    return true
  })
  const result = tokens.join(' ').trim()
  return result.length > 1 ? result : null
}

export function extractPaymentMethod(text) {
  const s = normalizeText(text)
  if (/\btransfer\b/.test(s)) return 'transfer'
  if (/\bcard\b/.test(s)) return 'card'
  if (/\bpos\b/.test(s)) return 'card'
  if (/\bcash\b/.test(s)) return 'cash'
  return null
}

const APPT_TYPE_WORDS = [
  { match: /\bfitting\b/, value: 'fitting' },
  { match: /\bmeasurements?\b/, value: 'measurement' },
  { match: /\bdeliver(y|ing)?\b/, value: 'delivery' },
  { match: /\bconsult(ation)?\b/, value: 'consultation' },
  { match: /\bpick[\s-]?up\b/, value: 'pickup' },
]

export function extractApptType(text) {
  const s = normalizeText(text)
  for (const { match, value } of APPT_TYPE_WORDS) {
    if (match.test(s)) return value
  }
  return null
}

export function extractTimeMention(text) {
  const m = text.match(/\b\d{1,2}(:\d{2})?\s*(am|pm|AM|PM)\b/) || text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/)
  return m ? m[0].trim() : null
}

export function extractEntities(text, customers) {
  const candidates = matchCustomerCandidates(customers, text)
  const topCustomer = candidates.length ? candidates[0].customer : null

  return {
    customerName: topCustomer ? topCustomer.name : null,
    customerCandidates: candidates,
    money: extractMoneyMention(text),
    date: extractDateMention(text),
    desc: extractGarmentDesc(text),
    method: extractPaymentMethod(text),
    apptType: extractApptType(text),
    time: extractTimeMention(text),
  }
}

export function formatDateNice(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function now() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export function timestampToMs(value) {
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

export function formatDateLabel(ms) {
  if (!ms) return 'Other'
  const date = new Date(ms)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.getFullYear()
}

export function formatClockLabel(ms) {
  if (!ms) return ''
  return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function detectTimeWindow(text) {
  const s = normalizeText(text)
  const now = Date.now()
  const today = new Date()

  if (/\btoday\b/.test(s)) {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    return { label: 'today', startMs: start, endMs: now }
  }
  if (/this week/.test(s)) {
    const dayOfWeek = today.getDay()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek).getTime()
    return { label: 'this week', startMs: start, endMs: now }
  }
  if (/this month/.test(s)) {
    const start = new Date(today.getFullYear(), today.getMonth(), 1).getTime()
    return { label: 'this month', startMs: start, endMs: now }
  }
  return { label: 'all time', startMs: 0, endMs: now }
}

export const DAY_MS = 86_400_000
export const HOUR_MS = 3_600_000
export const WEEK_MS = 604_800_000

export function durationToMs(duration) {
  if (!duration || typeof duration !== 'object') return DAY_MS
  const amount = Number(duration.amount) || 1
  const unitMs = { hours: HOUR_MS, days: DAY_MS, weeks: WEEK_MS, months: DAY_MS * 30 }
  return amount * (unitMs[duration.unit] || DAY_MS)
}

export function durationLabel(duration) {
  if (!duration || typeof duration !== 'object') return '1 day'
  const amount = Number(duration.amount) || 1
  const unit = duration.unit || 'days'
  const base = unit.replace(/s$/, '')
  return `${amount} ${amount === 1 ? base : unit}`
}

const INTENT_DEFS = [
  { intent: 'greeting', phrases: [
    { words: ['hi'], weight: 8 },
    { words: ['hello'], weight: 8 },
    { words: ['hey'], weight: 8 },
    { words: ['good', 'morning'], weight: 9 },
    { words: ['good', 'afternoon'], weight: 9 },
    { words: ['good', 'evening'], weight: 9 },
  ]},

  { intent: 'thanks', phrases: [
    { words: ['thank', 'you'], weight: 9 },
    { words: ['thanks'], weight: 8 },
    { words: ['appreciate', 'it'], weight: 8 },
  ]},

  { intent: 'help', phrases: [
    { words: ['what', 'can', 'you', 'do'], weight: 10 },
    { words: ['what', 'can', 'i', 'ask'], weight: 10 },
    { words: ['how', 'do', 'i', 'use', 'you'], weight: 10 },
    { words: ['help'], weight: 5 },
    { words: ['commands'], weight: 6 },
  ]},

  { intent: 'add_order', phrases: [
    { words: ['add', 'order'], weight: 9 },
    { words: ['new', 'order'], weight: 9 },
    { words: ['create', 'order'], weight: 9 },
    { words: ['take', 'order'], weight: 9 },
    { words: ['new', 'job'], weight: 8 },
    { words: ['add', 'job'], weight: 8 },
    { words: ['order', 'for'], weight: 6 },
  ]},

  { intent: 'gen_invoice', phrases: [
    { words: ['generate', 'invoice'], weight: 10 },
    { words: ['create', 'invoice'], weight: 10 },
    { words: ['send', 'invoice'], weight: 10 },
    { words: ['make', 'invoice'], weight: 10 },
    { words: ['invoice', 'for'], weight: 7 },
  ]},

  { intent: 'record_payment', phrases: [
    { words: ['record', 'payment'], weight: 10 },
    { words: ['payment', 'from'], weight: 8 },
    { words: ['just', 'paid'], weight: 9 },
    { words: ['received', 'payment'], weight: 9 },
    { words: ['mark', 'paid'], weight: 9 },
    { words: ['paid'], weight: 5 },
  ]},

  { intent: 'add_task', phrases: [
    { words: ['add', 'task'], weight: 9 },
    { words: ['create', 'task'], weight: 9 },
    { words: ['new', 'task'], weight: 9 },
    { words: ['remind', 'me'], weight: 8 },
    { words: ['note', 'to'], weight: 6 },
  ]},

  { intent: 'add_appt', phrases: [
    { words: ['book', 'appointment'], weight: 10 },
    { words: ['book', 'appt'], weight: 10 },
    { words: ['set', 'appointment'], weight: 10 },
    { words: ['appointment', 'for'], weight: 8 },
    { words: ['fitting', 'for'], weight: 8 },
    { words: ['schedule'], weight: 5 },
  ]},

  { intent: 'query_customer', phrases: [
    { words: ['how', 'much', 'owe'], weight: 10 },
    { words: ['balance', 'for'], weight: 9 },
    { words: ['what', 'owe'], weight: 9 },
    { words: ['does', 'owe'], weight: 9 },
    { words: ['owe', 'me'], weight: 8 },
  ]},

  { intent: 'query_debtors', phrases: [
    { words: ['who', 'owes'], weight: 10 },
    { words: ['who', 'has', 'not', 'paid'], weight: 10 },
    { words: ['list', 'debtors'], weight: 10 },
    { words: ['outstanding', 'customers'], weight: 9 },
  ]},

  { intent: 'query_top_customers', phrases: [
    { words: ['top', 'customers'], weight: 10 },
    { words: ['best', 'customers'], weight: 10 },
    { words: ['biggest', 'customers'], weight: 10 },
  ]},

  { intent: 'query_new_customers', phrases: [
    { words: ['new', 'customers'], weight: 9 },
    { words: ['customers', 'this', 'week'], weight: 10 },
    { words: ['customers', 'this', 'month'], weight: 10 },
  ]},

  { intent: 'query_contact', phrases: [
    { words: ['phone', 'number'], weight: 10 },
    { words: ['contact', 'for'], weight: 9 },
    { words: ['phone', 'for'], weight: 9 },
    { words: ['number', 'for'], weight: 7 },
  ]},

  { intent: 'query_revenue', phrases: [
    { words: ['how', 'much', 'did', 'i', 'make'], weight: 10 },
    { words: ['how', 'much', 'money'], weight: 9 },
    { words: ['revenue'], weight: 8 },
    { words: ['earnings'], weight: 8 },
    { words: ['sales', 'this'], weight: 8 },
  ]},

  { intent: 'query_orders', phrases: [
    { words: ['orders', 'due'], weight: 9 },
    { words: ['pending', 'orders'], weight: 9 },
    { words: ['active', 'orders'], weight: 9 },
    { words: ['show', 'orders'], weight: 8 },
    { words: ['what', 'due'], weight: 6 },
  ]},

  { intent: 'query_overdue', phrases: [
    { words: ['overdue', 'invoice'], weight: 10 },
    { words: ['late', 'invoice'], weight: 9 },
    { words: ['overdue'], weight: 6 },
    { words: ['unpaid'], weight: 5 },
  ]},

  { intent: 'query_tasks_overdue', phrases: [
    { words: ['overdue', 'tasks'], weight: 10 },
    { words: ['late', 'tasks'], weight: 10 },
    { words: ['tasks', 'not', 'done'], weight: 9 },
  ]},

  { intent: 'query_schedule', phrases: [
    { words: ['today', 'schedule'], weight: 10 },
    { words: ['what', 'is', 'on', 'today'], weight: 10 },
    { words: ['agenda'], weight: 8 },
    { words: ['what', 'is', 'happening', 'today'], weight: 9 },
  ]},

  { intent: 'query_summary', phrases: [
    { words: ['summary'], weight: 7 },
    { words: ['how', 'am', 'i', 'doing'], weight: 10 },
    { words: ['today', 'status'], weight: 8 },
    { words: ['overview'], weight: 7 },
    { words: ['snapshot'], weight: 7 },
  ]},

  { intent: 'update_status', phrases: [
    { words: ['mark', 'as'], weight: 9 },
    { words: ['status', 'to'], weight: 9 },
    { words: ['update', 'status'], weight: 9 },
    { words: ['set', 'status'], weight: 9 },
    { words: ['ready'], weight: 4 },
    { words: ['complete'], weight: 4 },
    { words: ['deliver'], weight: 4 },
  ]},

  { intent: 'check_measurements', phrases: [
    { words: ['measurement'], weight: 7 },
    { words: ['measure'], weight: 6 },
    { words: ['size', 'for'], weight: 6 },
    { words: ['has', 'measurements'], weight: 8 },
  ]},
]

const MIN_INTENT_SCORE = 5

export function classifyIntent(text) {
  const tokens = tokenize(text)
  if (!tokens.length) return { intent: 'unknown', score: 0 }

  let best = { intent: 'unknown', score: 0 }
  for (const { intent, phrases } of INTENT_DEFS) {
    let score = 0
    for (const { words, weight } of phrases) {
      if (phraseMatches(tokens, words)) score += weight
    }
    if (score > best.score) best = { intent, score }
  }

  if (best.score < MIN_INTENT_SCORE) return { intent: 'unknown', score: best.score }
  return best
}

export function buildHelpText(customers) {
  const name = customers?.[0]?.name || 'a customer'
  return [
    "Here's what I can help you with:",
    '',
    `📦 **Orders** — "Add an order for ${name}", "What orders are due today?"`,
    `🧾 **Invoices** — "Generate invoice for ${name}", "Any overdue invoices?"`,
    `💰 **Payments** — "${name} just paid 15k", "Who owes me money?"`,
    `👥 **Customers** — "How much does ${name} owe?", "Top customers this month"`,
    '✅ **Tasks** — "Remind me to call a customer tomorrow", "Any overdue tasks?"',
    '📊 **Business** — "How am I doing today?", "How much did I make this week?"',
    '',
    "Just type naturally — I'll do my best to figure it out.",
  ].join('\n')
}
