import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { db } from '../../firebase'
import { saveOnboardingRole } from '../../services/profileService'
import logoLightMode from '../../assets/logoLightMode.png'
import logoDarkMode from '../../assets/logoDarkMode.png'
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

export default function RoleSelection({ onDone, onSkip }) {
  const { user } = useAuth()
  const { generalSettings } = useGeneralSettings()
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const theme = generalSettings.theme
  const logoSrc = theme === 'dark' ? logoLightMode : logoDarkMode

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

      <div className={styles.header}>
        <img
          src={logoSrc}
          alt="TailorPady"
          className={styles.logoIcon}
          style={{ background: theme === 'dark' ? '#ffffff' : '#000000' }}
        />
      </div>

      <div className={styles.slideTrack}>
        <h1 className={styles.title}>Tell us who you are</h1>
        <p className={styles.sub}>Choose your role to personalize your experience.</p>

        <div className={styles.listArea}>
          {ROLES.map(role => {
            const isSelected = selected === role.id
            return (
              <div
                key={role.id}
                className={styles.roleOption}
                onClick={() => setSelected(role.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
              >
                <div className={styles.roleHead}>
                  <div className={`${styles.roleIcon} ${isSelected ? styles.roleIconSelected : ''}`}>
                    <span className="mi-outlined">{role.icon}</span>
                  </div>
                  <div className={styles.roleTextBlock}>
                    <p className={styles.roleTitle}>{role.title}</p>
                    <p className={styles.roleSub}>{role.sub}</p>
                  </div>
                  <div className={`${styles.roleRadio} ${isSelected ? styles.roleRadioSelected : ''}`} />
                </div>
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
