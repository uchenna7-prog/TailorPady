import { useEffect, useRef, useState } from 'react'
import styles from './PortfolioTemplate4.module.css'

function buildFaqItems(turnaround, address) {
  return [
    {
      q: 'How long does a commission take?',
      a: turnaround
        ? `Most pieces are completed within ${turnaround}, depending on the complexity of the design.`
        : 'Turnaround varies by garment and season — a timeline is confirmed once your order is understood.',
    },
    {
      q: address ? `Do you take commissions outside ${address}?` : 'Do you take commissions outside your base?',
      a: 'Yes. Remote measurement guidance and courier delivery can be arranged for clients further afield.',
    },
    {
      q: 'How do I pay for my order?',
      a: 'A deposit secures your slot, with the balance due before or on collection. Payment details follow confirmation.',
    },
    {
      q: 'Can changes be made after measurements are taken?',
      a: 'Minor adjustments are always possible at the fitting stage. Larger design changes may affect timeline and cost.',
    },
  ]
}

const CHEV_SVG = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6"/>
  </svg>
)

function FaqItem({ index, item, openIndex, onToggle }) {
  const isOpen = openIndex === index
  return (
    <div className={styles.faqRow}>
      <button className={styles.faqQuestion} onClick={() => onToggle(isOpen ? null : index)} aria-expanded={isOpen} type="button">
        <span>{item.q}</span>
        <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}>{CHEV_SVG}</span>
      </button>
      <div className={`${styles.faqAnswerWrap} ${isOpen ? styles.faqAnswerWrapOpen : ''}`}>
        <p className={styles.faqAnswer}>{item.a}</p>
      </div>
    </div>
  )
}

