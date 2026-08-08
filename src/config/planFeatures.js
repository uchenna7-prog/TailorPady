import { USAGE_LIMITS } from '../services/usageService'

export const FREE_FEATURES = [
  { icon: 'group', label: `Up to ${USAGE_LIMITS.customers} customers` },
  { icon: 'straighten', label: `${USAGE_LIMITS.measurementsPerMonth} measurement records / month` },
  { icon: 'receipt_long', label: `${USAGE_LIMITS.ordersPerMonth} active orders / month` },
  { icon: 'description', label: 'All invoice & receipt templates' },
  { icon: 'print', label: `${USAGE_LIMITS.invoicesPerMonth} invoice + ${USAGE_LIMITS.receiptsPerMonth} receipt generations / month` },
  { icon: 'palette', label: 'Basic branding customisation' },
  { icon: 'photo_library', label: `${USAGE_LIMITS.portfolioUploadsPerMonth} portfolio uploads / month` },
  { icon: 'link', label: 'Public portfolio link' },
  { icon: 'star_rate', label: `${USAGE_LIMITS.reviewLinksPerMonth} review links / month` },
  { icon: 'payments', label: 'Basic payment tracking' },
  { icon: 'smart_toy', label: `${USAGE_LIMITS.aiActionsPerMonth} AI assistant actions / month` },
  { icon: 'cake', label: 'Birthday reminders' },
]

export const PRO_FEATURES = [
  { icon: 'all_inclusive', label: 'Unlimited customers' },
  { icon: 'all_inclusive', label: 'Unlimited measurements' },
  { icon: 'all_inclusive', label: 'Unlimited active orders' },
  { icon: 'all_inclusive', label: 'Unlimited invoice & receipt generations' },
  { icon: 'palette', label: 'Full branding: logo, colours, signature' },
  { icon: 'account_balance', label: 'Bank details & T&Cs on every document' },
  { icon: 'photo_library', label: 'Unlimited portfolio uploads' },
  { icon: 'auto_awesome', label: 'Fully branded portfolio page' },
  { icon: 'star', label: 'Unlimited review links' },
  { icon: 'bar_chart', label: 'Advanced payment tracking & reports' },
  { icon: 'smart_toy', label: 'Unlimited AI assistant actions' },
  { icon: 'edit_note', label: 'Smart invoice auto-drafts' },
  { icon: 'campaign', label: 'Customer re-engagement reminders' },
  { icon: 'cloud', label: 'Expanded cloud storage' },
]
