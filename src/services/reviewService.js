import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocFromServer,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocsFromServer,
} from 'firebase/firestore'

function reviewsRef(db, uid) {
  return collection(db, 'users', uid, 'reviews')
}

function reviewDoc(db, uid, reviewId) {
  return doc(db, 'users', uid, 'reviews', reviewId)
}

function reviewContactDoc(db, uid, reviewId) {
  return doc(db, 'users', uid, 'reviewContacts', reviewId)
}

function reviewOrderDoc(db, uid, token) {
  return doc(db, 'users', uid, 'reviewOrders', token)
}

export async function addReview(db, uid, data) {
  const { customerPhone, ...reviewData } = data
  const ref = await addDoc(reviewsRef(db, uid), {
    ...reviewData,
    status:     'pending',
    approvedAt: null,
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),
  })
  if (customerPhone) {
    await setDoc(reviewContactDoc(db, uid, ref.id), {
      customerPhone,
      updatedAt: serverTimestamp(),
    })
  }
  return ref.id
}

export async function submitPublicReview(db, uid, token, data) {
  await setDoc(reviewDoc(db, uid, token), {
    ...data,
    token,
    status:     'pending',
    approvedAt: null,
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),
  })
  return token
}

export async function getReviewByToken(db, uid, token) {
  const snap = await getDoc(reviewDoc(db, uid, token))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateReview(db, uid, reviewId, data) {
  const { customerPhone, ...reviewData } = data
  await updateDoc(reviewDoc(db, uid, reviewId), {
    ...reviewData,
    updatedAt: serverTimestamp(),
  })
  if (customerPhone !== undefined) {
    await setDoc(reviewContactDoc(db, uid, reviewId), {
      customerPhone,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }
}

export async function approveReview(db, uid, reviewId) {
  await updateDoc(reviewDoc(db, uid, reviewId), {
    status:     'approved',
    approvedAt: serverTimestamp(),
    updatedAt:  serverTimestamp(),
  })
}

export async function rejectReview(db, uid, reviewId) {
  await updateDoc(reviewDoc(db, uid, reviewId), {
    status:     'rejected',
    approvedAt: null,
    updatedAt:  serverTimestamp(),
  })
}

export async function deleteReview(db, uid, reviewId) {
  await deleteDoc(reviewDoc(db, uid, reviewId))
  await deleteDoc(reviewContactDoc(db, uid, reviewId))
}

export async function getReviewContactPhone(db, uid, reviewId) {
  const snap = await getDoc(reviewContactDoc(db, uid, reviewId))
  return snap.exists() ? snap.data().customerPhone ?? null : null
}

export function subscribeToReviews(db, uid, callback, onError) {
  const q = query(reviewsRef(db, uid))

  return onSnapshot(
    q,
    (snap) => {
      const reviews = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0
          const bTime = b.createdAt?.toMillis?.() ?? 0
          return bTime - aTime
        })
      callback(reviews)
    },
    (err) => {
      onError?.(err)
    }
  )
}

export async function getApprovedReviews(db, uid) {
  const q = query(
    reviewsRef(db, uid),
    where('status', '==', 'approved'),
    orderBy('approvedAt', 'desc')
  )
  const snap = await getDocsFromServer(q)
  return snap.docs.map(d => {
    const { customerId, ...safe } = d.data()
    return { id: d.id, ...safe }
  })
}

export async function saveReviewOrderSnapshot(db, uid, token, data) {
  await setDoc(reviewOrderDoc(db, uid, token), {
    items:     data.items ?? [],
    orderDesc: data.orderDesc ?? '',
    updatedAt: serverTimestamp(),
  })
}

export async function getReviewOrderSnapshot(db, uid, token) {
  const snap = await getDocFromServer(reviewOrderDoc(db, uid, token))
  return snap.exists() ? snap.data() : null
}
