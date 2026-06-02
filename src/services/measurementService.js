import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

function measurementsRef(uid, customerId) {
  return collection(db, 'users', uid, 'customers', customerId, 'measurements')
}

function measurementDoc(uid, customerId, measurementId) {
  return doc(db, 'users', uid, 'customers', customerId, 'measurements', measurementId)
}

export async function addMeasurement(uid, customerId, data) {
  const ref = await addDoc(measurementsRef(uid, customerId), {
    ...data,
    imgSrcs:   data.imgSrcs      ?? [],
    imgSrc:    data.imgSrcs?.[0] ?? data.imgSrc ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateMeasurement(uid, customerId, measurementId, data) {
  await updateDoc(measurementDoc(uid, customerId, measurementId), {
    ...data,
    imgSrcs:   data.imgSrcs      ?? [],
    imgSrc:    data.imgSrcs?.[0] ?? data.imgSrc ?? null,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteMeasurement(uid, customerId, measurementId) {
  await deleteDoc(measurementDoc(uid, customerId, measurementId))
}

export function subscribeToMeasurements(uid, customerId, callback, onError) {
  const q = query(measurementsRef(uid, customerId), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err  => { onError?.(err) }
  )
}