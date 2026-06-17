import { useState } from 'react'
import styles from './UpgradeModal.module.css'

const FREE_FEATURES = [
  { icon: 'group',         label: 'Up to 15 customers' },
  { icon: 'straighten',    label: 'Full body & cloth measurements' },
  { icon: 'receipt_long',  label: '8 active orders / month' },
  { icon: 'description',   label: 'All invoice & receipt templates' },
  { icon: 'print',         label: '5 invoice + 5 receipt generations / month' },
  { icon: 'palette',       label: 'Basic branding customisation' },
  { icon: 'photo_library', label: '6 portfolio uploads / month' },
  { icon: 'link',          label: 'Public portfolio link' },
  { icon: 'star_rate',     label: '3 review links / month' },
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

const PRICING = {
  monthly: {
    amount: '₦1,200',
    period: '/month',
    billed: 'Billed monthly · Cancel anytime',
    cta: 'Start Pro — ₦1,200/month',
    switchCta: 'Switch to Monthly',
  },
  annual: {
    amount: '₦833',
    period: '/month',
    strikeAmount: '₦1,200',
    billed: 'Billed as ₦9,999/year',
    savings: 'You save ₦4,401 vs monthly',
    cta: 'Start Pro — ₦9,999/year',
    switchCta: 'Switch to Annual',
  },
}

export default function UpgradeModal({ onClose, onUpgrade, currentPlan = 'free' }) {
  const [billing, setBilling] = useState(currentPlan === 'monthly' ? 'monthly' : 'annual')

  const plan = PRICING[billing]
  const isFreeCurrent = currentPlan === 'free'
  const isProUser = currentPlan === 'monthly' || currentPlan === 'annual'
  const isCurrentBilling = isProUser && currentPlan === billing

  const ctaLabel = isCurrentBilling
    ? "You're on this plan"
    : isProUser
      ? plan.switchCta
      : plan.cta

  const handleUpgrade = () => {
    if (isCurrentBilling) return
    onUpgrade?.(billing)
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
        </div>

        <div className={styles.scrollBody}>

          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <div className={styles.planTitleRow}>
                <div className={styles.planName}>Free Plan</div>
                {isFreeCurrent && <div className={styles.planCurrentBadge}>Current plan</div>}
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
            {isFreeCurrent && (
              <button className={`${styles.ctaBtn} ${styles.ctaBtnFree}`} disabled>
                <span className="mi" style={{ fontSize: '1rem' }}>check_circle</span>
                You're on this plan
              </button>
            )}
          </div>

          <div className={`${styles.planCard} ${styles.planCardPro}`}>
            <div className={styles.planCardProGlow} />
            <div className={styles.planHeader}>
              <div className={styles.planTitleRow}>
                <div className={styles.planNamePro}>TailorPady Pro</div>
                {isCurrentBilling ? (
                  <div className={styles.planCurrentBadge}>Current plan</div>
                ) : (
                  <div className={styles.planPopularBadge}>
                    <span className="mi" style={{ fontSize: '0.65rem' }}>star</span>
                    {billing === 'annual' ? 'Most popular' : 'Pro'}
                  </div>
                )}
              </div>

              <div className={styles.billingToggle}>
                <button
                  className={`${styles.billingBtn} ${billing === 'monthly' ? styles.billingBtnActive : ''}`}
                  onClick={() => setBilling('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`${styles.billingBtn} ${billing === 'annual' ? styles.billingBtnActive : ''}`}
                  onClick={() => setBilling('annual')}
                >
                  Annual
                  <span className={styles.billingPill}>Save 31%</span>
                </button>
              </div>

              <div className={styles.planPriceRow}>
                <span className={styles.planAmount}>{plan.amount}</span>
                <span className={styles.planPeriod}>{plan.period}</span>
                {plan.strikeAmount && <span className={styles.strikePrice}>{plan.strikeAmount}</span>}
              </div>
              <div className={styles.planBilled}>{plan.billed}</div>
              {plan.savings && (
                <div className={styles.planSavingsBadge}>
                  <span className="mi" style={{ fontSize: '0.75rem' }}>savings</span>
                  {plan.savings}
                </div>
              )}
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
              disabled={isCurrentBilling}
              onClick={handleUpgrade}
            >
              <span className="mi" style={{ fontSize: '1rem' }}>
                {isCurrentBilling ? 'check_circle' : 'workspace_premium'}
              </span>
              {ctaLabel}
            </button>
            <p className={styles.fine}>No hidden charges · Instant activation</p>
          </div>

        </div>
      </div>
    </div>
  )
}
