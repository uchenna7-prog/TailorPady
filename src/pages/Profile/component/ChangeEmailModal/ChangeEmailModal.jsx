import { useState } from 'react'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { Field } from '../Field/Field'
import { TextInput } from '../TextInput/TextInput'
import { useAuth } from '../../../../contexts/AuthContext'
import styles from './ChangeEmailModal.module.css'


export function ChangeEmailModal({ onBack, showToast }) {

  const { user, changeEmail } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail,        setNewEmail]        = useState('')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')
  const [sent,            setSent]            = useState(false)

  async function handleSave() {
    setError('')

    if (!currentPassword) {
      setError('Please enter your current password.')
      return
    }
    if (!newEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (newEmail === user.email) {
      setError('New email is the same as your current email.')
      return
    }

    setLoading(true)
    try {
      await changeEmail(user, currentPassword, newEmail)
      setSent(true)
      showToast('Verification email sent')
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.')
      } else if (err.code === 'auth/email-already-in-use') {
        setError('That email is already linked to another account.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <FullModal title="Change Email" onBack={onBack}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <span className="mi">mark_email_read</span>
          </div>
          <p className={styles.successTitle}>Check your inbox</p>
          <p className={styles.successSub}>
            We sent a verification link to <strong>{newEmail}</strong>.
            Your email will update once you click the link.
          </p>
          <p className={styles.successNote}>
            Your current email <strong>{user.email}</strong> stays active until you verify the new one.
          </p>
        </div>
      </FullModal>
    )
  }

  return (
    <FullModal title="Change Email" onBack={onBack} onSave={handleSave} saveLabel={loading ? 'Sending…' : 'Send Link'}>
      <div>

        <FieldGroup>
          <Field
            label="Current Email"
            hint="Your email address on file."
          >
            <div className={styles.currentEmail}>{user.email}</div>
          </Field>
        </FieldGroup>

        <div style={{ height: 12 }} />

        <FieldGroup>
          <Field label="New Email" hint="We'll send a verification link here before updating.">
            <TextInput
              type="email"
              value={newEmail}
              onChange={setNewEmail}
              placeholder="new@email.com"
            />
          </Field>

          <Field label="Current Password" hint="Required to confirm it's you.">
            <TextInput
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Your current password"
            />
          </Field>
        </FieldGroup>

        {error && (
          <div className={styles.error}>
            <span className="mi" style={{ fontSize: '1rem' }}>error_outline</span>
            <span>{error}</span>
          </div>
        )}

      </div>
    </FullModal>
  )
}
