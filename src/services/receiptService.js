import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'

const receiptsCollection = (uid) =>
  collection(db, 'users', uid, 'receipts')

const receiptDocument = (uid, receiptId) =>
  doc(db, 'users', uid, 'receipts', receiptId)

export async function addReceipt(uid, customerId, data) {
  const { id: _, ...receiptData } = data
  const now = new Date().toISOString()
  const ref = await addDoc(receiptsCollection(uid), {
    ...receiptData,
    customerId,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function updateReceipt(uid, receiptId, data) {
  await updateDoc(receiptDocument(uid, receiptId), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function updateReceiptStatus(uid, receiptId, status) {
  await updateDoc(receiptDocument(uid, receiptId), {
    status,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteReceipt(uid, receiptId) {
  await deleteDoc(receiptDocument(uid, receiptId))
}

export function subscribeToReceipts(uid, callback) {
  const q = query(
    receiptsCollection(uid),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export function subscribeToCustomerReceipts(uid, customerId, callback, onError) {
  const q = query(
    receiptsCollection(uid),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q,
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    (err) => {
      onError?.(err)
    }
  )
}