import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const goalDocument = (uid) =>
  doc(db, 'users', uid, 'revenueGoal', 'current')

export async function fetchRevenueGoal(uid) {
  const snap = await getDoc(goalDocument(uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function saveRevenueGoal(uid, data) {
  await setDoc(goalDocument(uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteRevenueGoal(uid) {
  await deleteDoc(goalDocument(uid))
}