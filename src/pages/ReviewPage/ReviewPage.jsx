import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../firebasePublic'
import { getPublicBrandDataFromServer } from '../../services/profileService'
import {
  getReviewByToken,
  submitPublicReview,
  getReviewOrderSnapshot,
} from '../../services/reviewService'
import OrderMosaic from '../../components/OrderMosaic/OrderMosaic'
import styles from './ReviewPage.module.css'

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' }

const ICON_PATHS = {
  ruler: (
    <>
      <rect x="2.5" y="9.5" width="19" height="5" rx="1.2" transform="rotate(-8 12 12)" />
      <line x1="6.3" y1="10.2" x2="6.9" y2="12.3" transform="rotate(-8 12 12)" />
      <line x1="10" y1="9.8" x2="10.6" y2="12.7" transform="rotate(-8 12 12)" />
      <line x1="13.7" y1="9.4" x2="14.3" y2="13.1" transform="rotate(-8 12 12)" />
      <line x1="17.4" y1="9" x2="18" y2="13.5" transform="rotate(-8 12 12)" />
    </>
  ),
  fabric: (
    <>
      <path d="M4 8c2-2 4-2 6 0s4 2 6 0 4-2 4 0v3c-2 2-4 2-6 0s-4-2-6 0-4 2-4 0z" />
      <path d="M4 14c2-2 4-2 6 0s4 2 6 0 4-2 4 0v3c-2 2-4 2-6 0s-4-2-6 0-4 2-4 0z" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6.5" r="2.3" />
      <circle cx="6" cy="17.5" r="2.3" />
      <line x1="7.8" y1="8" x2="20" y2="19" />
      <line x1="7.8" y1="16" x2="20" y2="5" />
    </>
  ),
  truck: (
    <>
      <rect x="2" y="8" width="12" height="8" rx="1" />
      <path d="M14 11h4l3 3v2h-7z" />
      <circle cx="7" cy="18" r="1.7" />
      <circle cx="17.5" cy="18" r="1.7" />
    </>
  ),
  headset: (
    <>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
      <path d="M19.5 19v.5a3 3 0 0 1-3 3h-3" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-4 4v-4H4z" />
      <line x1="7.5" y1="9" x2="16.5" y2="9" />
      <line x1="7.5" y1="12.3" x2="13.5" y2="12.3" />
    </>
  ),
  star: (
    <path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.2-5.3 3.2 1.3-6-4.5-4 6-.6z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7" x2="12" y2="12.5" />
      <line x1="12" y1="12.5" x2="15.5" y2="14.5" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4l9.5 16h-19z" />
      <line x1="12" y1="10.5" x2="12" y2="14.5" />
      <circle cx="12" cy="17" r="0.15" fill="currentColor" stroke="none" />
    </>
  ),
  thumbsUp: (
    <path d="M8 20V10l4.5-6a1.7 1.7 0 0 1 3 1.3L14.5 10H19a2 2 0 0 1 2 2.4l-1.5 6A2 2 0 0 1 17.5 20H8zM8 10H4.5v10H8" />
  ),
  thumbsDown: (
    <path d="M16 4v10l-4.5 6a1.7 1.7 0 0 1-3-1.3l1-4.7H9a2 2 0 0 1-2-2.4l1.5-6A2 2 0 0 1 10.5 4H16zM16 14h3.5V4H16" />
  ),
  meh: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="9.5" x2="8" y2="11" />
      <line x1="16" y1="9.5" x2="16" y2="11" />
      <line x1="8" y1="15" x2="16" y2="15" />
    </>
  ),
}

function Icon({ name, size = 18 }) {
  const path = ICON_PATHS[name]
  if (!path) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  )
}

const POSITIVE_CHIPS = [
  { label: 'Perfect Fit', icon: 'ruler' },
  { label: 'Quality of Material', icon: 'fabric' },
  { label: 'Finishing', icon: 'scissors' },
  { label: 'On-time Delivery', icon: 'truck' },
  { label: 'Customer Service', icon: 'headset' },
  { label: 'Communication', icon: 'chat' },
  { label: 'Overall Experience', icon: 'star' },
]

