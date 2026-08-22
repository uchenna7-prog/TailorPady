import styles from './LookbookTemplate.module.css'

function formatPrice(price) {
  if (!price) return null
  return `₦${price}`
}

export function LookbookTemplate({ photos, profileSettings }) {
  const brandName    = profileSettings?.brandName || 'Design Lookbook'
  const brandTagline = profileSettings?.brandTagline
  const brandLogo    = profileSettings?.brandLogo
  const brandColour  = profileSettings?.brandColour || '#0A0A0A'
  const brandPhone   = profileSettings?.brandPhone
  const brandEmail   = profileSettings?.brandEmail
  const brandAddress = profileSettings?.brandAddress

  const hasContact = brandPhone || brandEmail || brandAddress

  return (
    <div className={styles.page} style={{ '--accent': brandColour }}>
      <div className={styles.header}>
        {brandLogo && <img src={brandLogo} alt={brandName} className={styles.logo} />}
        <div className={styles.brandBlock}>
          <p className={styles.brandName}>{brandName}</p>
          {brandTagline && <p className={styles.brandTagline}>{brandTagline}</p>}
        </div>
      </div>

      <p className={styles.docTitle}>Design Lookbook</p>

      <div className={styles.grid}>
        {photos.map(photo => (
          <div key={photo.id} className={styles.card}>
            <img
              src={photo.storageUrl || photo.src}
              alt={photo.caption || 'design'}
              className={styles.cardImg}
            />
            <div className={styles.cardBody}>
              {photo.clothingTypeLabel && <p className={styles.cardType}>{photo.clothingTypeLabel}</p>}
              {photo.caption && <p className={styles.cardCaption}>{photo.caption}</p>}
              {photo.price && <p className={styles.cardPrice}>{formatPrice(photo.price)}</p>}
            </div>
          </div>
        ))}
      </div>

      {hasContact && (
        <div className={styles.footer}>
          <p className={styles.footerTitle}>Get in touch</p>
          {brandPhone && <p className={styles.footerLine}>{brandPhone}</p>}
          {brandEmail && <p className={styles.footerLine}>{brandEmail}</p>}
          {brandAddress && <p className={styles.footerLine}>{brandAddress}</p>}
        </div>
      )}
    </div>
  )
}
