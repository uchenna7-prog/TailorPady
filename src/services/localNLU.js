// localNLU.js
//
// A small, fully-local "understanding" engine for the tailor-shop assistant.
// No model calls, no network — just better string matching than plain regex:
//   - typo/shorthand tolerant text normalization ("wat", "2day", "hw" etc.)
//   - Levenshtein-based fuzzy word matching
//   - weighted, scored intent classification (instead of first-regex-wins)
//   - fuzzy customer-name lookup against your real customer list
//   - money/date parsing that understands Nigerian shorthand ("50k", "5k naira")
//   - shared formatters so AgentContext and AutonomousAgentContext don't
//     each maintain their own copy of formatMoney/date helpers.

// ---------------------------------------------------------------------------
// Text normalization
// ---------------------------------------------------------------------------

// Common mobile-typing shorthand -> full word. Keep this list small and safe;
// only add entries you're confident won't collide with real words/names.
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

// ---------------------------------------------------------------------------
// Fuzzy matching
// ---------------------------------------------------------------------------

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
        prev[j] + 1,      // deletion
        curr[j - 1] + 1,  // insertion
        prev[j - 1] + cost // substitution
      )
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]
  }
  return prev[b.length]
}

// How much typo tolerance to allow, scaled to word length so short words
// (which are more likely to collide with unrelated short words) stay strict.
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

// Does every word in `phraseWords` appear somewhere (in any order, fuzzily)
// among `tokens`? Used to detect a trigger phrase regardless of word order
// or minor typos.
function phraseMatches(tokens, phraseWords) {
  return phraseWords.every(pw => tokens.some(t => fuzzyTokenMatch(t, pw)))
}

// ---------------------------------------------------------------------------
// Fuzzy customer lookup
// ---------------------------------------------------------------------------

// Searches free-form text for the customer it most likely refers to, using
// the real customer list rather than guessing from capitalization. This
// replaces the old "extract a Title Case word, then look it up" approach,
// which broke on lowercase typing, typos, and multi-word names.
export function matchCustomer(customers, text) {
  if (!text || !customers?.length) return null
  const norm = normalizeText(text)
  const textTokens = tokenize(text)

  let best = null
  for (const c of customers) {
    if (!c.name) continue
    const nameNorm = normalizeText(c.name)

    let score = 0
    if (norm === nameNorm) {
      score = 100
    } else if (norm.includes(nameNorm) || nameNorm.includes(norm)) {
      score = 85
    } else {
      // Shop owners very often refer to customers by first name only, so a
      // partial token match (e.g. "Bola" matching "Bola Adeyemi") still
      // needs to clear the confidence bar — not just a full-name match.
      const nameTokens = nameNorm.split(' ')
      const matchedCount = nameTokens.filter(nt =>
        textTokens.some(tt => fuzzyTokenMatch(tt, nt))
      ).length
      score = matchedCount > 0 ? 50 + (matchedCount / nameTokens.length) * 50 : 0
    }

    if (score > 45 && (!best || score > best.score)) {
      best = { customer: c, score }
    }
  }
  return best
}

// ---------------------------------------------------------------------------
// Money parsing
// ---------------------------------------------------------------------------

export function parseMoney(str) {
  if (str === null || str === undefined) return null
  let s = String(str).toLowerCase().trim()
  if (!s) return null

  s = s.replace(/naira|ngn|₦/g, '').trim()

  // "50k" / "50.5k" -> 50000 / 50500
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

// ---------------------------------------------------------------------------
// Date parsing
// ---------------------------------------------------------------------------

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

// Time-window helper used by the revenue / new-customers / debtor queries.
// Detects "today" / "this week" / "this month" in free text; defaults to
// "all time" when nothing specific is mentioned.
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

// ---------------------------------------------------------------------------
// Intent classification
// ---------------------------------------------------------------------------
//
// Each intent has a list of trigger phrases with weights. A phrase matches
// if ALL of its words are found (fuzzily, any order) in the input. The
// intent with the highest total matched weight wins — this fixes the old
// "first regex to fire wins" problem, where a generic single word like
// "ready" could hijack an unrelated sentence.

const INTENT_DEFS = [
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

export const HELP_TEXT = [
  "Here's what I can help you with:",
  '',
  '📦 **Orders** — "Add an order for Uchenna", "What orders are due today?"',
  '🧾 **Invoices** — "Generate invoice for Bola", "Any overdue invoices?"',
  '💰 **Payments** — "Emeka just paid 15k", "Who owes me money?"',
  '👥 **Customers** — "How much does Bola owe?", "Top customers this month"',
  '✅ **Tasks** — "Remind me to call Ada tomorrow", "Any overdue tasks?"',
  '📊 **Business** — "How am I doing today?", "How much did I make this week?"',
  '',
  'Just type naturally — I\'ll do my best to figure it out.',
].join('\n')
