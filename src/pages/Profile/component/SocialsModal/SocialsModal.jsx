
import { useState } from "react"
import { SOCIAL_PLATFORMS } from "../../datas"
import { SocialIcon } from "../SocialIcon/SocialIcon"
import { FullModal } from "../FullModal/FullModal"
import { FieldGroup } from "../FieldGroup/FieldGroup"
import { useProfileSettings } from "../../../../contexts/ProfileSettingsContext"
import styles from "./SocialsModal.module.css"


export function SocialsModal({ onBack, showToast }) {


  const { profileSettings, updateManyProfileSettings } = useProfileSettings()

  const toMap = arr => Object.fromEntries((arr || []).map(s => [s.platform, s.handle]))
  const [handles, setHandles]  = useState(() => toMap(profileSettings.brandSocials || []))
  const [expanded, setExpanded] = useState(() => {
    const active = new Set((profileSettings.brandSocials || []).map(s => s.platform))
    return Object.fromEntries(SOCIAL_PLATFORMS.map(p => [p.id, active.has(p.id)]))
  })

  const togglePlatform = id => {
    setExpanded(prev => {
      const next = { ...prev, [id]: !prev[id] }
      if (prev[id]) setHandles(h => { const n = { ...h }; delete n[id]; return n })
      return next
    })
  }

  const save = () => {
    const brandSocials = SOCIAL_PLATFORMS
      .filter(p => expanded[p.id] && handles[p.id]?.trim())
      .map(p => ({ platform: p.id, handle: handles[p.id].trim() }))
    updateManyProfileSettings({ brandSocials })
    showToast('Social links saved')
    onBack()
  }

  return (
    <FullModal title="Social Media" onBack={onBack} onSave={save}>

      <FieldGroup>

        {SOCIAL_PLATFORMS.map(platform => (
          <div key={platform.id} className={styles.socialRow}>
            <button
              type="button"
              className={`${styles.socialToggle} ${expanded[platform.id] ? styles.socialToggleActive : ''}`}
              onClick={() => togglePlatform(platform.id)}
            >
              <div className={styles.socialToggleLeft}>

                <div className={`${styles.socialIconWrap} ${expanded[platform.id] ? styles.socialIconActive : ''}`}>
                  <SocialIcon platformId={platform.id} size={18} />
                </div>

                <span className={styles.socialPlatformLabel}>{platform.label}</span>

              </div>

              <span className={`mi ${styles.socialChevron} ${expanded[platform.id] ? styles.socialChevronOpen : ''}`} style={{ fontSize: '1rem' }}>
                expand_more
              </span>

            </button>
            {expanded[platform.id] && (
              <div className={styles.socialHandleWrap}>

                <span className={styles.socialAt}>@</span>
                <input
                  className={styles.socialHandleInput}
                  type="text"
                  placeholder={platform.placeholder}
                  value={handles[platform.id] || ''}
                  onChange={e => setHandles(h => ({ ...h, [platform.id]: e.target.value }))}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            )}

          </div>

        ))}
      </FieldGroup>
      
    </FullModal>
  )
}
