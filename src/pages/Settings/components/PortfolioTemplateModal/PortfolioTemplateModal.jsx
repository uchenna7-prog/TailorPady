import { useState, useCallback, useEffect } from 'react'
import { useProfileSettings } from '../../../../contexts/ProfileSettingsContext'
import { usePortfolioSettings } from '../../../../contexts/PortfolioSettingsContext'
import Header from '../../../../components/Header/Header'
import { useTour } from '../../../../contexts/TourContext'
import { PortfolioTemplatePreview } from './PortfolioTemplatePreview/PortfolioTemplatePreview'
import { MissingFieldsSheet } from '../../../../components/TemplateModal/MissingFieldsSheet/MissingFieldsSheet'
import { MIN_ABOUT_LENGTH } from '../PortfolioSettingsModal/datas'
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

const FIELD_TO_PROFILE_KEY = {
  name:    'brandName',
  tagline: 'brandTagline',
  phone:   'brandPhone',
  email:   'brandEmail',
  address: 'brandAddress',
  logo:    'brandLogo',
  socials: 'brandSocials',
}

const PORTFOLIO_FIELD_KEYS = new Set(['about', 'location', 'yearFounded', 'milestones', 'processSteps', 'faqs'])

const PORTFOLIO_REQUIRES = [
  'logo', 'name', 'tagline', 'phone', 'email', 'address', 'socials',
  'about', 'location', 'yearFounded', 'milestones', 'processSteps', 'faqs',
]

function isProfileFieldMissing(key, profileSettings) {
  const rawKey = FIELD_TO_PROFILE_KEY[key]
  const value  = rawKey ? profileSettings[rawKey] : null
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

function hasFilledEntry(entries, requiredSubKeys) {
  if (!Array.isArray(entries) || entries.length === 0) return false
  return entries.some(entry => requiredSubKeys.every(k => entry?.[k]?.toString().trim()))
}

function isPortfolioFieldMissing(key, portfolioSettings) {
  switch (key) {
    case 'about':
      return (portfolioSettings.brandAbout?.trim().length || 0) < MIN_ABOUT_LENGTH
    case 'location':
      return !portfolioSettings.brandLocation?.trim()
    case 'yearFounded':
      return !portfolioSettings.brandYearFounded?.toString().trim()
    case 'milestones':
      return !hasFilledEntry(portfolioSettings.brandMilestones, ['number', 'label'])
    case 'processSteps':
      return !hasFilledEntry(portfolioSettings.brandProcessSteps, ['title', 'description'])
    case 'faqs':
      return !hasFilledEntry(portfolioSettings.brandFaqs, ['question', 'answer'])
    default:
      return false
  }
}

function getPortfolioMissingFields(profileSettings, portfolioSettings) {
  return PORTFOLIO_REQUIRES.filter(key => (
    PORTFOLIO_FIELD_KEYS.has(key)
      ? isPortfolioFieldMissing(key, portfolioSettings)
      : isProfileFieldMissing(key, profileSettings)
  ))
}

export function PortfolioTemplateModal({
  currentTemplate,
  initialSelected,
  slug,
  onClose,
  onSelect,
  returnTo,
  completionSignal,
  onCompletionSignalHandled,
}) {
  const { profileSettings }   = useProfileSettings()
  const { portfolioSettings } = usePortfolioSettings()

  const [selected, setSelected] = useState(initialSelected ?? currentTemplate)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [gender, setGender] = useState('male')
  const [missingFields, setMissingFields] = useState(null)
  const [completedModalKey, setCompletedModalKey] = useState(null)
  const { currentStep, completeStep, goToStep } = useTour()

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

  const commitSelection = useCallback(() => {
    onSelect(selected)
    if (currentStep?.id === 'portfolio-template-select-save') {
      completeStep('portfolio-template-select-save')
    }
    if (currentStep?.id === 'portfolio-template-select-save-2') {
      goToStep('portfolio-done')
    }
    onClose()
  }, [selected, onSelect, currentStep, completeStep, goToStep, onClose])

  const handleSavePress = useCallback(() => {
    const missing = getPortfolioMissingFields(profileSettings, portfolioSettings)
    if (missing.length > 0) {
      setCompletedModalKey(null)
      setMissingFields(missing)
      return
    }
    commitSelection()
  }, [profileSettings, portfolioSettings, commitSelection])

  const handleSkipAndSave = useCallback(() => {
    setMissingFields(null)
    setCompletedModalKey(null)
    commitSelection()
  }, [commitSelection])

  useEffect(() => {
    if (!completionSignal) return
    const missing = getPortfolioMissingFields(profileSettings, portfolioSettings)
    setCompletedModalKey(completionSignal.completedModal ?? null)
    setMissingFields(missing.length > 0 ? missing : null)
    onCompletionSignalHandled?.()
  }, [completionSignal, profileSettings, portfolioSettings, onCompletionSignalHandled])

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

      {missingFields !== null && (
        <MissingFieldsSheet
          missingFields={missingFields}
          docType="portfolio"
          onClose={() => { setMissingFields(null); setCompletedModalKey(null) }}
          onSkipAndSave={handleSkipAndSave}
          pendingTemplate={{ portfolioTemplate: selected }}
          returnTo={returnTo}
          completedModal={completedModalKey}
        />
      )}
    </div>
  )
}
