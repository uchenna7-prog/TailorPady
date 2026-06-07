import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase'


function photosRef(uid) {
  return collection(db, 'users', uid, 'galleryPhotos')
}

function photoDoc(uid, photoId) {
  return doc(db, 'users', uid, 'galleryPhotos', photoId)
}

function GarmentTypesDoc(uid, tabId) {
  return doc(db, 'users', uid, 'galleryGarmentTypes', tabId)
}


const DEFAULT_DRESS_TYPES = {
  completed_works: [{ id: 'garmenttype1', label: 'GarmentType1' }, { id: 'garmenttype2', label: 'GarmentType2' }],
  designs:         [{ id: 'garmenttype1', label: 'GarmentType1' }, { id: 'garmenttype2', label: 'GarmentType2' }],
  inspiration:     [{ id: 'garmenttype1', label: 'GarmentType1' }, { id: 'garmenttype2', label: 'GarmentType2' }],
}


export async function addPhoto(uid, data) {
  const ref = await addDoc(photosRef(uid), {
    ...data,
    storageUrl: data.storageUrl ?? null,
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),
  })
  return ref.id
}

export async function updatePhoto(uid, photoId, data) {
  await updateDoc(photoDoc(uid, photoId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deletePhoto(uid, photoId) {
  await deleteDoc(photoDoc(uid, photoId))
}

export function subscribeToPhotos(uid, callback, onError) {
  const q = query(photosRef(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    snap => {
      const photos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      callback(photos)
    },
    err => onError?.(err)
  )
}

export function subscribeToPhotosByCategory(uid, category, callback, onError) {
  const q = query(
    photosRef(uid),
    where('category', '==', category),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(
    q,
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err  => onError?.(err)
  )
}


export async function getGarmentTypes(uid, tabId) {
  const snap = await getDoc(GarmentTypesDoc(uid, tabId))
  if (!snap.exists()) return DEFAULT_DRESS_TYPES[tabId] ?? []
  return snap.data().types ?? []
}

export async function saveGarmentTypes(uid, tabId, types) {
  await setDoc(GarmentTypesDoc(uid, tabId), {
    tabId,
    types,
    updatedAt: serverTimestamp(),
  })
}

export function subscribeToGarmentTypes(uid, callback, onError) {
  const TAB_IDS = ['completed_works', 'designs', 'inspiration']
  const current = {
    completed_works: DEFAULT_DRESS_TYPES.completed_works,
    designs:         DEFAULT_DRESS_TYPES.designs,
    inspiration:     DEFAULT_DRESS_TYPES.inspiration,
  }

  const unsubs = TAB_IDS.map(tabId =>
    onSnapshot(
      GarmentTypesDoc(uid, tabId),
      snap => {
        current[tabId] = snap.exists()
          ? (snap.data().types ?? [])
          : (DEFAULT_DRESS_TYPES[tabId] ?? [])
        callback({ ...current })
      },
      err => onError?.(err)
    )
  )

  return () => unsubs.forEach(u => u())
}