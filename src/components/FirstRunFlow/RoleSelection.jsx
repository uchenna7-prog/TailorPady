import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../firebase'
import { saveOnboardingRole } from '../../services/profileService'
import styles from './FirstRunFlow.module.css'

const ROLES = [
  {
    id: 'owner',
    icon: 'storefront',
    title: 'Owner (Master/Madam)',
    sub: 'You run the studio and manage the business.',
  },
  {
    id: 'worker',
    icon: 'content_cut',
    title: 'Worker / Apprentice',
    sub: 'You work under a studio owner.',
  },
]

export default function RoleSelection({ onDone }) {
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
      <div className={styles.card}>
        <h1 className={styles.title}>Tell us who you are</h1>
        <p className={styles.sub}>Choose your role to personalize your experience.</p>

        {ROLES.map(role => {
          const isSelected = selected === role.id
          return (
            <div
              key={role.id}
              className={`${styles.roleOption} ${isSelected ? styles.roleOptionSelected : ''}`}
              onClick={() => setSelected(role.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
            >
              <div className={styles.roleHead}>
                <div className={styles.roleIcon}>
                  <span className="mi-outlined">{role.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p className={styles.roleTitle}>{role.title}</p>
                </div>
                <div className={`${styles.roleRadio} ${isSelected ? styles.roleRadioSelected : ''}`} />
              </div>
              <p className={styles.roleSub}>{role.sub}</p>
            </div>
          )
        })}

        <button
          className={styles.primaryBtn}
          onClick={handleContinue}
          disabled={!selected || saving}
          style={{ marginTop: 8, opacity: !selected ? 0.5 : 1 }}
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