const CONSTRUCTIVE_CHIPS = [
  { label: 'Fit Issues', icon: 'ruler' },
  { label: 'Material Quality', icon: 'fabric' },
  { label: 'Took Too Long', icon: 'clock' },
  { label: 'Late Delivery', icon: 'truck' },
  { label: 'Customer Service', icon: 'headset' },
  { label: 'Communication', icon: 'chat' },
  { label: 'Not As Expected', icon: 'warning' },
]

const RECOMMEND_OPTIONS = [
  { value: 'yes', label: 'Yes, definitely', icon: 'thumbsUp' },
  { value: 'maybe', label: 'Maybe', icon: 'meh' },
  { value: 'no', label: 'No', icon: 'thumbsDown' },
]

const MIN_REVIEW_LENGTH = 10
const MAX_REVIEW_LENGTH = 500
const MAX_PHOTO_MB = 5

function getReadableTextColor(hex) {
  if (!hex || hex.length < 7) return '#ffffff'
  try {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6 ? '#0a0a0a' : '#ffffff'
  } catch {
    return '#ffffff'
  }
}

function StarPicker({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className={styles.starPicker}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={styles.starBtn}
          disabled={disabled}
          onMouseEnter={() => !disabled && setHovered(n)}
          onMouseLeave={() => !disabled && setHovered(0)}
          onClick={() => !disabled && onChange(n)}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          <span
            className="mi"
            style={{
              fontSize: '2rem',
              color: n <= (hovered || value) ? '#e0a92f' : '#d9d3c7',
            }}
          >
            {n <= (hovered || value) ? 'star' : 'star_outline'}
          </span>
        </button>
      ))}
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <div className={styles.brandHeaderRow}>
          <div className={`${styles.skel} ${styles.skelLogoBox}`} />
          <div className={styles.brandHeaderText}>
            <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: 110, height: 14 }} />
            <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: 140, height: 11, marginTop: 4 }} />
          </div>
        </div>
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '70%', height: 26 }} />
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '85%', height: 13 }} />
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '55%', height: 13 }} />
      </div>

      <div className={styles.orderCard}>
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: 50, height: 13 }} />
        <div className={styles.orderCardBody}>
          <div className={`${styles.skel} ${styles.skelOrderImage}`} />
          <div className={styles.orderInfo}>
            <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '75%', height: 17 }} />
            <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '45%', height: 12, marginTop: 2 }} />
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '75%', height: 15 }} />
        <div className={styles.starPicker}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className={`${styles.skel} ${styles.skelStarDot}`} />
          ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '60%', height: 15 }} />
        <div className={styles.chipGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${styles.skel} ${styles.skelChip}`} />
          ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '65%', height: 15 }} />
        <div className={`${styles.skel} ${styles.skelInputBar}`} />
        <div className={`${styles.skel} ${styles.skelTextareaBar}`} />
      </div>

      <div className={styles.sectionCard}>
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '70%', height: 15 }} />
        <div className={styles.recommendGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${styles.skel} ${styles.skelRecommendOption}`} />
          ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '40%', height: 15 }} />
        <div className={`${styles.skel} ${styles.skelPhotoBar}`} />
      </div>

      <div className={styles.footerBlock}>
        <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '65%', height: 12 }} />
        <div className={`${styles.skel} ${styles.skelSubmitBar}`} />
      </div>
    </div>
  )
}

