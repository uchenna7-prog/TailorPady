import { useState } from 'react'
import Header from '../../../../components/Header/Header'
import { PortfolioTemplatePreview } from './PortfolioTemplatePreview/PortfolioTemplatePreview'
import styles from './PortfolioTemplateModal.module.css'
import template1Male from '../../../../assets/portfolioScreenshots/template1Male.png'
import template1Female from '../../../../assets/portfolioScreenshots/template1Female.png'
import template2Male from '../../../../assets/portfolioScreenshots/template2Male.png'
import template2Female from '../../../../assets/portfolioScreenshots/template2Female.png'

const TEMPLATES = [
  {
    id: 'template1',
    label: 'Template One',
    description: 'Classic layout with hero banner and gallery grid',
    thumbs: { male: template1Male, female: template1Female },
  },
  {
    id: 'template2',
    label: 'Template Two',
    description: 'Modern layout with featured work showcase',
    thumbs: { male: template2Male, female: template2Female },
  },
  {
    id: 'template3',
    label: 'Template Three',
    description: 'Editorial black and white studio portfolio',
    thumbs: null,
  },
  {
    id: 'template4',
    label: 'Template Four',
    description: 'Modern layout with featured work showcase',
    thumbs: null,
  },
]

const DEV_SLUG = 'urchstitches'

export function PortfolioTemplateModal({ currentTemplate, slug, onClose, onSelect }) {
  const [selected, setSelected] = useState(currentTemplate)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [gender, setGender] = useState('male')

  const hasChanges = selected !== currentTemplate
  const resolvedSlug = slug || (import.meta.env.DEV ? DEV_SLUG : null)
  const canPreview = Boolean(resolvedSlug)

  const handlePreviewOpen = (e, template) => {
    e.stopPropagation()
    setPreviewTemplate(template)
  }

  const handlePreviewClose = () => setPreviewTemplate(null)

  const handlePreviewSelect = (templateId) => {
    setSelected(templateId)
    setPreviewTemplate(null)
  }

  const handleSavePress = () => {
    onSelect(selected)
    onClose()
  }

  return (
    <div className={styles.templateModalContainer}>
      <Header
        type="back"
        title="Portfolio Template"
        onBackClick={onClose}
        showBorderBottom={false}
        customActions={[{
          label: 'Save',
          onClick: handleSavePress,
          disabled: !hasChanges,
        }]}
      />

      <div className={styles.templateList}>
        <div className={styles.toolbar}>
          <p className={styles.hint}>
            Tap a card to select it. Tap the preview icon to see it live before saving.
          </p>

          <div className={styles.genderToggle}>
            <button
              className={`${styles.genderOption} ${gender === 'male' ? styles.genderOptionActive : ''}`}
              onClick={() => setGender('male')}
            >
              Male
            </button>
            <button
              className={`${styles.genderOption} ${gender === 'female' ? styles.genderOptionActive : ''}`}
              onClick={() => setGender('female')}
            >
              Female
            </button>
          </div>
        </div>

        <div className={styles.templateGrid}>
          {TEMPLATES.map((template, index) => {
            const isSelected = selected === template.id
            const thumbSrc = template.thumbs ? template.thumbs[gender] : null

            return (
              <div
                key={template.id}
                className={styles.templateItem}
                onClick={() => setSelected(template.id)}
              >
                <div className={`${styles.templateCard} ${isSelected ? styles.templateCardSelected : ''}`}>
                  <div className={styles.previewShell}>
                    {thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt={template.label}
                        className={styles.thumbImage}
                      />
                    ) : (
                      <div className={styles.thumbPlaceholder}>
                        <span className="mi" style={{ fontSize: '1.6rem' }}>visibility_off</span>
                        <span>No preview available yet</span>
                      </div>
                    )}

                    {canPreview && (
                      <button
                        className={styles.zoomTrigger}
                        onClick={e => handlePreviewOpen(e, template)}
                        aria-label="Preview template"
                      >
                        <span className="mi" style={{ fontSize: '0.9rem' }}>open_in_full</span>
                      </button>
                    )}

                    {isSelected && (
                      <div className={styles.selectedBadge}>
                        <span className="mi" style={{ fontSize: '0.75rem' }}>check</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.templateMeta}>
                  <p className={`${styles.templateName} ${isSelected ? styles.templateNameSelected : ''}`}>
                    {`${index + 1}. ${template.label}`}
                  </p>
                  <p className={styles.templateDesc}>{template.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {previewTemplate && (
        <PortfolioTemplatePreview
          template={previewTemplate}
          slug={resolvedSlug}
          onClose={handlePreviewClose}
          onSelect={handlePreviewSelect}
        />
      )}
    </div>
  )
}