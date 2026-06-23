import { useState, useEffect, useRef } from 'react'
import { useBrandTokens } from '../../../../hooks/useBrandTokens'
import styles from './PortfolioTemplate1.module.css'

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function buildSocialUrl(platform, handle) {
  const h = handle.replace(/^@/, '')
  switch (platform) {
    case 'instagram': return `https://instagram.com/${h}`
    case 'tiktok':    return `https://tiktok.com/@${h}`
    case 'facebook':  return `https://facebook.com/${h}`
    case 'twitter':   return `https://x.com/${h}`
    case 'youtube':   return `https://youtube.com/@${h}`
    case 'pinterest': return `https://pinterest.com/${h}`
    case 'threads':   return `https://threads.net/@${h}`
    default:          return `https://${h}`
  }
}

const SOCIAL_ICONS = {
  instagram: (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>),
  facebook:  (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
  tiktok:    (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>),
  twitter:   (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.849L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>),
  youtube:   (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>),
  pinterest: (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>),
  threads:   (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068c0-3.51.85-6.37 2.495-8.424C5.845 1.341 8.598.16 12.18.136h.014c2.744.018 5.143.854 6.928 2.417 1.688 1.476 2.697 3.54 2.997 6.135l-2.172.255c-.527-4.499-3.224-6.64-7.769-6.64h-.01c-2.898.018-5.119.929-6.601 2.706C4.085 6.713 3.342 9.13 3.342 12.07c0 2.936.743 5.351 2.212 7.195 1.482 1.777 3.703 2.688 6.601 2.706h.01c2.558-.016 4.242-.684 5.467-2.165.853-1.02 1.428-2.479 1.703-4.337-.937.22-1.952.331-3.023.317-2.667-.035-4.879-.917-6.157-2.473-1.126-1.37-1.584-3.168-1.29-5.063.559-3.584 3.297-5.896 7.045-5.896h.047c2.075.014 3.87.654 5.19 1.851 1.435 1.3 2.219 3.166 2.269 5.408.033 1.462-.22 2.786-.752 3.936l-1.953-.84c.41-.953.6-2.03.572-3.165-.037-1.704-.584-3.071-1.581-3.965-.869-.787-2.106-1.196-3.731-1.206h-.034c-2.798 0-4.677 1.598-5.076 4.153-.235 1.503.089 2.856.909 3.83.889 1.052 2.302 1.654 4.16 1.68 1.43.019 2.701-.26 3.715-.697-.054-.53-.155-1.025-.3-1.474-.45-1.388-1.402-2.17-2.705-2.17-.876 0-1.611.34-2.139.982-.5.605-.74 1.434-.68 2.33l-2.16-.15c-.089-1.346.334-2.636 1.175-3.638.886-1.055 2.173-1.637 3.804-1.637 2.248 0 3.845 1.28 4.565 3.542.247.762.377 1.604.387 2.498z"/></svg>),
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
                <p className={styles.drawerLabel}><span className={styles.tagHole} />Order ticket</p>
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
