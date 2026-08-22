import { useState, useCallback, useRef, useEffect } from 'react'
import { getInitials } from '../../utils/nameUtils'
import Header from '../../components/Header/Header'
import Toast from '../../components/Toast/Toast'
import ConfirmSheet from '../../components/ConfirmSheet/ConfirmSheet'
import { useReviews } from '../../contexts/ReviewContext'
import styles from './Reviews.module.css'
import BottomNav from '../../components/BottomNav/BottomNav'

function formatDate(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const HIGHLIGHT_ICONS = {
  'Perfect Fit':          'straighten',
  'Fit Issues':           'straighten',
  'Quality of Material':  'checkroom',
  'Material Quality':     'checkroom',
  'Finishing':            'content_cut',
  'On-time Delivery':     'local_shipping',
  'Late Delivery':        'local_shipping',
  'Took Too Long':        'schedule',
  'Customer Service':     'support_agent',
  'Communication':        'chat',
  'Overall Experience':   'star',
  'Not As Expected':      'report_problem',
}

const RECOMMEND_CONFIG = {
  yes:   { label: 'Yes, definitely', icon: 'thumb_up',          color: '#22c55e' },
  maybe: { label: 'Maybe',           icon: 'sentiment_neutral', color: '#f59e0b' },
  no:    { label: 'No',              icon: 'thumb_down',        color: '#ef4444' },
}

function StarDisplay({ rating, size = '1rem' }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className="mi-outlined"
          style={{
            fontSize: size,
            color: n <= rating ? '#f59e0b' : 'var(--border2)',
          }}
        >
          star
        </span>
      ))}
    </div>
  )
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className={styles.starPicker}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={styles.starPickerBtn}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >
          <span
            className="mi-outlined"
            style={{
              fontSize: '2rem',
              color: n <= (hovered || value) ? '#f59e0b' : 'var(--border2)',
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

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  icon: 'schedule'     },
  approved: { label: 'Approved', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.35)',   icon: 'check_circle' },
  rejected: { label: 'Rejected', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)', icon: 'cancel'       },
}

const STATUS_ACTIONS = {
  approved: 'Approve',
  rejected: 'Reject',
}

