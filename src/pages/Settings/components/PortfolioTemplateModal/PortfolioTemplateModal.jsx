import { useState } from 'react'
import Header from '../../../../components/Header/Header'
import { PortfolioTemplatePreview } from './PortfolioTemplatePreview/PortfolioTemplatePreview'
import styles from './PortfolioTemplateModal.module.css'

const TEMPLATES = [
  {
    id: 'template1',
    label: 'Template 1',
    description: 'Classic layout with hero banner and gallery grid',
  },
  {
    id: 'template2',
    label: 'Template 2',
    description: 'Modern layout with featured work showcase',
  },
  {
    id: 'template3',
    label: 'Template 3',
    description: 'Editorial black and white studio portfolio',
  },
  {
    id: 'template4',
    label: 'Template 4',
    description: 'Modern layout with featured work showcase',
  },
]

const DEV_SLUG = 'urchstitches'

export function PortfolioTemplateModal({ currentTemplate, slug, onClose, onSelect }) {
  const [selected, setSelected] = useState(currentTemplate)
  const [previewTemplate, setPreviewTemplate] = useState(null)

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
        <p className={styles.hint}>
          Tap a card to select it. Tap the preview icon to see it live before saving.
        </p>

        <div className={styles.templateGrid}>
          {TEMPLATES.map((template, index) => {
            const isSelected = selected === template.id
            return (
              <div
                key={template.id}
                className={styles.templateItem}
                onClick={() => setSelected(template.id)}
              >
                <div className={`${styles.templateCard} ${isSelected ? styles.templateCardSelected : ''}`}>
                  <div className={styles.previewShell}>
                    {canPreview ? (
                      <div className={styles.thumbPlaceholder}>
                        <span className="mi" style={{ fontSize: '1.6rem' }}>visibility</span>
                        <span>{template.label}</span>
                      </div>
                    ) : (
                      <div className={styles.thumbPlaceholder}>
                        <span className="mi" style={{ fontSize: '1.6rem' }}>visibility_off</span>
                        <span>Set up your portfolio link to preview</span>
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