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

async function attemptReactivation(firebaseUser) {
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

    if (!response.ok) return false

    const refreshedResult = await firebaseUser.getIdTokenResult(true)
    return !refreshedResult.claims.pendingDeletion
  } catch {
    return false
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [deletionNotice, setDeletionNotice] = useState(false)
  const [reactivationNotice, setReactivationNotice] = useState(false)
  const profiledUidRef = useRef(null)

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
      return { pendingDeletion: false, reactivated: false }
    }

    let pendingDeletion = false
    try {
      const tokenResult = await firebaseUser.getIdTokenResult()
      pendingDeletion = !!tokenResult.claims.pendingDeletion
    } catch {
      pendingDeletion = false
    }

    if (pendingDeletion) {
      const reactivated = await attemptReactivation(firebaseUser)

      if (!reactivated) {
        try {
          await logout()
        } catch {}
        setUser(null)
        setDeletionNotice(true)
        return { pendingDeletion: true, reactivated: false }
      }

      setUser(firebaseUser)
      setReactivationNotice(true)
      ensureProfileOnce(firebaseUser, hint)
      return { pendingDeletion: false, reactivated: true }
    }

    setUser(firebaseUser)
    ensureProfileOnce(firebaseUser, hint)
    return { pendingDeletion: false, reactivated: false }
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
    return { credential, pendingDeletion: result.pendingDeletion, reactivated: result.reactivated }
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
    let reactivated = false
    if (googleUser) {
      const result = await handleUser(googleUser, { isNewUser })
      pendingDeletion = result.pendingDeletion
      reactivated = result.reactivated
    }
    return { user: googleUser, isNewUser, pendingDeletion, reactivated }
  }, [handleUser])

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
  }), [user, loading, redirecting, deletionNotice, clearDeletionNotice, reactivationNotice, clearReactivationNotice, signup, loginWithGoogle, login])

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
