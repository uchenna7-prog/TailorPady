import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate }  from 'react-router-dom'
import { usePayments }  from '../../contexts/PaymentContext'
import { useOrders }    from '../../contexts/OrdersContext'
import Header           from '../../components/Header/Header'
import Toast            from '../../components/Toast/Toast'
import OrderMosaic      from '../../components/OrderMosaic/OrderMosaic'
import styles from './AllPayments.module.css'
import BottomNav from '../../components/BottomNav/BottomNav'

// ── Helpers ───────────────────────────────────────────────────

function fmt(amount) {
  if (amount === null || amount === undefined || amount === '') return '—'
  return `₦${Number(amount).toLocaleString('en-NG')}`
}

const METHOD_ICONS = {
  cash:     'payments',
  transfer: 'swap_horiz',
  card:     'credit_card',
  other:    'more_horiz',
}

const METHOD_LABELS = {
  cash: 'Cash', transfer: 'Transfer', card: 'Card', other: 'Other',
}

const STATUS_META = {
  paid:     { label: 'Full Payment',  color: '#15803d', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'   },
  part:     { label: 'Part Payment',  color: '#c2410c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.3)'  },
  not_paid: { label: 'Not Paid',      color: '#dc2626', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
}

function flattenPayments(allPayments) {
  const rows = []

  for (const p of allPayments) {
    const installments = p.installments || []

    if (installments.length === 0) {
      rows.push({
        rowKey:            `${p.id}__none`,
        paymentId:         p.id,
        customerId:        p.customerId,
        customerName:      p.customerName,
        orderId:           p.orderId,
        orderDesc:         p.orderDesc,
        orderPrice:        p.orderPrice,
        paymentStatus:     p.status,
        amount:            null,
        method:            null,
        date:              p.date || 'Unknown Date',
        installIndex:      0,
        totalInstallments: 0,
        totalPaid:         0,
        notes:             p.notes,
      })
    } else {
      const isSingleInstallment = installments.length === 1
      let runningTotal = 0
      installments.forEach((inst, idx) => {
        const previousPaid = runningTotal
        runningTotal += parseFloat(inst.amount) || 0

        const rowStatus = isSingleInstallment ? p.status : 'part'

        const previousInstallments = installments.slice(0, idx).map(i => ({
          amount: i.amount,
          method: i.method || 'cash',
          date:   i.date || p.date || '',
        }))

        rows.push({
          rowKey:                `${p.id}__${inst.id ?? idx}`,
          paymentId:             p.id,
          customerId:            p.customerId,
          customerName:          p.customerName,
          orderId:               p.orderId,
          orderDesc:             p.orderDesc,
          orderPrice:            p.orderPrice,
          paymentStatus:         rowStatus,
          amount:                inst.amount,
          method:                inst.method || 'cash',
          date:                  inst.date || p.date || 'Unknown Date',
          installIndex:          idx + 1,
          totalInstallments:     installments.length,
          totalPaid:             runningTotal,
          previousPaid,
          previousInstallments,
          notes:                 p.notes,
        })
      })
    }
  }

  return rows
}

function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const parseD = (str) => {
      if (!str || str === 'Unknown Date') return 0
      const d = new Date(str)
      return isNaN(d) ? 0 : d.getTime()
    }
    return parseD(b.date) - parseD(a.date)
  })
}

const TABS = [
  { id: 'all',           label: 'All'           },
  { id: 'full_payment',  label: 'Full Payments' },
  { id: 'part',          label: 'Part Payment'  },
]

// ── PAYMENT ROW ───────────────────────────────────────────────

