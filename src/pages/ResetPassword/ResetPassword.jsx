import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import logoLightMode from '../../assets/logoLightMode.png'
import logoDarkMode from '../../assets/logoDarkMode.png'
import styles from './ResetPassword.module.css'

function friendlyError(code) {
  switch (code) {
    case 'auth/expired-action-code': return 'This reset link has expired. Request a new one.'
    case 'auth/invalid-action-code': return 'This reset link is invalid or has already been used.'
    case 'auth/user-disabled':       return 'This account has been disabled.'
    case 'auth/user-not-found':      return 'No account found for this reset link.'
    case 'auth/weak-password':       return 'Password must be at least 6 characters.'
    default:                         return 'Something went wrong. Please try again.'
  }
}

const STATUS = {
  VERIFYING: 'verifying',
  VALID:     'valid',
  INVALID:   'invalid',
  DONE:      'done',
}

export default function ResetPassword() {
  const { verifyResetCode, confirmReset } = useAuth()
  const { generalSettings }               = useGeneralSettings()
  const navigate                          = useNavigate()
  const [searchParams]                    = useSearchParams()
  const oobCode                           = searchParams.get('oobCode')

  const [status,          setStatus]          = useState(STATUS.VERIFYING)
  const [resetEmail,      setResetEmail]      = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error,           setError]           = useState('')
  const [saving,          setSaving]          = useState(false)

  const theme   = generalSettings.theme
  const logoSrc = theme === 'dark' ? logoLightMode : logoDarkMode

  useEffect(() => {
    if (!oobCode) {
      setStatus(STATUS.INVALID)
      setError('This reset link is missing or malformed.')
      return
    }
    verifyResetCode(oobCode)
      .then(email => {
        setResetEmail(email)
        setStatus(STATUS.VALID)
      })
      .catch(err => {
        setError(friendlyError(err.code))
        setStatus(STATUS.INVALID)
      })
  }, [oobCode, verifyResetCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSaving(true)
    try {
      await confirmReset(oobCode, newPassword)
      setStatus(STATUS.DONE)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setSaving(false)
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

        {status === STATUS.VERIFYING && (
          <>
            <h1 className={styles.title}>Checking your link…</h1>
            <p className={styles.sub}>Hang tight, this only takes a moment.</p>
          </>
        )}

        {status === STATUS.INVALID && (
          <>
            <h1 className={styles.title}>Link expired</h1>
            <p className={styles.sub}>{error}</p>
            <p className={styles.switchPrompt} style={{ marginTop: 16 }}>
              <Link to="/forgot-password" className={styles.switchLink}>Request a new link</Link>
            </p>
          </>
        )}

        {status === STATUS.VALID && (
          <>
            <h1 className={styles.title}>Set a new password</h1>
            <p className={styles.sub}>Resetting password for <strong>{resetEmail}</strong></p>

            {error && (
              <div className={styles.errorBanner}>
                <span className="mi-outlined" style={{ fontSize: '1rem' }}>error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrap}>
                  <span className="mi-outlined" style={{ position: 'absolute', left: 12, color: 'var(--text3)', fontSize: '1.1rem' }}>lock</span>
                  <input
                    className={styles.input}
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrap}>
                  <span className="mi-outlined" style={{ position: 'absolute', left: 12, color: 'var(--text3)', fontSize: '1.1rem' }}>lock</span>
                  <input
                    className={styles.input}
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    disabled={saving}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={saving}>
                {saving ? 'Saving…' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {status === STATUS.DONE && (
          <>
            <h1 className={styles.title}>Password updated</h1>
            <p className={styles.sub}>You can now log in with your new password.</p>
            <button
              type="button"
              className={styles.submitBtn}
              style={{ marginTop: 8 }}
              onClick={() => navigate('/login', { replace: true })}
            >
              Go to Login
            </button>
          </>
        )}

      </div>
    </div>
  )
}
