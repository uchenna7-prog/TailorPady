import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore'
import { db } from '../firebase'

const MONTHLY_LIMIT = 5

function getCurrentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function useSignatureUsage(userId) {
  const [cachedUrl,    setCachedUrl]    = useState(null)
  const [attemptsUsed, setAttemptsUsed] = useState(0)
  const [loading,      setLoading]      = useState(true)

  const attemptsLeft = MONTHLY_LIMIT - attemptsUsed

  useEffect(() => {
    if (!userId) return
    loadUsageData()
  }, [userId])

  async function loadUsageData() {
    setLoading(true)
    const userRef  = doc(db, 'users', userId)
    const snapshot = await getDoc(userRef)
    const monthKey = getCurrentMonthKey()

    if (!snapshot.exists()) {
      await setDoc(userRef, {
        signatureUsage: { monthKey, attemptsUsed: 0, limit: MONTHLY_LIMIT },
      }, { merge: true })
      setAttemptsUsed(0)
      setLoading(false)
      return
    }

    const data = snapshot.data()

    if (data.signatureUrl) {
      setCachedUrl(data.signatureUrl)
    }

    const usage = data.signatureUsage

    if (!usage || usage.monthKey !== monthKey) {
      await updateDoc(userRef, {
        signatureUsage: { monthKey, attemptsUsed: 0, limit: MONTHLY_LIMIT },
      })
      setAttemptsUsed(0)
    } else {
      setAttemptsUsed(usage.attemptsUsed || 0)
    }

    setLoading(false)
  }

  async function incrementAttempts() {
    const userRef  = doc(db, 'users', userId)
    const monthKey = getCurrentMonthKey()

    await updateDoc(userRef, {
      'signatureUsage.monthKey': monthKey,
      'signatureUsage.limit': MONTHLY_LIMIT,
      'signatureUsage.attemptsUsed': increment(1),
    })

    setAttemptsUsed(prev => prev + 1)
  }

  async function saveSignatureUrl(url) {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, { signatureUrl: url }, { merge: true })
    setCachedUrl(url)
  }

  async function clearSignatureCache() {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, { signatureUrl: null }, { merge: true })
    setCachedUrl(null)
  }

  return {
    cachedUrl,
    attemptsLeft,
    attemptsUsed,
    loading,
    canAttempt: attemptsLeft > 0,
    incrementAttempts,
    saveSignatureUrl,
    clearSignatureCache,
  }
}