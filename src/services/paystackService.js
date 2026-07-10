const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js'
const API_BASE = 'https://tailorpadyapi.vercel.app'

const AMOUNTS = {
  monthly: 120000,
  annual: 999900,
}

const PLAN_CODES = {
  monthly: import.meta.env.VITE_PAYSTACK_PLAN_MONTHLY,
  annual: import.meta.env.VITE_PAYSTACK_PLAN_ANNUAL,
}

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = PAYSTACK_SCRIPT_URL
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
}

async function verifyPayment({ reference, uid, billingCycle }) {
  const response = await fetch(`${API_BASE}/api/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference, uid, billingCycle }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Payment verification failed')
  }
  return data
}

export async function startPaystackPayment({ email, uid, billingCycle, onSuccess, onError, onClose }) {
  try {
    await loadPaystackScript()
  } catch {
    onError?.(new Error('Could not load Paystack'))
    return
  }

  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email,
    amount: AMOUNTS[billingCycle],
    plan: PLAN_CODES[billingCycle],
    currency: 'NGN',
    metadata: { uid, billingCycle },
    callback: (response) => {
      verifyPayment({ reference: response.reference, uid, billingCycle })
        .then(onSuccess)
        .catch(onError)
    },
    onClose,
  })

  handler.openIframe()
}