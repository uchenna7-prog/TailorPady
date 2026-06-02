import { useState } from 'react'
import { FullModal } from '../../../../components/FullModal/FullModal'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { Field } from '../Field/Field'
import { TextInput } from '../TextInput/TextInput'
import { useAuth } from '../../../../contexts/AuthContext'
import styles from './ChangePasswordModal.module.css'


export function ChangePasswordModal({ onBack, showToast }) {

  const { user, changePassword } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')

  async function handleSave() {
    setError('')

    if (!currentPassword) {
      setError('Please enter your current password.')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await changePassword(user, currentPassword, newPassword)
      showToast('Password updated')
      onBack()
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <FullModal title="Change Password" onBack={onBack} onSave={handleSave} saveLabel={loading ? 'Saving…' : 'Save'}>
      <div>

        <FieldGroup>
          <Field label="Current Password" hint="Enter your existing password to confirm it's you.">
            <TextInput
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Current password"
            />
          </Field>
        </FieldGroup>

        <div style={{ height: 12 }} />

        <FieldGroup>
          <Field label="New Password" hint="At least 6 characters.">
            <TextInput
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="New password"
            />
          </Field>

          <Field label="Confirm New Password">
            <TextInput
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat new password"
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
