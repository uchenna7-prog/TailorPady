import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../firebasePublic'
import { getPublicBrandDataFromServer } from '../../services/profileService'
import {
  getReviewByToken,
  submitPublicReview,
  getReviewOrderSnapshot,
  getApprovedReviews,
} from '../../services/reviewService'
import OrderMosaic from '../../components/OrderMosaic/OrderMosaic'
import styles from './ReviewPage.module.css'

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' }

const POSITIVE_CHIPS = ['Great fit', 'Fast delivery', 'High quality', 'Great communication', 'Worth the price']
const CONSTRUCTIVE_CHIPS = ['Took too long', 'Fit issues', 'Poor communication', 'Not as expected', 'Price concerns']

const MIN_REVIEW_LENGTH = 10
const MAX_REVIEW_LENGTH = 500

// Simple luminance check so the accent button text stays readable
// against whatever brand color the tailor picked.
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

function StarPicker({ value, onChange, disabled, size = 'lg' }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className={styles.starPicker}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`${styles.starBtn} ${n <= (hovered || value) ? styles.starBtnActive : ''}`}
          disabled={disabled}
          onMouseEnter={() => !disabled && setHovered(n)}
          onMouseLeave={() => !disabled && setHovered(0)}
          onClick={() => !disabled && onChange(n)}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          <span
            className="mi"
            style={{
              fontSize: size === 'lg' ? '2.6rem' : '1.6rem',
              color: n <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  )
}

function ConfettiBurst() {
  const particles = ['🎉', '✨', '⭐', '🎊', '✨']
  return (
    <div className={styles.confettiWrap} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className={styles.confettiParticle}
          style={{
            left: `${18 + i * 16}%`,
            animationDelay: `${i * 70}ms`,
          }}
        >
          {p}
        </span>
      ))}
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={`${styles.skel} ${styles.skelBadge}`} />
        <div className={`${styles.skel} ${styles.skelTitle}`} />
        <div className={`${styles.skel} ${styles.skelSubtitle}`} />
      </div>
      <div className={styles.form}>
        <div className={`${styles.skel} ${styles.skelStars}`} />
        <div className={`${styles.skel} ${styles.skelInput}`} />
        <div className={`${styles.skel} ${styles.skelTextarea}`} />
      </div>
    </div>
  )
}

