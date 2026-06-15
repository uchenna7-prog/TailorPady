import { useState, useEffect, useRef } from 'react'
import { useBrandTokens } from '../../../../hooks/useBrandTokens'
import styles from './PortfolioTemplate2.module.css'

// ─── helpers ────────────────────────────────────────────────────────────────

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function buildSocialUrl(platform, handle) {
  const h = handle.replace(/^@/, '')
  const map = {
    instagram: `https://instagram.com/${h}`,
    tiktok:    `https://tiktok.com/@${h}`,
    facebook:  `https://facebook.com/${h}`,
    twitter:   `https://x.com/${h}`,
    youtube:   `https://youtube.com/@${h}`,
    pinterest: `https://pinterest.com/${h}`,
    threads:   `https://threads.net/@${h}`,
  }
  return map[platform] || `https://${h}`
}

const SOCIAL_ICONS = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  tiktok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  twitter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.849L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  ),
  pinterest: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  ),
  threads: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068c0-3.51.85-6.37 2.495-8.424C5.845 1.341 8.598.16 12.18.136h.014c2.744.018 5.143.854 6.928 2.417 1.688 1.476 2.697 3.54 2.997 6.135l-2.172.255c-.527-4.499-3.224-6.64-7.769-6.64h-.01c-2.898.018-5.119.929-6.601 2.706C4.085 6.713 3.342 9.13 3.342 12.07c0 2.936.743 5.351 2.212 7.195 1.482 1.777 3.703 2.688 6.601 2.706h.01c2.558-.016 4.242-.684 5.467-2.165.853-1.02 1.428-2.479 1.703-4.337-.937.22-1.952.331-3.023.317-2.667-.035-4.879-.917-6.157-2.473-1.126-1.37-1.584-3.168-1.29-5.063.559-3.584 3.297-5.896 7.045-5.896h.047c2.075.014 3.87.654 5.19 1.851 1.435 1.3 2.219 3.166 2.269 5.408.033 1.462-.22 2.786-.752 3.936l-1.953-.84c.41-.953.6-2.03.572-3.165-.037-1.704-.584-3.071-1.581-3.965-.869-.787-2.106-1.196-3.731-1.206h-.034c-2.798 0-4.677 1.598-5.076 4.153-.235 1.503.089 2.856.909 3.83.889 1.052 2.302 1.654 4.16 1.68 1.43.019 2.701-.26 3.715-.697-.054-.53-.155-1.025-.3-1.474-.45-1.388-1.402-2.17-2.705-2.17-.876 0-1.611.34-2.139.982-.5.605-.74 1.434-.68 2.33l-2.16-.15c-.089-1.346.334-2.636 1.175-3.638.886-1.055 2.173-1.637 3.804-1.637 2.248 0 3.845 1.28 4.565 3.542.247.762.377 1.604.387 2.498z"/>
    </svg>
  ),
}

