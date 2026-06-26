import { useState, useEffect, useRef, useCallback } from 'react'
import { useBrandTokens } from '../../../../hooks/useBrandTokens'
import styles from './PortfolioTemplate3.module.css'

const pad = n => String(n).padStart(2, '0')

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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  facebook: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  tiktok: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  twitter: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.849L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  ),
  youtube: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  ),
  pinterest: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  ),
  threads: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068c0-3.51.85-6.37 2.495-8.424C5.845 1.341 8.598.16 12.18.136h.014c2.744.018 5.143.854 6.928 2.417 1.688 1.476 2.697 3.54 2.997 6.135l-2.172.255c-.527-4.499-3.224-6.64-7.769-6.64h-.01c-2.898.018-5.119.929-6.601 2.706C4.085 6.713 3.342 9.13 3.342 12.07c0 2.936.743 5.351 2.212 7.195 1.482 1.777 3.703 2.688 6.601 2.706h.01c2.558-.016 4.242-.684 5.467-2.165.853-1.02 1.428-2.479 1.703-4.337-.937.22-1.952.331-3.023.317-2.667-.035-4.879-.917-6.157-2.473-1.126-1.37-1.584-3.168-1.29-5.063.559-3.584 3.297-5.896 7.045-5.896h.047c2.075.014 3.87.654 5.19 1.851 1.435 1.3 2.219 3.166 2.269 5.408.033 1.462-.22 2.786-.752 3.936l-1.953-.84c.41-.953.6-2.03.572-3.165-.037-1.704-.584-3.071-1.581-3.965-.869-.787-2.106-1.196-3.731-1.206h-.034c-2.798 0-4.677 1.598-5.076 4.153-.235 1.503.089 2.856.909 3.83.889 1.052 2.302 1.654 4.16 1.68 1.43.019 2.701-.26 3.715-.697-.054-.53-.155-1.025-.3-1.474-.45-1.388-1.402-2.17-2.705-2.17-.876 0-1.611.34-2.139.982-.5.605-.74 1.434-.68 2.33l-2.16-.15c-.089-1.346.334-2.636 1.175-3.638.886-1.055 2.173-1.637 3.804-1.637 2.248 0 3.845 1.28 4.565 3.542.247.762.377 1.604.387 2.498z"/>
    </svg>
  ),
}

function SocialIcon({ platform }) {
  return SOCIAL_ICONS[platform] || (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>
  )
}

const WA_SVG = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

function SlideBar({ current, total, onPrev, onNext, light }) {
  return (
    <div className={`${styles.slideBar} ${light ? styles.slideBarLight : ''}`}>
      <button
        className={`${styles.slideBarArrow} ${current === 0 ? styles.slideBarArrowDim : ''}`}
        onClick={onPrev}
        aria-label="Previous slide"
      >
        <span className="mi">keyboard_arrow_up</span>
      </button>
      <span className={styles.slideBarCount}>{pad(current + 1)} / {pad(total)}</span>
      <button
        className={`${styles.slideBarArrow} ${current === total - 1 ? styles.slideBarArrowDim : ''}`}
        onClick={onNext}
        aria-label="Next slide"
      >
        <span className="mi">keyboard_arrow_down</span>
      </button>
    </div>
  )
}

