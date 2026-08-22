import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import logoLightMode from '../../assets/logoLightMode.png'
import logoDarkMode from '../../assets/logoDarkMode.png'
import styles from './ForgotPassword.module.css'

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':         return 'No account found with that email.'
    case 'auth/invalid-email':          return 'Enter a valid email address.'
    case 'auth/too-many-requests':      return 'Too many attempts. Please try again later.'
    case 'auth/network-request-failed': return 'Network error. Check your connection.'
    default:                            return 'Something went wrong. Please try again.'
  }
}

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const { generalSettings } = useGeneralSettings()

  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const theme   = generalSettings.theme
  const logoSrc = theme === 'dark' ? logoLightMode : logoDarkMode

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.logo}>
          <img
            src={logoSrc}
            alt="TailorPady"
            className={styles.logoIcon}
            style={{
              borderRadius: '10px',
              background: theme === 'dark' ? '#ffffff' : '#000000',
            }}
          />
          <div className={styles.logoText}>
            <span className={styles.logoName}>TailorPady</span>
            <span className={styles.logoTagline}>The business side of tailoring, simplified.</span>
          </div>
        </div>

        <div className={styles.divider} />

        {sent ? (
          <>
            <h1 className={styles.title}>Check your inbox</h1>
            <p className={styles.sub}>
              We sent a password reset link to <strong>{email.trim()}</strong>. Follow the link to set a new password.
            </p>
            <p className={styles.switchPrompt} style={{ marginTop: 16 }}>
              <Link to="/login" className={styles.switchLink}>Back to login</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Forgot password?</h1>
            <p className={styles.sub}>Enter your email and we&apos;ll send you a reset link</p>

            {error && (
              <div className={styles.errorBanner}>
                <span className="mi-outlined" style={{ fontSize: '1rem' }}>error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <div className={styles.inputWrap}>
                  <span className="mi-outlined" style={{ position: 'absolute', left: 12, color: 'var(--text3)', fontSize: '1.1rem' }}>mail</span>
                  <input
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p className={styles.switchPrompt}>
              Remembered it?{' '}
              <Link to="/login" className={styles.switchLink}>Log in</Link>
            </p>
          </>
        )}

      </div>
    </div>
  )
}