export default function ReviewPage() {
  const { uid, token } = useParams()

  const [tailorName,      setTailorName]      = useState('')
  const [brandColour,     setBrandColour]     = useState('')
  const [orderItems,      setOrderItems]      = useState([])
  const [avgRating,       setAvgRating]       = useState(0)
  const [reviewCount,     setReviewCount]     = useState(0)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [submitting,      setSubmitting]      = useState(false)
  const [submitted,       setSubmitted]       = useState(false)
  const [error,           setError]           = useState('')
  const [offline,         setOffline]         = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [rating,       setRating]       = useState(0)
  const [reviewText,   setReviewText]   = useState('')
  const [fieldErrors,  setFieldErrors]  = useState({})

  const revealed = rating > 0
  const isLowRating = rating > 0 && rating <= 3

  const textColor = useMemo(() => getReadableTextColor(brandColour), [brandColour])
  const chips = isLowRating ? CONSTRUCTIVE_CHIPS : POSITIVE_CHIPS

  useEffect(() => {
    if (!uid || !token) { setLoading(false); return }

    async function init() {
      const [brandResult, snapshotResult, existingResult, approvedResult] = await Promise.allSettled([
        getPublicBrandDataFromServer(db, uid),
        getReviewOrderSnapshot(db, uid, token),
        getReviewByToken(db, uid, token),
        getApprovedReviews(db, uid),
      ])

      const brand = brandResult.status === 'fulfilled' ? brandResult.value : null
      setTailorName(brand?.brandName || brand?.name || 'Your tailor')
      setBrandColour(brand?.brandColour || '')

      const snapshot = snapshotResult.status === 'fulfilled' ? snapshotResult.value : null
      if (snapshot?.items?.length) setOrderItems(snapshot.items)

      const existing = existingResult.status === 'fulfilled' ? existingResult.value : null
      if (existing) setAlreadyReviewed(true)

      const approved = approvedResult.status === 'fulfilled' ? approvedResult.value : []
      if (approved.length) {
        const sum = approved.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
        setAvgRating(sum / approved.length)
        setReviewCount(approved.length)
      }

      // If literally everything failed, this is likely a connectivity issue
      // rather than "no data" — tell the visitor instead of silently
      // rendering a page with defaults.
      const allFailed = [brandResult, snapshotResult, existingResult].every(r => r.status === 'rejected')
      if (allFailed) setOffline(true)

      setLoading(false)
    }

    init()
  }, [uid, token])

  const retry = () => {
    setOffline(false)
    setLoading(true)
    setError('')
    // re-trigger the effect
    setTailorName('')
  }

  const toggleChip = (chip) => {
    const parts = reviewText.split('. ').map(s => s.trim()).filter(Boolean)
    const idx = parts.indexOf(chip)
    let next
    if (idx >= 0) {
      parts.splice(idx, 1)
      next = parts.join('. ')
    } else {
      next = parts.length ? `${parts.join('. ')}. ${chip}` : chip
    }
    setReviewText(next.slice(0, MAX_REVIEW_LENGTH))
    setFieldErrors(p => ({ ...p, reviewText: '' }))
  }

  const handleSubmit = async () => {
    const errs = {}
    if (!customerName.trim()) errs.customerName = 'Please enter your name'
    if (rating === 0)         errs.rating       = 'Please select a rating'
    if (!reviewText.trim())   errs.reviewText   = 'Please write a short review'
    else if (reviewText.trim().length < MIN_REVIEW_LENGTH) {
      errs.reviewText = `A few more details help — at least ${MIN_REVIEW_LENGTH} characters`
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
    return (
      <div className={styles.page}>
        <ReviewSkeleton />
      </div>
    )
  }

  if (!uid || !token) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <span className="mi" style={{ fontSize: '3rem', color: 'var(--text3)' }}>link_off</span>
          <h2 className={styles.title} style={{ marginTop: 16 }}>Invalid Link</h2>
          <p className={styles.subtitle}>This review link is not valid. Please ask your tailor to resend the link.</p>
        </div>
      </div>
    )
  }

  if (offline) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <span className="mi" style={{ fontSize: '3rem', color: 'var(--text3)' }}>wifi_off</span>
          <h2 className={styles.title} style={{ marginTop: 16 }}>Couldn't Load</h2>
          <p className={styles.subtitle}>Check your connection and try again.</p>
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
        <div className={styles.card}>
          <div className={styles.successIcon}>
            <span className="mi" style={{ fontSize: '2rem', color: '#22c55e' }}>check_circle</span>
          </div>
          <h2 className={styles.title}>Already Submitted</h2>
          <p className={styles.subtitle}>
            You've already submitted a review for this order — thank you for taking the time! 🙏
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIconWrap}>
            {!isLowRating && <ConfettiBurst />}
            <div className={styles.successIcon}>
              <span className="mi" style={{ fontSize: '2.5rem', color: '#22c55e' }}>check_circle</span>
            </div>
          </div>
          <h2 className={styles.title}>{isLowRating ? 'Thank You for Sharing' : 'Thank You! 🎉'}</h2>
          <p className={styles.subtitle}>
            {isLowRating
              ? `Your feedback goes straight to ${tailorName} so they can make it right.`
              : `Thank you for your feedback! ${tailorName} appreciates it.`}
          </p>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <span
                key={n}
                className="mi"
                style={{ fontSize: '1.6rem', color: n <= rating ? '#f59e0b' : '#d1d5db' }}
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
    <div className={styles.page}>
      <div
        className={styles.card}
        style={{ '--brand-accent': brandColour || 'var(--accent)', '--brand-accent-text': textColor }}
      >

        <div className={styles.header}>
          {orderItems.length > 0 ? (
            <OrderMosaic items={orderItems} size="md" className={styles.brandBadge} />
          ) : (
            <div className={styles.brandBadge}>
              <span className="mi" style={{ fontSize: '1.4rem', color: 'var(--text)' }}>content_cut</span>
            </div>
          )}
          <h1 className={styles.title}>Leave a Review</h1>
          <p className={styles.subtitle}>
            How was your experience with <strong>{tailorName}</strong>?
            Your honest feedback helps them grow. ✂️
          </p>
          {reviewCount > 0 && (
            <div className={styles.ratingSummary}>
              <span className="mi" style={{ fontSize: '0.9rem', color: '#f59e0b' }}>star</span>
              {avgRating.toFixed(1)} · {reviewCount} review{reviewCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Step 1: rating always shown first, on its own */}
        <div className={styles.fieldGroup} style={{ alignItems: 'center', textAlign: 'center' }}>
          <label className={styles.fieldLabel}>Your Rating *</label>
          <StarPicker value={rating} onChange={v => { setRating(v); setFieldErrors(p => ({ ...p, rating: '' })) }} disabled={submitting} />
          {rating > 0 && (
            <span className={styles.ratingLabel}>{RATING_LABELS[rating]}</span>
          )}
          {fieldErrors.rating && (
            <span className={styles.errorMsg}>{fieldErrors.rating}</span>
          )}
        </div>

        {/* Step 2: revealed once a rating is picked */}
        {revealed && (
          <div className={styles.form}>

            <p className={styles.branchNote}>
              {isLowRating
                ? `We're sorry to hear that. Tell ${tailorName} what went wrong — this helps them fix it.`
                : `You're about to make ${tailorName}'s day!`}
            </p>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Your Name *</label>
              <input
                className={`${styles.input} ${fieldErrors.customerName ? styles.inputError : ''}`}
                placeholder="e.g. Emeka Okafor"
                value={customerName}
                onChange={e => {
                  setCustomerName(e.target.value)
                  setFieldErrors(p => ({ ...p, customerName: '' }))
                }}
                disabled={submitting}
              />
              {fieldErrors.customerName && (
                <span className={styles.errorMsg}>{fieldErrors.customerName}</span>
              )}
              <span className={styles.privacyNote}>
                Your name and review will be shown publicly on {tailorName}'s portfolio once approved.
              </span>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{isLowRating ? 'What could be better?' : 'What stood out?'}</label>
              <div className={styles.chipRow}>
                {chips.map(chip => {
                  const active = reviewText.split('. ').map(s => s.trim()).includes(chip)
                  return (
                    <button
                      key={chip}
                      type="button"
                      className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                      onClick={() => toggleChip(chip)}
                      disabled={submitting}
                    >
                      {chip}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Your Review *</label>
              <textarea
                className={`${styles.textarea} ${fieldErrors.reviewText ? styles.inputError : ''}`}
                placeholder="Tell others about the quality, fit, communication and delivery…"
                value={reviewText}
                rows={5}
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

            {error && (
              <div className={styles.submitError}>
                <span className="mi" style={{ fontSize: '1rem' }}>error_outline</span>
                {error}
              </div>
            )}

            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="mi" style={{ fontSize: '1rem', animation: 'spin 1s linear infinite' }}>autorenew</span>
                  Submitting…
                </>
              ) : (
                <>
                  <span className="mi" style={{ fontSize: '1rem' }}>send</span>
                  Submit Review
                </>
              )}
            </button>

            <p className={styles.disclaimer}>
              Your review will be live on {tailorName}'s portfolio once it's approved.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
