import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import {
  signup,
  login,
  logout,
  resetPassword,
  changePassword,
  changeEmail,
  loginWithGoogle,
  getGoogleRedirectResult,
  linkGoogle,
  unlinkProvider,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    let settled = false

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (!settled) {
        settled = true
        setLoading(false)
      }
    })

    getGoogleRedirectResult()
      .then(result => {
        if (result?.user) {
          setUser(result.user)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!settled) {
          settled = true
          setLoading(false)
        }
      })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{
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
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}