import { useState } from 'react'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { useAuth } from '../../../../contexts/AuthContext'
import styles from './ConnectedAccountsModal.module.css'


function getProviders(user) {
  if (!user) return { hasGoogle: false, hasPassword: false }
  const ids = user.providerData.map(p => p.providerId)
  return {
    hasGoogle:   ids.includes('google.com'),
    hasPassword: ids.includes('password'),
  }
}


export function ConnectedAccountsModal({ onBack, showToast }) {

  const { user, linkGoogle, unlinkProvider } = useAuth()

  const [loading, setLoading] = useState(null)
  const [error,   setError]   = useState('')

  const { hasGoogle, hasPassword } = getProviders(user)

  const linkedCount = [hasGoogle, hasPassword].filter(Boolean).length
  const canUnlink = linkedCount > 1

  async function handleLinkGoogle() {
    setError('')
    setLoading('google')
    try {
      await linkGoogle(user)
      showToast('Google account linked')
    } catch (err) {
      if (err.code === 'auth/credential-already-in-use') {
        setError('This Google account is already linked to another user.')
      } else if (err.code === 'auth/popup-closed-by-user') {
        // user dismissed — do nothing
      } else {
        setError('Could not link Google. Please try again.')
      }
    } finally {
      setLoading(null)
    }
  }

  async function handleUnlinkGoogle() {
    setError('')
    if (!canUnlink) {
      setError('You need at least one sign-in method. Add a password before removing Google.')
      return
    }
    setLoading('unlink-google')
    try {
      await unlinkProvider(user, 'google.com')
      showToast('Google account removed')
    } catch {
      setError('Could not remove Google. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <FullModal title="Connected Accounts" onBack={onBack}>
      <div>

        <div className={styles.intro}>
          <p className={styles.introText}>
            Linked accounts let you sign in without a password. You need at least one sign-in method active at all times.
          </p>
        </div>

        <FieldGroup>

          <div className={styles.providerRow}>
            <div className={styles.providerIcon}>
              <GoogleIcon />
            </div>
            <div className={styles.providerText}>
              <span className={styles.providerName}>Google</span>
              <span className={styles.providerSub}>
                {hasGoogle ? `Connected as ${user.email}` : 'Not connected'}
              </span>
            </div>
            {hasGoogle ? (
              <button
                className={`${styles.providerBtn} ${styles.providerBtnDanger}`}
                onClick={handleUnlinkGoogle}
                disabled={loading === 'unlink-google' || !canUnlink}
              >
                {loading === 'unlink-google' ? 'Removing…' : 'Remove'}
              </button>
            ) : (
              <button
                className={styles.providerBtn}
                onClick={handleLinkGoogle}
                disabled={loading === 'google'}
              >
                {loading === 'google' ? 'Linking…' : 'Link'}
              </button>
            )}
          </div>

          <div className={styles.providerRow} style={{ borderBottom: 'none' }}>
            <div className={styles.providerIcon}>
              <span className="mi" style={{ fontSize: '1.3rem', color: 'var(--text2)' }}>lock</span>
            </div>
            <div className={styles.providerText}>
              <span className={styles.providerName}>Email & Password</span>
              <span className={styles.providerSub}>
                {hasPassword ? `Active · ${user.email}` : 'Not set up'}
              </span>
            </div>
            <div className={`${styles.providerStatus} ${hasPassword ? styles.providerStatusActive : ''}`}>
              {hasPassword ? 'Active' : 'None'}
            </div>
          </div>

        </FieldGroup>

        {error && (
          <div className={styles.error}>
            <span className="mi" style={{ fontSize: '1rem' }}>error_outline</span>
            <span>{error}</span>
          </div>
        )}

        {!canUnlink && hasGoogle && (
          <div className={styles.notice}>
            <span className="mi" style={{ fontSize: '0.9rem', flexShrink: 0 }}>info</span>
            <span>Set up a password first before removing Google sign-in.</span>
          </div>
        )}

      </div>
    </FullModal>
  )
}


function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.1 0 5.8 1.1 8 2.9l6-6C34.5 3.1 29.6 1 24 1 14.9 1 7.1 6.4 3.4 14.1l7 5.4C12.2 13.1 17.6 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"/>
      <path fill="#FBBC05" d="M10.4 28.5A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7-5.4A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6.2z"/>
      <path fill="#34A853" d="M24 47c5.5 0 10.2-1.8 13.6-4.9l-7.4-5.7c-1.8 1.2-4.2 2-6.2 2-6.4 0-11.8-4.3-13.6-10.1l-7.8 6.2C7.1 41.6 14.9 47 24 47z"/>
    </svg>
  )
}