function PaymentRow({ row, isLast, onTap, orderItems }) {
  const sm        = STATUS_META[row.paymentStatus] ?? STATUS_META.not_paid
  const mIcon     = METHOD_ICONS[row.method] ?? 'payments'
  const mLabel    = METHOD_LABELS[row.method] ?? 'Cash'
  const fullPrice = parseFloat(row.orderPrice) || 0

  const rawPct = fullPrice > 0 && row.totalPaid > 0 ? (row.totalPaid / fullPrice) * 100 : 0
  const pct    = rawPct >= 100 ? 100 : Math.min(99, rawPct)

  const isPartInstall = row.totalInstallments > 1
  const isPending     = row.amount === null
  const showProgress  = fullPrice > 0 && row.totalInstallments > 0

  return (
    <div
      className={`${styles.row} ${isLast ? styles.rowLast : ''}`}
      onClick={() => onTap(row)}
    >
      {/* ── Thumbnail: wrap OrderMosaic so we can tint the outer border/bg ── */}
      <div
        className={styles.mosaicWrap}
        style={{
          '--mosaic-border': isPending ? 'var(--border)' : sm.border,
          '--mosaic-bg':     isPending ? 'var(--surface)' : sm.bg,
        }}
      >
        <OrderMosaic
          items={orderItems}
          size="md"
          overdue={false}
          className={styles.mosaicOverride}
        />
      </div>

      {/* ── Centre info column ── */}
      <div className={styles.info}>
        <div className={styles.titleRow}>
          <span className={styles.desc}>{row.orderDesc || 'Payment'}</span>
          {isPartInstall && (
            <span className={styles.installBadge}>
              {row.installIndex}/{row.totalInstallments}
            </span>
          )}
        </div>

        <div className={styles.metaRow}>
          <span className="mi" style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>person</span>
          <span className={styles.metaText}>{row.customerName}</span>
        </div>

        <span
          className={styles.statusPill}
          style={{ background: sm.bg, color: sm.color, borderColor: sm.border }}
        >
          {sm.label}
        </span>
      </div>

      {/* ── Right column: amount → progress bar → method ── */}
      <div className={styles.amountCol}>
        <div
          className={styles.amount}
          style={{ color: isPending ? 'var(--text3)' : sm.color }}
        >
          {isPending ? '—' : fmt(row.amount)}
        </div>

        {showProgress && (
          <div className={styles.progressWrapRight}>
            <div
              className={styles.progressBarRight}
              style={{ width: `${pct}%`, background: pct >= 100 ? '#15803d' : sm.color }}
            />
          </div>
        )}

        {row.method && (
          <div className={styles.methodRow}>
            <span className="mi" style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{mIcon}</span>
            <span className={styles.methodLabel}>{mLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ROW DETAIL SHEET ──────────────────────────────────────────

function PaymentDetail({ row, onClose, onNavigateToCustomer, orderImageUrl }) {
  if (!row) return null

  const sm              = STATUS_META[row.paymentStatus] ?? STATUS_META.not_paid
  const mLabel          = METHOD_LABELS[row.method] ?? '—'
  const fullPrice       = parseFloat(row.orderPrice) || 0
  const thisAmount      = parseFloat(row.amount) || 0
  const previousPaid    = parseFloat(row.previousPaid) || 0
  const totalPaid       = parseFloat(row.totalPaid) || 0
  const balanceBefore   = fullPrice > 0 ? Math.max(0, fullPrice - previousPaid) : 0
  const balanceAfter    = fullPrice > 0 ? Math.max(0, fullPrice - totalPaid)    : 0
  const hasPrevious     = (row.previousInstallments?.length > 0) || previousPaid > 0
  const rawPct = fullPrice > 0 ? (totalPaid / fullPrice) * 100 : 0
  const pct    = rawPct >= 100 ? 100 : Math.min(99, rawPct)

  const cellStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '12px 14px',
  }
  const cellLbl = {
    fontSize: '0.58rem', fontWeight: 800, color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
  }
  const cellVal = {
    fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3,
  }

  return (
    <div className={styles.sheetOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.sheetHandle} />

        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>Payment Details</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', display: 'flex', cursor: 'pointer' }}>
            <span className="mi" style={{ fontSize: '1.4rem' }}>close</span>
          </button>
        </div>

        <div className={styles.sheetBody}>

          <div className={styles.amountHero}>
            {orderImageUrl && (
              <div className={styles.detailImgWrap}>
                <img
                  src={orderImageUrl}
                  alt={row.orderDesc || 'Order'}
                  className={styles.detailImg}
                />
              </div>
            )}
            <div className={styles.heroAmount} style={{ color: sm.color }}>
              {row.amount !== null ? fmt(row.amount) : '₦ —'}
            </div>
            <div
              className={styles.heroPill}
              style={{ background: `${sm.color}18`, color: sm.color, borderColor: `${sm.color}40` }}
            >
              {sm.label}
              {row.totalInstallments > 1 && ` · ${row.installIndex}/${row.totalInstallments}`}
            </div>
          </div>

          <div className={styles.cellGrid}>
            <div style={cellStyle}>
              <div style={cellLbl}>Customer</div>
              <div style={cellVal}>{row.customerName}</div>
            </div>
            <div style={cellStyle}>
              <div style={cellLbl}>Date</div>
              <div style={cellVal}>{row.date}</div>
            </div>
            <div style={cellStyle}>
              <div style={cellLbl}>Order</div>
              <div style={cellVal}>{row.orderDesc || '—'}</div>
            </div>
            <div style={cellStyle}>
              <div style={cellLbl}>Method</div>
              <div style={cellVal}>{row.method ? mLabel : '—'}</div>
            </div>
          </div>

          {fullPrice > 0 && (
            <div className={styles.progressSection}>

              <div className={styles.progressLabelRow}>
                <span className={styles.progressLabel}>Order Value</span>
                <span className={styles.progressFigure} style={{ color: 'var(--text)', fontWeight: 700 }}>
                  {fmt(row.orderPrice)}
                </span>
              </div>

              {hasPrevious && (
                <>
                  {(row.previousInstallments || []).map((p, i) => (
                    <div key={i} className={styles.progressLabelRow} style={{ marginTop: 6 }}>
                      <span className={styles.progressLabel} style={{ color: '#6b7280' }}>
                        Payment {i + 1} · {p.date}{p.method ? ` · ${p.method.charAt(0).toUpperCase() + p.method.slice(1)}` : ''}
                      </span>
                      <span className={styles.progressFigure} style={{ color: '#6b7280' }}>
                        {fmt(p.amount)}
                      </span>
                    </div>
                  ))}
                  <div className={styles.progressLabelRow} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <span className={styles.progressLabel}>Balance Before This Payment</span>
                    <span className={styles.progressFigure} style={{ color: '#f59e0b', fontWeight: 700 }}>
                      {fmt(balanceBefore)}
                    </span>
                  </div>
                </>
              )}

              <div className={styles.progressLabelRow} style={{ marginTop: 8 }}>
                <span className={styles.progressLabel}>This Payment</span>
                <span className={styles.progressFigure} style={{ color: '#22c55e', fontWeight: 700 }}>
                  {fmt(thisAmount)}
                </span>
              </div>

              {balanceAfter > 0 && (
                <div className={styles.progressLabelRow} style={{ marginTop: 6 }}>
                  <span className={styles.progressLabel}>Balance Remaining</span>
                  <span className={styles.progressFigure} style={{ color: '#ef4444', fontWeight: 700 }}>
                    {fmt(balanceAfter)}
                  </span>
                </div>
              )}
              {balanceAfter === 0 && (
                <div className={styles.progressLabelRow} style={{ marginTop: 6 }}>
                  <span className={styles.progressLabel}>Balance Remaining</span>
                  <span className={styles.progressFigure} style={{ color: '#22c55e', fontWeight: 700 }}>
                    Fully Paid ✓
                  </span>
                </div>
              )}

              <div className={styles.progressTrack} style={{ marginTop: 12 }}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${pct}%`, background: sm.color }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text3)', fontWeight: 600 }}>
                  {fmt(totalPaid)} paid
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text3)', fontWeight: 600 }}>
                  {fmt(fullPrice)} total
                </span>
              </div>
            </div>
          )}

          {row.notes && (
            <div className={styles.notesBox}>
              <div className={styles.notesLabel}>Notes</div>
              <p className={styles.notesText}>{row.notes}</p>
            </div>
          )}

          <button
            className={styles.viewCustomerBtn}
            onClick={() => { onClose(); onNavigateToCustomer(row.customerId) }}
          >
            <span className="mi" style={{ fontSize: '1rem' }}>open_in_new</span>
            View {row.customerName}'s Profile
          </button>

        </div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────

export default function AllPayments({ onMenuClick }) {
  const navigate         = useNavigate()
  const { allPayments }  = usePayments()
  const { allOrders }    = useOrders()

  const [activeTab,     setActiveTab]     = useState('all')
  const [detailRow,     setDetailRow]     = useState(null)
  const [toastMsg,      setToastMsg]      = useState('')
  const [search,        setSearch]        = useState('')
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [swipeProgress, setSwipeProgress] = useState(0)

  const touchStartX     = useRef(null)
  const touchStartY     = useRef(null)
  const swipeAxisLocked = useRef(null)
  const toastTimer      = useRef(null)
  const tabsRef         = useRef(null)

  const activeTabIdx = TABS.findIndex(t => t.id === activeTab)

  useEffect(() => {
    if (!tabsRef.current) return
    const activeEl = tabsRef.current.querySelector(`.${styles.tabActive}`)
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeTab])

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400)
  }, [])

  const orderItemsMap = {}
  for (const order of allOrders) {
    if (order.customerId && order.id && order.items?.length) {
      orderItemsMap[`${order.customerId}__${order.id}`] = order.items
    }
  }

  const allRows = sortRows(flattenPayments(allPayments))

  const tabFiltered = allRows.filter(r => {
    if (activeTab === 'all')          return true
    if (activeTab === 'full_payment') return r.paymentStatus === 'paid'
    if (activeTab === 'part')         return r.paymentStatus === 'part'
    return true
  })

  const filtered = search.trim()
    ? tabFiltered.filter(r =>
        r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        r.orderDesc?.toLowerCase().includes(search.toLowerCase())
      )
    : tabFiltered

  const counts = {
    all:          allRows.length,
    full_payment: allRows.filter(r => r.paymentStatus === 'paid').length,
    part:         allRows.filter(r => r.paymentStatus === 'part').length,
  }

  const totalReceived = filtered
    .filter(r => r.amount !== null)
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)

  const grouped = filtered.reduce((acc, row) => {
    const key = row.date || 'Unknown Date'
    if (!acc[key]) acc[key] = []
    acc[key].push(row)
    return acc
  }, {})

  const handleTouchStart = useCallback((e) => {
    touchStartX.current     = e.touches[0].clientX
    touchStartY.current     = e.touches[0].clientY
    swipeAxisLocked.current = null
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (touchStartX.current === null) return

    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (swipeAxisLocked.current === null) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        swipeAxisLocked.current = 'horizontal'
      } else if (Math.abs(dy) > 8) {
        swipeAxisLocked.current = 'vertical'
      }
    }

    if (swipeAxisLocked.current !== 'horizontal') return

    const screenW     = window.innerWidth || 375
    const rawProgress = dx / screenW

    const atStart = activeTabIdx === 0
    const atEnd   = activeTabIdx === TABS.length - 1

    let clamped = rawProgress
    if (atStart && rawProgress > 0) clamped = rawProgress * 0.15
    if (atEnd   && rawProgress < 0) clamped = rawProgress * 0.15

    setSwipeProgress(Math.max(-1, Math.min(1, clamped)))
  }, [activeTabIdx])

  const handleTouchEnd = useCallback(() => {
    if (swipeAxisLocked.current === 'horizontal' && Math.abs(swipeProgress) > 0.2) {
      if (swipeProgress < 0 && activeTabIdx < TABS.length - 1) {
        setActiveTab(TABS[activeTabIdx + 1].id)
      } else if (swipeProgress > 0 && activeTabIdx > 0) {
        setActiveTab(TABS[activeTabIdx - 1].id)
      }
    }

    touchStartX.current     = null
    touchStartY.current     = null
    swipeAxisLocked.current = null
    setSwipeProgress(0)
  }, [swipeProgress, activeTabIdx])

  const tabUnderlineOffset = ((activeTabIdx + (-swipeProgress)) / TABS.length) * 100

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="All Payments" />

      <div className={styles.searchContainer}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <span className="mi" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
            <input
              type="text"
              placeholder="Search client or order…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text3)', display: 'flex', cursor: 'pointer', padding: 0 }}
                onClick={() => setSearch('')}
              >
                <span className="mi" style={{ fontSize: '1rem' }}>close</span>
              </button>
            )}
          </div>
          <button
            className={`${styles.filterBtn} ${filterOpen ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterOpen(p => !p)}
          >
            <span className="mi" style={{ fontSize: '1.2rem' }}>tune</span>
          </button>
        </div>

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total Received</span>
          <span className={styles.totalVal} style={{ color: '#15803d' }}>{fmt(totalReceived)}</span>
        </div>

        {filterOpen && (
          <div className={styles.filterDropdown}>
            <div className={styles.filterDropdownTitle}>Filter by Status</div>
            {[{ id: 'all', label: 'All Statuses' }, ...TABS.slice(1)].map(t => (
              <button
                key={t.id}
                className={`${styles.filterOption} ${filterStatus === t.id ? styles.filterOptionActive : ''}`}
                onClick={() => { setFilterStatus(t.id); setActiveTab(t.id); setFilterOpen(false) }}
              >
                <span className="mi" style={{ fontSize: '1.1rem' }}>
                  {t.id === 'full_payment' ? 'check_circle' : t.id === 'part' ? 'pending' : 'payments'}
                </span>
                {t.label || 'All Statuses'}
                {filterStatus === t.id && <span className="mi" style={{ fontSize: '1rem', marginLeft: 'auto', color: 'var(--accent)' }}>check</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.tabs} ref={tabsRef}>
        {TABS.map((tab, idx) => {
          const distanceFromActive = idx - activeTabIdx
          const colorProgress      = Math.max(0, 1 - Math.abs(distanceFromActive + (-swipeProgress)))
          const isActive           = tab.id === activeTab

          const textColor = colorProgress > 0.5
            ? 'var(--accent)'
            : isActive
              ? 'var(--accent)'
              : 'var(--text3)'

          return (
            <div
              key={tab.id}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              style={{ whiteSpace: 'nowrap', color: textColor }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span className={styles.tabBadge}>
                  {counts[tab.id]}
                </span>
              )}
            </div>
          )
        })}

        <div
          className={styles.tabUnderlineTrack}
          style={{ '--tab-offset': `${tabUnderlineOffset}%`, '--tab-width': `${100 / TABS.length}%` }}
        />
      </div>

      <div
        className={styles.listArea}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <span className="mi" style={{ fontSize: '2.8rem', opacity: 0.2 }}>
              {activeTab === 'full_payment' ? 'check_circle' : activeTab === 'part' ? 'pending' : 'payments'}
            </span>
            <p>
              {search
                ? `No results for "${search}"`
                : activeTab === 'all'
                  ? 'No payments recorded yet.'
                  : `No ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()} payments.`}
            </p>
          </div>
        )}

        {Object.entries(grouped).map(([date, rows]) => (
          <div key={date} className={styles.dateGroup}>
            <div className={styles.dateLabel}>{date}</div>
            <div className={styles.dateDivider} />

            {rows.map((row, idx) => (
              <PaymentRow
                key={row.rowKey}
                row={row}
                isLast={idx === rows.length - 1}
                onTap={setDetailRow}
                orderItems={orderItemsMap[`${row.customerId}__${row.orderId}`] ?? []}
              />
            ))}
          </div>
        ))}

        <div style={{ height: 32 }} />
      </div>

      {detailRow && (
        <PaymentDetail
          row={detailRow}
          onClose={() => setDetailRow(null)}
          onNavigateToCustomer={(id) => navigate(`/customers/${id}`)}
          orderImageUrl={(orderItemsMap[`${detailRow.customerId}__${detailRow.orderId}`]?.[0]?.imgSrc) ?? null}
        />
      )}

      <Toast message={toastMsg} />
      <BottomNav />
    </div>
  )
}