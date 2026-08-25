const API_BASE = 'https://tailor-pady-api.vercel.app'
const PLAY_BILLING_METHOD = 'https://play.google.com/billing'

const ITEM_IDS = {
  monthly: 'pro:monthly',
  annual: 'pro:annual',
}

export function isPlayBillingAvailable() {
  return typeof window !== 'undefined' && 'getDigitalGoodsService' in window
}

async function getDigitalGoodsService() {
  if (!isPlayBillingAvailable()) {
    throw new Error('Digital Goods API not available')
  }
  return window.getDigitalGoodsService(PLAY_BILLING_METHOD)
}

export async function getPlayBillingDetails(billingCycle) {
  const service = await getDigitalGoodsService()
  const itemId = ITEM_IDS[billingCycle]
  const details = await service.getDetails([itemId])
  return details[0] || null
}

async function verifyPlayPurchase({ purchaseToken, uid, billingCycle }) {
  const response = await fetch(`${API_BASE}/api/play-billing?action=verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purchaseToken, uid, billingCycle }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Purchase verification failed')
  }
  return data
}

export async function startPlayBillingPayment({ uid, billingCycle, onSuccess, onError, onClose }) {
  const itemId = ITEM_IDS[billingCycle]
  if (!itemId) {
    onError?.(new Error('Invalid billing cycle'))
    return
  }

  let request
  try {
    window.alert(`Attempting purchase for item: ${itemId}`)
    request = new PaymentRequest(
      [{ supportedMethods: PLAY_BILLING_METHOD, data: { sku: itemId } }],
      { total: { label: 'Total', amount: { currency: 'NGN', value: '0' } } }
    )
  } catch (err) {
    window.alert(`Construction failed: ${err?.name || 'Unknown'} — ${err?.message || 'no message'}`)
    onError?.(err)
    return
  }

  let paymentResponse
  try {
    paymentResponse = await request.show()
  } catch (err) {
    window.alert(`Show failed: ${err?.name || 'Unknown'} — ${err?.message || 'no message'}`)
    if (err?.name === 'AbortError') {
      onClose?.()
      return
    }
    onError?.(err)
    return
  }

  try {
    const purchaseToken = paymentResponse.details.purchaseToken
    await paymentResponse.complete('success')

    const data = await verifyPlayPurchase({ purchaseToken, uid, billingCycle })
    onSuccess?.({ billingCycle, ...data })
  } catch (err) {
    await paymentResponse.complete('fail').catch(() => {})
    onError?.(err)
  }
}
