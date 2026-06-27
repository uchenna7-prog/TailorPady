import { useState, useRef, useEffect } from 'react'
import { SOCIAL_PLATFORMS } from '../../datas'
import { SocialIcon } from '../SocialIcon/SocialIcon'
import { FullModal } from '../FullModal/FullModal'
import { FieldGroup } from '../FieldGroup/FieldGroup'
import { useProfileSettings } from '../../../../contexts/ProfileSettingsContext'
import styles from './SocialsModal.module.css'

function buildHandles(socials) {
  return Object.fromEntries((socials || []).map(s => [s.platform, s.handle]))
}

function buildExpanded(socials) {
  const active = new Set((socials || []).map(s => s.platform))
  return Object.fromEntries(SOCIAL_PLATFORMS.map(p => [p.id, active.has(p.id)]))
}

export function SocialsModal({ onBack, showToast }) {
  const { profileSettings, isLoading, updateManyProfileSettings } = useProfileSettings()
  const initializedRef = useRef(false)

  const [handles,  setHandles]  = useState(() => buildHandles(profileSettings.brandSocials))
  const [expanded, setExpanded] = useState(() => buildExpanded(profileSettings.brandSocials))

  useEffect(() => {
    if (isLoading || initializedRef.current) return
    initializedRef.current = true
    setHandles(buildHandles(profileSettings.brandSocials))
    setExpanded(buildExpanded(profileSettings.brandSocials))
  }, [isLoading])

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

  if (isLoading) {
    return (
      <FullModal title="Social Media" onBack={onBack}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ width: 28, height: 28, border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </FullModal>
    )
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