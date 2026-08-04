import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { db } from '../firebase'
import {
  subscribeToReviews,
  addReview            as fsAddReview,
  approveReview         as fsApproveReview,
  rejectReview          as fsRejectReview,
  deleteReview          as fsDeleteReview,
  updateReview          as fsUpdateReview,
  getReviewContactPhone as fsGetReviewContactPhone,
} from '../services/reviewService'

const ReviewContext = createContext(null)

export function ReviewProvider({ children }) {
  const { user } = useAuth()

  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!user) {
      setReviews([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsub = subscribeToReviews(
      db,
      user.uid,
      (data) => { setReviews(data); setLoading(false) },
      (err)  => { setError(err.message); setLoading(false) }
    )

    return unsub
  }, [user])

  const pendingCount = reviews.filter(r => r.status === 'pending').length

  const addReview = useCallback(async (data) => {
    if (!user) return
    try {
      const { id: _localId, ...reviewData } = data
      return await fsAddReview(db, user.uid, reviewData)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [user])

  const approveReview = useCallback(async (id) => {
    if (!user) return
    try {
      await fsApproveReview(db, user.uid, String(id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [user])

  const rejectReview = useCallback(async (id) => {
    if (!user) return
    try {
      await fsRejectReview(db, user.uid, String(id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [user])

  const deleteReview = useCallback(async (id) => {
    if (!user) return
    try {
      await fsDeleteReview(db, user.uid, String(id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [user])

  const updateReview = useCallback(async (id, data) => {
    if (!user) return
    try {
      await fsUpdateReview(db, user.uid, String(id), data)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [user])

  const getContactPhone = useCallback(async (id) => {
    if (!user) return null
    try {
      return await fsGetReviewContactPhone(db, user.uid, String(id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [user])

  return (
    <ReviewContext.Provider value={{
      reviews,
      pendingCount,
      loading,
      error,
      addReview,
      approveReview,
      rejectReview,
      deleteReview,
      updateReview,
      getContactPhone,
    }}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReviews() {
  const ctx = useContext(ReviewContext)
  if (!ctx) throw new Error('useReviews must be used inside ReviewProvider')
  return ctx
}
