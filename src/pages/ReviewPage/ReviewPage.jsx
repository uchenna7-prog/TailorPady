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

const POSITIVE_CHIPS = [
  { label: 'Perfect Fit', icon: 'straighten' },
  { label: 'Quality of Material', icon: 'workspace_premium' },
  { label: 'Finishing', icon: 'content_cut' },
  { label: 'On-time Delivery', icon: 'local_shipping' },
  { label: 'Customer Service', icon: 'support_agent' },
  { label: 'Communication', icon: 'chat_bubble' },
  { label: 'Overall Experience', icon: 'star' },
]

const CONSTRUCTIVE_CHIPS = [
  { label: 'Fit Issues', icon: 'straighten' },
  { label: 'Material Quality', icon: 'workspace_premium' },
  { label: 'Took Too Long', icon: 'schedule' },
  { label: 'Late Delivery', icon: 'local_shipping' },
  { label: 'Customer Service', icon: 'support_agent' },
  { label: 'Communication', icon: 'chat_bubble' },
  { label: 'Not As Expected', icon: 'report_problem' },
]

const RECOMMEND_OPTIONS = [
  { value: 'yes', label: 'Yes, definitely' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: 'No' },
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

function formatDate(value) {
  if (!value) return ''
  try {
    const date = value?.toDate ? value.toDate() : new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
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
        <div className={`${styles.skel} ${styles.skelOrderImage}`} />
        <div className={styles.orderInfo}>
          <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: 70, height: 11 }} />
          <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: 100, height: 11 }} />
          <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '80%', height: 17, marginTop: 2 }} />
          <div className={`${styles.skel} ${styles.skelLine}`} style={{ width: '90%', height: 12, marginTop: 2 }} />
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
  const [orderNumber,     setOrderNumber]     = useState('')
  const [orderStatus,     setOrderStatus]     = useState('')
  const [deliveredAt,     setDeliveredAt]     = useState(null)
  const [snapshotCustomerName, setSnapshotCustomerName] = useState('')
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [submitting,      setSubmitting]      = useState(false)
  const [submitted,       setSubmitted]       = useState(false)
  const [error,           setError]           = useState('')
  const [offline,         setOffline]         = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [rating,       setRating]       = useState(0)
  const [reviewText,   setReviewText]   = useState('')
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
    if (!orderItems.length) return 'Your order'
    const names = orderItems
      .map(item => item.name || item.itemName || item.garmentName || item.type)
      .filter(Boolean)
    if (!names.length) return 'Your order'
    return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2} more` : names.join(', ')
  }, [orderItems])

  const deliveredLabel = useMemo(() => formatDate(deliveredAt), [deliveredAt])

  useEffect(() => {
    if (!uid || !token) { setLoading(false); return }

    async function init() {
      const [brandResult, snapshotResult, existingResult] = await Promise.allSettled([
        getPublicBrandDataFromServer(db, uid),
        getReviewOrderSnapshot(db, uid, token),
        getReviewByToken(db, uid, token),
      ])

      const brand = brandResult.status === 'fulfilled' ? brandResult.value : null
      setTailorName(brand?.brandName || brand?.name || 'Your tailor')
      setBrandTagline(brand?.tagline || brand?.slogan || '')
      setBrandColour(brand?.brandColour || '')
      setBrandLogoUrl(brand?.logoUrl || brand?.brandLogo || '')

      const snapshot = snapshotResult.status === 'fulfilled' ? snapshotResult.value : null
      if (snapshot?.items?.length) setOrderItems(snapshot.items)
      if (snapshot?.orderNumber) setOrderNumber(snapshot.orderNumber)
      if (snapshot?.status) setOrderStatus(snapshot.status)
      if (snapshot?.deliveredAt) setDeliveredAt(snapshot.deliveredAt)
      if (snapshot?.customerName) setSnapshotCustomerName(snapshot.customerName)

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
    const parts = reviewText.split('. ').map(s => s.trim()).filter(Boolean)
    const idx = parts.indexOf(label)
    let next
    if (idx >= 0) {
      parts.splice(idx, 1)
      next = parts.join('. ')
    } else {
      next = parts.length ? `${parts.join('. ')}. ${label}` : label
    }
    setReviewText(next.slice(0, MAX_REVIEW_LENGTH))
    setFieldErrors(p => ({ ...p, reviewText: '' }))
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
        {orderItems.length > 0 ? (
          <OrderMosaic items={orderItems} size="lg" className={styles.orderImage} />
        ) : (
          <div className={styles.orderImageFallback}>
            <span className="mi" style={{ fontSize: '1.6rem', color: 'var(--text3)' }}>content_cut</span>
          </div>
        )}
        <div className={styles.orderInfo}>
          {orderStatus && (
            <span className={styles.statusBadge}>
              {orderStatus}
              <span className="mi" style={{ fontSize: '0.9rem' }}>check_circle</span>
            </span>
          )}
          {orderNumber && (
            <span className={styles.orderNumber}>Order #{orderNumber}</span>
          )}
          <span className={styles.orderName}>{orderName}</span>
          {deliveredLabel && (
            <span className={styles.orderMetaRow}>
              <span className="mi" style={{ fontSize: '1rem' }}>calendar_today</span>
              Delivered on {deliveredLabel}
            </span>
          )}
          {snapshotCustomerName && (
            <span className={styles.orderMetaRow}>
              <span className="mi" style={{ fontSize: '1rem' }}>person</span>
              Thank you, {snapshotCustomerName}
            </span>
          )}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <span className={styles.sectionTitle}>1. How would you rate your overall experience?</span>
        <div className={styles.ratingWrap}>
          <StarPicker value={rating} onChange={v => { setRating(v); setFieldErrors(p => ({ ...p, rating: '' })) }} disabled={submitting} />
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
            const active = reviewText.split('. ').map(s => s.trim()).includes(chip.label)
            return (
              <button
                key={chip.label}
                type="button"
                className={`${styles.chipCard} ${active ? styles.chipCardActive : ''}`}
                onClick={() => toggleChip(chip.label)}
                disabled={submitting}
              >
                <span className="mi" style={{ fontSize: '1.1rem' }}>{chip.icon}</span>
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
              <span className={styles.radioDot} />
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
          <span className="mi" style={{ fontSize: '0.9rem' }}>lock</span>
          Your review is private and will only be used to improve our service.
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
