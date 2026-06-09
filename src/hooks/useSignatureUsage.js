import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const MONTHLY_LIMIT = 5

function getCurrentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function useSignatureUsage(userId) {
  const [cachedUrl,      setCachedUrl]      = useState(null)
  const [attemptsUsed,   setAttemptsUsed]   = useState(0)
  const [loading,        setLoading]        = useState(true)

  const attemptsLeft = MONTHLY_LIMIT - attemptsUsed

  useEffect(() => {
    if (!userId) return
    loadUsageData()
  }, [userId])

  async function loadUsageData() {
    setLoading(true)
    const userRef  = doc(db, 'users', userId)
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
      setLoading(false)
      return
    }

    const data       = snapshot.data()
    const monthKey   = getCurrentMonthKey()

    if (data.signatureUrl) {
      setCachedUrl(data.signatureUrl)
    }

    const usage = data.signatureUsage
    if (!usage || usage.monthKey !== monthKey) {
      setAttemptsUsed(0)
    } else {
      setAttemptsUsed(usage.attemptsUsed || 0)
    }

    setLoading(false)
  }

  async function incrementAttempts() {
    const userRef  = doc(db, 'users', userId)
    const monthKey = getCurrentMonthKey()
    const newCount = attemptsUsed + 1

    await updateDoc(userRef, {
      signatureUsage: {
        monthKey,
        attemptsUsed: newCount,
        limit: MONTHLY_LIMIT,
      },
    })

    setAttemptsUsed(newCount)
  }

  async function saveSignatureUrl(url) {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { signatureUrl: url })
    setCachedUrl(url)
  }

  async function clearSignatureCache() {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { signatureUrl: null })
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