import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../firebase'
import { saveOnboardingRole } from '../../services/profileService'
import styles from './FirstRunFlow.module.css'

const ROLES = [
  {
    id: 'owner',
    title: 'Owner (Master/Madam)',
    sub: 'You run the studio and manage the business.',
  },
  {
    id: 'worker',
    title: 'Worker / Apprentice',
    sub: 'You work under a studio owner.',
  },
]

export default function RoleSelection({ onDone, onSkip }) {
  const { user } = useAuth()
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleContinue() {
    if (!selected || !user?.uid) return
    setSaving(true)
    try {
      await saveOnboardingRole(db, user.uid, selected)
    } catch {
      setSaving(false)
      onDone()
      return
    }
    setSaving(false)
    onDone()
  }

  return (
    <div className={styles.page}>
      <button type="button" className={styles.skipBtn} onClick={onSkip}>
        Skip
      </button>

      <div className={styles.slideTrack}>
        <h1 className={styles.title}>Tell us who you are</h1>
        <p className={styles.sub}>Choose your role to personalize your experience.</p>

        <div className={styles.listArea}>
          {ROLES.map(role => {
            const isSelected = selected === role.id
            return (
              <div
                key={role.id}
                className={`${styles.roleCard} ${isSelected ? styles.roleCardSelected : ''}`}
                onClick={() => setSelected(role.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
              >
                <div className={styles.roleTextBlock}>
                  <p className={styles.roleTitle}>{role.title}</p>
                  <p className={styles.roleSub}>{role.sub}</p>
                </div>
                <div className={`${styles.roleRadio} ${isSelected ? styles.roleRadioSelected : ''}`} />
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.primaryBtn}
          onClick={handleContinue}
          disabled={!selected || saving}
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
