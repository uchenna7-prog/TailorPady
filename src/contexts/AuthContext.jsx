import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import {
  signup as signupService,
  login,
  logout,
  resetPassword,
  changePassword,
  changeEmail,
  loginWithGoogle as loginWithGoogleService,
  getGoogleRedirectResult,
  linkGoogle,
  unlinkProvider,
} from '../services/authService'
import { ensureUserProfile, checkReferralActivation } from '../services/referralService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const profiledUidRef = useRef(null)

  const handleUser = useCallback((firebaseUser, hint) => {
    setUser(firebaseUser)
    if (firebaseUser && profiledUidRef.current !== firebaseUser.uid) {
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
    }
  }, [])

  useEffect(() => {
    let authSettled = false
    let redirectSettled = false

    const trySettle = () => {
      if (authSettled && redirectSettled) {
        setLoading(false)
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      handleUser(firebaseUser)
      authSettled = true
      trySettle()
    })

    getGoogleRedirectResult()
      .then(({ user: redirectUser, isNewUser }) => {
        if (redirectUser) {
          handleUser(redirectUser, { isNewUser })
        }
      })
      .catch(() => {})
      .finally(() => {
        redirectSettled = true
        trySettle()
      })

    return unsubscribe
  }, [handleUser])

  const signup = useCallback(async (email, password, displayName) => {
    const credential = await signupService(email, password, displayName)
    if (credential?.user) {
      handleUser(credential.user, { isNewUser: true })
    }
    return credential
  }, [handleUser])

  const loginWithGoogle = useCallback(async () => {
    const { user: googleUser, isNewUser } = await loginWithGoogleService()
    if (googleUser) {
      handleUser(googleUser, { isNewUser })
    }
    return googleUser
  }, [handleUser])

  const value = useMemo(() => ({
    user,
    loading,
    redirecting,
    setRedirecting,
    login,
    loginWithGoogle,
    signup,
    logout,
    resetPassword,
    changePassword,
    changeEmail,
    linkGoogle,
    unlinkProvider,
  }), [user, loading, redirecting, signup, loginWithGoogle])

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
