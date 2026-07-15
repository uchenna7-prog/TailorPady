import { parsePhoneNumberFromString } from 'libphonenumber-js'


export function getBirthdayStr(birthday) {
  if (!birthday) return ''
  const today = new Date()
  const [month, day] = birthday.split('-').map(Number)
  if (today.getMonth() + 1 === month && today.getDate() === day) return '🎂 Today!'
  const d = new Date(2000, month - 1, day)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}


export function buildPhoneNumber(localNumber, countryCca2) {
  const digits = localNumber.replace(/\D/g, '')
  if (!digits) return null

  const parsed = parsePhoneNumberFromString(digits, countryCca2)
  if (!parsed || !parsed.isValid()) return null

  return parsed.number
}


export function isValidLocalPhoneNumber(localNumber, countryCca2) {
  const digits = localNumber.replace(/\D/g, '')
  if (!digits) return false

  const parsed = parsePhoneNumberFromString(digits, countryCca2)
  return !!parsed && parsed.isValid()
}