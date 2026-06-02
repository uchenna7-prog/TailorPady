import styles from './BillingHistoryModal.module.css'

const STATUS_META = {
  paid:    { label: 'Paid',    color: '#22c55e' },
  pending: { label: 'Pending', color: '#f59e0b' },
  failed:  { label: 'Failed',  color: '#ef4444' },
}

const MOCK_INVOICES = [
  { id: 'INV-2024-006', date: 'Jun 1, 2025',  amount: '₦20,000', plan: 'Pro Annual',   status: 'paid' },
  { id: 'INV-2024-005', date: 'Jun 1, 2024',  amount: '₦20,000', plan: 'Pro Annual',   status: 'paid' },
  { id: 'INV-2024-004', date: 'May 1, 2024',  amount: '₦2,500',  plan: 'Pro Monthly',  status: 'paid' },
  { id: 'INV-2024-003', date: 'Apr 1, 2024',  amount: '₦2,500',  plan: 'Pro Monthly',  status: 'paid' },
  { id: 'INV-2024-002', date: 'Mar 1, 2024',  amount: '₦2,500',  plan: 'Pro Monthly',  status: 'failed' },
  { id: 'INV-2024-001', date: 'Feb 1, 2024',  amount: '₦2,500',  plan: 'Pro Monthly',  status: 'paid' },
]

export default function BillingHistoryModal({ onClose, isPremium, nextRenewal = 'Jun 1, 2026' }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        <div className={styles.handle} />

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={`mi ${styles.headerIcon}`}>receipt_long</span>
            <div>
              <div className={styles.headerTitle}>Billing History</div>
              <div className={styles.headerSub}>Payments, renewals and receipts</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="mi">close</span>
          </button>
        </div>

        {isPremium && (
          <div className={styles.statusCard}>
            <div className={styles.statusCardLeft}>
              <span className={`mi ${styles.statusIcon}`}>workspace_premium</span>
              <div>
                <div className={styles.statusPlan}>TailorPady Pro · Annual</div>
                <div className={styles.statusRenewal}>Renews {nextRenewal}</div>
              </div>
            </div>
            <div className={styles.activePill}>Active</div>
          </div>
        )}

        {!isPremium && (
          <div className={styles.freeBanner}>
            <span className="mi" style={{ fontSize: '1.2rem', color: 'var(--text3)' }}>info</span>
            <span className={styles.freeBannerText}>You are on the Free plan — no billing history yet.</span>
          </div>
        )}

        {isPremium && (
          <div className={styles.list}>
            {MOCK_INVOICES.map((inv, i) => {
              const meta = STATUS_META[inv.status]
              return (
                <div key={inv.id} className={`${styles.invoiceRow} ${i === MOCK_INVOICES.length - 1 ? styles.noDivider : ''}`}>
                  <div className={styles.invoiceIcon}>
                    <span className="mi" style={{ fontSize: '1rem', color: inv.status === 'failed' ? '#ef4444' : 'var(--text2)' }}>
                      {inv.status === 'failed' ? 'error_outline' : 'receipt'}
                    </span>
                  </div>
                  <div className={styles.invoiceText}>
                    <div className={styles.invoicePlan}>{inv.plan}</div>
                    <div className={styles.invoiceDate}>{inv.date} · {inv.id}</div>
                  </div>
                  <div className={styles.invoiceRight}>
                    <div className={styles.invoiceAmount}>{inv.amount}</div>
                    <div className={styles.invoiceStatus} style={{ color: meta.color }}>{meta.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className={styles.footer}>
          <span className="mi" style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>lock</span>
          <span className={styles.footerText}>Payments secured by Paystack</span>
        </div>

      </div>
    </div>
  )
}
