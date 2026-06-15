import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebasePublic'
import { getPublicBrandDataFromFirestore } from '../../services/profileService'
import styles from './ReviewPage.module.css'

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
              fontSize: '2.2rem',
              color: n <= (hovered || value) ? '#f59e0b' : '#d1d5db',
              transition: 'color 0.15s',
            }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  )
}

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
}

export default function ReviewPage() {
  const { uid, token } = useParams()

  const [tailorName,      setTailorName]      = useState('')
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [submitting,      setSubmitting]      = useState(false)
  const [submitted,       setSubmitted]       = useState(false)
  const [error,           setError]           = useState('')

  const [customerName, setCustomerName] = useState('')
  const [rating,       setRating]       = useState(0)
  const [reviewText,   setReviewText]   = useState('')
  const [fieldErrors,  setFieldErrors]  = useState({})

  useEffect(() => {
    if (!uid || !token) { setLoading(false); return }

    async function init() {
      try {
        const brand = await getPublicBrandDataFromFirestore(db, uid)
        setTailorName(brand?.brandName || brand?.name || 'Your tailor')

        const q = query(
          collection(db, 'users', uid, 'reviews'),
          where('token', '==', token)
        )
        const snap = await getDocs(q)
        if (!snap.empty) setAlreadyReviewed(true)
      } catch {
        setTailorName('Your tailor')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [uid, token])

  const handleSubmit = async () => {
    const errs = {}
    if (!customerName.trim()) errs.customerName = 'Please enter your name'
    if (rating === 0)         errs.rating       = 'Please select a rating'
    if (!reviewText.trim())   errs.reviewText   = 'Please write a short review'
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setSubmitting(true)
    setError('')

    try {
      await addDoc(collection(db, 'users', uid, 'reviews'), {
        customerName:  customerName.trim(),
        customerPhone: '',
        customerId:    null,
        review:        reviewText.trim(),
        rating,
        token,
        status:        'pending',
        approvedAt:    null,
        createdAt:     serverTimestamp(),
        updatedAt:     serverTimestamp(),
      })
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <span className="mi" style={{ fontSize: '2rem', color: 'var(--text3)', animation: 'spin 1.2s linear infinite' }}>
            autorenew
          </span>
        </div>
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

  if (alreadyReviewed) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>
            <span className="mi" style={{ fontSize: '2rem', color: '#22c55e' }}>check_circle</span>
          </div>
          <h2 className={styles.title}>Already Submitted</h2>
          <p className={styles.subtitle}>
            You've already submitted a review for this order. Thank you! 🙏
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>
            <span className="mi" style={{ fontSize: '2.5rem', color: '#22c55e' }}>check_circle</span>
          </div>
          <h2 className={styles.title}>Thank You! 🎉</h2>
          <p className={styles.subtitle}>
            Thank you for your feedback! {tailorName} appreciates it.
          </p>
          <div className={styles.starRow}>
            {[1,2,3,4,5].map(n => (
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
      <div className={styles.card}>

        <div className={styles.header}>
          <div className={styles.brandBadge}>
            <span className="mi" style={{ fontSize: '1.4rem', color: 'var(--text)' }}>content_cut</span>
          </div>
          <h1 className={styles.title}>Leave a Review</h1>
          <p className={styles.subtitle}>
            How was your experience with <strong>{tailorName}</strong>?
            Your honest feedback helps them grow. ✂️
          </p>
        </div>

        <div className={styles.form}>

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
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Rating *</label>
            <StarPicker value={rating} onChange={v => { setRating(v); setFieldErrors(p => ({ ...p, rating: '' })) }} disabled={submitting} />
            {rating > 0 && (
              <span className={styles.ratingLabel}>{RATING_LABELS[rating]}</span>
            )}
            {fieldErrors.rating && (
              <span className={styles.errorMsg}>{fieldErrors.rating}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Your Review *</label>
            <textarea
              className={`${styles.textarea} ${fieldErrors.reviewText ? styles.inputError : ''}`}
              placeholder="Tell others about the quality, fit, communication and delivery…"
              value={reviewText}
              rows={5}
              onChange={e => {
                setReviewText(e.target.value)
                setFieldErrors(p => ({ ...p, reviewText: '' }))
              }}
              disabled={submitting}
            />
            {fieldErrors.reviewText && (
              <span className={styles.errorMsg}>{fieldErrors.reviewText}</span>
            )}
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

        </div>

        <p className={styles.disclaimer}>
          Your review will be live on {tailorName}'s portfolio once it's approved.
        </p>

      </div>
    </div>
  )
}