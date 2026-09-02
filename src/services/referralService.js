import { doc, getDoc, collection, query, where, orderBy, limit, startAfter, getDocs, getDocsFromCache, getCountFromServer } from 'firebase/firestore'
import { db } from '../firebase'

const REFERRAL_STASH_KEY = 'TailorPady_referral_code'
const REFERRAL_COUNTS_CACHE_PREFIX = 'TailorPady_referral_counts_'
const API_BASE = 'https://tailor-pady-api.vercel.app'
const HISTORY_PAGE_SIZE = 20
const CACHE_PREVIEW_SIZE = 20
const REFERRALS_PER_REWARD = 5
const MAX_REWARDS_PER_REFERRER = 3

let hasCheckedThisSession = false

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

export async function triggerReferralActivationCheck(user) {
  if (!user || hasCheckedThisSession) return
  hasCheckedThisSession = true
  try {
    await checkReferralActivation(user)
  } catch (err) {
    hasCheckedThisSession = false
  }
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

function buildHistoryBaseQuery(user) {
  return query(
    collection(db, 'referrals'),
    where('referrerUid', '==', user.uid),
    orderBy('createdAt', 'desc'),
    limit(HISTORY_PAGE_SIZE),
  )
}

export async function getReferralHistoryFromCache(user) {
  if (!user) return { referrals: [], nextCursor: null, hasMore: false }

  try {
    const cacheQuery = query(
      collection(db, 'referrals'),
      where('referrerUid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(CACHE_PREVIEW_SIZE),
    )
    const snap = await getDocsFromCache(cacheQuery)
    const referrals = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return { referrals, nextCursor: null, hasMore: false }
  } catch {
    return { referrals: [], nextCursor: null, hasMore: false }
  }
}

export async function getReferralHistory(user, cursor = null) {
  if (!user) return { referrals: [], nextCursor: null, hasMore: false }

  const base = buildHistoryBaseQuery(user)
  const q = cursor ? query(base, startAfter(cursor)) : base
  const snap = await getDocs(q)

  const referrals = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  const hasMore = snap.docs.length === HISTORY_PAGE_SIZE

  return {
    referrals,
    nextCursor: hasMore ? snap.docs[snap.docs.length - 1] : null,
    hasMore,
  }
}

export async function getReferralCounts(user) {
  if (!user) return { total: 0, activated: 0, rewarded: 0, progressToNextReward: 0, rewardsRemaining: MAX_REWARDS_PER_REFERRER }

  const referralsRef = collection(db, 'referrals')
  const totalQuery = query(referralsRef, where('referrerUid', '==', user.uid))
  const activatedQuery = query(referralsRef, where('referrerUid', '==', user.uid), where('status', '==', 'activated'))
  const rewardedQuery = query(referralsRef, where('referrerUid', '==', user.uid), where('rewardGranted', '==', true))

  const [totalSnap, activatedSnap, rewardedSnap] = await Promise.all([
    getCountFromServer(totalQuery),
    getCountFromServer(activatedQuery),
    getCountFromServer(rewardedQuery),
  ])

  const total = totalSnap.data().count
  const activated = activatedSnap.data().count
  const rewarded = rewardedSnap.data().count
  const rewardsRemaining = Math.max(0, MAX_REWARDS_PER_REFERRER - rewarded)
  const progressToNextReward = rewardsRemaining > 0 ? activated % REFERRALS_PER_REWARD : 0

  const counts = { total, activated, rewarded, progressToNextReward, rewardsRemaining }
  cacheReferralCounts(user.uid, counts)
  return counts
}

function cacheReferralCounts(uid, counts) {
  try {
    localStorage.setItem(REFERRAL_COUNTS_CACHE_PREFIX + uid, JSON.stringify(counts))
  } catch {}
}

export function getCachedReferralCounts(user) {
  if (!user) return null
  try {
    const raw = localStorage.getItem(REFERRAL_COUNTS_CACHE_PREFIX + user.uid)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}