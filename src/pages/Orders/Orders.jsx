import { useState, useRef } from 'react'
import { useTour } from '../../contexts/TourContext'
import Header from '../../components/Header/Header'
import BottomNav from '../../components/BottomNav/BottomNav'
import OrderDetailModal from '../../components/OrderDetailModal/OrderDetailModal'
import { OrderRow, isOrderOverdue } from '../../components/OrderRow/OrderRow'
import styles from './Orders.module.css'
import { useOrders } from '../../contexts/OrdersContext'

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown Date'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getOrderGroupDate(o) {
  if (o.date && o.date !== 'Unknown Date') return o.date
  if (o.createdAt) {
    const d = typeof o.createdAt.toDate === 'function'
      ? o.createdAt.toDate()
      : new Date(o.createdAt)
    if (!isNaN(d)) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (o.dueDate) return formatDate(o.dueDate)
  return 'Unknown Date'
}

const TABS = [
  { id: 'all',         label: 'All',         icon: 'assignment'     },
  { id: 'pending',     label: 'Pending',     icon: 'schedule'       },
  { id: 'in-progress', label: 'In Progress', icon: 'autorenew'      },
  { id: 'completed',   label: 'Completed',   icon: 'check_circle'   },
  { id: 'delivered',   label: 'Delivered',   icon: 'local_shipping' },
  { id: 'cancelled',   label: 'Cancelled',   icon: 'cancel'         },
  { id: 'overdue',     label: 'Overdue',     icon: 'alarm_on'       },
]

const EMPTY_CONFIG = {
  all: {
    icon: 'shopping_basket',
    title: 'No orders yet',
    subtitle: <>Orders from all your customers will appear here. Create one from their profile page. Tap <strong>?</strong> button for help.</>,
  },
  pending: {
    icon: 'schedule',
    title: 'No pending orders',
    subtitle: <>Pending orders from all your customers will appear here. Tap <strong>?</strong> button for help.</>,
  },
  'in-progress': {
    icon: 'autorenew',
    title: 'No orders in progress',
    subtitle: <>In-progress orders from all your customers will appear here. Tap <strong>?</strong> button for help.</>,
  },
  completed: {
    icon: 'check_circle',
    title: 'No completed orders yet',
    subtitle: <>Completed orders from all your customers will appear here. Tap <strong>?</strong> button for help.</>,
  },
  delivered: {
    icon: 'local_shipping',
    title: 'No delivered orders yet',
    subtitle: <>Delivered orders from all your customers will appear here. Tap <strong>?</strong> button for help.</>,
  },
  cancelled: {
    icon: 'cancel',
    title: 'No cancelled orders',
    subtitle: <>Cancelled orders from all your customers will appear here. Tap <strong>?</strong> button for help.</>,
  },
  overdue: {
    icon: 'alarm_on',
    title: 'No overdue orders',
    subtitle: <>Nice work, every order is on schedule. Tap <strong>?</strong> button for help.</>,
  },
}

const SWIPE_THRESHOLD    = 50
const SWIPE_MAX_VERTICAL = 80

