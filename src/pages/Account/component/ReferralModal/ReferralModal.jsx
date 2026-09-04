import { useState, useEffect, useCallback, useRef } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useAuth } from '../../../../contexts/AuthContext'
import { getReferralHistory, getReferralHistoryFromCache, getReferralCounts, getCachedReferralCounts } from '../../../../services/referralService'
import styles from './ReferralModal.module.css'

const STATUS_META = {
  pending: { label: 'Pending', color: '#f59e0b' },
  activated: { label: 'Active', color: '#22c55e' },
}

const DONUT_CIRCUMFERENCE = 2 * Math.PI * 26

function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ReferralModal({ onClose, onShare, pendingReferralReward, onAcknowledgeReward }) {
  const { user } = useAuth()
  const hasPaintedRef = useRef(false)

  const [referrals, setReferrals] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [counts, setCounts] = useState(() => getCachedReferralCounts(user))
  const [countsStale, setCountsStale] = useState(!!getCachedReferralCounts(user))
  const [error, setError] = useState(false)

  const loadInitial = useCallback(async () => {
    if (!user) return
    setError(false)

    if (!hasPaintedRef.current) {
      const cached = await getReferralHistoryFromCache(user)
      if (cached.referrals.length > 0) {
        setReferrals(cached.referrals)
        setLoadingInitial(false)
        hasPaintedRef.current = true
      }
      const cachedCounts = getCachedReferralCounts(user)
      if (cachedCounts) {
        setCounts(cachedCounts)
        setCountsStale(true)
        setLoadingInitial(false)
        hasPaintedRef.current = true
      }
    }

    try {
      const [historyResult, countsResult] = await Promise.all([
        getReferralHistory(user),
        getReferralCounts(user).catch(() => null),
      ])
      setReferrals(historyResult.referrals)
      setCursor(historyResult.nextCursor)
      setHasMore(historyResult.hasMore)
      if (countsResult) {
        setCounts(countsResult)
        setCountsStale(false)
      }
      hasPaintedRef.current = true
    } catch (err) {
      if (!hasPaintedRef.current) {
        console.error(err)
        setError(true)
      }
    } finally {
      setLoadingInitial(false)
    }
  }, [user])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const handleLoadMore = async () => {
    if (!user || !cursor) return
    setLoadingMore(true)
    try {
      const result = await getReferralHistory(user, cursor)
      setReferrals(prev => [...prev, ...result.referrals])
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMore(false)
    }
  }

  const capReached = counts && counts.rewardsRemaining === 0
  const showSkeleton = loadingInitial && referrals.length === 0 && !counts
  const donutPercent = counts ? (capReached ? 100 : (counts.progressToNextReward / 5) * 100) : 0

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.handle} />

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={`mi-outlined ${styles.headerIcon}`}>redeem</span>
            <div>
              <div className={styles.headerTitle}>Referrals</div>
              <div className={styles.headerSub}>Invite tailors, earn free Pro</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="mi-outlined">close</span>
          </button>
        </div>

        <div className={styles.body}>

          {pendingReferralReward && (
            <div className={styles.rewardBanner}>
              <span className="mi-outlined" style={{ fontSize: '1.3rem', color: '#22c55e' }}>celebration</span>
              <div className={styles.rewardBannerText}>
                <div className={styles.rewardBannerTitle}>You earned a free month of Pro</div>
                <div className={styles.rewardBannerSub}>Thanks to {pendingReferralReward.rewardBatchCount || 5} referrals</div>
              </div>
              <button
                className={styles.rewardAckBtn}
                onClick={() => onAcknowledgeReward?.(pendingReferralReward.id)}
              >
                Got it
              </button>
            </div>
          )}

          {showSkeleton && (
            <div className={styles.premiumCard}>
              <Skeleton height={92} borderRadius={16} />
            </div>
          )}

          {!showSkeleton && counts && (
            <div className={styles.premiumCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Referral progress</span>
                {countsStale && <span className={styles.staleNote}>Updating…</span>}
              </div>

              <div className={styles.donutRow}>
                <div className={styles.donutContent}>
                  <div className={styles.cardValue} style={{ color: capReached ? '#22c55e' : 'var(--text)' }}>
                    {capReached ? 'Max rewards reached' : `${counts.rewarded}/3 rewards claimed`}
                  </div>
                  <div className={styles.donutMeta}>
                    <span className="mi-outlined" style={{ fontSize: '0.82rem' }}>group_add</span>
                    <span>
                      {capReached
                        ? "You've claimed all 3 free months"
                        : `${counts.progressToNextReward}/5 invites toward next reward`}
                    </span>
                  </div>
                </div>
                <div className={styles.donutWrap}>
                  <svg viewBox="0 0 64 64" className={styles.donutSvg}>
                    <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface2)" strokeWidth="7" />
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke={capReached ? '#22c55e' : 'var(--accent)'}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={DONUT_CIRCUMFERENCE}
                      strokeDashoffset={DONUT_CIRCUMFERENCE - (donutPercent / 100) * DONUT_CIRCUMFERENCE}
                      transform="rotate(-90 32 32)"
                      className={styles.donutProgress}
                    />
                  </svg>
                  {capReached ? (
                    <span className={`mi-outlined ${styles.donutIcon}`} style={{ color: '#22c55e' }}>check</span>
                  ) : (
                    <span className={styles.donutLabel}>{counts.progressToNextReward}/5</span>
                  )}
                </div>
              </div>

              <div className={styles.cardCaption}>
                Every 5 activated invites earns you 30 days of Pro, up to 3 times
              </div>
            </div>
          )}

          <button className={styles.shareBtn} onClick={onShare}>
            <span className="mi-outlined" style={{ fontSize: '1.1rem' }}>share</span>
            Share your code
          </button>

          <div className={styles.sectionLabel}>Your invites</div>

          {showSkeleton && (
            <div className={styles.listCard}>
              {[0, 1, 2].map(i => (
                <div key={i} className={styles.skeletonRow}>
                  <Skeleton circle width={36} height={36} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="70%" />
                    <Skeleton width="40%" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showSkeleton && error && referrals.length === 0 && (
            <div className={styles.emptyState}>
              <span className="mi-outlined" style={{ fontSize: '1.4rem', color: 'var(--text3)' }}>wifi_off</span>
              <span className={styles.emptyStateText}>Couldn't load your invites. Check your connection.</span>
              <button className={styles.retryBtn} onClick={loadInitial}>Try again</button>
            </div>
          )}

          {!showSkeleton && !error && referrals.length === 0 && (
            <div className={styles.emptyState}>
              <span className="mi-outlined" style={{ fontSize: '1.4rem', color: 'var(--text3)' }}>group_add</span>
              <span className={styles.emptyStateText}>No invites yet. Share your code to start earning free months.</span>
            </div>
          )}

          {referrals.length > 0 && (
            <div className={styles.listCard}>
              {referrals.map((r, i) => {
                const meta = STATUS_META[r.status] || STATUS_META.pending
                return (
                  <div key={r.id} className={`${styles.row} ${i === referrals.length - 1 ? styles.noDivider : ''}`}>
                    <div className={styles.rowIcon}>
                      <span className="mi-outlined" style={{ fontSize: '1rem' }}>person</span>
                    </div>
                    <div className={styles.rowText}>
                      <div className={styles.rowName}>{r.referredDisplayName || 'New tailor'}</div>
                      <div className={styles.rowDate}>{formatDate(r.createdAt)}</div>
                    </div>
                    <div className={styles.rowStatus} style={{ color: meta.color }}>{meta.label}</div>
                  </div>
                )
              })}
            </div>
          )}

          {hasMore && !showSkeleton && (
            <button className={styles.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}

        </div>

      </div>
    </div>
  )
}