function BookingSheet({ isOpen, onClose, brandName, brandEmail, brandPhone }) {
  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [garment,  setGarment]  = useState('')
  const [deadline, setDeadline] = useState('')
  const [message,  setMessage]  = useState('')
  const [sent,     setSent]     = useState(false)
  const [visible,  setVisible]  = useState(false)

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => setVisible(true))
    else setVisible(false)
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) return
    const deadlineLine = deadline ? `%0ADeadline / Occasion Date: ${deadline}` : ''
    const msg = `Hello ${brandName},%0A%0AI'd like to place an order.%0A%0AName: ${name}%0APhone: ${phone}%0AGarment: ${garment}${deadlineLine}%0ADetails: ${message}`
    if (brandPhone) {
      window.open(`https://wa.me/${brandPhone.replace(/\D/g, '')}?text=${msg}`, '_blank', 'noopener,noreferrer')
    } else if (brandEmail) {
      window.open(`mailto:${brandEmail}?subject=Order Enquiry&body=${decodeURIComponent(msg.replace(/%0A/g, '\n'))}`)
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
        <div className={styles.drawerHandle} />
        {sent ? (
          <div className={styles.sentState}>
            <div className={styles.sentCheck}><span className="mi">check</span></div>
            <p className={styles.sentTitle}>Request received</p>
            <p className={styles.sentSub}>{brandName} will be in touch shortly.</p>
          </div>
        ) : (
          <>
            <div className={styles.drawerHead}>
              <div>
                <p className={styles.drawerLabel}>Order ticket</p>
                <p className={styles.drawerTitle}>Book {brandName}</p>
              </div>
              <button className={styles.drawerClose} onClick={onClose}>
                <span className="mi">close</span>
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
                <input className={styles.fieldInput} placeholder="e.g. Suit, Dress, Agbada…" value={garment} onChange={e => setGarment(e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Occasion / deadline date</label>
                <input className={styles.fieldInput} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ colorScheme: 'light dark' }} />
                <span className={styles.fieldHint}>When do you need this ready?</span>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Additional details</label>
                <textarea className={styles.fieldTextarea} placeholder="Fabric preferences, measurements, colour…" value={message} onChange={e => setMessage(e.target.value)} rows={4} />
              </div>
            </div>
            <div className={styles.drawerFooter}>
              <button className={styles.sendBtn} onClick={handleSubmit} disabled={!name.trim() || !phone.trim()}>
                Send booking request
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

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
        <button className={styles.lbClose} onClick={onClose}><span className="mi">close</span></button>
        <img src={current.src || current.storageUrl} alt={current.caption} className={styles.lbImg} />
        {photos.length > 1 && (
          <>
            {idx > 0 && (
              <button className={`${styles.lbNav} ${styles.lbLeft}`} onClick={e => { e.stopPropagation(); setIdx(i => i - 1) }}>
                <span className="mi">chevron_left</span>
              </button>
            )}
            {idx < photos.length - 1 && (
              <button className={`${styles.lbNav} ${styles.lbRight}`} onClick={e => { e.stopPropagation(); setIdx(i => i + 1) }}>
                <span className="mi">chevron_right</span>
              </button>
            )}
          </>
        )}
        {(current.caption || current.price) && (
          <div className={styles.lbMeta}>
            <span className={styles.lbType}>{current.clothingTypeLabel || 'Piece'}{current.price ? ` · From ₦${Number(current.price).toLocaleString()}` : ''}</span>
            {current.caption && <p className={styles.lbCaption}>{current.caption}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export function PortfolioTemplate3({ brand, photos, garmentTypes, reviews }) {
  const [currentSlide,  setCurrentSlide]  = useState(0)
  const [lightbox,      setLightbox]      = useState(null)
  const [bookingOpen,   setBookingOpen]   = useState(false)
  const [navOpen,       setNavOpen]       = useState(false)
  const [activeTab,     setActiveTab]     = useState(null)
  const [lightMode,     setLightMode]     = useState(false)
  const [vh,            setVh]            = useState(() => typeof window !== 'undefined' ? window.innerHeight : 800)

  const currentSlideRef  = useRef(0)
  const isAnimatingRef   = useRef(false)
  const lastWheelTime    = useRef(0)
  const touchStartY      = useRef(0)
  const touchStartX      = useRef(0)
  const pageRef          = useRef(null)
  const galleryRef       = useRef(null)
  const aboutScrollRef   = useRef(null)
  const reviewsScrollRef = useRef(null)

  useBrandTokens(brand?.brandColourId)

  useEffect(() => {
    const update = () => setVh(window.innerHeight)
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  const brandName         = brand.brandName             || 'The Tailor'
  const tagline           = brand.brandTagline          || ''
  const brandBio          = brand.brandBio              || ''
  const availability      = brand.brandAvailability     || 'open'
  const availableUntil    = brand.brandAvailableUntil   || ''
  const foundedYear       = brand.brandFoundedYear      || ''
  const turnaround        = brand.brandTurnaround       || ''
  const serviceArea       = brand.brandServiceArea      || ''
  const styleStatement    = brand.brandStyleStatement   || ''
  const milestone         = brand.brandMilestone        || ''
  const featuredTechnique = brand.brandFeaturedTechnique || ''

  const completedPhotos = photos.filter(p => p.category === 'completed_works')
  const filteredPhotos  = activeTab
    ? completedPhotos.filter(p => p.clothingType === activeTab)
    : completedPhotos

  const statGarments  = milestone || (completedPhotos.length ? `${completedPhotos.length}+` : '—')
  const yearsCrafting = foundedYear ? new Date().getFullYear() - parseInt(foundedYear) : null

  const processSteps = [
    { num: '01', title: 'Consultation', desc: 'Share your vision, occasion, and deadline. We listen carefully and walk through fabric, fit, and budget.' },
    { num: '02', title: 'Measurements', desc: 'Precise measurements taken to ensure your garment fits exactly as it should, the first time.' },
    { num: '03', title: 'Crafting',     desc: 'Every piece is cut and stitched with intention, using techniques refined over years on the floor.' },
    { num: '04', title: 'Delivery',     desc: turnaround ? `Ready in ${turnaround}, with a final fitting before your piece leaves the shop.` : 'A final fitting, then your bespoke piece is ready to wear.' },
  ]

  const slides = [
    { id: 'hero',    label: 'Home'    },
    ...(completedPhotos.length > 0 ? [{ id: 'work',    label: 'Work'    }] : []),
    { id: 'about',   label: 'About'   },
    { id: 'process', label: 'Process' },
    ...(reviews.length > 0          ? [{ id: 'reviews', label: 'Reviews' }] : []),
    { id: 'book',    label: 'Contact' },
  ]
  const totalSlides = slides.length
  const si = id => slides.findIndex(s => s.id === id)

  const goTo = useCallback((idx) => {
    if (isAnimatingRef.current || idx < 0 || idx >= totalSlides) return
    isAnimatingRef.current = true
    setCurrentSlide(idx)
    currentSlideRef.current = idx
    setTimeout(() => { isAnimatingRef.current = false }, 950)
  }, [totalSlides])

  const goNext = useCallback(() => goTo(currentSlideRef.current + 1), [goTo])
  const goPrev = useCallback(() => goTo(currentSlideRef.current - 1), [goTo])

  useEffect(() => {
    const handler = e => {
      if (bookingOpen || lightbox) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, bookingOpen, lightbox])

  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    const handler = e => {
      if (bookingOpen || lightbox) return
      const inGallery = galleryRef.current?.contains(e.target)
      const inAbout   = aboutScrollRef.current?.contains(e.target)
      const inReviews = reviewsScrollRef.current?.contains(e.target)
      if (inGallery || inAbout || inReviews) {
        const scrollEl = inGallery ? galleryRef.current : inAbout ? aboutScrollRef.current : reviewsScrollRef.current
        const { scrollTop, scrollHeight, clientHeight } = scrollEl
        const atBottom = scrollTop + clientHeight >= scrollHeight - 2
        const atTop    = scrollTop <= 2
        if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return
      }
      e.preventDefault()
      const now = Date.now()
      if (now - lastWheelTime.current < 950) return
      lastWheelTime.current = now
      if (e.deltaY > 20) goNext()
      else if (e.deltaY < -20) goPrev()
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [goNext, goPrev, bookingOpen, lightbox])

  const handleTouchStart = e => {
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = e => {
    if (bookingOpen || lightbox) return
    if (galleryRef.current?.contains(e.target))       return
    if (aboutScrollRef.current?.contains(e.target))   return
    if (reviewsScrollRef.current?.contains(e.target)) return
    const dy = e.changedTouches[0].clientY - touchStartY.current
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 55) {
      if (dy < 0) goNext()
      else goPrev()
    }
  }

  const availText = availability === 'open'
    ? 'Open for orders'
    : availableUntil
      ? `Booked until ${new Date(availableUntil).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
      : 'Fully booked'

  return (
    <div
      ref={pageRef}
      className={`${styles.page} ${lightMode ? styles.lightMode : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <button className={styles.navBrand} onClick={() => { setNavOpen(false); goTo(0) }}>
            {brandName}
          </button>

          <div className={`${styles.navLinks} ${navOpen ? styles.navLinksOpen : ''}`}>
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`${styles.navLink} ${currentSlide === i ? styles.navLinkActive : ''}`}
                onClick={() => { setNavOpen(false); goTo(i) }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className={styles.navActions}>
            <button className={styles.themeBtn} onClick={() => setLightMode(m => !m)} aria-label="Toggle theme">
              <span className="mi">{lightMode ? 'dark_mode' : 'light_mode'}</span>
            </button>
            <button className={styles.navOrderBtn} onClick={() => { setNavOpen(false); setBookingOpen(true) }}>
              Order Now
            </button>
            <button className={styles.navBurger} onClick={() => setNavOpen(o => !o)} aria-label="Menu">
              <span className={`${styles.bLine} ${navOpen ? styles.bLineT : ''}`} />
              <span className={`${styles.bLine} ${navOpen ? styles.bLineB : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      <div className={styles.dotNav}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.dot} ${currentSlide === i ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={s.label}
            title={s.label}
          />
        ))}
      </div>

      <div className={styles.slidesWrap} style={{ height: `${vh}px` }}>
        <div
          className={styles.slidesTrack}
          style={{ transform: `translateY(-${currentSlide * vh}px)` }}
        >

          <div className={styles.slide} style={{ height: `${vh}px` }}>
            <div className={styles.heroBg}>
              {brand.heroBgImage
                ? <img src={brand.heroBgImage} alt="" className={styles.heroBgImg} />
                : <div className={styles.heroBgFallback} />
              }
              <div className={styles.heroBgDim} />
            </div>
            <div className={styles.heroContent}>
              <div className={styles.heroTop}>
                <span className={styles.heroStatusPill}>
                  <span className={`${styles.heroDot} ${availability === 'open' ? styles.heroDotOpen : ''}`} />
                  {availText}
                </span>
                {foundedYear && <span className={styles.heroEst}>Est. {foundedYear}</span>}
              </div>
              <div className={styles.heroCenter}>
                <h1 className={styles.heroName}>{brandName}</h1>
                {tagline && <p className={styles.heroTagline}>{tagline}</p>}
                {styleStatement && <p className={styles.heroStmt}>{styleStatement}</p>}
              </div>
              <div className={styles.heroBottom}>
                <div className={styles.heroBtns}>
                  <button className={styles.heroBtnPrimary} onClick={() => setBookingOpen(true)}>
                    Place an Order
                  </button>
                  {si('work') > -1 && (
                    <button className={styles.heroBtnGhost} onClick={() => goTo(si('work'))}>
                      View Work
                    </button>
                  )}
                </div>
                <div className={styles.heroFoot}>
                  <span className={styles.heroSlideNum}>{pad(1)} / {pad(totalSlides)}</span>
                  <div className={styles.heroRule} />
                  <button className={styles.heroNext} onClick={goNext}>
                    Scroll <span className="mi" style={{ fontSize: '0.72rem', verticalAlign: 'middle' }}>south</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {si('work') > -1 && (
            <div className={styles.slide} style={{ height: `${vh}px` }}>
              <div className={styles.workLayout}>
                <div className={styles.workSidebar}>
                  <span className={styles.slideTag}>{pad(si('work') + 1)}</span>
                  <h2 className={styles.workHeading}>Selected<br />Work</h2>
                  <p className={styles.workCount}>
                    {filteredPhotos.length} piece{filteredPhotos.length !== 1 ? 's' : ''}
                  </p>
                  {garmentTypes.length > 0 && (
                    <div className={styles.filterList}>
                      <button
                        className={`${styles.filterItem} ${!activeTab ? styles.filterItemActive : ''}`}
                        onClick={() => setActiveTab(null)}
                      >
                        All
                      </button>
                      {garmentTypes.map(t => (
                        <button
                          key={t.id}
                          className={`${styles.filterItem} ${activeTab === t.id ? styles.filterItemActive : ''}`}
                          onClick={() => setActiveTab(t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.workGallery} ref={galleryRef}>
                  {filteredPhotos.length === 0 ? (
                    <div className={styles.workEmpty}>Nothing in this category yet.</div>
                  ) : (
                    filteredPhotos.map((photo, i) => (
                      <button
                        key={photo.id}
                        className={`${styles.galleryCard} ${i === 0 ? styles.galleryCardWide : ''}`}
                        onClick={() => setLightbox(photo)}
                      >
                        <img
                          src={photo.src || photo.storageUrl}
                          alt={photo.caption || 'Work'}
                          className={styles.galleryCardImg}
                          loading="lazy"
                        />
                        <div className={styles.galleryCardOverlay}>
                          <span className={styles.galleryCardType}>
                            {photo.clothingTypeLabel || 'Piece'}
                            {photo.price ? ` · ₦${Number(photo.price).toLocaleString()}` : ''}
                          </span>
                          {photo.caption && (
                            <span className={styles.galleryCardCaption}>{photo.caption}</span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <SlideBar current={si('work')} total={totalSlides} onPrev={goPrev} onNext={goNext} />
            </div>
          )}

          <div className={styles.slide} style={{ height: `${vh}px` }}>
            <div className={styles.aboutScrollArea} ref={aboutScrollRef}>
              <div className={styles.aboutLayout}>
                <div className={styles.aboutLeft}>
                  <span className={styles.slideTag}>{pad(si('about') + 1)}</span>
                  <h2 className={styles.aboutHeading}>
                    The maker<br />behind<br />{brandName}
                  </h2>
                  {(statGarments || yearsCrafting !== null) && (
                    <div className={styles.aboutNums}>
                      {statGarments && (
                        <div className={styles.aboutNum}>
                          <span className={styles.aboutNumVal}>{statGarments}</span>
                          <span className={styles.aboutNumLbl}>Garments made</span>
                        </div>
                      )}
                      {yearsCrafting !== null && (
                        <div className={styles.aboutNum}>
                          <span className={styles.aboutNumVal}>{yearsCrafting}+</span>
                          <span className={styles.aboutNumLbl}>Years crafting</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className={styles.aboutRight}>
                  <p className={styles.aboutBio}>
                    {brandBio || 'Every piece starts with a conversation — about the occasion, the fabric, and the fit you have in mind. From there, it is measured, cut, and finished by hand.'}
                  </p>
                  {(foundedYear || serviceArea || turnaround || featuredTechnique) && (
                    <div className={styles.aboutGrid}>
                      {foundedYear && (
                        <div className={styles.aboutCell}>
                          <span className={styles.aboutCellLbl}>Working since</span>
                          <span className={styles.aboutCellVal}>{foundedYear}</span>
                        </div>
                      )}
                      {serviceArea && (
                        <div className={styles.aboutCell}>
                          <span className={styles.aboutCellLbl}>Based in</span>
                          <span className={styles.aboutCellVal}>{Array.isArray(serviceArea) ? serviceArea.join(', ') : serviceArea}</span>
                        </div>
                      )}
                      {turnaround && (
                        <div className={styles.aboutCell}>
                          <span className={styles.aboutCellLbl}>Turnaround</span>
                          <span className={styles.aboutCellVal}>{turnaround}</span>
                        </div>
                      )}
                      {featuredTechnique && (
                        <div className={styles.aboutCell}>
                          <span className={styles.aboutCellLbl}>Signature</span>
                          <span className={styles.aboutCellVal}>{featuredTechnique}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {garmentTypes.length > 0 && (
                    <div className={styles.aboutSpecials}>
                      <span className={styles.aboutCellLbl}>Specialises in</span>
                      <div className={styles.chipRow}>
                        {garmentTypes.map(t => (
                          <span key={t.id} className={styles.chip}>{t.label}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={styles.contactBlock}>
                    <div className={styles.contactBlockTop}>
                      {brand.brandLogo
                        ? <img src={brand.brandLogo} alt={brandName} className={styles.contactLogo} />
                        : <div className={styles.contactMono}>{initials(brandName)}</div>
                      }
                      <div>
                        <p className={styles.contactName}>{brandName}</p>
                        {tagline && <p className={styles.contactTag}>{tagline}</p>}
                      </div>
                    </div>
                    <div className={styles.contactLines}>
                      {brand.brandAddress && (
                        <span className={styles.contactLine}>
                          <span className="mi">location_on</span>{brand.brandAddress}
                        </span>
                      )}
                      {brand.brandPhone && (
                        <a href={`tel:${brand.brandPhone}`} className={styles.contactLine}>
                          <span className="mi">call</span>{brand.brandPhone}
                        </a>
                      )}
                      {brand.brandEmail && (
                        <a href={`mailto:${brand.brandEmail}`} className={styles.contactLine}>
                          <span className="mi">mail</span>{brand.brandEmail}
                        </a>
                      )}
                      {brand.brandWebsite && (
                        <a href={brand.brandWebsite} target="_blank" rel="noopener noreferrer" className={styles.contactLine}>
                          <span className="mi">language</span>{brand.brandWebsite}
                        </a>
                      )}
                    </div>
                    {(brand.brandPhone || (brand.brandSocials || []).length > 0) && (
                      <div className={styles.socialRow}>
                        {brand.brandPhone && (
                          <a href={`https://wa.me/${brand.brandPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                            {WA_SVG}
                          </a>
                        )}
                        {(brand.brandSocials || []).map((s, i) => (
                          <a key={i} href={buildSocialUrl(s.platform, s.handle)} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                            <SocialIcon platform={s.platform} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <SlideBar current={si('about')} total={totalSlides} onPrev={goPrev} onNext={goNext} />
          </div>

          <div className={styles.slide} style={{ height: `${vh}px` }}>
            <div className={styles.processLayout}>
              <div className={styles.processHead}>
                <span className={styles.slideTag}>{pad(si('process') + 1)}</span>
                <h2 className={styles.processHeading}>How it<br />comes together</h2>
              </div>
              <div className={styles.processSteps}>
                {processSteps.map(step => (
                  <div key={step.num} className={styles.processStep}>
                    <span className={styles.processNum}>{step.num}</span>
                    <div className={styles.processStepBody}>
                      <p className={styles.processStepTitle}>{step.title}</p>
                      <p className={styles.processStepDesc}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <SlideBar current={si('process')} total={totalSlides} onPrev={goPrev} onNext={goNext} />
          </div>

          {si('reviews') > -1 && (
            <div className={styles.slide} style={{ height: `${vh}px` }}>
              <div className={styles.reviewsScrollArea} ref={reviewsScrollRef}>
                <div className={styles.reviewsLayout}>
                  <div className={styles.reviewsHead}>
                    <span className={styles.slideTag}>{pad(si('reviews') + 1)}</span>
                    <h2 className={styles.reviewsHeading}>From recent<br />clients</h2>
                  </div>
                  <div className={styles.reviewsGrid}>
                    {reviews.map(r => (
                      <div key={r.id} className={styles.reviewCard}>
                        <p className={styles.reviewText}>{r.review}</p>
                        <div className={styles.reviewFoot}>
                          <div className={styles.reviewAuthor}>
                            <span className={styles.reviewAvatar}>{(r.customerName || '?').charAt(0).toUpperCase()}</span>
                            <span className={styles.reviewName}>{r.customerName}</span>
                          </div>
                          <span className={styles.reviewStars}>
                            {'★'.repeat(r.rating)}{'☆'.repeat(Math.max(0, 5 - r.rating))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <SlideBar current={si('reviews')} total={totalSlides} onPrev={goPrev} onNext={goNext} />
            </div>
          )}

          <div className={styles.slide} style={{ height: `${vh}px` }}>
            <div className={styles.bookBg}>
              {brand.footerBgImage
                ? <img src={brand.footerBgImage} alt="" className={styles.bookBgImg} />
                : <div className={styles.bookBgFallback} />
              }
              <div className={styles.bookBgDim} />
            </div>
            <div className={styles.bookContent}>
              <span className={styles.slideTagLight}>{pad(si('book') + 1)}</span>
              <h2 className={styles.bookHeading}>Start your<br />piece.</h2>
              <p className={styles.bookSub}>Tell us the occasion, the fabric, and the date — we'll take it from there.</p>
              {turnaround && <span className={styles.bookTurnaround}>{turnaround}</span>}
              <div className={styles.bookBtns}>
                <button className={styles.bookBtnPrimary} onClick={() => setBookingOpen(true)}>
                  Place Your Order
                </button>
                {brand.brandPhone && (
                  <a
                    href={`https://wa.me/${brand.brandPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.bookBtnWa}
                  >
                    {WA_SVG}
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
              <div className={styles.bookContacts}>
                {brand.brandPhone && (
                  <a href={`tel:${brand.brandPhone}`} className={styles.bookContactLink}>
                    <span className="mi">call</span>{brand.brandPhone}
                  </a>
                )}
                {brand.brandEmail && (
                  <a href={`mailto:${brand.brandEmail}`} className={styles.bookContactLink}>
                    <span className="mi">mail</span>{brand.brandEmail}
                  </a>
                )}
              </div>
              <p className={styles.bookPowered}>
                Powered by <span style={{ color: 'var(--brand-primary)' }}>TailorPady</span>
              </p>
            </div>
            <SlideBar current={si('book')} total={totalSlides} onPrev={goPrev} onNext={goNext} light />
          </div>

        </div>
      </div>

      {lightbox && (
        <Lightbox photo={lightbox} photos={filteredPhotos} onClose={() => setLightbox(null)} />
      )}
      <BookingSheet
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        brandName={brandName}
        brandEmail={brand.brandEmail}
        brandPhone={brand.brandPhone}
      />
    </div>
  )
}