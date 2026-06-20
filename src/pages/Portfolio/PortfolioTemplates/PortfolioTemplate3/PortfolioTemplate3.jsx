import { useEffect, useRef, useState } from 'react'
import styles from './PortfolioTemplate3.module.css'

function serviceAreaLabel(area) {
  if (!area) return ''
  if (typeof area === 'string') return area
  if (Array.isArray(area)) return area.slice(0, 2).join(' · ')
  return ''
}

function Reveal({ children, className = '', delay = 0, tag: Tag = 'div' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!('IntersectionObserver' in window)) {
      el.classList.add(styles.revealed)
      return
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.revealed)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}

function StarRating({ rating }) {
  return (
    <span className={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? styles.starOn : styles.starOff}>★</span>
      ))}
    </span>
  )
}

export function PortfolioTemplate3({ brand, photos = [], garmentTypes = [], reviews = [] }) {
  const [scrolled, setScrolled] = useState(false)

  const {
    brandName = 'Studio',
    brandBio = '',
    brandEmail = '',
    brandWhatsapp = '',
    brandPhone = '',
    brandInstagram = '',
    brandLogo = null,
    portfolioBgImage = null,
    portfolioHeroSubtitle = 'Bespoke Tailoring',
    brandServiceArea = [],
  } = brand || {}

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const defaultTypes = ['Bespoke Suits', 'Evening Gowns', 'Bridal Wear', 'Ankara Styles', 'Corporate Wear']
  const tickerItems = garmentTypes.length > 0 ? garmentTypes : defaultTypes
  const tickerRow = [...tickerItems, ...tickerItems, ...tickerItems]

  const galleryPhotos = photos.slice(0, 6)
  const featuredReview = reviews[0] ?? null
  const secondaryReviews = reviews.slice(1, 4)

  const whatsappUrl = brandWhatsapp
    ? `https://wa.me/${brandWhatsapp.replace(/\D/g, '')}`
    : null
  const instagramUrl = brandInstagram
    ? `https://instagram.com/${brandInstagram.replace(/^@/, '')}`
    : null
  const primaryCta = whatsappUrl ?? (brandEmail ? `mailto:${brandEmail}` : '#')
  const locationLabel = serviceAreaLabel(brandServiceArea)

  return (
    <div className={styles.root}>

      <header className={`${styles.header} ${scrolled ? styles.solid : ''}`}>
        <div className={styles.hInner}>
          <a href='#hero' className={styles.hBrand}>
            {brandLogo
              ? <img src={brandLogo} alt={brandName} className={styles.hLogo} />
              : brandName}
          </a>
          <nav className={styles.hNav}>
            {instagramUrl && (
              <a href={instagramUrl} target='_blank' rel='noopener noreferrer' className={styles.hLink}>
                Instagram
              </a>
            )}
            <a
              href={primaryCta}
              target={whatsappUrl ? '_blank' : undefined}
              rel='noopener noreferrer'
              className={`${styles.hLink} ${styles.hBook}`}
            >
              Book Now
            </a>
          </nav>
        </div>
      </header>

      <section id='hero' className={styles.hero}>
        <div className={styles.heroDark}>
          <div className={styles.heroContent}>
            {locationLabel && (
              <span className={styles.heroEyebrow}>{locationLabel}</span>
            )}
            <h1 className={styles.heroTitle}>{brandName}</h1>
            <p className={styles.heroSub}>{portfolioHeroSubtitle}</p>
            <a
              href={primaryCta}
              target={whatsappUrl ? '_blank' : undefined}
              rel='noopener noreferrer'
              className={styles.heroBtn}
            >
              Start Your Order <span aria-hidden='true'>→</span>
            </a>
          </div>
          <div className={styles.heroScroll} aria-hidden='true'>
            <span className={styles.heroScrollLine} />
            <span className={styles.heroScrollText}>scroll</span>
          </div>
        </div>
        <div className={styles.heroRight}>
          {portfolioBgImage
            ? <img src={portfolioBgImage} alt='' className={styles.heroImg} />
            : (
              <div className={styles.heroPlaceholder}>
                <span>Hero Image</span>
              </div>
            )}
        </div>
      </section>

      <div className={styles.ticker} aria-hidden='true'>
        <div className={styles.tickerTrack}>
          {tickerRow.map((item, i) => (
            <span key={i} className={styles.tickerItem}>
              {item}
              <span className={styles.tickerDot}>×</span>
            </span>
          ))}
        </div>
      </div>

      <section className={styles.about} id='about'>
        <div className={styles.aboutInner}>
          <div className={styles.aboutStats}>
            {[
              { num: `${garmentTypes.length || 12}+`, label: 'Garment Types' },
              { num: `${photos.length || 80}+`, label: 'Pieces Created' },
              { num: `${reviews.length || 40}+`, label: 'Happy Clients' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100} className={styles.statRow}>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </Reveal>
            ))}
          </div>
          <div className={styles.aboutText}>
            <Reveal>
              <span className={styles.aboutEyebrow}>About the Studio</span>
            </Reveal>
            <Reveal delay={80}>
              <p className={styles.aboutBio}>
                {brandBio || 'Crafting bespoke garments with precision, passion, and artistry. Every stitch tells a story of care and craftsmanship.'}
              </p>
            </Reveal>
            {locationLabel && (
              <Reveal delay={160}>
                <span className={styles.aboutLocation}>◎ {locationLabel}</span>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {galleryPhotos.length > 0 && (
        <section className={styles.gallery} id='gallery'>
          <div className={styles.galleryHead}>
            <Reveal>
              <span className={styles.galleryEyebrow}>Portfolio</span>
              <h2 className={styles.galleryTitle}>Selected Works</h2>
            </Reveal>
          </div>
          <div className={styles.galleryGrid}>
            {galleryPhotos.map((p, i) => (
              <Reveal
                key={p.id ?? i}
                delay={(i % 2) * 100}
                className={`${styles.galleryCell} ${styles[`gc${i}`]}`}
              >
                <div className={styles.galleryImgBox}>
                  <img src={p.url} alt={p.caption ?? `Work ${i + 1}`} className={styles.galleryImg} />
                  {p.caption && (
                    <div className={styles.galleryCap}>
                      <span>{p.caption}</span>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {garmentTypes.length > 0 && (
        <section className={styles.services} id='services'>
          <div className={styles.servicesInner}>
            <Reveal className={styles.servicesLeft}>
              <span className={styles.servicesEyebrow}>What We Make</span>
              <h2 className={styles.servicesTitle}>Our<br />Specialties</h2>
            </Reveal>
            <ul className={styles.servicesList}>
              {garmentTypes.map((type, i) => (
                <Reveal key={i} delay={i * 55} tag='li' className={styles.svcItem}>
                  <span className={styles.svcName}>{type}</span>
                  <span className={styles.svcNum}>{String(i + 1).padStart(2, '0')}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className={styles.reviews} id='reviews'>
          <div className={styles.reviewsInner}>
            <Reveal>
              <span className={styles.reviewsEyebrow}>Client Words</span>
            </Reveal>
            {featuredReview && (
              <Reveal delay={60} className={styles.reviewFeatured}>
                <blockquote className={styles.reviewQuote}>
                  "{featuredReview.reviewText}"
                </blockquote>
                <div className={styles.reviewMeta}>
                  <span className={styles.reviewerName}>— {featuredReview.reviewerName}</span>
                  {featuredReview.rating && <StarRating rating={featuredReview.rating} />}
                </div>
              </Reveal>
            )}
            {secondaryReviews.length > 0 && (
              <div className={styles.reviewCards}>
                {secondaryReviews.map((r, i) => (
                  <Reveal key={r.id ?? i} delay={i * 80} className={styles.reviewCard}>
                    {r.rating && <StarRating rating={r.rating} />}
                    <p className={styles.reviewCardText}>"{r.reviewText}"</p>
                    <span className={styles.reviewCardName}>— {r.reviewerName}</span>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className={styles.cta}>
        <Reveal className={styles.ctaInner}>
          <span className={styles.ctaEyebrow}>Ready to Begin?</span>
          <h2 className={styles.ctaTitle}>Let's Create<br />Something Beautiful</h2>
          <div className={styles.ctaBtns}>
            {whatsappUrl && (
              <a href={whatsappUrl} target='_blank' rel='noopener noreferrer' className={styles.ctaBtn}>
                Chat on WhatsApp
              </a>
            )}
            {brandEmail && (
              <a href={`mailto:${brandEmail}`} className={`${styles.ctaBtn} ${styles.ctaBtnGhost}`}>
                Send an Email
              </a>
            )}
          </div>
        </Reveal>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerBrand}>{brandName}</span>
          <div className={styles.footerLinks}>
            {instagramUrl && (
              <a href={instagramUrl} target='_blank' rel='noopener noreferrer' className={styles.footerLink}>
                Instagram
              </a>
            )}
            {brandEmail && (
              <a href={`mailto:${brandEmail}`} className={styles.footerLink}>{brandEmail}</a>
            )}
            {brandPhone && (
              <a href={`tel:${brandPhone}`} className={styles.footerLink}>{brandPhone}</a>
            )}
          </div>
          <span className={styles.footerPowered}>Powered by TailorPady</span>
        </div>
      </footer>

    </div>
  )
}