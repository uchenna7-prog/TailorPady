import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import {
  signup as signupService,
  login as loginService,
  logout,
  resetPassword,
  verifyResetCode,
  confirmReset,
  changePassword,
  changeEmail,
  setPassword,
  loginWithGoogle as loginWithGoogleService,
  getGoogleRedirectResult,
  linkGoogle,
  unlinkProvider,
} from '../services/authService'
import { ensureUserProfile, checkReferralActivation } from '../services/referralService'

const AuthContext = createContext(null)
const API_BASE = 'https://tailor-pady-api.vercel.app'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [deletionNotice, setDeletionNotice] = useState(false)
  const [reactivationNotice, setReactivationNotice] = useState(false)
  const [pendingReactivation, setPendingReactivation] = useState(null)
  const [reactivating, setReactivating] = useState(false)
  const profiledUidRef = useRef(null)
  const reactivatingRef = useRef(false)

  const ensureProfileOnce = useCallback((firebaseUser, hint) => {
    if (profiledUidRef.current === firebaseUser.uid) return
    profiledUidRef.current = firebaseUser.uid
    ensureUserProfile(firebaseUser, hint)
      .then(() => {
        checkReferralActivation(firebaseUser).catch(err => {
          console.warn('Referral activation check failed:', err)
        })
      })
      .catch(() => {
        profiledUidRef.current = null
      })
  }, [])

  const handleUser = useCallback(async (firebaseUser, hint) => {
    if (!firebaseUser) {
      setUser(null)
      return { pendingDeletion: false }
    }

    let pendingDeletion = false
    try {
      const tokenResult = await firebaseUser.getIdTokenResult()
      pendingDeletion = !!tokenResult.claims.pendingDeletion
    } catch {
      pendingDeletion = false
    }

    if (pendingDeletion) {
      setUser(null)
      setPendingReactivation({ firebaseUser, hint })
      return { pendingDeletion: true }
    }

    setUser(firebaseUser)
    ensureProfileOnce(firebaseUser, hint)
    return { pendingDeletion: false }
  }, [ensureProfileOnce])

  useEffect(() => {
    let authSettled = false
    let redirectSettled = false
    const trySettle = () => {
      if (authSettled && redirectSettled) {
        setLoading(false)
      }
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      handleUser(firebaseUser).finally(() => {
        authSettled = true
        trySettle()
      })
    })
    getGoogleRedirectResult()
      .then(({ user: redirectUser, isNewUser }) => {
        if (redirectUser) {
          return handleUser(redirectUser, { isNewUser })
        }
      })
      .catch(() => {})
      .finally(() => {
        redirectSettled = true
        trySettle()
      })
    return unsubscribe
  }, [handleUser])

  const login = useCallback(async (email, password) => {
    const credential = await loginService(email, password)
    const result = await handleUser(credential.user)
    return { credential, pendingDeletion: result.pendingDeletion }
  }, [handleUser])

  const signup = useCallback(async (email, password, displayName) => {
    const credential = await signupService(email, password, displayName)
    if (credential?.user) {
      await handleUser(credential.user, { isNewUser: true })
    }
    return credential
  }, [handleUser])

  const loginWithGoogle = useCallback(async () => {
    const { user: googleUser, isNewUser } = await loginWithGoogleService()
    let pendingDeletion = false
    if (googleUser) {
      const result = await handleUser(googleUser, { isNewUser })
      pendingDeletion = result.pendingDeletion
    }
    return { user: googleUser, isNewUser, pendingDeletion }
  }, [handleUser])

  const confirmReactivation = useCallback(async () => {
    if (!pendingReactivation || reactivatingRef.current) return
    reactivatingRef.current = true
    setReactivating(true)

    const { firebaseUser, hint } = pendingReactivation

    try {
      const idToken = await firebaseUser.getIdToken()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      let response
      try {
        response = await fetch(`${API_BASE}/api/delete-account`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ action: 'reactivate' }),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeoutId)
      }

      if (!response.ok) throw new Error('reactivate-request-failed')

      const refreshedResult = await firebaseUser.getIdTokenResult(true)
      if (refreshedResult.claims.pendingDeletion) throw new Error('still-pending-after-reactivate')

      setPendingReactivation(null)
      setReactivating(false)
      reactivatingRef.current = false
      setUser(firebaseUser)
      setReactivationNotice(true)
      ensureProfileOnce(firebaseUser, hint)
    } catch {
      setReactivating(false)
      reactivatingRef.current = false
      setPendingReactivation(null)
      try {
        await logout()
      } catch {}
      setUser(null)
      setDeletionNotice(true)
    }
  }, [pendingReactivation, ensureProfileOnce])

  const declineReactivation = useCallback(async () => {
    if (!pendingReactivation || reactivatingRef.current) return
    setPendingReactivation(null)
    try {
      await logout()
    } catch {}
    setUser(null)
  }, [pendingReactivation])

  const clearDeletionNotice = useCallback(() => setDeletionNotice(false), [])
  const clearReactivationNotice = useCallback(() => setReactivationNotice(false), [])

  const value = useMemo(() => ({
    user,
    loading,
    redirecting,
    setRedirecting,
    deletionNotice,
    clearDeletionNotice,
    reactivationNotice,
    clearReactivationNotice,
    pendingReactivation,
    reactivating,
    confirmReactivation,
    declineReactivation,
    login,
    loginWithGoogle,
    signup,
    logout,
    resetPassword,
    verifyResetCode,
    confirmReset,
    changePassword,
    changeEmail,
    setPassword,
    linkGoogle,
    unlinkProvider,
  }), [
    user, loading, redirecting, deletionNotice, clearDeletionNotice,
    reactivationNotice, clearReactivationNotice, pendingReactivation, reactivating,
    confirmReactivation, declineReactivation, signup, loginWithGoogle, login,
  ])

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
