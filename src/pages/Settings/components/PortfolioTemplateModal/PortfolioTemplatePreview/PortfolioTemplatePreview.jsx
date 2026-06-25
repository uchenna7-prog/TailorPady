import Header from '../../../../../components/Header/Header'
import styles from './PortfolioTemplatePreview.module.css'

export function PortfolioTemplatePreview({ template, slug, onClose, onSelect }) {
  const previewUrl = slug
    ? `${window.location.origin}/portfolio/${slug}?template=${template.id}`
    : null

  const handleSelect = () => onSelect(template.id)

  const handleOpenInNewTab = () => window.open(previewUrl, '_blank')

  let previewContent

  if (!previewUrl) {
    previewContent = (
      <div className={styles.previewNoSlug}>
        <span className="mi" style={{ fontSize: '2rem' }}>visibility_off</span>
        <p>Set up your portfolio slug in Profile to enable live preview.</p>
      </div>
    )
  } else if (import.meta.env.DEV) {
    previewContent = (
      <div className={styles.previewNoSlug}>
        <span className="mi" style={{ fontSize: '2rem' }}>open_in_new</span>
        <p>{template.label} preview</p>
        <button onClick={handleOpenInNewTab} className={styles.previewLink}>
          Open preview in new tab
        </button>
      </div>
    )
  } else {
    previewContent = (
      <iframe
        className={styles.previewFrame}
        src={previewUrl}
        title="Portfolio preview"
      />
    )
  }

  return (
    <div className={styles.previewContainer}>
      <Header
        type="back"
        title={`${template.label}`}
        onBackClick={onClose}
        showBorderBottom={false}
        customActions={[{
          label: 'Select',
          onClick: handleSelect,
        }]}
      />
      <div className={styles.previewContent}>
        {previewContent}
      </div>
    </div>
  )
}