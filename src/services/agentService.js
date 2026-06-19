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
} from 'firebase/firestore'
import { db } from '../firebase'

const messagesCol = (uid) =>
  collection(db, 'users', uid, 'agentMessages')

const draftsCol = (uid) =>
  collection(db, 'users', uid, 'agentDrafts')

export async function saveAgentMessage(uid, message) {
  await addDoc(messagesCol(uid), {
    ...message,
    createdAt: serverTimestamp(),
  })
}

export async function loadAgentMessages(uid, count = 80) {
  try {
    const q = query(messagesCol(uid), orderBy('createdAt', 'desc'), limit(count))
    const snap = await getDocs(q)
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .reverse()
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
    const q = query(draftsCol(uid), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('[agentService] loadAgentDrafts failed:', err)
    return []
  }
}

export async function createAgentDraftIfMissing(uid, draftId, draftData) {
  const ref = doc(db, 'users', uid, 'agentDrafts', draftId)
  const existing = await getDoc(ref)
  if (existing.exists()) return false
  await setDoc(ref, {
    ...draftData,
    createdAt: serverTimestamp(),
  })
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