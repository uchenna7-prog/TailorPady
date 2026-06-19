import { useEffect, useRef, useState } from 'react'
import styles from './PortfolioTemplate4.module.css'

export function PortfolioTemplate4({ brand = {}, photos = [], garmentTypes = [], reviews = [] }) {
  const [activePhoto, setActivePhoto] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [reviewIndex, setReviewIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const galleryRef = useRef(null)

  const brandName = brand.brandName || brand.businessName || brand.name || 'Atelier'
  const tagline = brand.tagline || brand.bio || brand.about || 'Garments built to measure, finished by hand.'
  const logo = brand.logo || brand.logoUrl
  const heroImage = brand.heroImage || brand.heroBackgroundUrl || photos[0]?.url
  const footerImage = brand.footerImage || brand.footerBackgroundUrl || photos[1]?.url
  const address = brand.address || brand.location
  const whatsapp = brand.whatsapp || brand.whatsappNumber || brand.phone
  const instagram = brand.instagram || brand.instagramHandle
  const email = brand.email

  const filters = ['All', ...garmentTypes]
  const filteredPhotos = activeFilter === 'All'
    ? photos
    : photos.filter(p => (p.garmentType || p.type) === activeFilter)

  useEffect(() => {
    setRevealed(true)
  }, [])

  useEffect(() => {
    if (reviews.length < 2) return
    const id = setInterval(() => {
      setReviewIndex(i => (i + 1) % reviews.length)
    }, 6000)
    return () => clearInterval(id)
  }, [reviews.length])

  useEffect(() => {
    if (!activePhoto) return
    const onKey = e => {
      if (e.key === 'Escape') setActivePhoto(null)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [activePhoto])

  const whatsappLink = whatsapp
    ? `https://wa.me/${String(whatsapp).replace(/[^0-9]/g, '')}`
    : null

  const activeReview = reviews[reviewIndex]

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.navMark}>{brandName}</span>
          <nav className={styles.navLinks}>
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className={`${styles.hero} ${revealed ? styles.revealed : ''}`}>
        <div className={styles.heroGrid}>
          <h1 className={styles.heroName}>
            {brandName.split(' ').map((word, i) => (
              <span key={i} className={styles.heroWord}>
                <span className={styles.heroWordInner} style={{ transitionDelay: `${i * 90}ms` }}>
                  {word}
                </span>
              </span>
            ))}
          </h1>
          <div className={styles.heroMeta}>
            <p className={styles.heroTagline}>{tagline}</p>
            {address && <p className={styles.heroLocation}>{address}</p>}
          </div>
        </div>
        {heroImage && (
          <div className={styles.heroImageWrap}>
            <img src={heroImage} alt={brandName} className={styles.heroImage} />
          </div>
        )}
      </section>

      {garmentTypes.length > 0 && (
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {[...garmentTypes, ...garmentTypes].map((type, i) => (
              <span key={i} className={styles.marqueeItem}>
                {type}
                <span className={styles.marqueeDot} />
              </span>
            ))}
          </div>
        </div>
      )}

      <section id="work" className={styles.work}>
        <div className={styles.workHead}>
          <h2 className={styles.sectionLabel}>Selected Work</h2>
          {filters.length > 1 && (
            <div className={styles.filters}>
              {filters.map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ''}`}
                  onClick={() => setActiveFilter(f)}
                  type="button"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredPhotos.length > 0 ? (
          <div className={styles.gallery} ref={galleryRef}>
            {filteredPhotos.map((photo, i) => (
              <button
                key={photo.id || i}
                className={`${styles.galleryItem} ${styles['galleryItem' + (i % 5)]}`}
                onClick={() => setActivePhoto(photo)}
                type="button"
              >
                <img src={photo.url} alt={photo.caption || brandName} loading="lazy" />
                {photo.caption && <span className={styles.galleryCaption}>{photo.caption}</span>}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.emptyWork}>
            <p>New work is on the way.</p>
          </div>
        )}
      </section>

      {reviews.length > 0 && (
        <section className={styles.reviews}>
          <span className={styles.sectionLabel}>What Clients Say</span>
          <blockquote className={styles.reviewQuote} key={reviewIndex}>
            <p>{activeReview.comment || activeReview.text}</p>
            <footer>
              <span className={styles.reviewName}>{activeReview.customerName || activeReview.name}</span>
              {activeReview.rating && (
                <span className={styles.reviewStars}>
                  {'★'.repeat(activeReview.rating)}{'☆'.repeat(5 - activeReview.rating)}
                </span>
              )}
            </footer>
          </blockquote>
          {reviews.length > 1 && (
            <div className={styles.reviewDots}>
              {reviews.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.reviewDot} ${i === reviewIndex ? styles.reviewDotActive : ''}`}
                  onClick={() => setReviewIndex(i)}
                  type="button"
                  aria-label={`Show review ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <section id="about" className={styles.about}>
        <div className={styles.aboutInner}>
          {logo && (
            <div className={styles.aboutMark}>
              <img src={logo} alt={brandName} />
            </div>
          )}
          <p className={styles.aboutText}>{tagline}</p>
        </div>
      </section>

      <footer id="contact" className={styles.footer}>
        {footerImage && (
          <div className={styles.footerImageWrap}>
            <img src={footerImage} alt="" className={styles.footerImage} />
          </div>
        )}
        <div className={styles.footerInner}>
          <h2 className={styles.footerHeading}>Start a fitting.</h2>
          <div className={styles.footerLinks}>
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noreferrer" className={styles.footerLink}>
                WhatsApp
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className={styles.footerLink}>
                Email
              </a>
            )}
            {instagram && (
              <a
                href={`https://instagram.com/${String(instagram).replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className={styles.footerLink}
              >
                Instagram
              </a>
            )}
          </div>
          <div className={styles.footerBottom}>
            <span>{brandName}</span>
            {address && <span>{address}</span>}
          </div>
        </div>
      </footer>

      {activePhoto && (
        <div className={styles.lightbox} onClick={() => setActivePhoto(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setActivePhoto(null)}
            type="button"
            aria-label="Close"
          >
            Close
          </button>
          <img
            src={activePhoto.url}
            alt={activePhoto.caption || brandName}
            className={styles.lightboxImage}
            onClick={e => e.stopPropagation()}
          />
          {activePhoto.caption && (
            <span className={styles.lightboxCaption}>{activePhoto.caption}</span>
          )}
        </div>
      )}
    </div>
  )
}