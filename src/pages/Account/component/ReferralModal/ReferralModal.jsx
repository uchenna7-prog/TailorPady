import { useState, useEffect, useCallback } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useAuth } from '../../../../contexts/AuthContext'
import { getReferralHistory, getReferralCounts } from '../../../../services/referralService'
import styles from './ReferralModal.module.css'

const STATUS_META = {
  pending: { label: 'Pending', color: '#f59e0b' },
  activated: { label: 'Active', color: '#22c55e' },
}

function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ReferralModal({ onClose, onShare, pendingReferralReward, onAcknowledgeReward }) {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState(false)

  const loadInitial = useCallback(async () => {
    if (!user) return
    setLoadingInitial(true)
    setError(false)
    try {
      const [historyResult, countsResult] = await Promise.all([
        getReferralHistory(user),
        getReferralCounts(user),
      ])
      setReferrals(historyResult.referrals)
      setCursor(historyResult.nextCursor)
      setHasMore(historyResult.hasMore)
      setCounts(countsResult)
    } catch {
      setError(true)
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
    } catch {
    } finally {
      setLoadingMore(false)
    }
  }

  const capReached = counts && counts.rewardsRemaining === 0

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

          {loadingInitial && (
            <div className={styles.progressCard}>
              <Skeleton height={54} borderRadius={16} />
            </div>
          )}

          {!loadingInitial && counts && (
            <div className={styles.progressCard}>
              <div className={styles.progressTop}>
                <span className={styles.progressLabel}>
                  {capReached ? 'Max rewards reached' : `${counts.progressToNextReward}/5 toward your next free month`}
                </span>
                <span className={styles.progressCount}>{counts.rewarded}/3 claimed</span>
              </div>
              {!capReached && (
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(counts.progressToNextReward / 5) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <button className={styles.shareBtn} onClick={onShare}>
            <span className="mi-outlined" style={{ fontSize: '1.1rem' }}>share</span>
            Share your code
          </button>

          <div className={styles.sectionLabel}>Your invites</div>

          {loadingInitial && (
            <div className={styles.list}>
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

          {!loadingInitial && error && (
            <div className={styles.emptyState}>
              <span className="mi-outlined" style={{ fontSize: '1.4rem', color: 'var(--text3)' }}>wifi_off</span>
              <span className={styles.emptyStateText}>Couldn't load your invites. Check your connection.</span>
              <button className={styles.retryBtn} onClick={loadInitial}>Try again</button>
            </div>
          )}

          {!loadingInitial && !error && referrals.length === 0 && (
            <div className={styles.emptyState}>
              <span className="mi-outlined" style={{ fontSize: '1.4rem', color: 'var(--text3)' }}>group_add</span>
              <span className={styles.emptyStateText}>No invites yet. Share your code to start earning free months.</span>
            </div>
          )}

          {!loadingInitial && !error && referrals.length > 0 && (
            <div className={styles.list}>
              {referrals.map((r, i) => {
                const meta = STATUS_META[r.status] || STATUS_META.pending
                return (
                  <div key={r.id} className={`${styles.row} ${i === referrals.length - 1 && !hasMore ? styles.noDivider : ''}`}>
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

          {hasMore && !loadingInitial && (
            <button className={styles.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}

          <div className={styles.footer}>
            <span className="mi-outlined" style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>info</span>
            <span className={styles.footerText}>Every 5 activated invites earns you 30 days of Pro, up to 3 times</span>
          </div>

        </div>

      </div>
    </div>
  )
}