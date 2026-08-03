import { usePortfolioSettings } from "../contexts/PortfolioSettingsContext"

const PLACEHOLDERS = {
    styleStatement: 'Describe the style and craft that make your work stand out.',
    yearFounded:    '2020',
    location:       'Lagos, Nigeria',
    availableUntil: 'Next Month',
    turnaround:     '1 weeks',
    bookingNote:    'Please include your measurement chart and fabric preference when reaching out.',
    businessHours:  'Mon–Sat, 9am–6pm',
    footerText:     "Let's create something beautiful together.",
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

export function usePortfolioBrandSettings() {

    const { portfolioSettings } = usePortfolioSettings()

    const PORTFOLIO_BRAND_SETTINGS = {

        styleStatement: portfolioSettings.brandStyleStatement || PLACEHOLDERS.styleStatement,
        yearFounded:    portfolioSettings.brandYearFounded || PLACEHOLDERS.yearFounded,
        milestones:     fillMilestones(portfolioSettings.brandMilestones),
        location:       portfolioSettings.brandLocation || PLACEHOLDERS.location,

        availability:   portfolioSettings.brandAvailability || 'open',
        availableUntil: portfolioSettings.brandAvailableUntil || PLACEHOLDERS.availableUntil,

        turnaround:  portfolioSettings.brandTurnaround || PLACEHOLDERS.turnaround,
        serviceArea: portfolioSettings.brandServiceArea?.length > 0
            ? portfolioSettings.brandServiceArea
            : ['Nationwide'],

        processSteps: fillProcessSteps(portfolioSettings.brandProcessSteps),
        faqs:         fillFaqs(portfolioSettings.brandFaqs),

        bookingNote:   portfolioSettings.brandBookingNote || PLACEHOLDERS.bookingNote,
        businessHours: portfolioSettings.brandBusinessHours || PLACEHOLDERS.businessHours,

        heroBgImage:   portfolioSettings.heroBgImage || null,
        footerBgImage: portfolioSettings.footerBgImage || null,
        footerText:    portfolioSettings.brandFooterText || PLACEHOLDERS.footerText,

        template: portfolioSettings.portfolioTemplate || 'template1',

    }

    return PORTFOLIO_BRAND_SETTINGS

}