function BookingSheet({ isOpen, onClose, brandName, email, whatsappLink }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [garment, setGarment] = useState('')
  const [deadline, setDeadline] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => setVisible(true))
    else setVisible(false)
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) return
    const deadlineLine = deadline ? `%0ADeadline%3A ${deadline}` : ''
    const msg = `Hello ${brandName},%0A%0AEnquiry.%0A%0AName%3A ${name}%0APhone%3A ${phone}%0AGarment%3A ${garment}${deadlineLine}%0ADetails%3A ${message}`
    if (whatsappLink) {
      window.open(`${whatsappLink}?text=${msg}`, '_blank', 'noopener,noreferrer')
    } else if (email) {
      window.open(`mailto:${email}?subject=Order Enquiry&body=${decodeURIComponent(msg.replace(/%0A/g, '\n'))}`)
    }
    setSent(true)
    setTimeout(() => {
      setSent(false)
      onClose()
      setName('')
      setPhone('')
      setGarment('')
      setDeadline('')
      setMessage('')
    }, 2500)
  }

  return (
    <div
      className={`${styles.bookingOverlay} ${visible ? styles.bookingOverlayVisible : ''}`}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`${styles.bookingDrawer} ${visible ? styles.bookingDrawerVisible : ''}`}>
        <div className={styles.drawerHandle}>
          <span className={styles.drawerHandleBar} />
        </div>
        {sent ? (
          <div className={styles.sentState}>
            <p className={styles.sentTitle}>Enquiry sent</p>
            <p className={styles.sentSub}>{brandName} will be in touch shortly.</p>
          </div>
        ) : (
          <>
            <div className={styles.drawerHead}>
              <div>
                <p className={styles.drawerEyebrow}>Enquiry</p>
                <p className={styles.drawerTitle}>Start a fitting</p>
              </div>
              <button className={styles.drawerClose} onClick={onClose} aria-label="Close" type="button">
                <span className={styles.closeMark} />
              </button>
            </div>
            <div className={styles.drawerBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Full name *</label>
                <input className={styles.fieldInput} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Phone number *</label>
                <input className={styles.fieldInput} placeholder="e.g. 0812 345 6789" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Garment type</label>
                <input className={styles.fieldInput} placeholder="Suit, dress, agbada…" value={garment} onChange={e => setGarment(e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Occasion / deadline date</label>
                <input className={styles.fieldInput} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Additional details</label>
                <textarea className={styles.fieldTextarea} placeholder="Fabric, measurements, colours…" value={message} onChange={e => setMessage(e.target.value)} rows={3} />
              </div>
            </div>
            <div className={styles.drawerFooter}>
              <button className={styles.sendBtn} onClick={handleSubmit} disabled={!name.trim() || !phone.trim()} type="button">
                Send enquiry
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function PortfolioTemplate4({ brand = {}, photos = [], garmentTypes = [], reviews = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [reviewIndex, setReviewIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  const galleryRef = useRef(null)

  const workRef = useRef(null)
  const aboutRef = useRef(null)
  const faqRef = useRef(null)
  const contactRef = useRef(null)

  const brandName = brand.brandName || brand.businessName || brand.name || 'Atelier'
  const tagline = brand.tagline || brand.bio || brand.about || 'Garments built to measure, finished by hand.'
  const logo = brand.logo || brand.logoUrl
  const heroImage = brand.heroImage || brand.heroBackgroundUrl || photos[0]?.url
  const footerImage = brand.footerImage || brand.footerBackgroundUrl || photos[1]?.url
  const address = brand.address || brand.location
  const whatsapp = brand.whatsapp || brand.whatsappNumber || brand.phone
  const instagram = brand.instagram || brand.instagramHandle
  const email = brand.email

  const foundedYear = brand.foundedYear || brand.brandFoundedYear
  const turnaround = brand.turnaround || brand.brandTurnaround
  const availability = brand.availability || brand.brandAvailability || 'open'
  const availableUntil = brand.availableUntil || brand.brandAvailableUntil
  const milestone = brand.milestone || brand.brandMilestone
  const piecesLabel = milestone || (photos.length ? `${photos.length}+` : '0')

  const facts = [
    { label: 'Pieces made', value: piecesLabel },
    foundedYear && { label: 'Since', value: String(foundedYear) },
    address && { label: 'Based in', value: address },
    turnaround && { label: 'Turnaround', value: turnaround },
  ].filter(Boolean)

  const faqItems = buildFaqItems(turnaround, address)

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
    if (lightboxIndex === null) return
    const onKey = e => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i < filteredPhotos.length - 1 ? i + 1 : i))
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i > 0 ? i - 1 : i))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, filteredPhotos.length])

  const whatsappLink = whatsapp
    ? `https://wa.me/${String(whatsapp).replace(/[^0-9]/g, '')}`
    : null

  const activeReview = reviews[reviewIndex]
  const activeLightboxPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null

  const scrollTo = ref => {
    setNavOpen(false)
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToTop = () => {
    setNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <button className={styles.navMark} onClick={scrollToTop} type="button">{brandName}</button>

          <nav className={styles.navLinks}>
            <button onClick={() => scrollTo(workRef)} type="button">Work</button>
            <button onClick={() => scrollTo(aboutRef)} type="button">About</button>
            <button onClick={() => scrollTo(faqRef)} type="button">FAQ</button>
            <button onClick={() => scrollTo(contactRef)} type="button">Contact</button>
          </nav>

          <div className={styles.navActions}>
            <button className={styles.navCta} onClick={() => setBookingOpen(true)} type="button">Enquire</button>
          </div>

          <div className={styles.navMobileTrigger}>
            <button className={styles.navMenuButton} onClick={() => setNavOpen(o => !o)} aria-label="Toggle menu" type="button">
              <span className={navOpen ? styles.menuMarkOpen : styles.menuMark} />
            </button>
          </div>
        </div>

        {navOpen && (
          <div className={styles.navMobilePanel}>
            <button onClick={() => scrollTo(workRef)} type="button">Work</button>
            <button onClick={() => scrollTo(aboutRef)} type="button">About</button>
            <button onClick={() => scrollTo(faqRef)} type="button">FAQ</button>
            <button onClick={() => scrollTo(contactRef)} type="button">Contact</button>
            <button className={styles.navMobileCta} onClick={() => { setNavOpen(false); setBookingOpen(true) }} type="button">Enquire</button>
          </div>
        )}
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
            <p className={styles.heroAvailability}>
              <span className={`${styles.availDot} ${availability === 'open' ? styles.availDotOpen : ''}`} />
              {availability === 'open'
                ? 'Accepting new orders'
                : availableUntil
                  ? `Booked until ${new Date(availableUntil).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
                  : 'Fully booked'}
            </p>
            <button className={styles.heroCta} onClick={() => setBookingOpen(true)} type="button">Start an enquiry</button>
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

      {facts.length > 0 && (
        <section className={styles.stats}>
          <div className={styles.statsInner}>
            {facts.map(fact => (
              <div key={fact.label} className={styles.statCell}>
                <span className={styles.statValue}>{fact.value}</span>
                <span className={styles.statLabel}>{fact.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="work" className={styles.work} ref={workRef}>
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
                onClick={() => setLightboxIndex(i)}
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

      <section id="about" className={styles.about} ref={aboutRef}>
        <div className={styles.aboutInner}>
          {logo && (
            <div className={styles.aboutMark}>
              <img src={logo} alt={brandName} />
            </div>
          )}
          <p className={styles.aboutText}>{tagline}</p>
        </div>
      </section>

      <section id="faq" className={styles.faq} ref={faqRef}>
        <span className={styles.sectionLabel}>Common Questions</span>
        <div className={styles.faqList}>
          {faqItems.map((item, i) => (
            <FaqItem key={item.q} index={i} item={item} openIndex={openFaqIndex} onToggle={setOpenFaqIndex} />
          ))}
        </div>
      </section>

      <footer id="contact" className={styles.footer} ref={contactRef}>
        {footerImage && (
          <div className={styles.footerImageWrap}>
            <img src={footerImage} alt="" className={styles.footerImage} />
          </div>
        )}
        <div className={styles.footerInner}>
          <h2 className={styles.footerHeading}>Start a fitting.</h2>
          <div className={styles.footerLinks}>
            <button className={styles.footerLink} onClick={() => setBookingOpen(true)} type="button">
              Enquire
            </button>
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

      {activeLightboxPhoto && (
        <div className={styles.lightbox} onClick={() => setLightboxIndex(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxIndex(null)}
            type="button"
            aria-label="Close"
          >
            Close
          </button>
          {lightboxIndex > 0 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxNavLeft}`}
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => i - 1) }}
              type="button"
              aria-label="Previous"
            >
              ‹
            </button>
          )}
          {lightboxIndex < filteredPhotos.length - 1 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxNavRight}`}
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => i + 1) }}
              type="button"
              aria-label="Next"
            >
              ›
            </button>
          )}
          <img
            src={activeLightboxPhoto.url}
            alt={activeLightboxPhoto.caption || brandName}
            className={styles.lightboxImage}
            onClick={e => e.stopPropagation()}
          />
          {activeLightboxPhoto.caption && (
            <span className={styles.lightboxCaption}>{activeLightboxPhoto.caption}</span>
          )}
        </div>
      )}

      <BookingSheet
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        brandName={brandName}
        email={email}
        whatsappLink={whatsappLink}
      />
    </div>
  )
}