import { useState, useRef } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { startPaystackPayment } from '../../../../services/paystackService'
import { FREE_FEATURES, PRO_FEATURES } from '../../../../config/planFeatures'
import Header from '../../../../components/Header/Header'
import styles from './UpgradeModal.module.css'

const TABS = [
  { key: 'free',    label: 'Free' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'annual',  label: 'Annual', pill: 'Save 31%' },
]

const TAB_KEYS = TABS.map(t => t.key)

export default function UpgradeModal({ onClose, onSuccess, initialTab = 'free' }) {
  const { user } = useAuth()
  const [active, setActive] = useState(initialTab)
  const [payingPlan, setPayingPlan] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const scrollRef = useRef(null)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const handleTab = (key) => {
    setActive(key)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return

    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current

    const isHorizontal = Math.abs(dx) > Math.abs(dy)
    const isPastThreshold = Math.abs(dx) > 50

    if (!isHorizontal || !isPastThreshold) return

    const currentIndex = TAB_KEYS.indexOf(active)

    if (dx < 0 && currentIndex < TAB_KEYS.length - 1) {
      handleTab(TAB_KEYS[currentIndex + 1])
    } else if (dx > 0 && currentIndex > 0) {
      handleTab(TAB_KEYS[currentIndex - 1])
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  const handleUpgrade = (billingCycle) => {
    if (!user) return
    setErrorMsg('')
    setPayingPlan(billingCycle)

    startPaystackPayment({
      email: user.email,
      uid: user.uid,
      billingCycle,
      onSuccess: (data) => {
        setPayingPlan(null)
        onSuccess?.({ billingCycle, ...data })
      },
      onError: (err) => {
        setPayingPlan(null)
        setErrorMsg(err.message || 'Something went wrong, please try again')
      },
      onClose: () => {
        setPayingPlan(null)
      },
    })
  }

  return (
    <div className={styles.upgradeModalContainer}>

      <Header
        type="back"
        title="TailorPady Plans"
        onBackClick={onClose}
        showBorderBottom={false}
      />


      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tabBtn} ${active === tab.key ? styles.tabActive : ''}`}
            onClick={() => handleTab(tab.key)}
          >
            {tab.label}
            {tab.pill && <span className={styles.savePill}>{tab.pill}</span>}
          </button>
        ))}
      </div>

      <div
        className={styles.scrollBody}
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >

        {active === 'free' && (
          <div className={styles.planCard} key="free">
            <div className={styles.planHeader}>
              <div className={styles.planTitleRow}>
                <div className={styles.planName}>Free Plan</div>
                <div className={styles.planCurrentBadge}>Current plan</div>
              </div>
              <div className={styles.planPriceRow}>
                <span className={styles.planAmount}>₦0</span>
                <span className={styles.planPeriod}>/month</span>
              </div>
            </div>
            <div className={styles.divider} />
            <div className={styles.featureList}>
              {FREE_FEATURES.map((f, i) => (
                <div key={i} className={styles.featureRow}>
                  <div className={styles.featureIconWrap}>
                    <span className="mi" style={{ fontSize: '0.85rem' }}>{f.icon}</span>
                  </div>
                  <span className={styles.featureLabel}>{f.label}</span>
                </div>
              ))}
            </div>
            <button className={`${styles.ctaBtn} ${styles.ctaBtnFree}`} disabled>
              <span className="mi" style={{ fontSize: '1rem' }}>check_circle</span>
              You're on this plan
            </button>
          </div>
        )}

        {active === 'monthly' && (
          <div className={`${styles.planCard} ${styles.planCardPro}`} key="monthly">
            <div className={styles.planCardProGlow} />
            <div className={styles.planHeader}>
              <div className={styles.planTitleRow}>
                <div className={styles.planNamePro}>Pro Monthly</div>
                <div className={styles.planPopularBadge}>
                  <span className="mi" style={{ fontSize: '0.65rem' }}>star</span>
                  Pro
                </div>
              </div>
              <div className={styles.planPriceRow}>
                <span className={styles.planAmount}>₦1,200</span>
                <span className={styles.planPeriod}>/month</span>
              </div>
              <div className={styles.planBilled}>Billed monthly, Cancel anytime</div>
            </div>
            <div className={styles.divider} />
            <div className={styles.featureList}>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} className={styles.featureRow}>
                  <div className={`${styles.featureIconWrap} ${styles.featureIconPro}`}>
                    <span className="mi" style={{ fontSize: '0.85rem' }}>{f.icon}</span>
                  </div>
                  <span className={styles.featureLabelPro}>{f.label}</span>
                </div>
              ))}
            </div>
            <button
              className={styles.ctaBtn}
              onClick={() => handleUpgrade('monthly')}
              disabled={payingPlan === 'monthly'}
            >
              <span className="mi" style={{ fontSize: '1rem' }}>workspace_premium</span>
              {payingPlan === 'monthly' ? 'Processing…' : 'Subscribe to Pro'}
            </button>
            {errorMsg && <p className={styles.fine} style={{ color: '#ef4444' }}>{errorMsg}</p>}
            <p className={styles.fine}>No hidden charges, Instant activation</p>
          </div>
        )}

        {active === 'annual' && (
          <div className={`${styles.planCard} ${styles.planCardPro}`} key="annual">
            <div className={styles.planCardProGlow} />
            <div className={styles.planHeader}>
              <div className={styles.planTitleRow}>
                <div className={styles.planNamePro}>Pro Annual</div>
                <div className={styles.planPopularBadge}>
                  <span className="mi" style={{ fontSize: '0.65rem' }}>star</span>
                  Most popular
                </div>
              </div>
              <div className={styles.planPriceRow}>
                <span className={styles.planAmount}>₦9,999</span>
                <span className={styles.planPeriod}>/year</span>
              </div>
              <div className={styles.planBilled}>₦833/month</div>
              <div className={styles.planSavingsBadge}>
                <span className="mi" style={{ fontSize: '0.75rem' }}>savings</span>
                You save ₦4,401 vs monthly
              </div>
            </div>
            <div className={styles.divider} />
            <div className={styles.featureList}>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} className={styles.featureRow}>
                  <div className={`${styles.featureIconWrap} ${styles.featureIconPro}`}>
                    <span className="mi" style={{ fontSize: '0.85rem' }}>{f.icon}</span>
                  </div>
                  <span className={styles.featureLabelPro}>{f.label}</span>
                </div>
              ))}
            </div>
            <button
              className={styles.ctaBtn}
              onClick={() => handleUpgrade('annual')}
              disabled={payingPlan === 'annual'}
            >
              <span className="mi" style={{ fontSize: '1rem' }}>workspace_premium</span>
              {payingPlan === 'annual' ? 'Processing…' : 'Subscribe to Pro'}
            </button>
            {errorMsg && <p className={styles.fine} style={{ color: '#ef4444' }}>{errorMsg}</p>}
            <p className={styles.fine}>No hidden charges · Instant activation</p>
          </div>
        )}

      </div>
    </div>
  )
}
