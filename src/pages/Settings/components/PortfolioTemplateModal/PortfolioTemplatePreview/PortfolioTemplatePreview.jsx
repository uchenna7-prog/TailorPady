import Header from '../../../../../components/Header/Header'
import styles from './PortfolioTemplatePreview.module.css'

export function PortfolioTemplatePreview({ template, slug, onClose, onSelect }) {
  const previewUrl = slug ? `/portfolio/${slug}?template=${template.id}` : null

  const handleSelect = () => onSelect(template.id)

  return (
    <div className={styles.previewContainer}>

      <Header
        type="back"
        title={`${template.label} Preview`}
        onBackClick={onClose}
        showBorderBottom={false}
        customActions={[{
          label: 'Select',
          onClick: handleSelect,
        }]}
      />

      <div className={styles.previewContent}>
        {previewUrl ? (
          <iframe
            className={styles.previewFrame}
            src={previewUrl}
            title="Portfolio preview"
          />
        ) : (
          <div className={styles.previewNoSlug}>
            <span className="mi" style={{ fontSize: '2rem' }}>visibility_off</span>
            <p>Set up your portfolio slug in Profile to enable live preview.</p>
          </div>
        )}
      </div>

    </div>
  )
}