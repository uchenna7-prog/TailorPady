import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const messagesCol  = uid => collection(db, 'users', uid, 'agentMessages')
const draftsCol    = uid => collection(db, 'users', uid, 'agentDrafts')
const scheduledCol = uid => collection(db, 'users', uid, 'agentScheduled')

export async function saveAgentMessage(uid, message) {
  await addDoc(messagesCol(uid), { ...message, createdAt: serverTimestamp() })
}

export async function loadAgentMessages(uid, count = 80) {
  try {
    const q    = query(messagesCol(uid), orderBy('createdAt', 'desc'), limit(count))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse()
  } catch (err) {
    console.error('[agentService] loadAgentMessages failed:', err)
    return []
  }
}

export async function clearAgentMessages(uid) {
  const snap = await getDocs(messagesCol(uid))
  await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'users', uid, 'agentMessages', d.id))))
}

export async function loadAgentDrafts(uid) {
  try {
    const q    = query(draftsCol(uid), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('[agentService] loadAgentDrafts failed:', err)
    return []
  }
}

export async function createAgentDraft(uid, draftId, draftData) {
  const ref      = doc(db, 'users', uid, 'agentDrafts', draftId)
  const existing = await getDoc(ref)
  if (existing.exists()) return false
  await setDoc(ref, { ...draftData, createdAt: serverTimestamp() })
  return true
}

export async function updateAgentDraftStatus(uid, draftId, status) {
  const ref = doc(db, 'users', uid, 'agentDrafts', draftId)
  await setDoc(ref, { status }, { merge: true })
}

export async function clearAgentDrafts(uid) {
  const snap = await getDocs(draftsCol(uid))
  await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'users', uid, 'agentDrafts', d.id))))
}

export async function loadScheduledItems(uid) {
  try {
    const q    = query(scheduledCol(uid), orderBy('fireAt', 'asc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('[agentService] loadScheduledItems failed:', err)
    return []
  }
}

export async function upsertScheduledItem(uid, itemId, data) {
  const ref = doc(db, 'users', uid, 'agentScheduled', itemId)
  await setDoc(ref, data, { merge: true })
}

export async function removeScheduledItem(uid, itemId) {
  const ref = doc(db, 'users', uid, 'agentScheduled', itemId)
  await deleteDoc(ref)
}

export async function clearScheduledItems(uid) {
  const snap = await getDocs(scheduledCol(uid))
  await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'users', uid, 'agentScheduled', d.id))))
}