import { useState } from 'react'
import { FullModal } from '../../../../components/FullModal/FullModal'
import styles from './PortfolioTemplateModal.module.css'

const TEMPLATES = [
  {
    id: 'template1',
    label: 'Template One',
    description: 'Classic layout with hero banner and gallery grid',
  },
  {
    id: 'template2',
    label: 'Template Two',
    description: 'Modern layout with featured work showcase',
  },
  {
    id: 'template4',
    label: 'Template Four',
    description: 'Modern layout with featured work showcase',
  },
]

export function PortfolioTemplateModal({ currentTemplate, slug, onBack, onSelect }) {
  const [selected, setSelected] = useState(currentTemplate)
  const [previewTemplate, setPreviewTemplate] = useState(null)

  const buildPreviewUrl = (templateId) =>
    slug ? `/portfolio/${slug}?template=${templateId}` : null

  const handlePreview = (e, templateId) => {
    e.stopPropagation()
    setPreviewTemplate(templateId)
  }

  const handleClosePreview = () => setPreviewTemplate(null)

  const onSave = () => onSelect(selected)

  const overlayUrl = previewTemplate ? buildPreviewUrl(previewTemplate) : null

  return (
    <FullModal title="Portfolio Template" onBack={onBack} onSave={onSave}>
      <div className={styles.page}>

        <p className={styles.hint}>
          Tap a card to select it. Tap "Preview" to see it live before saving.
        </p>

        <div className={styles.cards}>
          {TEMPLATES.map(t => {
            const previewUrl = buildPreviewUrl(t.id)
            return (
              <div
                key={t.id}
                className={`${styles.card} ${selected === t.id ? styles.cardSelected : ''}`}
                onClick={() => setSelected(t.id)}
              >
                <div className={styles.thumbWrap}>
                  {previewUrl ? (
                    <div className={styles.thumbPlaceholder}>
                      <span className="mi" style={{ fontSize: '1.6rem' }}>visibility</span>
                      <span>{t.label}</span>
                    </div>
                  ) : (
                    <div className={styles.thumbPlaceholder}>
                      <span className="mi" style={{ fontSize: '1.6rem' }}>visibility_off</span>
                      <span>Set up your portfolio link to preview</span>
                    </div>
                  )}

                  {previewUrl && (
                    <button
                      className={styles.thumbPreviewBtn}
                      onClick={e => handlePreview(e, t.id)}
                    >
                      <span className="mi">open_in_new</span>
                      Preview
                    </button>
                  )}
                </div>

                <div className={styles.cardBody}>
                  {selected === t.id && (
                    <span className={`mi ${styles.checkIcon}`}>check_circle</span>
                  )}
                  <div>
                    <div className={styles.cardLabel}>{t.label}</div>
                    <div className={styles.cardDesc}>{t.description}</div>
                  </div>
                </div>
              </div>
            )
          })}
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

            {overlayUrl ? (
              <iframe
                className={styles.previewFrame}
                src={overlayUrl}
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