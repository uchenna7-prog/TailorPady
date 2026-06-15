import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'

export function toSlug(raw = '') {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

function slugDocRef(db, slug) {
  return doc(db, 'slugs', slug)
}

function brandDocRef(db, uid) {
  return doc(db, 'users', uid, 'publicProfile', 'brand')
}

export async function isSlugAvailable(db, slug, ownerUid) {
  if (!slug || slug.length < 3) return false
  const snap = await getDoc(slugDocRef(db, slug))
  if (!snap.exists()) return true
  return snap.data().uid === ownerUid
}

export async function claimSlug(db, uid, newSlug, oldSlug) {
  if (!uid || !newSlug) throw new Error('uid and newSlug are required')

  const available = await isSlugAvailable(db, newSlug, uid)
  if (!available) throw new Error('slug_taken')

  if (oldSlug && oldSlug !== newSlug) {
    const oldSnap = await getDoc(slugDocRef(db, oldSlug))
    if (oldSnap.exists() && oldSnap.data().uid === uid) {
      await deleteDoc(slugDocRef(db, oldSlug))
    }
  }

  await setDoc(slugDocRef(db, newSlug), { uid, createdAt: serverTimestamp() })

  await setDoc(brandDocRef(db, uid), { portfolioSlug: newSlug }, { merge: true })
}

export async function resolveSlug(db, slug) {
  if (!slug) return null
  const snap = await getDoc(slugDocRef(db, slug))
  return snap.exists() ? snap.data().uid : null
}

export async function getCurrentSlug(db, uid) {
  if (!uid) return null
  const snap = await getDoc(brandDocRef(db, uid))
  if (!snap.exists()) return null
  return snap.data().portfolioSlug || null
}