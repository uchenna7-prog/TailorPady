import { useState, useEffect, useRef, Component } from 'react'
import { useBrandTokens } from '../../../../hooks/useBrandTokens'
import { usePortfolioBrandSettings } from '../../../../hooks/usePortfolioBrandSettings'
import styles from './PortfolioTemplate2.module.css'

const SECTION_IDS = ['about', 'work', 'faq', 'contact']

const WHATSAPP_PEEK_KEY = 'tailorpady-portfolio-whatsapp-peek-shown'

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V']

class PortfolioErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100dvh',
          padding: '24px',
          background: '#1a1a1a',
          color: '#ff6b6b',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowY: 'auto',
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
            Portfolio failed to render
          </div>
          <div style={{ marginBottom: '16px' }}>
            {this.state.error?.toString()}
          </div>
          {this.state.error?.stack && (
            <div style={{ color: '#999', fontSize: '11px' }}>
              {this.state.error.stack}
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

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
  instagram: (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>),
  facebook:  (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
  tiktok:    (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>),
  twitter:   (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.849L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>),
  youtube:   (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>),
  pinterest: (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>),
  threads:   (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068c0-3.51.85-6.37 2.495-8.424C5.845 1.341 8.598.16 12.18.136h.014c2.744.018 5.143.854 6.928 2.417 1.688 1.476 2.697 3.54 2.997 6.135l-2.172.255c-.527-4.499-3.224-6.64-7.769-6.64h-.01c-2.898.018-5.119.929-6.601 2.706C4.085 6.713 3.342 9.13 3.342 12.07c0 2.936.743 5.351 2.212 7.195 1.482 1.777 3.703 2.688 6.601 2.706h.01c2.558-.016 4.242-.684 5.467-2.165.853-1.02 1.428-2.479 1.703-4.337-.937.22-1.952.331-3.023.317-2.667-.035-4.879-.917-6.157-2.473-1.126-1.37-1.584-3.168-1.29-5.063.559-3.584 3.297-5.896 7.045-5.896h.047c2.075.014 3.87.654 5.19 1.851 1.435 1.3 2.219 3.166 2.269 5.408.033 1.462-.22 2.786-.752 3.936l-1.953-.84c.41-.953.6-2.03.572-3.165-.037-1.704-.584-3.071-1.581-3.965-.869-.787-2.106-1.196-3.731-1.206h-.034c-2.798 0-4.677 1.598-5.076 4.153-.235 1.503.089 2.856.909 3.83.889 1.052 2.302 1.654 4.16 1.68 1.43.019 2.701-.26 3.715-.697-.054-.53-.155-1.025-.3-1.474-.45-1.388-1.402-2.17-2.705-2.17-.876 0-1.611.34-2.139.982-.5.605-.74 1.434-.68 2.33l-2.16-.15c-.089-1.346.334-2.636 1.175-3.638.886-1.055 2.173-1.637 3.804-1.637 2.248 0 3.845 1.28 4.565 3.542.247.762.377 1.604.387 2.498z"/></svg>),
}

function SocialIcon({ platform }) {
  return SOCIAL_ICONS[platform] || (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>
  )
}

const WA_SVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const BAG_SVG = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8h12l-1 12H7L6 8z"/>
    <path d="M9 8V6a3 3 0 016 0v2"/>
  </svg>
)

const CHEV_SVG = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6"/>
  </svg>
)

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function TypingDots() {
  return (
    <span className={styles.typingDots}>
      <span />
      <span />
      <span />
    </span>
  )
}

function WhatsAppWidget({ brandName, brandPhone, brandLogo }) {
  const [open, setOpen] = useState(false)
  const [peekVisible, setPeekVisible] = useState(false)
  const [peekDismissed, setPeekDismissed] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const hasAnimatedRef = useRef(false)

  const waHref = `https://wa.me/${brandPhone.replace(/\D/g, '')}`

  useEffect(() => {
    if (sessionStorage.getItem(WHATSAPP_PEEK_KEY)) return
    const showTimer = setTimeout(() => {
      setPeekVisible(true)
      sessionStorage.setItem(WHATSAPP_PEEK_KEY, '1')
    }, 5000)
    return () => clearTimeout(showTimer)
  }, [])

  useEffect(() => {
    if (!peekVisible) return
    const hideTimer = setTimeout(() => setPeekVisible(false), 14000)
    return () => clearTimeout(hideTimer)
  }, [peekVisible])

  useEffect(() => {
    if (!open || hasAnimatedRef.current) return
    hasAnimatedRef.current = true
    setShowTyping(true)
    const typingTimer = setTimeout(() => {
      setShowTyping(false)
      setShowMessage(true)
    }, 1100)
    return () => clearTimeout(typingTimer)
  }, [open])

  const handleOpen = () => {
    setOpen(true)
    setPeekVisible(false)
    setPeekDismissed(true)
  }

  const handlePeekDismiss = event => {
    event.stopPropagation()
    setPeekVisible(false)
    setPeekDismissed(true)
  }

  const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={styles.whatsappWidget}>
      {peekVisible && (
        <div
          className={styles.peekBubble}
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') handleOpen()
          }}
        >
          <button
            type="button"
            className={styles.peekClose}
            onClick={handlePeekDismiss}
            aria-label="Dismiss message"
          >
            <span className={styles.closeMark} style={{ width: 10, height: 10 }} />
          </button>
          <span className={styles.peekAvatar}>
            {brandLogo
              ? <img src={brandLogo} alt="" className={styles.peekAvatarImg} />
              : <WhatsAppIcon size={18} />
            }
          </span>
          <span className={styles.peekText}>
            <span className={styles.peekName}>{brandName}</span>
            <span className={styles.peekMessage}>Hi there! 👋 Have a question about your order?</span>
          </span>
        </div>
      )}

      {open && (
        <div className={styles.whatsappPanel} role="dialog" aria-label={`Chat with ${brandName}`}>
          <div className={styles.whatsappPanelHeader}>
            <span className={styles.whatsappPanelAvatar}>
              {brandLogo
                ? <img src={brandLogo} alt="" className={styles.whatsappPanelAvatarImg} />
                : <WhatsAppIcon size={20} />
              }
            </span>
            <div className={styles.whatsappPanelHeaderText}>
              <span className={styles.whatsappPanelTitle}>{brandName}</span>
              <span className={styles.whatsappPanelStatus}>
                <span className={styles.whatsappStatusDot} />
                Online
              </span>
            </div>
            <button
              type="button"
              className={styles.whatsappPanelClose}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <span className={styles.closeMark} style={{ width: 11, height: 11 }} />
            </button>
          </div>
          <div className={styles.whatsappPanelBody}>
            <span className={styles.whatsappDateChip}>Today</span>
            {showTyping && (
              <div className={styles.whatsappTypingBubble}>
                <TypingDots />
              </div>
            )}
            {showMessage && (
              <div className={styles.whatsappBubble}>
                Hi there! 👋 How can we help you with your order today?
                <span className={styles.whatsappBubbleTime}>{timeNow()}</span>
              </div>
            )}
          </div>
          <div className={styles.whatsappPanelFooter}>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className={styles.whatsappStartChatBtn}
            >
              <WhatsAppIcon size={18} />
              Continue on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`${styles.whatsappTrigger} ${open ? styles.whatsappTriggerOpen : ''}`}
        onClick={() => (open ? setOpen(false) : handleOpen())}
        aria-label={open ? 'Close chat' : 'Chat with us on WhatsApp'}
      >
        <WhatsAppIcon size={24} />
        {!open && !peekDismissed && <span className={styles.whatsappBadgeDot} />}
        {open && <span className={styles.whatsappTriggerLabel}>Close chat</span>}
      </button>
    </div>
  )
}