export default function Orders({ onMenuClick, onGoToCustomer }) {
  const { allOrders } = useOrders()
  const { hasCompletedTour, startTour, isActive } = useTour()

  const [activeTab,   setActiveTab]   = useState('all')
  const [detailOrder, setDetailOrder] = useState(null)
  const [search,      setSearch]      = useState('')
  const [filterOpen,  setFilterOpen]  = useState(false)

  const tabsRef  = useRef(null)
  const swipeRef = useRef({ startX: 0, startY: 0, tracking: false })

  const activeIndex = TABS.findIndex(t => t.id === activeTab)

  function handleHelpClick() {
    if (isActive) return
    startTour('recovery-orders')
  }

  function goToTab(index) {
    if (index < 0 || index >= TABS.length) return
    const tab = TABS[index]
    setActiveTab(tab.id)
    scrollTabIntoView(tab.id)
  }

  function scrollTabIntoView(tabId) {
    const bar = tabsRef.current
    if (!bar) return
    const chip = bar.querySelector(`[data-tab="${tabId}"]`)
    if (!chip) return
    const barRect  = bar.getBoundingClientRect()
    const chipRect = chip.getBoundingClientRect()
    const offset   = chipRect.left - barRect.left - barRect.width / 2 + chipRect.width / 2
    bar.scrollBy({ left: offset, behavior: 'smooth' })
  }

  function handleTabClick(e, tabId) {
    setActiveTab(tabId)
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  function handleTouchStart(e) {
    const touch = e.touches[0]
    swipeRef.current = { startX: touch.clientX, startY: touch.clientY, tracking: true }
  }

  function handleTouchEnd(e) {
    if (!swipeRef.current.tracking) return
    const touch  = e.changedTouches[0]
    const deltaX = touch.clientX - swipeRef.current.startX
    const deltaY = touch.clientY - swipeRef.current.startY
    swipeRef.current.tracking = false

    if (Math.abs(deltaY) > SWIPE_MAX_VERTICAL) return
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return

    if (deltaX < 0) {
      goToTab(activeIndex + 1)
    } else {
      goToTab(activeIndex - 1)
    }
  }

  const filtered = allOrders.filter(o => {
    if (activeTab === 'all')          return true
    if (activeTab === 'pending')      return o.status === 'pending'     && !isOrderOverdue(o)
    if (activeTab === 'in-progress')  return o.status === 'in-progress' && !isOrderOverdue(o)
    if (activeTab === 'completed')    return o.status === 'completed'
    if (activeTab === 'delivered')    return o.status === 'delivered'
    if (activeTab === 'cancelled')    return o.status === 'cancelled'
    if (activeTab === 'overdue')      return isOrderOverdue(o)
    return true
  })

  const counts = {
    all:           allOrders.length,
    pending:       allOrders.filter(o => o.status === 'pending'     && !isOrderOverdue(o)).length,
    'in-progress': allOrders.filter(o => o.status === 'in-progress' && !isOrderOverdue(o)).length,
    completed:     allOrders.filter(o => o.status === 'completed').length,
    delivered:     allOrders.filter(o => o.status === 'delivered').length,
    cancelled:     allOrders.filter(o => o.status === 'cancelled').length,
    overdue:       allOrders.filter(isOrderOverdue).length,
  }

  const searchFiltered = search.trim()
    ? filtered.filter(o =>
        (o.desc || o.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.customerName || '').toLowerCase().includes(search.toLowerCase())
      )
    : filtered

  const grouped = [...searchFiltered]
    .sort((a, b) => {
      const da = a.dueRaw || a.dueDate || a.date || ''
      const db = b.dueRaw || b.dueDate || b.date || ''
      return db.localeCompare(da)
    })
    .reduce((acc, o) => {
      const key = getOrderGroupDate(o)
      if (!acc[key]) acc[key] = []
      acc[key].push(o)
      return acc
    }, {})

  return (
    <div className={styles.page}>
      <Header title="All Orders" onMenuClick={onMenuClick} />

      <div className={styles.searchContainer}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <span className="mi-outlined" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
            <input
              type="text"
              placeholder="Search orders or clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text3)', display: 'flex', cursor: 'pointer', padding: 0 }}
                onClick={() => setSearch('')}
              >
                <span className="mi-outlined" style={{ fontSize: '1rem' }}>close</span>
              </button>
            )}
          </div>
          <button
            className={`${styles.filterBtn} ${filterOpen ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterOpen(p => !p)}
          >
            <span className="mi-outlined" style={{ fontSize: '1.2rem' }}>tune</span>
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
                <span className="mi-outlined" style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                {t.label}
                {activeTab === t.id && (
                  <span className="mi-outlined" style={{ fontSize: '1rem', marginLeft: 'auto', color: 'var(--accent)' }}>check</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={styles.tabs}
        ref={tabsRef}
        onClick={() => filterOpen && setFilterOpen(false)}
      >
        {TABS.map(tab => (
          <div
            key={tab.id}
            data-tab={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={e => handleTabClick(e, tab.id)}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`${styles.tabBadge} ${tab.id === 'overdue' ? styles.badgeOverdue : ''}`}>
                {counts[tab.id]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        className={styles.listArea}
        onClick={() => filterOpen && setFilterOpen(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {searchFiltered.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="mi-outlined" style={{ fontSize: '2.5rem', color: 'var(--text3)' }}>
              {EMPTY_CONFIG[activeTab].icon}
            </span>
            <p className={styles.emptyStateTitle}>{EMPTY_CONFIG[activeTab].title}</p>
            <p className={styles.emptyStateSubtitle}>{EMPTY_CONFIG[activeTab].subtitle}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dateOrders]) => (
            <div key={date} className={styles.orderGroup}>
              <div className={styles.orderGroupDate}>{date}</div>
              <div className={styles.orderGroupDivider} />
              {dateOrders.map((order, idx) => (
                <OrderRow
                  key={`${order.customerId}-${order.id}`}
                  order={order}
                  isLast={idx === dateOrders.length - 1}
                  onTap={() => setDetailOrder(order)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <button
        className={styles.fab}
        onClick={handleHelpClick}
        disabled={isActive}
        title={isActive ? 'Finish the current tour first' : 'Need help?'}
      >
        <span className="mi-outlined">help_outline</span>
      </button>

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onGoToCustomer={onGoToCustomer}
        />
      )}

      <BottomNav />
    </div>
  )
}