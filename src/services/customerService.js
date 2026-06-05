import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

function customersRef(uid) {
  return collection(db, 'users', uid, 'customers')
}

function customerDoc(uid, customerId) {
  return doc(db, 'users', uid, 'customers', customerId)
}

export async function addCustomer(uid, data) {
  const ref = await addDoc(customersRef(uid), {
    ...data,
    photo: data.photo ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getCustomer(uid, customerId) {
  const snap = await getDoc(customerDoc(uid, customerId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function getAllCustomers(uid) {
  const q = query(customersRef(uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateCustomer(uid, customerId, data) {
  await updateDoc(customerDoc(uid, customerId), {
    ...data,
    photo: data.photo ?? null,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCustomer(uid, customerId) {
  await deleteDoc(customerDoc(uid, customerId))
}

export async function deleteCustomerAndAllData(uid, customerId) {
  
  const batch = writeBatch(db)

  const topLevelCollections = ['orders', 'invoices', 'payments', 'receipts']

  for (const col of topLevelCollections) {
    const q = query(
      collection(db, 'users', uid, col),
      where('customerId', '==', customerId)
    )
    const snap = await getDocs(q)
    snap.docs.forEach(d => batch.delete(d.ref))
  }

  const measurementsSnap = await getDocs(
    collection(db, 'users', uid, 'customers', customerId, 'measurements')
  )
  measurementsSnap.docs.forEach(d => batch.delete(d.ref))

  batch.delete(customerDoc(uid, customerId))

  await batch.commit()
}

export function subscribeToCustomers(uid, onSetCustomers, onSetError) {
  const q = query(customersRef(uid))
  return onSnapshot(
    q,
    (snap) => {
      const customers = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
      onSetCustomers(customers)
    },
    (err) => onSetError?.(err)
  )
}