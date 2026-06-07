import { useState, useRef } from 'react'
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
  all:           { icon: 'assignment',     text: 'No orders yet.'              },
  pending:       { icon: 'schedule',       text: 'No pending orders.'           },
  'in-progress': { icon: 'autorenew',      text: 'No orders in progress.'       },
  completed:     { icon: 'check_circle',   text: 'No completed orders yet.'     },
  delivered:     { icon: 'local_shipping', text: 'No delivered orders yet.'     },
  cancelled:     { icon: 'cancel',         text: 'No cancelled orders.'         },
  overdue:       { icon: 'alarm_on',       text: 'No overdue orders. Good job!' },
}

export default function Orders({ onMenuClick, onGoToCustomer }) {
  const { allOrders } = useOrders()

  const [activeTab,   setActiveTab]   = useState('all')
  const [detailOrder, setDetailOrder] = useState(null)
  const [search,      setSearch]      = useState('')
  const [filterOpen,  setFilterOpen]  = useState(false)
  const tabsRef = useRef(null)

  const handleTabClick = (e, tabId) => {
    setActiveTab(tabId)
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
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
            <span className="mi" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
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
                <span className="mi" style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                {t.label}
                {activeTab === t.id && (
                  <span className="mi" style={{ fontSize: '1rem', marginLeft: 'auto', color: 'var(--accent)' }}>check</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.tabs} ref={tabsRef} onClick={() => filterOpen && setFilterOpen(false)}>
        {TABS.map(tab => (
          <div
            key={tab.id}
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

      <div className={styles.listArea} onClick={() => filterOpen && setFilterOpen(false)}>
        {searchFiltered.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="mi" style={{ fontSize: '2.8rem', opacity: 0.2 }}>
              {EMPTY_CONFIG[activeTab].icon}
            </span>
            <p>{EMPTY_CONFIG[activeTab].text}</p>
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