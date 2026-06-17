import { useState, useRef } from 'react'
import styles from './UpgradeModal.module.css'

const FREE_FEATURES = [
  { icon: 'group',         label: 'Up to 15 customers' },
  { icon: 'straighten',    label: 'Full body & cloth measurements' },
  { icon: 'receipt_long',  label: '20 active orders / month' },
  { icon: 'description',   label: 'All invoice & receipt templates' },
  { icon: 'print',         label: '10 invoice + 10 receipt generations / month' },
  { icon: 'palette',       label: 'Basic branding customisation' },
  { icon: 'photo_library', label: '15 portfolio uploads / month' },
  { icon: 'link',          label: 'Public portfolio link' },
  { icon: 'star_rate',     label: '5 review links / month' },
  { icon: 'payments',      label: 'Basic payment tracking' },
  { icon: 'smart_toy',     label: '3 AI assistant actions / month' },
  { icon: 'cake',          label: 'Birthday reminders' },
]

const PRO_FEATURES = [
  { icon: 'all_inclusive',   label: 'Unlimited customers' },
  { icon: 'all_inclusive',   label: 'Unlimited measurements' },
  { icon: 'all_inclusive',   label: 'Unlimited active orders' },
  { icon: 'all_inclusive',   label: 'Unlimited invoice & receipt generations' },
  { icon: 'palette',         label: 'Full branding — logo, colours, signature' },
  { icon: 'account_balance', label: 'Bank details & T&Cs on every document' },
  { icon: 'photo_library',   label: 'Unlimited portfolio uploads' },
  { icon: 'auto_awesome',    label: 'Fully branded portfolio page' },
  { icon: 'star',            label: 'Unlimited review links' },
  { icon: 'bar_chart',       label: 'Advanced payment tracking & reports' },
  { icon: 'smart_toy',       label: 'Unlimited AI assistant actions' },
  { icon: 'edit_note',       label: 'Smart invoice auto-drafts' },
  { icon: 'campaign',        label: 'Customer re-engagement reminders' },
  { icon: 'cloud',           label: 'Expanded cloud storage' },
]

const TABS = [
  { key: 'free',    label: 'Free' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'annual',  label: 'Annual', pill: 'Save 31%' },
]

const TAB_KEYS = TABS.map(t => t.key)

export default function UpgradeModal({ onClose, onUpgrade }) {
  const [active, setActive] = useState('free')
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.fixedHeader}>
          <div className={styles.handle} />

          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <span className={`mi ${styles.crownIcon}`}>workspace_premium</span>
              <div className={styles.headerText}>
                <div className={styles.title}>TailorPady Pro</div>
                <div className={styles.subtitle}>Run your tailoring business like a pro</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <span className="mi">close</span>
            </button>
          </div>

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
                <div className={styles.planBilled}>Billed monthly · Cancel anytime</div>
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
              <button className={styles.ctaBtn} onClick={() => onUpgrade?.('monthly')}>
                <span className="mi" style={{ fontSize: '1rem' }}>workspace_premium</span>
                Start Pro — ₦1,200/month
              </button>
              <p className={styles.fine}>No hidden charges · Instant activation</p>
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
                  <span className={styles.planAmount}>₦833</span>
                  <span className={styles.planPeriod}>/month</span>
                </div>
                <div className={styles.planBilled}>Billed as ₦9,999/year</div>
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
              <button className={styles.ctaBtn} onClick={() => onUpgrade?.('annual')}>
                <span className="mi" style={{ fontSize: '1rem' }}>workspace_premium</span>
                Start Pro — ₦9,999/year
              </button>
              <p className={styles.fine}>No hidden charges · Instant activation</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