function MediaPlaceholder({ label, dark = false }) {
  return (
    <div className={`${styles.mediaPlaceholder} ${dark ? styles.mediaPlaceholderDark : ''}`}>
      <span className={styles.mediaPlaceholderLabel}>{label}</span>
    </div>
  )
}

function useNavScrolled(threshold = 16) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

function useActiveSection(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin: '0px 0px -80px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

function Reveal({ as: Tag = 'div', children, className = '', delay = 0, style, ...rest }) {
  const [ref, inView] = useInView()
  const combined = `${styles.reveal} ${inView ? styles.revealVisible : ''} ${className}`.trim()
  return (
    <Tag ref={ref} className={combined} style={{ '--reveal-delay': `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  )
}

function formatStatic(value) {
  if (!value) return ''
  return value.replace(/[\d.,]+/, m => (m.includes('.') ? '0.0' : '0'))
}

function useCountUp(value, inView, duration = 1400) {
  const [display, setDisplay] = useState(() => formatStatic(value))
  const startedRef = useRef(false)

  useEffect(() => {
    if (!inView || startedRef.current || !value) return
    startedRef.current = true

    const match = value.match(/[\d.,]+/)
    if (!match) {
      setDisplay(value)
      return
    }

    const raw = match[0]
    const prefix = value.slice(0, match.index)
    const suffix = value.slice(match.index + raw.length)
    const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
    const target = parseFloat(raw.replace(/,/g, ''))
    const start = performance.now()

    const tick = now => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased
      const formatted =
        decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString()
      setDisplay(`${prefix}${formatted}${suffix}`)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [inView, value, duration])

  return display
}

function StatValue({ value, className }) {
  const [ref, inView] = useInView(0.5)
  const display = useCountUp(value, inView)
  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}

function BookingSheet({ isOpen, onClose, brandName, brandEmail, brandPhone, bookingNote }) {
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
    const deadlineLine = deadline ? `%0ADeadline%2FDate%3A ${deadline}` : ''
    const msg = `Hello ${brandName},%0A%0AOrder request.%0A%0AName%3A ${name}%0APhone%3A ${phone}%0AGarment%3A ${garment}${deadlineLine}%0ADetails%3A ${message}`
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
        <div className={styles.drawerHandle}>
          <span className={styles.drawerHandleBar} />
        </div>
        {sent ? (
          <div className={styles.sentState}>
            <p className={styles.sentTitle}>Request sent</p>
            <p className={styles.sentSub}>{brandName} will be in touch shortly.</p>
          </div>
        ) : (
          <>
            <div className={styles.drawerHead}>
              <div>
                <p className={styles.drawerEyebrow}>Enquiry</p>
                <p className={styles.drawerTitle}>Book {brandName}</p>
              </div>
              <button className={styles.drawerClose} onClick={onClose} aria-label="Close">
                <span className={styles.closeMark} />
              </button>
            </div>
            {bookingNote && <p className={styles.drawerNote}>{bookingNote}</p>}
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
              <button className={styles.sendBtn} onClick={handleSubmit} disabled={!name.trim() || !phone.trim()}>
                Send enquiry
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
        <button className={styles.lbClose} onClick={onClose} aria-label="Close"><span className={styles.closeMark} /></button>
        <img src={current.src || current.storageUrl} alt={current.caption} className={styles.lbImg} />
        {photos.length > 1 && (
          <>
            {idx > 0 && (
              <button className={`${styles.lbNav} ${styles.lbLeft}`} onClick={e => { e.stopPropagation(); setIdx(i => i - 1) }} aria-label="Previous">‹</button>
            )}
            {idx < photos.length - 1 && (
              <button className={`${styles.lbNav} ${styles.lbRight}`} onClick={e => { e.stopPropagation(); setIdx(i => i + 1) }} aria-label="Next">›</button>
            )}
          </>
        )}
        {(current.caption || current.price) && (
          <div className={styles.lbMeta}>
            <span className={styles.lbType}>N&deg; {String(idx + 1).padStart(2, '0')} — {current.clothingTypeLabel || 'Piece'}{current.price ? ` — From ₦${current.price}` : ''}</span>
            {current.caption && <p className={styles.lbCaption}>{current.caption}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryRow({ label, items, delay = 0, onSelect }) {
  const scrollRef = useRef(null)

  const scrollByAmount = dir => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <Reveal as="div" className={styles.categoryRow} delay={delay}>
      <h3 className={styles.categoryTitle}>{label}</h3>

      <div className={styles.categoryStrip} ref={scrollRef}>
        {items.map((photo, i) => (
          <button key={photo.id} className={styles.stripItem} onClick={() => onSelect(photo, items)}>
            <div className={styles.stripImgWrap}>
              <img src={photo.src || photo.storageUrl} alt={photo.caption || label} className={styles.stripImg} loading="lazy" />
            </div>
            <div className={styles.stripCaption}>
              <span className={styles.stripIndex}>N&deg; {String(i + 1).padStart(2, '0')}</span>
              {photo.price && <span className={styles.stripPrice}>From ₦{photo.price}</span>}
            </div>
          </button>
        ))}
      </div>

      <div className={styles.categoryArrows}>
        <button className={styles.categoryArrowBtn} onClick={() => scrollByAmount(-1)} aria-label="Scroll left">
          <span className={styles.arrowFlip}>{CHEV_SVG}</span>
        </button>
        <button className={styles.categoryArrowBtn} onClick={() => scrollByAmount(1)} aria-label="Scroll right">
          {CHEV_SVG}
        </button>
      </div>
    </Reveal>
  )
}

function FaqItem({ index, item, openIndex, onToggle }) {
  const isOpen = openIndex === index
  return (
    <div className={styles.faqRow}>
      <button className={styles.faqQuestion} onClick={() => onToggle(isOpen ? null : index)} aria-expanded={isOpen}>
        <span>{item.question}</span>
        <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}>{CHEV_SVG}</span>
      </button>
      <div className={`${styles.faqAnswerWrap} ${isOpen ? styles.faqAnswerWrapOpen : ''}`}>
        <p className={styles.faqAnswer}>{item.answer}</p>
      </div>
    </div>
  )
}

function PortfolioTemplate2Inner({ brand, photos, garmentTypes, reviews }) {
  const settings = usePortfolioBrandSettings(brand)

  const [lightboxPhoto,  setLightboxPhoto]  = useState(null)
  const [lightboxPhotos, setLightboxPhotos] = useState([])
  const [bookingOpen,    setBookingOpen]    = useState(false)
  const [navOpen,        setNavOpen]        = useState(false)
  const [openFaqIndex,   setOpenFaqIndex]   = useState(null)
  const activeSection                       = useActiveSection(SECTION_IDS)
  const scrolled                            = useNavScrolled()

  const aboutRef = useRef(null)
  const worksRef = useRef(null)
  const faqRef   = useRef(null)
  const bookRef  = useRef(null)

  useBrandTokens(brand?.brandColourId)

  const openLightbox = (photo, groupItems) => {
    setLightboxPhotos(groupItems)
    setLightboxPhoto(photo)
  }

  const scrollTo = ref => {
    setNavOpen(false)
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToTop = () => {
    setNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const brandName        = brand.brandName    || 'Brand Name'
  const tagline          = brand.brandTagline || ''
  const brandBio         = brand.brandBio     || ''
  const brandSocials     = brand.brandSocials || []
  const hasFooterSocials = Boolean(brand.brandPhone) || brandSocials.length > 0

  const completedPhotos = photos.filter(p => p.category === 'completed_works')

  const categorizedIds = new Set(garmentTypes.map(t => t.id))
  const categoryGroups = garmentTypes
    .map(t => ({ id: t.id, label: t.label, items: completedPhotos.filter(p => p.clothingType === t.id) }))
    .filter(g => g.items.length > 0)

  const uncategorized = completedPhotos.filter(p => !categorizedIds.has(p.clothingType))
  if (uncategorized.length > 0) {
    categoryGroups.push({ id: '__other', label: 'Other pieces', items: uncategorized })
  }

  const stats = [
    { label: settings.milestones[0].label, value: settings.milestones[0].number },
    { label: settings.milestones[1].label, value: settings.milestones[1].number },
    { label: 'Since', value: settings.yearFounded },
  ]

  const facts = [
    { label: 'Based in',    value: settings.location },
    { label: 'Delivers to', value: settings.serviceArea.join(', ') },
    { label: 'Turnaround',  value: settings.turnaround },
    { label: 'Hours',       value: settings.businessHours },
  ]

  return (
    <div className={styles.page}>

      <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <button className={styles.logo} onClick={scrollToTop}>
            {brand.brandLogo
              ? <img src={brand.brandLogo} alt={brandName} className={styles.logoIcon} />
              : <span className={styles.logoIconFallback}>{initials(brandName)}</span>
            }
            <span className={styles.logoMark}>{brandName}</span>
          </button>

          <nav className={styles.navLinks}>
            <button onClick={scrollToTop} className={!activeSection ? styles.navLinkActive : ''}>Home</button>
            <button onClick={() => scrollTo(aboutRef)} className={activeSection === 'about' ? styles.navLinkActive : ''}>About</button>
            <button onClick={() => scrollTo(worksRef)} className={activeSection === 'work' ? styles.navLinkActive : ''}>Collection</button>
            <button onClick={() => scrollTo(faqRef)} className={activeSection === 'faq' ? styles.navLinkActive : ''}>FAQ</button>
            <button onClick={() => scrollTo(bookRef)} className={activeSection === 'contact' ? styles.navLinkActive : ''}>Contact</button>
          </nav>

          <div className={styles.navActions}>
            <button className={styles.navCta} onClick={() => setBookingOpen(true)}>Place Order</button>
          </div>

          <div className={styles.navMobileTrigger}>
            <button className={styles.navOrderIconBtn} onClick={() => setBookingOpen(true)} aria-label="Place an order">
              {BAG_SVG}
            </button>
            <button className={styles.navMenuButton} onClick={() => setNavOpen(o => !o)} aria-label="Toggle menu">
              <span className={navOpen ? styles.menuMarkOpen : styles.menuMark} />
            </button>
          </div>
        </div>

        {navOpen && (
          <div className={styles.navMobilePanel}>
            <button onClick={scrollToTop}>Home</button>
            <button onClick={() => scrollTo(aboutRef)}>About</button>
            <button onClick={() => scrollTo(worksRef)}>Collection</button>
            <button onClick={() => scrollTo(faqRef)}>FAQ</button>
            <button onClick={() => scrollTo(bookRef)}>Contact</button>
            <button className={styles.navMobileCta} onClick={() => { setNavOpen(false); setBookingOpen(true) }}>Place an order</button>
          </div>
        )}
      </header>

      <section className={styles.hero}>
        {settings.heroBgImage
          ? <img src={settings.heroBgImage} alt="" className={styles.heroImg} />
          : <MediaPlaceholder label="Hero image" />
        }
        <div className={styles.heroScrim} />
        <button
          type="button"
          className={`${styles.scrollCue} ${scrolled ? styles.scrollCueHidden : ''}`}
          onClick={() => scrollTo(aboutRef)}
          aria-label="Scroll down"
        >
          <span className={styles.scrollCueRing}>
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l6 6 6-6"/>
            </svg>
          </span>
        </button>
      </section>

      <div className={styles.mainBody}>

        <section id="about" className={styles.about} ref={aboutRef}>
          <Reveal as="div" className={styles.aboutIntro}>
            <span className={styles.eyebrow}>About</span>
            <p className={styles.aboutBio}>{brandBio || settings.styleStatement}</p>
          </Reveal>

          <Reveal as="div" className={styles.aboutStats} delay={70}>
            {stats.map(stat => (
              <div key={stat.label} className={styles.statBox}>
                <StatValue value={stat.value} className={styles.statValue} />
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </Reveal>

          <Reveal as="div" className={styles.aboutFacts} delay={140}>
            {facts.map(fact => (
              <div key={fact.label} className={styles.factRow}>
                <span className={styles.factLabel}>{fact.label}</span>
                <span className={styles.factValue}>{fact.value}</span>
              </div>
            ))}
            <div className={styles.factRow}>
              <span className={styles.factLabel}>Availability</span>
              <span className={styles.factValue}>
                <span className={`${styles.availDot} ${settings.availability === 'open' ? styles.availDotOpen : ''}`} />
                {settings.availability === 'open'
                  ? 'Accepting orders'
                  : settings.availableUntil
                    ? `Booked until ${settings.availableUntil}`
                    : 'Fully booked'}
              </span>
            </div>
          </Reveal>
        </section>

        <section id="work" className={styles.works} ref={worksRef}>
          <Reveal as="div" className={styles.worksHeader}>
            <h2 className={styles.sectionTitle}>Collection</h2>
            {settings.styleStatement && <p className={styles.worksSub}>{settings.styleStatement}</p>}
          </Reveal>

          {categoryGroups.length === 0 ? (
            <div className={styles.worksEmpty}>Nothing in the collection yet — check back soon.</div>
          ) : (
            <div className={styles.categoryList}>
              {categoryGroups.map((group, i) => (
                <CategoryRow
                  key={group.id}
                  label={group.label}
                  items={group.items}
                  delay={(i % 3) * 60}
                  onSelect={openLightbox}
                />
              ))}
            </div>
          )}
        </section>

        <section className={styles.process}>
          <Reveal as="div" className={styles.processHeader}>
            <span className={styles.eyebrow}>Process</span>
          </Reveal>
          <div className={styles.processSteps}>
            {settings.processSteps.map((step, i) => (
              <Reveal as="div" key={i} className={styles.processStep} delay={i * 70}>
                <span className={styles.processNumeral}>{ROMAN_NUMERALS[i] || i + 1}</span>
                <span className={styles.processTitle}>{step.title}</span>
                <p className={styles.processDesc}>{step.description}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {reviews.length > 0 && (
          <section className={styles.reviews}>
            <Reveal as="div" className={styles.reviewsHeader}>
              <span className={styles.eyebrow}>In their words</span>
            </Reveal>
            <div className={styles.reviewStack}>
              {reviews.map((r, i) => (
                <Reveal as="div" key={r.id} className={styles.reviewRow} delay={(i % 3) * 70}>
                  <p className={styles.reviewQuote}>&ldquo;{r.review}&rdquo;</p>
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewName}>{r.customerName}</span>
                    <span className={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(Math.max(0, 5 - r.rating))}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <section id="faq" className={styles.faq} ref={faqRef}>
          <Reveal as="div" className={styles.faqHeader}>
            <span className={styles.eyebrow}>FAQ</span>
          </Reveal>
          <Reveal as="div" className={styles.faqList} delay={80}>
            {settings.faqs.map((item, i) => (
              <FaqItem key={i} index={i} item={item} openIndex={openFaqIndex} onToggle={setOpenFaqIndex} />
            ))}
          </Reveal>
        </section>

        <section id="contact" className={styles.cta} ref={bookRef}>
          <div className={styles.ctaMedia}>
            {settings.footerBgImage
              ? <img src={settings.footerBgImage} alt="" className={styles.ctaImg} />
              : <MediaPlaceholder label="Cover image" dark />
            }
            <div className={styles.ctaOverlay} />
          </div>
          <div className={styles.ctaContent}>
            <span className={styles.eyebrowLight}>Bespoke enquiries</span>
            <h2 className={styles.ctaTitle}>Begin your commission.</h2>
            <p className={styles.ctaSub}>Tell us the occasion, the fabric, and the date — we&rsquo;ll take it from there.</p>
            <div className={styles.ctaBtns}>
              <button className={styles.ctaBtnPrimary} onClick={() => setBookingOpen(true)}>Place an enquiry</button>
              {brand.brandPhone && (
                <a href={`https://wa.me/${brand.brandPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.ctaBtnGhost}>
                  {WA_SVG} WhatsApp
                </a>
              )}
            </div>
            <div className={styles.ctaContacts}>
              {brand.brandPhone && <a href={`tel:${brand.brandPhone}`}    className={styles.ctaContact}>{brand.brandPhone}</a>}
              {brand.brandEmail && <a href={`mailto:${brand.brandEmail}`} className={styles.ctaContact}>{brand.brandEmail}</a>}
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          {settings.footerText && (
            <Reveal as="p" className={styles.footerStatement}>{settings.footerText}</Reveal>
          )}
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <p className={styles.footerName}>{brandName}</p>
              {tagline && <p className={styles.footerTagline}>{tagline}</p>}
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColLabel}>Contact</p>
              {brand.brandAddress      && <span className={styles.footerRow}>{brand.brandAddress}</span>}
              {brand.brandEmail        && <a href={`mailto:${brand.brandEmail}`} className={styles.footerRow}>{brand.brandEmail}</a>}
              {brand.brandPhone        && <a href={`tel:${brand.brandPhone}`}    className={styles.footerRow}>{brand.brandPhone}</a>}
              {settings.businessHours  && <span className={styles.footerRow}>{settings.businessHours}</span>}
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColLabel}>Navigate</p>
              <button onClick={scrollToTop} className={styles.footerNavLink}>Home</button>
              <button onClick={() => scrollTo(aboutRef)} className={styles.footerNavLink}>About</button>
              <button onClick={() => scrollTo(worksRef)} className={styles.footerNavLink}>Collection</button>
              <button onClick={() => scrollTo(faqRef)} className={styles.footerNavLink}>FAQ</button>
              <button onClick={() => scrollTo(bookRef)}  className={styles.footerNavLink}>Contact</button>
            </div>
            {hasFooterSocials && (
              <div className={styles.footerCol}>
                <p className={styles.footerColLabel}>Follow</p>
                <div className={styles.footerSocials}>
                  {brand.brandPhone && (
                    <a href={`https://wa.me/${brand.brandPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.footerSocialBtn}>{WA_SVG}</a>
                  )}
                  {brandSocials.map((s, i) => (
                    <a key={i} href={buildSocialUrl(s.platform, s.handle)} target="_blank" rel="noopener noreferrer" className={styles.footerSocialBtn}>
                      <SocialIcon platform={s.platform} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>{brandName} © {new Date().getFullYear()}</p>
            <p className={styles.footerPowered}>Powered by <span className={styles.footerPoweredMark}>TailorPady</span></p>
          </div>
        </footer>

      </div>

      {lightboxPhoto && (
        <Lightbox photo={lightboxPhoto} photos={lightboxPhotos} onClose={() => setLightboxPhoto(null)} />
      )}
      <BookingSheet
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        brandName={brandName}
        brandEmail={brand.brandEmail}
        brandPhone={brand.brandPhone}
        bookingNote={settings.bookingNote}
      />
      {brand.brandPhone && (
        <WhatsAppWidget brandName={brandName} brandPhone={brand.brandPhone} brandLogo={brand.brandLogo} />
      )}
    </div>
  )
}

export function PortfolioTemplate2(props) {
  return (
    <PortfolioErrorBoundary>
      <PortfolioTemplate2Inner {...props} />
    </PortfolioErrorBoundary>
  )
}
