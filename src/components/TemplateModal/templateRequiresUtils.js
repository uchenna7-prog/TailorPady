import { INVOICE_TEMPLATE_GROUPS } from './datas/invoiceTemplateGroups'
import { RECEIPT_TEMPLATE_GROUPS } from './datas/receiptTemplateGroups'

export const FIELD_TO_PROFILE_KEY = {
  name:          'brandName',
  tagline:       'brandTagline',
  phone:         'brandPhone',
  email:         'brandEmail',
  address:       'brandAddress',
  website:       'brandWebsite',
  logo:          'brandLogo',
  signature:     'brandSignature',
  accountBank:   'accountBank',
  accountNumber: 'accountNumber',
  accountName:   'accountName',
  paymentTerms:  'brandPaymentTerms',
}

function isMissing(key, profileSettings) {
  const rawKey = FIELD_TO_PROFILE_KEY[key]
  const value  = rawKey ? profileSettings[rawKey] : null
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

export function getMissingFields(requires, profileSettings) {
  return requires.filter(key => isMissing(key, profileSettings))
}

export function getRequiresForDoc(docType, invoiceTemplateId, receiptTemplateId) {
  if (docType === 'invoice') {
    const allInvoice      = INVOICE_TEMPLATE_GROUPS.flatMap(g => g.templates)
    const invoiceTemplate = allInvoice.find(t => t.id === invoiceTemplateId)
    return invoiceTemplate?.requires ?? []
  }

  if (docType === 'receipt') {
    const allReceipt      = RECEIPT_TEMPLATE_GROUPS.flatMap(g => g.templates)
    const receiptTemplate = allReceipt.find(t => t.id === receiptTemplateId)
    return receiptTemplate?.requires ?? []
  }

  const allInvoice      = INVOICE_TEMPLATE_GROUPS.flatMap(g => g.templates)
  const allReceipt      = RECEIPT_TEMPLATE_GROUPS.flatMap(g => g.templates)
  const invoiceTemplate = allInvoice.find(t => t.id === invoiceTemplateId)
  const receiptTemplate = allReceipt.find(t => t.id === receiptTemplateId)
  const combined        = new Set([
    ...(invoiceTemplate?.requires ?? []),
    ...(receiptTemplate?.requires ?? []),
  ])
  return Array.from(combined)
}