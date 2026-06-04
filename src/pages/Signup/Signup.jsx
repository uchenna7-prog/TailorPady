import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import logoLightMode from '../../assets/logoLightMode.png'
import logoDarkMode from '../../assets/logoDarkMode.png'
import styles from './Signup.module.css'

const STRENGTH_LEVELS = [
  { label: 'Too short', color: '#ef4444', min: 0 },
  { label: 'Weak',      color: '#f97316', min: 1 },
  { label: 'Fair',      color: '#eab308', min: 2 },
  { label: 'Good',      color: '#22c55e', min: 3 },
  { label: 'Strong',    color: '#16a34a', min: 4 },
]

function getStrength(password) {
  if (password.length === 0) return -1
  let score = 0
  if (password.length >= 8)          score++
  if (/[A-Z]/.test(password))        score++
  if (/[0-9]/.test(password))        score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (password.length < 8)           return 0
  return score
}

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':   return 'This email is already registered. Try logging in.'
    case 'auth/invalid-email':          return 'Enter a valid email address.'
    case 'auth/weak-password':          return 'Password must be at least 6 characters.'
    case 'auth/network-request-failed': return 'Network error. Check your connection.'
    default:                            return 'Something went wrong. Please try again.'
  }
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export default function Signup() {
  const { signup, loginWithGoogle, setRedirecting } = useAuth()
  const { generalSettings }                         = useGeneralSettings()
  const navigate                                    = useNavigate()

  const [fullName,      setFullName]      = useState('')
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPass,      setShowPass]      = useState(false)
  const [touched,       setTouched]       = useState({})
  const [error,         setError]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const strengthScore = getStrength(password)
  const strengthLevel = strengthScore >= 0 ? STRENGTH_LEVELS[strengthScore] : null

  const nameError     = touched.fullName && fullName.trim().length === 0
  const emailError    = touched.email    && email.trim().length === 0
  const passwordError = touched.password && password.length < 8

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ fullName: true, email: true, password: true })
    setError('')

    if (!fullName.trim())    return
    if (!email.trim())       return
    if (password.length < 8) return

    setLoading(true)
    try {
      await signup(email.trim(), password, fullName.trim())
      navigate('/', { replace: true })
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    setError('')
    setGoogleLoading(true)
    setRedirecting(true)
    loginWithGoogle().catch(err => {
      setError(friendlyError(err.code))
      setGoogleLoading(false)
      setRedirecting(false)
    })
  }

  const isLoading = loading || googleLoading

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.logo}>
          <img
            src={generalSettings.theme === 'light' ? logoLightMode : logoDarkMode}
            alt="TailorPady"
            className={styles.logoIcon}
          />
          <div className={styles.logoText}>
            <span className={styles.logoName}>TailorPady</span>
            <span className={styles.logoTagline}>The operating system for tailors</span>
          </div>
        </div>

        <div className={styles.divider} />

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.sub}>Get started in seconds</p>

        {error && (
          <div className={styles.errorBanner}>
            <span className="mi" style={{ fontSize: '1rem' }}>error</span>
            {error}
          </div>
        )}

        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogle}
          disabled={isLoading}
        >
          <GoogleIcon />
          {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
        </button>

        <div className={styles.orRow}>
          <div className={styles.orLine} />
          <span className={styles.orText}>or</span>
          <div className={styles.orLine} />
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrap}>
              <span className="mi" style={{ position: 'absolute', left: 12, color: nameError ? '#ef4444' : 'var(--text3)', fontSize: '1.1rem' }}>person</span>
              <input
                className={`${styles.input} ${nameError ? styles.inputError : ''}`}
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Your full name"
                autoComplete="name"
                disabled={isLoading}
              />
            </div>
            {nameError && <span className={styles.fieldError}>Full name is required</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <span className="mi" style={{ position: 'absolute', left: 12, color: emailError ? '#ef4444' : 'var(--text3)', fontSize: '1.1rem' }}>mail</span>
              <input
                className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@email.com"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            {emailError && <span className={styles.fieldError}>Email is required</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <span className="mi" style={{ position: 'absolute', left: 12, color: passwordError ? '#ef4444' : 'var(--text3)', fontSize: '1.1rem' }}>lock</span>
              <input
                className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(p => !p)}
              >
                <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--text3)' }}>
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {passwordError && <span className={styles.fieldError}>Password must be at least 8 characters</span>}
            {password.length > 0 && strengthLevel && (
              <div className={styles.strengthRow}>
                <div className={styles.strengthBars}>
                  {STRENGTH_LEVELS.slice(1).map((_, i) => (
                    <div
                      key={i}
                      className={styles.strengthBar}
                      style={{ background: i < strengthScore ? strengthLevel.color : 'var(--border)' }}
                    />
                  ))}
                </div>
                <span className={styles.strengthLabel} style={{ color: strengthLevel.color }}>
                  {strengthLevel.label}
                </span>
              </div>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.tos}>
          By signing up you agree to our{' '}
          <Link to="/terms" className={styles.tosLink}>Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className={styles.tosLink}>Privacy Policy</Link>
        </p>

        <p className={styles.switchPrompt}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>Log in</Link>
        </p>

      </div>
    </div>
  )
}