const TABS = [
  { id: 'all',      label: 'All'      },
  { id: 'pending',  label: 'Pending'  },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

function AddReviewSheet({ isOpen, onClose, onSave }) {
  const [customerName,  setCustomerName]  = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [reviewText,    setReviewText]    = useState('')
  const [rating,        setRating]        = useState(0)
  const [errors,        setErrors]        = useState({})

  const reset = () => {
    setCustomerName('')
    setCustomerPhone('')
    setReviewText('')
    setRating(0)
    setErrors({})
  }

  const handleClose = () => { reset(); onClose() }

  const handleSave = () => {
    const errs = {}
    if (!customerName.trim()) errs.customerName = 'Name is required'
    if (!reviewText.trim())   errs.reviewText   = 'Review text is required'
    if (rating === 0)         errs.rating       = 'Please select a rating'
    if (Object.keys(errs).length) { setErrors(errs); return }

    onSave({
      customerName:  customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerId:    null,
      review:        reviewText.trim(),
      rating,
      token:         crypto.randomUUID(),
    })
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.sheetOverlay} onClick={handleClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>Add Review Manually</span>
          <button className={styles.sheetClose} onClick={handleClose}>
            <span className="mi-outlined" style={{ fontSize: '1.2rem' }}>close</span>
          </button>
        </div>

        <div className={styles.sheetBody}>
          <label className={styles.fieldLabel}>
            Customer Name <span className={styles.req}>*</span>
          </label>
          <input
            className={`${styles.input} ${errors.customerName ? styles.inputError : ''}`}
            placeholder="e.g. Emeka Okafor"
            value={customerName}
            onChange={e => { setCustomerName(e.target.value); setErrors(p => ({ ...p, customerName: '' })) }}
          />
          {errors.customerName && <span className={styles.errorMsg}>{errors.customerName}</span>}

          <label className={styles.fieldLabel} style={{ marginTop: 16 }}>
            WhatsApp Number <span className={styles.optional}>(optional)</span>
          </label>
          <input
            className={styles.input}
            placeholder="e.g. 08012345678"
            value={customerPhone}
            type="tel"
            onChange={e => setCustomerPhone(e.target.value)}
          />

          <label className={styles.fieldLabel} style={{ marginTop: 16 }}>
            Rating <span className={styles.req}>*</span>
          </label>
          <StarPicker value={rating} onChange={v => { setRating(v); setErrors(p => ({ ...p, rating: '' })) }} />
          {errors.rating && <span className={styles.errorMsg}>{errors.rating}</span>}

          <label className={styles.fieldLabel} style={{ marginTop: 16 }}>
            Review <span className={styles.req}>*</span>
          </label>
          <textarea
            className={`${styles.textarea} ${errors.reviewText ? styles.inputError : ''}`}
            placeholder="Write the customer's review here…"
            value={reviewText}
            rows={4}
            onChange={e => { setReviewText(e.target.value); setErrors(p => ({ ...p, reviewText: '' })) }}
          />
          {errors.reviewText && <span className={styles.errorMsg}>{errors.reviewText}</span>}
        </div>

        <div className={styles.sheetFooter}>
          <button className={styles.sheetSaveBtn} onClick={handleSave}>Save Review</button>
        </div>
      </div>
    </div>
  )
}

function ReviewDetailSheet({ review, phone, phoneLoading, onClose, onApprove, onReject, onDelete }) {
  const [avatarFailed,   setAvatarFailed]   = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [pendingStatus,  setPendingStatus]  = useState(false)
  const statusRef = useRef(null)

  useEffect(() => {
    setAvatarFailed(false)
    setShowStatusMenu(false)
    setPendingStatus(false)
  }, [review?.id])

  useEffect(() => {
    if (!showStatusMenu) return
    function handleClickOutside(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setShowStatusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showStatusMenu])

  if (!review) return null

  const sc = STATUS_CONFIG[review.status] ?? STATUS_CONFIG.pending
  const rc = review.recommend ? RECOMMEND_CONFIG[review.recommend] : null
  const hasPhoto = review.photoUrl && !avatarFailed
  const highlights = Array.isArray(review.highlights) ? review.highlights : []
  const isLowRating = review.rating > 0 && review.rating <= 3
  const highlightsTitle = isLowRating ? 'What Could Improve' : 'What They Enjoyed'
  const submittedLabel = formatDate(review.createdAt)

  async function handleStatusSelect(nextStatus) {
    if (pendingStatus || nextStatus === review.status) {
      setShowStatusMenu(false)
      return
    }
    setShowStatusMenu(false)
    setPendingStatus(true)
    try {
      if (nextStatus === 'approved') await onApprove(review.id)
      else if (nextStatus === 'rejected') await onReject(review.id)
    } finally {
      setPendingStatus(false)
    }
  }

  return (
    <div className={styles.sheetOverlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>Review Details</span>
          <div className={styles.sheetHeaderActions}>
            <button className={styles.sheetHeaderDelete} onClick={() => onDelete(review)}>
              <span className="mi-outlined" style={{ fontSize: '1.05rem' }}>delete_outline</span>
            </button>
            <button className={styles.sheetClose} onClick={onClose}>
              <span className="mi-outlined" style={{ fontSize: '1.2rem' }}>close</span>
            </button>
          </div>
        </div>

        <div className={styles.sheetBody}>

          <div className={styles.detailCustomerRow}>
            {hasPhoto ? (
              <img
                src={review.photoUrl}
                alt={review.customerName}
                className={styles.detailAvatarImg}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div className={styles.detailAvatar}>
                {getInitials(review.customerName) || '?'}
              </div>
            )}
            <div>
              <div className={styles.detailCustomerName}>{review.customerName}</div>
              {phoneLoading ? (
                <div className={styles.detailCustomerPhone}>
                  <span className="mi-outlined" style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>phone</span>
                  …
                </div>
              ) : phone ? (
                <div className={styles.detailCustomerPhone}>
                  <span className="mi-outlined" style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>phone</span>
                  {phone}
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.statusRow}>
            <div className={styles.chipLabel}>Status</div>
            <div className={styles.statusDropdown} ref={statusRef}>
              <button
                type="button"
                className={styles.statusTrigger}
                disabled={pendingStatus}
                onClick={() => setShowStatusMenu(v => !v)}
                style={{ background: sc.bg, borderColor: sc.border }}
              >
                <span className={styles.statusTriggerLeft}>
                  <span className="mi-outlined" style={{ fontSize: '0.9rem', color: sc.color }}>{sc.icon}</span>
                  <span style={{ color: sc.color }}>{sc.label}</span>
                </span>
                <span
                  className="mi-outlined"
                  style={{
                    fontSize: '1.1rem',
                    color: sc.color,
                    opacity: 0.7,
                    transform: showStatusMenu ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s',
                  }}
                >
                  expand_more
                </span>
              </button>

              {showStatusMenu && (
                <div className={styles.statusMenu}>
                  {['approved', 'rejected'].filter(s => s !== review.status).map(s => {
                    const meta = STATUS_CONFIG[s]
                    return (
                      <button
                        key={s}
                        type="button"
                        className={styles.statusMenuItem}
                        onClick={() => handleStatusSelect(s)}
                      >
                        <span className="mi-outlined" style={{ fontSize: '0.9rem', color: meta.color }}>{meta.icon}</span>
                        <span>{STATUS_ACTIONS[s]}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoGridCell}>
              <div className={styles.infoGridLabel}>Rating</div>
              <div className={styles.infoGridValue}>
                <StarDisplay rating={review.rating} size="0.85rem" />
              </div>
            </div>
            {rc && (
              <div className={styles.infoGridCell}>
                <div className={styles.infoGridLabel}>Recommend</div>
                <div className={styles.infoGridValue} style={{ color: rc.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="mi-outlined" style={{ fontSize: '0.95rem' }}>{rc.icon}</span>
                  {rc.label}
                </div>
              </div>
            )}
            <div className={styles.infoGridCell}>
              <div className={styles.infoGridLabel}>Submitted</div>
              <div className={styles.infoGridValue}>{submittedLabel || '—'}</div>
            </div>
          </div>

          {highlights.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionCardLabel}>{highlightsTitle}</div>
              <div className={styles.highlightGrid}>
                {highlights.map(label => (
                  <span key={label} className={styles.highlightChip}>
                    <span className="mi-outlined" style={{ fontSize: '0.95rem' }}>
                      {HIGHLIGHT_ICONS[label] || 'label'}
                    </span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sectionCard}>
            <div className={styles.sectionCardLabel}>Review</div>
            <div className={styles.detailReviewBox}>
              <span className="mi-outlined" style={{ fontSize: '1.2rem', color: 'var(--text3)', flexShrink: 0 }}>format_quote</span>
              <p className={styles.detailReviewText}>{review.review}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function ReviewCard({ review, onTap, isLast }) {
  const [avatarFailed, setAvatarFailed] = useState(false)
  const sc = STATUS_CONFIG[review.status] ?? STATUS_CONFIG.pending
  const hasPhoto = review.photoUrl && !avatarFailed

  return (
    <div
      className={`${styles.reviewCard} ${isLast ? styles.reviewCardLast : ''}`}
      onClick={onTap}
    >
      <div className={styles.cardAvatarOuter}>
        <div className={styles.cardAvatarInner}>
          {hasPhoto ? (
            <img
              src={review.photoUrl}
              alt={review.customerName}
              className={styles.cardAvatarImg}
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span className={styles.cardAvatarInitials}>
              {getInitials(review.customerName) || '?'}
            </span>
          )}
        </div>
      </div>

      <div className={styles.cardInfo}>
        <div className={styles.cardName}>{review.customerName}</div>
        <StarDisplay rating={review.rating} size="0.85rem" />
        <p className={styles.cardReviewSnippet}>
          {review.review?.length > 72 ? review.review.slice(0, 72) + '…' : review.review}
        </p>
      </div>

      <div className={styles.cardRight}>
        <span
          className={styles.statusPill}
          style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}
        >
          {sc.label}
        </span>
        <span className={styles.cardDate}>{formatDate(review.createdAt)}</span>
      </div>
    </div>
  )
}

export default function Reviews({ onMenuClick }) {
  const { reviews, loading, addReview, approveReview, rejectReview, deleteReview, getContactPhone } = useReviews()

  const [activeTab,      setActiveTab]      = useState('all')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [addSheetOpen,   setAddSheetOpen]   = useState(false)
  const [detailReview,   setDetailReview]   = useState(null)
  const [detailPhone,    setDetailPhone]    = useState(null)
  const [phoneLoading,   setPhoneLoading]   = useState(false)
  const [confirmDel,     setConfirmDel]     = useState(null)
  const [toastMsg,       setToastMsg]       = useState('')
  const toastTimer = useRef(null)
  const tabRefs    = useRef({})

  const showToast = useCallback(msg => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400)
  }, [])

  useEffect(() => {
    if (!detailReview) { setDetailPhone(null); return }
    let cancelled = false
    setPhoneLoading(true)
    getContactPhone(detailReview.id)
      .then(phone => { if (!cancelled) setDetailPhone(phone) })
      .catch(() => { if (!cancelled) setDetailPhone(null) })
      .finally(() => { if (!cancelled) setPhoneLoading(false) })
    return () => { cancelled = true }
  }, [detailReview, getContactPhone])

  const tabFiltered = activeTab === 'all'
    ? reviews
    : reviews.filter(r => r.status === activeTab)

  const filtered = searchQuery.trim()
    ? tabFiltered.filter(r =>
        r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.review?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tabFiltered

  const counts = {
    all:      reviews.length,
    pending:  reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  }

  const handleAddReview = async data => {
    try {
      await addReview(data)
      showToast('Review added ✓')
    } catch {
      showToast('Failed to add review')
    }
  }

  const handleApprove = async id => {
    try {
      await approveReview(id)
      setDetailReview(prev => prev?.id === id ? { ...prev, status: 'approved' } : prev)
      showToast('Review approved ✓')
    } catch {
      showToast('Failed to approve review')
    }
  }

  const handleReject = async id => {
    try {
      await rejectReview(id)
      setDetailReview(prev => prev?.id === id ? { ...prev, status: 'rejected' } : prev)
      showToast('Review rejected')
    } catch {
      showToast('Failed to reject review')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDel) return
    try {
      await deleteReview(confirmDel.id)
      showToast('Review deleted')
    } catch {
      showToast('Failed to delete review')
    }
    setConfirmDel(null)
    setDetailReview(null)
  }

  const emptyTitle = searchQuery.trim()
    ? 'No results found'
    : activeTab === 'all'
      ? 'No reviews yet'
      : `No ${activeTab} reviews`

  return (
    <div className={styles.page}>
      <Header title="Reviews" onMenuClick={onMenuClick} />

      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <span className="mi-outlined" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
          <input
            className={styles.searchInput}
            placeholder="Search reviews or clients…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.searchClear} onClick={() => setSearchQuery('')}>
              <span className="mi-outlined" style={{ fontSize: '1rem' }}>close</span>
            </button>
          )}
        </div>
        <button className={styles.filterBtn}>
          <span className="mi-outlined" style={{ fontSize: '1.2rem' }}>tune</span>
        </button>
      </div>

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <div
            key={tab.id}
            ref={el => { tabRefs.current[tab.id] = el }}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab(tab.id)
              tabRefs.current[tab.id]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
            }}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`${styles.tabBadge} ${tab.id === 'pending' && counts.pending > 0 ? styles.tabBadgePending : ''}`}>
                {counts[tab.id]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.listArea}>
        {loading ? (
          <div className={styles.emptyState}>
            <span className="mi-outlined" style={{ fontSize: '2.5rem', color: 'var(--text3)' }}>hourglass_empty</span>
            <p className={styles.emptyStateTitle}>Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="mi-outlined" style={{ fontSize: '2.5rem', color: 'var(--text3)' }}>rate_review</span>
            <p className={styles.emptyStateTitle}>{emptyTitle}</p>
            {activeTab === 'all' && !searchQuery.trim() && (
              <p className={styles.emptyStateSubtitle}>
                Send review links to customers from their order detail, or tap the <strong>+</strong> button to add one manually.
              </p>
            )}
          </div>
        ) : (
          <div className={styles.reviewList}>
            {filtered.map((review, idx) => (
              <ReviewCard
                key={review.id}
                review={review}
                isLast={idx === filtered.length - 1}
                onTap={() => setDetailReview(review)}
              />
            ))}
          </div>
        )}
      </div>

      <button className={styles.fab} onClick={() => setAddSheetOpen(true)}>
        <span className="mi-outlined">add</span>
      </button>

      <AddReviewSheet
        isOpen={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSave={handleAddReview}
      />

      {detailReview && (
        <ReviewDetailSheet
          review={detailReview}
          phone={detailPhone}
          phoneLoading={phoneLoading}
          onClose={() => setDetailReview(null)}
          onApprove={id => handleApprove(id)}
          onReject={id => handleReject(id)}
          onDelete={r => { setDetailReview(null); setConfirmDel(r) }}
        />
      )}

      <ConfirmSheet
        open={!!confirmDel}
        title="Delete Review?"
        message="This review will be permanently removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDel(null)}
      />

      <Toast message={toastMsg} />
      <BottomNav />
    </div>
  )
}
