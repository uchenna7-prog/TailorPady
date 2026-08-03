const PLACEHOLDERS = {
  styleStatement: 'Bespoke fashion designed to complement your shape, style, and personality.',
  about:          "I'm a tailor dedicated to crafting pieces that fit your shape, style, and story.",
  yearFounded:    '2020',
  location:       'Lagos, Nigeria',
  availableUntil: 'Next Month',
  turnaround:     '1 weeks',
  bookingNote:    'Please include your measurement chart and fabric preference when reaching out.',
  businessHours:  'Mon–Sat, 9am–6pm',
  footerText:     "Let's create something beautiful together.",
}

function formatAvailableUntil(value) {
  if (value && typeof value === 'object' && value.month && value.year) {
    return `${value.month} ${value.year}`
  }
  if (typeof value === 'string' && value.trim()) return value
  return PLACEHOLDERS.availableUntil
}

function formatMinutes(minutes) {
  const hour24 = Math.floor(minutes / 60)
  const minute = minutes % 60
  const period = hour24 < 12 ? 'AM' : 'PM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`
}

function formatBusinessHours(value) {
  if (
    value && typeof value === 'object' &&
    value.startDay && value.endDay &&
    typeof value.openMinutes === 'number' && typeof value.closeMinutes === 'number'
  ) {
    const dayLabel = value.startDay === value.endDay
      ? value.startDay.slice(0, 3)
      : `${value.startDay.slice(0, 3)}–${value.endDay.slice(0, 3)}`
    return `${dayLabel}, ${formatMinutes(value.openMinutes)}–${formatMinutes(value.closeMinutes)}`
  }
  if (typeof value === 'string' && value.trim()) return value
  return PLACEHOLDERS.businessHours
}

function fillMilestones(milestones) {
  const rows = Array.isArray(milestones) && milestones.length > 0 ? milestones : [{}, {}]
  return rows.slice(0, 2).map((m, i) => ({
    number: m?.number || '0',
    label:  m?.label  || `Milestone ${i + 1}`,
  }))
}

function fillProcessSteps(steps) {
  const rows = Array.isArray(steps) && steps.length > 0 ? steps : [{}]
  return rows.map((s, i) => ({
    title:       s?.title       || `Step ${i + 1}`,
    description: s?.description || `Description for step ${i + 1}`,
  }))
}

function fillFaqs(faqs) {
  const rows = Array.isArray(faqs) && faqs.length > 0 ? faqs : [{}]
  return rows.map((f, i) => ({
    question: f?.question || `Question ${i + 1}`,
    answer:   f?.answer   || `Answer ${i + 1}`,
  }))
}

export function usePortfolioBrandSettings(portfolioSettings = {}) {
  const PORTFOLIO_BRAND_SETTINGS = {

    styleStatement: portfolioSettings.brandStyleStatement || PLACEHOLDERS.styleStatement,
    about:          portfolioSettings.brandAbout || PLACEHOLDERS.about,
    yearFounded:    portfolioSettings.brandYearFounded || PLACEHOLDERS.yearFounded,
    milestones:     fillMilestones(portfolioSettings.brandMilestones),
    location:       portfolioSettings.brandLocation || PLACEHOLDERS.location,

    availability:   portfolioSettings.brandAvailability || 'open',
    availableUntil: formatAvailableUntil(portfolioSettings.brandAvailableUntil),

    turnaround:  portfolioSettings.brandTurnaround || PLACEHOLDERS.turnaround,
    serviceArea: portfolioSettings.brandServiceArea?.length > 0
      ? portfolioSettings.brandServiceArea
      : ['Nationwide'],

    processSteps: fillProcessSteps(portfolioSettings.brandProcessSteps),
    faqs:         fillFaqs(portfolioSettings.brandFaqs),

    bookingNote:   portfolioSettings.brandBookingNote || PLACEHOLDERS.bookingNote,
    businessHours: formatBusinessHours(portfolioSettings.brandBusinessHours),

    heroBgImage:   portfolioSettings.heroBgImage || null,
    footerBgImage: portfolioSettings.footerBgImage || null,
    footerText:    portfolioSettings.brandFooterText || PLACEHOLDERS.footerText,

    template: portfolioSettings.portfolioTemplate || 'template1',

  }

  return PORTFOLIO_BRAND_SETTINGS
}