export default function ReviewPage() {
  const { uid, token } = useParams()
  const photoInputRef = useRef(null)

  const [tailorName,      setTailorName]      = useState('')
  const [brandTagline,    setBrandTagline]    = useState('')
  const [brandColour,     setBrandColour]     = useState('')
  const [brandLogoUrl,    setBrandLogoUrl]    = useState('')
  const [orderItems,      setOrderItems]      = useState([])
  const [orderDesc,       setOrderDesc]       = useState('')
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [submitting,      setSubmitting]      = useState(false)
  const [submitted,       setSubmitted]       = useState(false)
  const [error,           setError]           = useState('')
  const [offline,         setOffline]         = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [rating,       setRating]       = useState(0)
  const [reviewText,   setReviewText]   = useState('')
  const [highlights,   setHighlights]   = useState([])
  const [recommend,    setRecommend]    = useState('')
  const [photoFile,    setPhotoFile]    = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoError,   setPhotoError]   = useState('')
  const [fieldErrors,  setFieldErrors]  = useState({})
  const [logoFailed,   setLogoFailed]   = useState(false)

  const isLowRating = rating > 0 && rating <= 3

  const textColor = useMemo(() => getReadableTextColor(brandColour), [brandColour])
  const chips = isLowRating ? CONSTRUCTIVE_CHIPS : POSITIVE_CHIPS

  const orderName = useMemo(() => {
    if (orderDesc.trim()) return orderDesc.trim()
    if (!orderItems.length) return 'Your order'
    const names = orderItems
      .map(item => item.name || item.itemName || item.garmentName || item.type)
      .filter(Boolean)
    if (!names.length) return 'Your order'
    return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2} more` : names.join(', ')
  }, [orderDesc, orderItems])

  useEffect(() => {
    if (!uid || !token) { setLoading(false); return }

    async function init() {
      const [brandResult, snapshotResult, existingResult] = await Promise.allSettled([
        getPublicBrandDataFromServer(db, uid),
        getReviewOrderSnapshot(db, uid, token),
        getReviewByToken(db, uid, token),
      ])

      const brand = brandResult.status === 'fulfilled' ? brandResult.value : null
      setTailorName(brand?.brandName || 'Your tailor')
      setBrandTagline(brand?.brandTagline || '')
      setBrandColour(brand?.brandColour || '')
      setBrandLogoUrl(brand?.brandLogo || '')

      const snapshot = snapshotResult.status === 'fulfilled' ? snapshotResult.value : null
      if (snapshot?.items?.length) setOrderItems(snapshot.items)
      if (snapshot?.orderDesc) setOrderDesc(snapshot.orderDesc)

      const existing = existingResult.status === 'fulfilled' ? existingResult.value : null
      if (existing) setAlreadyReviewed(true)

      const allFailed = [brandResult, snapshotResult, existingResult].every(r => r.status === 'rejected')
      if (allFailed) setOffline(true)

      setLoading(false)
    }

    init()
  }, [uid, token])

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  const retry = () => {
    setOffline(false)
    setLoading(true)
    setError('')
    setTailorName('')
  }

  const toggleChip = (label) => {
    setHighlights(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file')
      return
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setPhotoError(`Photo must be under ${MAX_PHOTO_MB}MB`)
      return
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview('')
    setPhotoError('')
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    const errs = {}
    if (!customerName.trim()) errs.customerName = 'Please enter your name'
    if (rating === 0)         errs.rating       = 'Please select a rating'
    if (!reviewText.trim())   errs.reviewText   = 'Please write a short review'
    else if (reviewText.trim().length < MIN_REVIEW_LENGTH) {
      errs.reviewText = `A few more details help, at least ${MIN_REVIEW_LENGTH} characters`
    }
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setSubmitting(true)
    setError('')

    try {
      await submitPublicReview(db, uid, token, {
        customerName: customerName.trim(),
        customerId:   null,
        review:       reviewText.trim(),
        rating,
        highlights,
        recommend:    recommend || null,
        photoFile:    photoFile || null,
      })
      setSubmitted(true)
    } catch (err) {
      if (err?.code === 'permission-denied') {
        setAlreadyReviewed(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <ReviewSkeleton />
  }

  if (!uid || !token) {
    return (
      <div className={styles.page}>
        <div className={styles.simpleCard}>
          <span className="mi" style={{ fontSize: '3rem', color: 'var(--text3)' }}>link_off</span>
          <h2 className={styles.simpleTitle}>Invalid Link</h2>
          <p className={styles.simpleSubtitle}>This review link is not valid. Please ask your tailor to resend the link.</p>
        </div>
      </div>
    )
  }

  if (offline) {
    return (
      <div className={styles.page}>
        <div className={styles.simpleCard}>
          <span className="mi" style={{ fontSize: '3rem', color: 'var(--text3)' }}>wifi_off</span>
          <h2 className={styles.simpleTitle}>Couldn't Load</h2>
          <p className={styles.simpleSubtitle}>Check your connection and try again.</p>
          <button className={styles.retryBtn} onClick={retry}>
            <span className="mi" style={{ fontSize: '1rem' }}>refresh</span>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (alreadyReviewed) {
    return (
      <div className={styles.page}>
        <div className={styles.simpleCard}>
          <div className={styles.successIcon}>
            <span className="mi" style={{ fontSize: '2rem', color: '#22c55e' }}>check_circle</span>
          </div>
          <h2 className={styles.simpleTitle}>Already Submitted</h2>
          <p className={styles.simpleSubtitle}>
            You've already submitted a review for this order, thank you for taking the time.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.simpleCard}>
          <div className={styles.successIcon}>
            <span className="mi" style={{ fontSize: '2.5rem', color: '#22c55e' }}>check_circle</span>
          </div>
          <h2 className={styles.simpleTitle}>{isLowRating ? 'Thank You for Sharing' : 'Thank You'}</h2>
          <p className={styles.simpleSubtitle}>
            {isLowRating
              ? `Your feedback goes straight to ${tailorName} so they can make it right.`
              : `Thank you for your feedback, ${tailorName} appreciates it.`}
          </p>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <span
                key={n}
                className="mi"
                style={{ fontSize: '1.5rem', color: n <= rating ? '#e0a92f' : '#d9d3c7' }}
              >
                star
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} style={{ '--brand-accent': brandColour || 'var(--accent)', '--brand-accent-text': textColor }}>

      <div className={styles.headerBlock}>
        <div className={styles.brandHeaderRow}>
          {brandLogoUrl && !logoFailed ? (
            <img
              src={brandLogoUrl}
              alt={`${tailorName} logo`}
              className={styles.logoImg}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className={styles.logoPlaceholder}>LOGO</div>
          )}
          <div className={styles.brandHeaderText}>
            <span className={styles.brandName}>{tailorName}</span>
            {brandTagline && <span className={styles.brandTagline}>{brandTagline}</span>}
          </div>
        </div>
        <h1 className={styles.heading}>We'd love your feedback</h1>
        <p className={styles.subheading}>
          Your review helps {tailorName} improve and helps other customers choose with confidence.
        </p>
      </div>

      <div className={styles.orderCard}>
        <span className={styles.sectionTitle}>Order</span>
        <div className={styles.orderCardBody}>
          <OrderMosaic items={orderItems} size="md" />
          <div className={styles.orderInfo}>
            <span className={styles.orderName}>{orderName}</span>
            {orderItems.length > 0 && (
              <span className={styles.orderMetaRow}>
                <span className="mi" style={{ fontSize: '1rem' }}>checkroom</span>
                {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <span className={styles.sectionTitle}>1. How would you rate your overall experience?</span>
        <div className={styles.ratingWrap}>
          <StarPicker
            value={rating}
            onChange={v => {
              setRating(prev => {
                const wasLow = prev > 0 && prev <= 3
                const isLow = v <= 3
                if (wasLow !== isLow) setHighlights([])
                return v
              })
              setFieldErrors(p => ({ ...p, rating: '' }))
            }}
            disabled={submitting}
          />
          {rating > 0 ? (
            <span className={styles.ratingLabel}>{RATING_LABELS[rating]}</span>
          ) : (
            <span className={styles.ratingHint}>Tap a star to rate</span>
          )}
        </div>
        {fieldErrors.rating && <span className={styles.errorMsg}>{fieldErrors.rating}</span>}
      </div>

      <div className={styles.sectionCard}>
        <span className={styles.sectionTitle}>
          2. {isLowRating ? 'What could be better?' : 'What did you like?'}
          <span className={styles.sectionOptional}> (Select all that apply)</span>
        </span>
        <div className={styles.chipGrid}>
          {chips.map(chip => {
            const active = highlights.includes(chip.label)
            return (
              <button
                key={chip.label}
                type="button"
                className={`${styles.chipCard} ${active ? styles.chipCardActive : ''}`}
                onClick={() => toggleChip(chip.label)}
                disabled={submitting}
              >
                <Icon name={chip.icon} size={18} />
                {chip.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <span className={styles.sectionTitle}>
          3. Tell us more about your experience
          <span className={styles.sectionOptional}> (Optional)</span>
        </span>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Your Name *</label>
          <input
            className={`${styles.input} ${fieldErrors.customerName ? styles.inputError : ''}`}
            placeholder="Enter your name"
            value={customerName}
            onChange={e => {
              setCustomerName(e.target.value)
              setFieldErrors(p => ({ ...p, customerName: '' }))
            }}
            disabled={submitting}
          />
          {fieldErrors.customerName && <span className={styles.errorMsg}>{fieldErrors.customerName}</span>}
        </div>
        <div className={styles.textareaWrap}>
          <textarea
            className={`${styles.textarea} ${fieldErrors.reviewText ? styles.inputError : ''}`}
            placeholder="Share details about the fit, quality, delivery, or anything else you'd like us to know…"
            value={reviewText}
            rows={4}
            maxLength={MAX_REVIEW_LENGTH}
            onChange={e => {
              setReviewText(e.target.value)
              setFieldErrors(p => ({ ...p, reviewText: '' }))
            }}
            disabled={submitting}
          />
          <div className={styles.textareaFooter}>
            {fieldErrors.reviewText ? (
              <span className={styles.errorMsg}>{fieldErrors.reviewText}</span>
            ) : <span />}
            <span className={styles.charCount}>{reviewText.length}/{MAX_REVIEW_LENGTH}</span>
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <span className={styles.sectionTitle}>4. Would you recommend {tailorName} to others?</span>
        <div className={styles.recommendGrid}>
          {RECOMMEND_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.recommendOption} ${recommend === opt.value ? styles.recommendOptionActive : ''}`}
              onClick={() => setRecommend(opt.value)}
              disabled={submitting}
            >
              <Icon name={opt.icon} size={19} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <span className={styles.sectionTitle}>
          5. Add a photo
          <span className={styles.sectionOptional}> (Optional)</span>
        </span>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handlePhotoSelect}
          disabled={submitting}
        />
        {photoPreview ? (
          <div className={styles.photoPreviewWrap}>
            <img src={photoPreview} alt="Your photo" className={styles.photoPreview} />
            <button
              type="button"
              className={styles.photoRemoveBtn}
              onClick={removePhoto}
              disabled={submitting}
            >
              <span className="mi" style={{ fontSize: '1rem' }}>close</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.photoUpload}
            onClick={() => photoInputRef.current?.click()}
            disabled={submitting}
          >
            <span className={styles.photoUploadIcon}>
              <span className="mi" style={{ fontSize: '1.2rem' }}>upload</span>
            </span>
            <span className={styles.photoUploadText}>
              <span className={styles.photoUploadTitle}>Upload a photo of yourself</span>
              <span className={styles.photoUploadHint}>JPG, PNG up to {MAX_PHOTO_MB}MB</span>
            </span>
            <span className="mi" style={{ fontSize: '1.6rem', color: 'var(--text3)' }}>account_circle</span>
          </button>
        )}
        {photoError && <span className={styles.errorMsg}>{photoError}</span>}
      </div>

      {error && (
        <div className={styles.submitError}>
          <span className="mi" style={{ fontSize: '1rem' }}>error_outline</span>
          {error}
        </div>
      )}

      <div className={styles.footerBlock}>
        <span className={styles.privacyRow}>
          <span className="mi" style={{ fontSize: '0.95rem', flexShrink: 0, marginTop: 1 }}>info</span>
          Your name, photo, and review may be published on {tailorName}'s portfolio for other customers to see.
        </span>
        <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <span className="mi" style={{ fontSize: '1rem', animation: 'spin 1s linear infinite' }}>autorenew</span>
              Submitting…
            </>
          ) : (
            <>
              Submit Review
              <span className="mi" style={{ fontSize: '1rem' }}>arrow_forward</span>
            </>
          )}
        </button>
        <button className={styles.skipBtn} type="button" disabled={submitting}>
          Skip for now
        </button>
      </div>

    </div>
  )
}
