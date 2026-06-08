import { useState, useRef, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useOrders } from '../../contexts/OrdersContext'
import { useReceipts } from '../../contexts/ReceiptContext'
import { deleteReceipt } from '../../services/receiptService'
import { formatMoney } from '../../utils/moneyUtils'
import OrderMosaic from '../../components/OrderMosaic/OrderMosaic'
import ReceiptViewer from '../../components/ReceiptViewer/ReceiptViewer'
import Header from '../../components/Header/Header'
import BottomNav from '../../components/BottomNav/BottomNav'
import styles from './Receipts.module.css'


function formatDate(dateStr) {
  if (!dateStr) return 'Unknown Date'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function resolveCumulativePaid(receipt) {
  if (typeof receipt.cumulativePaid === 'number') return receipt.cumulativePaid
  if (typeof receipt.amountPaid     === 'number') return receipt.amountPaid
  return parseFloat(receipt.amountPaid) || 0
}

function isFullPayment(receipt) {
  const paid  = resolveCumulativePaid(receipt)
  const total = receipt.orderPrice ? parseFloat(receipt.orderPrice) : paid
  return paid >= total && total > 0
}

const TABS = [
  { id: 'all',  label: 'All'          },
  { id: 'full', label: 'Paid in Full' },
  { id: 'part', label: 'Part Payment' },
]

const STATUS_STYLES = {
  full: { bg: 'rgba(34,197,94,0.12)',  color: '#15803d', border: 'rgba(34,197,94,0.3)'  },
  part: { bg: 'rgba(251,146,60,0.12)', color: '#c2410c', border: 'rgba(251,146,60,0.3)' },
}

function ReceiptCard({ receipt, currency, onTap, isLast, orderItems }) {
  const paid  = resolveCumulativePaid(receipt)
  const full  = isFullPayment(receipt)
  const sty   = full ? STATUS_STYLES.full : STATUS_STYLES.part
  const label = full ? 'Paid in Full' : 'Part Payment'

  return (
    <div
      className={`${styles.receiptListItem} ${isLast ? styles.receiptListItemLast : ''}`}
      onClick={onTap}
    >
      <OrderMosaic items={orderItems} />

      <div className={styles.receiptListInfo}>
        <div className={styles.receiptListDesc}>{receipt.orderDesc || 'Order'}</div>
        <div className={styles.receiptListOrdRow}>{receipt.number}</div>
        <div className={styles.receiptListMeta}>
          <span className="mi" style={{ fontSize: '0.8rem', color: 'var(--text3)', verticalAlign: 'middle' }}>person</span>
          <span className={styles.receiptListMetaText}>{receipt.customerName || '—'}</span>
        </div>
      </div>

      <div className={styles.receiptListRight}>
        <div className={styles.receiptListAmount}>{formatMoney(currency, paid)}</div>
        <span className={styles.receiptStatusPill} style={{
          background: sty.bg,
          color:      sty.color,
          border:     `1px solid ${sty.border}`,
        }}>
          {label}
        </span>
      </div>
    </div>
  )
}


export default function Receipts({ onMenuClick }) {
  const { user }            = useAuth()
  const { generalSettings } = useGeneralSettings()
  const { allOrders }       = useOrders()
  const { allReceipts }     = useReceipts()

  const currency = generalSettings.invoiceCurrency || '₦'

  const [activeTab,     setActiveTab]     = useState('all')
  const [viewing,       setViewing]       = useState(null)
  const [search,        setSearch]        = useState('')
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [swipeProgress, setSwipeProgress] = useState(0)

  const touchStartX   = useRef(null)
  const touchStartY   = useRef(null)
  const swipeAxisLocked = useRef(null)
  const activeTabIdx  = TABS.findIndex(t => t.id === activeTab)

  const orderItemsMap = {}
  for (const order of allOrders) {
    if (order.customerId && order.id) {
      orderItemsMap[`${order.customerId}__${order.id}`] = order.items || []
    }
  }

  const filtered = allReceipts.filter(rec => {
    if (activeTab === 'full') return isFullPayment(rec)
    if (activeTab === 'part') return !isFullPayment(rec)
    return true
  })

  const counts = {
    all:  allReceipts.length,
    full: allReceipts.filter(r =>  isFullPayment(r)).length,
    part: allReceipts.filter(r => !isFullPayment(r)).length,
  }

  const EMPTY_TEXT = {
    all:  'No receipts yet.',
    full: 'No fully paid receipts yet.',
    part: 'No part payment receipts.',
  }

  const searchFiltered = search.trim()
    ? filtered.filter(rec =>
        (rec.orderDesc    || '').toLowerCase().includes(search.toLowerCase()) ||
        (rec.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (rec.number       || '').toLowerCase().includes(search.toLowerCase())
      )
    : filtered

  const grouped = searchFiltered.reduce((acc, rec) => {
    const key = rec.date || 'Unknown Date'
    if (!acc[key]) acc[key] = []
    acc[key].push(rec)
    return acc
  }, {})

  const handleTouchStart = useCallback((e) => {
    touchStartX.current   = e.touches[0].clientX
    touchStartY.current   = e.touches[0].clientY
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

    const screenW   = window.innerWidth || 375
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
      <Header title="All Receipts" onMenuClick={onMenuClick} />

      <div className={styles.searchContainer}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <span className="mi" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
            <input
              type="text"
              placeholder="Search receipts or clients…"
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

        {filterOpen && (
          <div className={styles.filterDropdown}>
            <div className={styles.filterDropdownTitle}>Filter by Status</div>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`${styles.filterOption} ${activeTab === t.id ? styles.filterOptionActive : ''}`}
                onClick={() => { setActiveTab(t.id); setFilterOpen(false) }}
              >
                <span className="mi" style={{ fontSize: '1.1rem' }}>
                  {t.id === 'full' ? 'check_circle' : t.id === 'part' ? 'payments' : 'receipt'}
                </span>
                {t.label}
                {activeTab === t.id && (
                  <span className="mi" style={{ fontSize: '1rem', marginLeft: 'auto', color: 'var(--accent)' }}>check</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.tabs} onClick={() => filterOpen && setFilterOpen(false)}>
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
              style={{ color: textColor }}
              onClick={(e) => {
                setActiveTab(tab.id)
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
              }}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span className={styles.tabBadge}>{counts[tab.id]}</span>
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
        onClick={() => filterOpen && setFilterOpen(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {searchFiltered.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="mi" style={{ fontSize: '2.8rem', opacity: 0.2 }}>receipt</span>
            <p>{EMPTY_TEXT[activeTab]}</p>
            {activeTab === 'all' && (
              <span className={styles.emptyHint}>
                Go to a customer → Receipts → Generate Receipt
              </span>
            )}
          </div>
        ) : (
          Object.entries(grouped).map(([date, dateReceipts]) => (
            <div key={date} className={styles.receiptGroup}>
              <div className={styles.receiptGroupDate}>{date}</div>
              <div className={styles.receiptGroupDivider} />
              {dateReceipts.map((rec, idx) => (
                <ReceiptCard
                  key={`${rec.customerId}-${rec.id}`}
                  receipt={rec}
                  currency={currency}
                  isLast={idx === dateReceipts.length - 1}
                  onTap={() => setViewing(rec)}
                  orderItems={orderItemsMap[`${rec.customerId}__${rec.orderId}`] ?? []}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {viewing && (
        <ReceiptViewer
          receipt={viewing}
          customer={{
            name:    viewing.customerName   || '—',
            phone:   viewing.customerPhone  || '',
            address: viewing.customerAddress || '',
          }}
          onClose={() => setViewing(null)}
          onDelete={async (id) => {
            try {
              await deleteReceipt(user.uid, id)
              setViewing(null)
            } catch { /* silent */ }
          }}
          showToast={() => {}}
        />
      )}

      <BottomNav />
    </div>
  )
}