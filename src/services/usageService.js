import { doc, onSnapshot, setDoc, increment } from 'firebase/firestore'

export const USAGE_LIMITS = {
  customers: 8,
  measurementsPerMonth: 8,
  ordersPerMonth: 10,
  invoicesPerMonth: 5,
  receiptsPerMonth: 5,
  portfolioUploadsPerMonth: 5,
  reviewLinksPerMonth: 8,
  aiActionsPerMonth: 3,
}

function getCurrentMonthKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${month}`
}

function getUsageRef(db, uid) {
  return doc(db, 'users', uid, 'usage', getCurrentMonthKey())
}

export function subscribeToUsage(db, uid, callback) {
  return onSnapshot(getUsageRef(db, uid), snap => {
    callback(snap.exists() ? snap.data() : {})
  })
}

export async function incrementUsage(db, uid, field) {
  await setDoc(getUsageRef(db, uid), { [field]: increment(1) }, { merge: true })
}
