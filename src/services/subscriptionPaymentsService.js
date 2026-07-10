import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export function subscribeToSubscriptionPayments(uid, callback) {
  const q = query(
    collection(db, 'users', uid, 'subscriptionPayments'),
    orderBy('paidAt', 'desc')
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}