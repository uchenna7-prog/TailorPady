import { useState } from 'react'
import { FullModal } from '../../../../components/FullModal/FullModal'
import styles from './AppearanceModal.module.css'

const ACCENTS = [
  { id: 'default',  label: 'Default',   color: null,      description: 'Follows your theme'   },
  { id: 'mahogany', label: 'Mahogany',  color: '#5C0E1E', description: 'Rich suiting cloth'   },
  { id: 'ink',      label: 'Ink Blue',  color: '#0A1F35', description: 'Bespoke shirting'     },
  { id: 'bronze',   label: 'Bronze',    color: '#5C3410', description: 'Leather & buttons'    },
  { id: 'sage',     label: 'Sage',      color: '#1A3D22', description: 'Irish linen'          },
  { id: 'graphite', label: 'Graphite',  color: '#2E2E32', description: 'Wool flannel'         },
  { id: 'claret',   label: 'Claret',    color: '#3A0818', description: 'Velvet evening wear'  },
  { id: 'teal',     label: 'Teal',      color: '#083530', description: 'Silk lining'          },
]

export function AppearanceModal({ currentTheme, currentAccent, onBack, onThemeChange, onAccentChange }) {

  const [localTheme,  setLocalTheme]  = useState(currentTheme)
  const [localAccent, setLocalAccent] = useState(currentAccent || 'default')

  const isDark = localTheme === 'dark'

  function save() {
    if (localTheme  !== currentTheme)              onThemeChange(localTheme)
    if (localAccent !== (currentAccent || 'default')) {
      const accent = ACCENTS.find(a => a.id === localAccent)
      onAccentChange(localAccent, accent?.color ?? null)
    }
    onBack()
  }

  return (

    <FullModal title="Appearance" onBack={onBack} onSave={save}>

      <div className={styles.scrollArea}>

        <div className={styles.sectionLabel}>Theme</div>

        <div className={styles.themeRow}>

          <button
            className={`${styles.themeCard} ${!isDark ? styles.themeCardSelected : ''}`}
            onClick={() => setLocalTheme('light')}
          >
            <div className={styles.themePreview} data-mode="light">
              <div className={styles.previewTopBar}>
                <div className={styles.previewBarLine} />
                <div className={styles.previewBarDot} />
              </div>
              <div className={styles.previewRows}>
                <div className={styles.previewRow} />
                <div className={styles.previewRow} />
                <div className={styles.previewRow} style={{ width: '60%' }} />
              </div>
            </div>
            <div className={styles.themeFooter}>
              <span className="mi" style={{ fontSize: '1rem' }}>light_mode</span>
              <span className={styles.themeLabel}>Light</span>
              {!isDark && (
                <span className="mi" style={{ fontSize: '1rem', color: 'var(--accent)', marginLeft: 'auto' }}>
                  check_circle
                </span>
              )}
            </div>
          </button>

          <button
            className={`${styles.themeCard} ${isDark ? styles.themeCardSelected : ''}`}
            onClick={() => setLocalTheme('dark')}
          >
            <div className={styles.themePreview} data-mode="dark">
              <div className={styles.previewTopBar} data-dark>
                <div className={styles.previewBarLine} data-dark />
                <div className={styles.previewBarDot} data-dark />
              </div>
              <div className={styles.previewRows}>
                <div className={styles.previewRow} data-dark />
                <div className={styles.previewRow} data-dark />
                <div className={styles.previewRow} data-dark style={{ width: '60%' }} />
              </div>
            </div>
            <div className={styles.themeFooter}>
              <span className="mi" style={{ fontSize: '1rem' }}>dark_mode</span>
              <span className={styles.themeLabel}>Dark</span>
              {isDark && (
                <span className="mi" style={{ fontSize: '1rem', color: 'var(--accent)', marginLeft: 'auto' }}>
                  check_circle
                </span>
              )}
            </div>
          </button>

        </div>

        <div className={styles.sectionLabel} style={{ marginTop: 28 }}>Accent Color</div>
        <p className={styles.sectionHint}>Tailored to the craft</p>

        <div className={styles.accentList}>
          {ACCENTS.map(a => {
            const isSelected = localAccent === a.id
            const isDefault  = a.id === 'default'

            return (
              <button
                key={a.id}
                className={`${styles.accentRow} ${isSelected ? styles.accentRowSelected : ''}`}
                onClick={() => setLocalAccent(a.id)}
              >
                {isDefault ? (
                  <span className={styles.accentDotDefault} />
                ) : (
                  <span
                    className={styles.accentDot}
                    style={{ background: a.color }}
                  />
                )}
                <div className={styles.accentText}>
                  <span className={styles.accentLabel}>{a.label}</span>
                  <span className={styles.accentDesc}>{a.description}</span>
                </div>
                {isSelected && (
                  <span
                    className="mi"
                    style={{
                      fontSize: '1.1rem',
                      color: isDefault ? 'var(--accent)' : a.color,
                      marginLeft: 'auto',
                    }}
                  >
                    check
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div style={{ height: 40 }} />

      </div>

    </FullModal>

  )
}