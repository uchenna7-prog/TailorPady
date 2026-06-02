
export function getBirthdayStr(birthday) {
  if (!birthday) return ''
  const today = new Date()
  const [month, day] = birthday.split('-').map(Number)
  if (today.getMonth() + 1 === month && today.getDate() === day) return '🎂 Today!'
  const d = new Date(2000, month - 1, day)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}


export function buildPhoneNumber(localNumber, countryDialCode) {
  
  const digits = localNumber.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${countryDialCode} ${digits.slice(1)}`
  }
  if (digits.length === 10) {
    return `${countryDialCode} ${digits}`
  }
  return null
}
