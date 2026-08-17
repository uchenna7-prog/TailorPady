import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

const REFERRAL_STASH_KEY = 'TailorPady_referral_code'
const API_BASE = 'https://tailor-pady-api.vercel.app'

export function stashReferralCode(code) {
  if (!code) return
  try {
    localStorage.setItem(REFERRAL_STASH_KEY, code.trim().toUpperCase())
  } catch {}
}

export function readStashedReferralCode() {
  try {
    return localStorage.getItem(REFERRAL_STASH_KEY)
  } catch {
    return null
  }
}

export function clearStashedReferralCode() {
  try {
    localStorage.removeItem(REFERRAL_STASH_KEY)
  } catch {}
}

export async function ensureUserProfile(user, hint = {}) {
  if (!hint.isNewUser) {
    const existingSnap = await getDoc(doc(db, 'users', user.uid))
    if (existingSnap.exists()) {
      return { created: false, ...existingSnap.data() }
    }
  }

  const idToken = await user.getIdToken()
  const referredByCode = readStashedReferralCode()

  const response = await fetch(`${API_BASE}/api/create-user-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ referredByCode }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Could not set up profile')
  }

  clearStashedReferralCode()
  return data
}

export async function checkReferralActivation(user) {
  const idToken = await user.getIdToken()

  const response = await fetch(`${API_BASE}/api/activate-referral`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({}),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Could not check referral activation')
  }
  return data
}

export async function acknowledgeReferral(user, referralId) {
  const idToken = await user.getIdToken()

  const response = await fetch(`${API_BASE}/api/acknowledge-referral`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ referralId }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Could not acknowledge referral')
  }
  return data
}
