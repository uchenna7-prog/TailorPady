import { useState } from 'react'
import { FullModal } from '../../../../components/FullModal/FullModal'
import styles from './PortfolioTemplateModal.module.css'

const TEMPLATES = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean grid, lots of white space',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Magazine-style with large hero image',
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Full-bleed dark layout with strong type',
  },
]

export function PortfolioTemplateModal({ currentTemplate, slug, onBack, onSelect }) {

  const [selected, setSelected] = useState(currentTemplate)
  const [previewTemplate, setPreviewTemplate] = useState(null)

  function handlePreview(templateId) {
    setPreviewTemplate(templateId)
  }

  function handleClosePreview() {
    setPreviewTemplate(null)
  }

  const previewUrl = slug
    ? `/portfolio/${slug}?template=${previewTemplate}`
    : null

  const onSave = ()=>{
    onSelect(selected)
  }
  return (

    <FullModal title="Portfolio Template" onBack={onBack} onSave={onSave}>

       <div>

        <div className={styles.page}>


          <p className={styles.hint}>
            Tap a card to select. Tap Preview to see it live before saving.
          </p>

          <div className={styles.cards}>
            {TEMPLATES.map(t => (
              <div
                key={t.id}
                className={`${styles.card} ${selected === t.id ? styles.cardSelected : ''}`}
                onClick={() => setSelected(t.id)}
              >
                <div className={`${styles.mockup} ${styles[`mockup_${t.id}`]}`}>
                  <Mockup id={t.id} />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardInfo}>
                    {selected === t.id && (
                      <span className={`mi ${styles.checkIcon}`}>check_circle</span>
                    )}
                    <div>
                      <div className={styles.cardLabel}>{t.label}</div>
                      <div className={styles.cardDesc}>{t.description}</div>
                    </div>
                  </div>

                  <button
                    className={styles.previewBtn}
                    onClick={e => { e.stopPropagation(); handlePreview(t.id) }}
                  >
                    <span className="mi">open_in_new</span>
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {previewTemplate && (
          <div className={styles.previewOverlay}>
            <div className={styles.previewBar}>
              <button className={styles.previewClose} onClick={handleClosePreview}>
                <span className="mi">close</span>
              </button>
              <span className={styles.previewLabel}>
                {TEMPLATES.find(t => t.id === previewTemplate)?.label} Preview
              </span>
              <button
                className={styles.previewSelect}
                onClick={() => { setSelected(previewTemplate); handleClosePreview() }}
              >
                Select
              </button>
            </div>

            {previewUrl ? (
              <iframe
                className={styles.previewFrame}
                src={previewUrl}
                title="Portfolio preview"
              />
            ) : (
              <div className={styles.previewNoSlug}>
                Set up your portfolio slug in Profile to enable live preview.
              </div>
            )}
          </div>
        )}

      </div>


    </FullModal>
   
  )
}


function Mockup({ id }) {
  if (id === 'minimal') return (
    <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="100" fill="#f8f8f8"/>
      <rect x="12" y="12" width="60" height="6" rx="2" fill="#e0e0e0"/>
      <rect x="12" y="22" width="36" height="3" rx="1.5" fill="#ebebeb"/>
      <rect x="12" y="36" width="64" height="40" rx="3" fill="#e4e4e4"/>
      <rect x="84" y="36" width="64" height="19" rx="3" fill="#e4e4e4"/>
      <rect x="84" y="57" width="64" height="19" rx="3" fill="#e4e4e4"/>
    </svg>
  )
  if (id === 'editorial') return (
    <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="100" fill="#f2ede8"/>
      <rect width="160" height="52" fill="#d9d0c6"/>
      <rect x="12" y="58" width="80" height="7" rx="2" fill="#c8bfb5"/>
      <rect x="12" y="69" width="50" height="4" rx="2" fill="#ddd8d2"/>
      <rect x="12" y="78" width="136" height="3" rx="1.5" fill="#e5e1dd"/>
      <rect x="12" y="84" width="100" height="3" rx="1.5" fill="#e5e1dd"/>
    </svg>
  )
  if (id === 'bold') return (
    <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="100" fill="#111"/>
      <rect x="12" y="14" width="90" height="10" rx="2" fill="#2a2a2a"/>
      <rect x="12" y="28" width="55" height="5" rx="2" fill="#222"/>
      <rect x="12" y="42" width="64" height="40" rx="3" fill="#1e1e1e"/>
      <rect x="84" y="42" width="64" height="19" rx="3" fill="#1e1e1e"/>
      <rect x="84" y="63" width="64" height="19" rx="3" fill="#1e1e1e"/>
      <rect x="12" y="14" width="8" height="10" rx="2" fill="#e0c97a"/>
    </svg>
  )
  return null
}
