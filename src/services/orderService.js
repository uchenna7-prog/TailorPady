import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  runTransaction,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const ordersCollection = (uid) =>
  collection(db, 'users', uid, 'orders')

const orderDocument = (uid, orderId) =>
  doc(db, 'users', uid, 'orders', orderId)

const countersDocument = (uid) =>
  doc(db, 'users', uid, 'meta', 'counters')

async function getNextOrderNumber(uid) {
  const ref = countersDocument(uid)
  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref)
    const current = snap.exists() ? (snap.data().orderNumber || 0) : 0
    const next = current + 1
    transaction.set(ref, { orderNumber: next }, { merge: true })
    return next
  })
}

export async function addOrder(uid, customerId, data) {
  const stage = data.stage ?? null
  const orderNumber = await getNextOrderNumber(uid)
  const ref = await addDoc(ordersCollection(uid), {
    ...data,
    customerId,
    orderNumber,
    status: data.status ?? 'pending',
    stage,
    stageHistory: stage ? { [stage]: serverTimestamp() } : {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getOrder(uid, orderId) {
  const snap = await getDoc(orderDocument(uid, orderId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function updateOrder(uid, orderId, data) {
  await updateDoc(orderDocument(uid, orderId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function updateOrderStatus(uid, orderId, status) {
  await updateDoc(orderDocument(uid, orderId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function updateOrderStage(uid, orderId, stage) {
  await updateDoc(orderDocument(uid, orderId), {
    stage,
    [`stageHistory.${stage}`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function deleteOrder(uid, orderId) {
  await deleteDoc(orderDocument(uid, orderId))
}

export function subscribeToOrders(uid, callback) {
  const q = query(
    ordersCollection(uid),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export function subscribeToCustomerOrders(uid, customerId, callback) {
  const q = query(
    ordersCollection(uid),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}