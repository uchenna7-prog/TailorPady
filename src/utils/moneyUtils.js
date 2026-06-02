export function formatMoney(
  currency,
  amount,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
) {
  const symbol = typeof currency === 'object' ? (currency?.symbol ?? '₦') : (currency ?? '₦')
  const number = parseFloat(amount) || 0
  return `${symbol}${number.toLocaleString('en-NG', { minimumFractionDigits, maximumFractionDigits })}`
}


export function getCurrency() {
  try {
    const raw = JSON.parse(localStorage.getItem('TailorPady_general_settings') || '{}')
    const currency = raw.invoiceCurrency
    return typeof currency === 'object' ? (currency?.symbol ?? '₦') : (currency ?? '₦')
  }
  catch {
    return '₦'
  }
}