const WA_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({ photo, photos, onClose }) {
  const [idx, setIdx] = useState(() => photos.findIndex(p => p.id === photo.id))
  const current = photos[idx] || photo

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, photos.length - 1))
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [photos, onClose])

  return (
    <div className={styles.lbOverlay} onClick={onClose}>
      <div className={styles.lbInner} onClick={e => e.stopPropagation()}>
        <button className={styles.lbClose} onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {idx > 0 && (
          <button className={`${styles.lbNav} ${styles.lbNavPrev}`} onClick={() => setIdx(i => i - 1)} aria-label="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}

        <div className={styles.lbFrame}>
          <img src={current.src || current.storageUrl} alt={current.caption || ''} className={styles.lbImg} />
          {(current.caption || current.price) && (
            <div className={styles.lbMeta}>
              {current.clothingTypeLabel && <span className={styles.lbType}>{current.clothingTypeLabel}</span>}
              {current.caption && <p className={styles.lbCaption}>{current.caption}</p>}
              {current.price && <p className={styles.lbPrice}>From ₦{current.price}</p>}
            </div>
          )}
        </div>

        {idx < photos.length - 1 && (
          <button className={`${styles.lbNav} ${styles.lbNavNext}`} onClick={() => setIdx(i => i + 1)} aria-label="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}

        <div className={styles.lbCount}>{idx + 1} / {photos.length}</div>
      </div>
    </div>
  )
}

// ─── Order Modal ─────────────────────────────────────────────────────────────

function OrderModal({ isOpen, onClose, brandName, brandEmail, brandPhone }) {
  const [step,     setStep]     = useState(1)
  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [garment,  setGarment]  = useState('')
  const [deadline, setDeadline] = useState('')
  const [message,  setMessage]  = useState('')
  const [done,     setDone]     = useState(false)
  const [visible,  setVisible]  = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10)
      document.body.style.overflow = 'hidden'
    } else {
      setVisible(false)
      document.body.style.overflow = ''
      setTimeout(() => { setStep(1); setDone(false) }, 400)
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const handleSend = () => {
    const dl = deadline ? `%0ADeadline: ${deadline}` : ''
    const msg = `Hello ${brandName},%0A%0AOrder enquiry:%0A%0AName: ${name}%0APhone: ${phone}%0AGarment: ${garment}${dl}%0ADetails: ${message}`
    if (brandPhone) {
      window.open(`https://wa.me/${brandPhone.replace(/\D/g, '')}?text=${msg}`, '_blank', 'noopener,noreferrer')
    } else if (brandEmail) {
      window.open(`mailto:${brandEmail}?subject=Order Enquiry&body=${decodeURIComponent(msg.replace(/%0A/g, '\n'))}`)
    }
    setDone(true)
    setTimeout(() => { onClose() }, 2600)
  }

  const canNext = name.trim() && phone.trim()
  const canSend = garment.trim() || message.trim()

  return (
    <div className={`${styles.modal} ${visible ? styles.modalIn : ''}`} onClick={onClose}>
      <div className={styles.modalSheet} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {done ? (
          <div className={styles.modalDone}>
            <div className={styles.modalDoneCheck}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className={styles.modalDoneTitle}>Order request sent</p>
            <p className={styles.modalDoneSub}>{brandName} will reach out to you shortly.</p>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <div className={styles.modalSteps}>
                <span className={`${styles.modalStep} ${step >= 1 ? styles.modalStepActive : ''}`}>Contact</span>
                <div className={styles.modalStepLine} />
                <span className={`${styles.modalStep} ${step >= 2 ? styles.modalStepActive : ''}`}>Details</span>
              </div>
              <p className={styles.modalTitle}>
                {step === 1 ? 'Who are you?' : 'What do you need?'}
              </p>
            </div>

            {step === 1 && (
              <div className={styles.modalFields}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Your full name</label>
                  <input className={styles.modalInput} value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" autoFocus />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Phone number</label>
                  <input className={styles.modalInput} value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0812 345 6789" type="tel" />
                </div>
                <button className={styles.modalNext} onClick={() => setStep(2)} disabled={!canNext}>
                  Continue
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className={styles.modalFields}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Garment type</label>
                  <input className={styles.modalInput} value={garment} onChange={e => setGarment(e.target.value)} placeholder="Suit, gown, agbada…" autoFocus />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Occasion date</label>
                  <input className={styles.modalInput} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ colorScheme: 'dark' }} />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Details — fabric, colours, measurements</label>
                  <textarea className={styles.modalTextarea} rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="The more detail, the better." />
                </div>
                <div className={styles.modalActions}>
                  <button className={styles.modalBack} onClick={() => setStep(1)}>Back</button>
                  <button className={styles.modalSend} onClick={handleSend} disabled={!canSend}>
                    Send request
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
                {brandPhone && (
                  <a href={`https://wa.me/${brandPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.modalWa}>
                    {WA_ICON} Skip form — chat on WhatsApp
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Marquee ─────────────────────────────────────────────────────────────────

function Marquee({ text, count = 5 }) {
  const content = Array.from({ length: count }, () => text).join(' · ')
  return (
    <div className={styles.marqueeOuter} aria-hidden="true">
      <div className={styles.marqueeTrack}>
        <span className={styles.marqueeText}>{content} · </span>
        <span className={styles.marqueeText} aria-hidden="true">{content} · </span>
      </div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function PortfolioTemplate2({ brand, photos, garmentTypes, reviews }) {
  const [activeFilter, setActiveFilter] = useState(null)
  const [lightbox,     setLightbox]     = useState(null)
  const [orderOpen,    setOrderOpen]    = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [scrollY,      setScrollY]      = useState(0)

  useBrandTokens(brand?.brandColourId)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const brandName     = brand?.brandName    || 'The Studio'
  const tagline       = brand?.brandTagline || ''
  const brandBio      = brand?.brandBio     || ''
  const foundedYear   = brand?.brandFoundedYear || ''
  const turnaround    = brand?.brandTurnaround  || ''
  const serviceArea   = brand?.brandServiceArea  || ''
  const styleStatement    = brand?.brandStyleStatement    || ''
  const featuredTechnique = brand?.brandFeaturedTechnique || ''
  const milestone         = brand?.brandMilestone         || ''
  const availability      = brand?.brandAvailability      || 'open'
  const availableUntil    = brand?.brandAvailableUntil    || ''

  const completedPhotos = photos.filter(p => p.category === 'completed_works')
  const filteredPhotos  = activeFilter
    ? completedPhotos.filter(p => p.clothingType === activeFilter)
    : completedPhotos

  const yearsActive  = foundedYear ? new Date().getFullYear() - parseInt(foundedYear) : null
  const statGarments = milestone || (completedPhotos.length ? `${completedPhotos.length}+` : null)
  const navScrolled  = scrollY > 60

  // Bento layout: position 0=large, 1=tall, 2=small, 3=wide, 4=small, loop
  const bentoClass = (i) => {
    const p = i % 5
    if (p === 0) return styles.bentoLarge
    if (p === 1) return styles.bentoTall
    if (p === 3) return styles.bentoWide
    return styles.bentoSmall
  }

  return (
    <div className={styles.root}>

      {/* ── Nav ── */}
      <header className={`${styles.nav} ${navScrolled ? styles.navSolid : ''}`}>
        <div className={styles.navInner}>
          <div className={styles.navBrand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {brand?.brandLogo
              ? <img src={brand.brandLogo} alt={brandName} className={styles.navLogo} />
              : <span className={styles.navLogoText}>{initials(brandName)}</span>
            }
          </div>

          <nav className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            {[
              ['Works',   '#works'],
              ['About',   '#about'],
              ['Contact', '#contact'],
            ].map(([label, href]) => (
              <a key={label} href={href} className={styles.navLink}
                onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
            <button className={styles.navOrderMobile} onClick={() => { setMenuOpen(false); setOrderOpen(true) }}>
              Place an order
            </button>
          </nav>

          <div className={styles.navRight}>
            <button className={styles.navOrder} onClick={() => setOrderOpen(true)}>
              Place an order
            </button>
            <button className={styles.navMenu} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <span className={`${styles.menuLine} ${menuOpen ? styles.menuLineTopX : ''}`} />
              <span className={`${styles.menuLine} ${menuOpen ? styles.menuLineBotX : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero — split: text left, image right ── */}
      <section className={styles.hero}>
        {/* Left text column */}
        <div className={styles.heroLeft}>
          <div className={styles.heroLeftInner}>
            <div className={styles.heroStatus}>
              {availability === 'open'
                ? <><span className={styles.heroPulse} /><span>Available for orders</span></>
                : <span>{availableUntil
                    ? `Booked until ${new Date(availableUntil).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
                    : 'Currently booked'
                  }</span>
              }
            </div>

            <h1 className={styles.heroName}>
              {brandName.split(' ').map((word, i) => (
                <span key={i} className={styles.heroNameWord}>{word}</span>
              ))}
            </h1>

            {tagline && <p className={styles.heroTagline}>{tagline}</p>}

            <div className={styles.heroCtas}>
              <button className={styles.heroPrimary} onClick={() => setOrderOpen(true)}>
                Commission a piece
              </button>
              <a href="#works" className={styles.heroSecondary}>
                View works
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
              </a>
            </div>

            <div className={styles.heroStats}>
              {statGarments && (
                <div className={styles.heroStat}>
                  <span className={styles.heroStatN}>{statGarments}</span>
                  <span className={styles.heroStatL}>Garments</span>
                </div>
              )}
              {yearsActive && (
                <div className={styles.heroStat}>
                  <span className={styles.heroStatN}>{yearsActive}+</span>
                  <span className={styles.heroStatL}>Years</span>
                </div>
              )}
              {turnaround && (
                <div className={styles.heroStat}>
                  <span className={styles.heroStatN}>{turnaround}</span>
                  <span className={styles.heroStatL}>Turnaround</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right image column */}
        <div className={styles.heroRight}>
          <div className={styles.heroImageWrap}>
            {brand?.heroBgImage
              ? <img src={brand.heroBgImage} alt="" className={styles.heroImage} />
              : <div className={styles.heroImageFallback}>
                  <span className={styles.heroFallbackText}>{initials(brandName)}</span>
                </div>
            }
            <div className={styles.heroImageVeil} />
          </div>
          {serviceArea && (
            <div className={styles.heroLocation}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {serviceArea}
            </div>
          )}
        </div>
      </section>

      {/* ── Marquee divider ── */}
      <Marquee text={brandName} />

      {/* ── Works ── */}
      <section className={styles.works} id="works">
        <div className={styles.worksTop}>
          <div className={styles.worksHeadline}>
            <span className={styles.label}>Portfolio</span>
            <h2 className={styles.worksTitle}>Selected Works</h2>
          </div>
          {garmentTypes.length > 0 && (
            <div className={styles.filters}>
              <button
                className={`${styles.filter} ${!activeFilter ? styles.filterOn : ''}`}
                onClick={() => setActiveFilter(null)}
              >All</button>
              {garmentTypes.map(t => (
                <button
                  key={t.id}
                  className={`${styles.filter} ${activeFilter === t.id ? styles.filterOn : ''}`}
                  onClick={() => setActiveFilter(t.id)}
                >{t.label}</button>
              ))}
            </div>
          )}
        </div>

        {filteredPhotos.length === 0 ? (
          <div className={styles.empty}>
            <p>No works in this category yet.</p>
          </div>
        ) : (
          <div className={styles.bento}>
            {filteredPhotos.map((photo, i) => (
              <div
                key={photo.id}
                className={`${styles.bentoCard} ${bentoClass(i)}`}
                onClick={() => setLightbox(photo)}
                style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
              >
                <img
                  src={photo.src || photo.storageUrl}
                  alt={photo.caption || ''}
                  className={styles.bentoImg}
                  loading="lazy"
                />
                <div className={styles.bentoOverlay}>
                  <div className={styles.bentoCopy}>
                    {photo.clothingTypeLabel && <span className={styles.bentoType}>{photo.clothingTypeLabel}</span>}
                    {photo.caption && <p className={styles.bentoCap}>{photo.caption}</p>}
                    {photo.price && <span className={styles.bentoPrice}>From ₦{photo.price}</span>}
                  </div>
                  <div className={styles.bentoIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Statement quote strip ── */}
      {styleStatement && (
        <div className={styles.quoteStrip}>
          <blockquote className={styles.quoteText}>
            <span className={styles.quoteMark}>"</span>
            {styleStatement}
            <span className={styles.quoteMark}>"</span>
          </blockquote>
          <p className={styles.quoteBy}>— {brandName}</p>
        </div>
      )}

      {/* ── About ── */}
      <section className={styles.about} id="about">
        <div className={styles.aboutInner}>
          <div className={styles.aboutMedia}>
            <div className={styles.aboutImgWrap}>
              {brand?.footerBgImage
                ? <img src={brand.footerBgImage} alt="" className={styles.aboutImg} />
                : <div className={styles.aboutImgFallback}>
                    <span className={styles.aboutInitials}>{initials(brandName)}</span>
                  </div>
              }
            </div>

            <div className={styles.aboutDataCard}>
              {foundedYear && <div className={styles.aboutDatum}><span className={styles.aboutDatumN}>{foundedYear}</span><span className={styles.aboutDatumL}>Founded</span></div>}
              {statGarments && <div className={styles.aboutDatum}><span className={styles.aboutDatumN}>{statGarments}</span><span className={styles.aboutDatumL}>Garments</span></div>}
              {yearsActive && <div className={styles.aboutDatum}><span className={styles.aboutDatumN}>{yearsActive}+</span><span className={styles.aboutDatumL}>Years</span></div>}
            </div>
          </div>

          <div className={styles.aboutText}>
            <span className={styles.label}>About the maker</span>
            <h2 className={styles.aboutName}>{brandName}</h2>
            {tagline && <p className={styles.aboutTagline}>{tagline}</p>}

            {brandBio && <p className={styles.aboutBio}>{brandBio}</p>}

            <div className={styles.aboutMeta}>
              {serviceArea && (
                <div className={styles.aboutMetaRow}>
                  <span className={styles.aboutMetaKey}>Location</span>
                  <span className={styles.aboutMetaVal}>{serviceArea}</span>
                </div>
              )}
              {turnaround && (
                <div className={styles.aboutMetaRow}>
                  <span className={styles.aboutMetaKey}>Turnaround</span>
                  <span className={styles.aboutMetaVal}>{turnaround}</span>
                </div>
              )}
              {featuredTechnique && (
                <div className={styles.aboutMetaRow}>
                  <span className={styles.aboutMetaKey}>Signature</span>
                  <span className={styles.aboutMetaVal}>{featuredTechnique}</span>
                </div>
              )}
            </div>

            {garmentTypes.length > 0 && (
              <div className={styles.aboutTags}>
                {garmentTypes.map(t => (
                  <span key={t.id} className={styles.aboutTag}>{t.label}</span>
                ))}
              </div>
            )}

            <button className={styles.aboutCta} onClick={() => setOrderOpen(true)}>
              Commission a piece
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {reviews.length > 0 && (
        <section className={styles.reviews}>
          <div className={styles.reviewsHead}>
            <span className={styles.label}>Testimonials</span>
            <h2 className={styles.reviewsTitle}>Client stories</h2>
          </div>
          <div className={styles.reviewsTrack}>
            {reviews.map(r => (
              <article key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewStars}>
                  {[1,2,3,4,5].map(n => (
                    <svg key={n} width="11" height="11" viewBox="0 0 24 24"
                      fill={n <= r.rating ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="1.5"
                      className={n <= r.rating ? styles.starOn : styles.starOff}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p className={styles.reviewText}>"{r.review}"</p>
                <footer className={styles.reviewFooter}>
                  <div className={styles.reviewAvatar}>{(r.customerName || '?')[0].toUpperCase()}</div>
                  <span className={styles.reviewName}>{r.customerName}</span>
                </footer>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Contact ── */}
      <section className={styles.contact} id="contact">
        <div className={styles.contactInner}>
          <div className={styles.contactLeft}>
            <span className={styles.labelLight}>Commission</span>
            <h2 className={styles.contactTitle}>
              Ready to create<br />something together?
            </h2>
            <p className={styles.contactSub}>
              Every great garment starts with a conversation. Get in touch and let's bring your vision to life.
            </p>
            <button className={styles.contactCta} onClick={() => setOrderOpen(true)}>
              Place an order
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>

          <div className={styles.contactRight}>
            <div className={styles.contactCard}>
              {brand?.brandLogo
                ? <img src={brand.brandLogo} alt={brandName} className={styles.contactLogoImg} />
                : <div className={styles.contactLogoInitials}>{initials(brandName)}</div>
              }
              <p className={styles.contactBrand}>{brandName}</p>
              {tagline && <p className={styles.contactTag}>{tagline}</p>}

              <div className={styles.contactInfo}>
                {brand?.brandAddress && (
                  <div className={styles.contactRow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{brand.brandAddress}</span>
                  </div>
                )}
                {brand?.brandPhone && (
                  <a href={`tel:${brand.brandPhone}`} className={styles.contactRow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.27-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>{brand.brandPhone}</span>
                  </a>
                )}
                {brand?.brandEmail && (
                  <a href={`mailto:${brand.brandEmail}`} className={styles.contactRow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>{brand.brandEmail}</span>
                  </a>
                )}
              </div>

              <div className={styles.socials}>
                {brand?.brandPhone && (
                  <a href={`https://wa.me/${brand.brandPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="WhatsApp">
                    {WA_ICON}
                  </a>
                )}
                {(brand?.brandSocials || []).map((s, i) => (
                  <a key={i} href={buildSocialUrl(s.platform, s.handle)} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label={s.platform}>
                    {SOCIAL_ICONS[s.platform] || null}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            <p className={styles.footerBrand}>{brandName}</p>
            {tagline && <p className={styles.footerTagline}>{tagline}</p>}
          </div>
          <div className={styles.footerLinks}>
            <a href="#works" className={styles.footerLink}>Works</a>
            <a href="#about" className={styles.footerLink}>About</a>
            <a href="#contact" className={styles.footerLink}>Contact</a>
          </div>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} {brandName}
            <span className={styles.footerSep}>·</span>
            Powered by <span className={styles.footerMark}>TailorPady</span>
          </p>
        </div>
      </footer>

      {/* ── Lightbox ── */}
      {lightbox && (
        <Lightbox photo={lightbox} photos={filteredPhotos} onClose={() => setLightbox(null)} />
      )}

      {/* ── Order modal ── */}
      <OrderModal
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        brandName={brandName}
        brandEmail={brand?.brandEmail}
        brandPhone={brand?.brandPhone}
      />
    </div>
  )
}