import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../../contexts/CustomerContext'
import { usePremium } from '../../contexts/PremiumContext'
import { DeleteConfirmSheet } from './components/DeleteConfirmSheet/DeleteConfirmSheet'
import { CustomerRow } from './components/CustomerRow/CustomerRow'
import { AddCustomerModal } from './components/AddCustomerModal/AddCustomerModal'
import { EmptyState } from './components/EmptyState/EmptyState'
import BottomNav from '../../components/BottomNav/BottomNav'
import Header from '../../components/Header/Header'
import Toast from '../../components/Toast/Toast'
import styles from './Customers.module.css'


export default function Customers({ onMenuClick }) {

  const navigate = useNavigate()
  const { customers, addCustomer, deleteCustomer } = useCustomers()
  const { isPremium } = usePremium()

  const [query,        setQuery]        = useState('')
  const [formOpen,     setFormOpen]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toastMsg,     setToastMsg]     = useState('')
  const [sortMode,     setSortMode]     = useState('date')
  const [filterOpen,   setFilterOpen]   = useState(false)
  const toastTimer = useRef(null)

  const showToast = (msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400)
  }

  const handleSave = async ({
    name,
    phone,
    phoneType,
    onWhatsApp,
    sex,
    birthday,
    email,
    address,
    notes,
    photo,
    bodyMeasurements,
  }) => {

    if (!name) {
      showToast('Name is required')
      return
    }
    if (!phone) {
      showToast('Phone number is required')
      return
    }
    if (phone === '__INVALID_PHONE__') {
      showToast('Phone number must be 10 digits (or 11 starting with 0)')
      return
    }

    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const hasMeasurements = Object.keys(bodyMeasurements || {}).length > 0

    try {
      await addCustomer({
        name,
        phone,
        phoneType,
        onWhatsApp,
        sex,
        birthday,
        email,
        address,
        notes,
        photo,
        bodyMeasurements,
        date: today,
      })
      showToast(hasMeasurements ? `${name} saved with measurements ✓` : `${name} added — no measurements saved`)
    } catch (err) {
      showToast(`ERROR: ${err?.code || err?.message || String(err)}`)
    }
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deleteCustomer(deleteTarget.id)
    showToast(`${deleteTarget.name} deleted`)
    setDeleteTarget(null)
  }

  const filtered = query.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.phone && c.phone.includes(query))
      )
    : customers

  const sectionLabel = customers.length === 0
    ? ''
    : filtered.length === customers.length
      ? 'All Clients'
      : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`

  const grouped = (() => {
    if (sortMode === 'alpha') {
      const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      return sorted.reduce((acc, c) => {
        const key = c.name.trim()[0]?.toUpperCase() || '#'
        if (!acc[key]) acc[key] = []
        acc[key].push(c)
        return acc
      }, {})
    } else {
      const sorted = [...filtered].sort((a, b) => {
        const da = a.date ? new Date(a.date) : new Date(0)
        const db = b.date ? new Date(b.date) : new Date(0)
        return db - da
      })
      return sorted.reduce((acc, c) => {
        const key = c.date || 'Unknown Date'
        if (!acc[key]) acc[key] = []
        acc[key].push(c)
        return acc
      }, {})
    }
  })()

  const selectSort = (mode) => {
    setSortMode(mode)
    setFilterOpen(false)
  }

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} />

      <div className={styles.searchContainer}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <span className="mi" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
            <input
              type="text"
              placeholder="Search clients…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button
            className={`${styles.filterBtn} ${sortMode !== 'date' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterOpen(v => !v)}
          >
            <span className="mi" style={{ fontSize: '1.3rem' }}>tune</span>
          </button>
        </div>

        {filterOpen && (
          <div className={styles.filterDropdown}>
            <div className={styles.filterDropdownTitle}>Sort by</div>
            <button
              className={`${styles.filterOption} ${sortMode === 'date' ? styles.filterOptionActive : ''}`}
              onClick={() => selectSort('date')}
            >
              <span className="mi" style={{ fontSize: '1.1rem' }}>calendar_today</span>
              <span>Date Added</span>
              {sortMode === 'date' && (
                <span className="mi" style={{ fontSize: '1rem', marginLeft: 'auto', color: 'var(--accent)' }}>check</span>
              )}
            </button>
            <button
              className={`${styles.filterOption} ${sortMode === 'alpha' ? styles.filterOptionActive : ''}`}
              onClick={() => selectSort('alpha')}
            >
              <span className="mi" style={{ fontSize: '1.1rem' }}>sort_by_alpha</span>
              <span>Alphabetically (A–Z)</span>
              {sortMode === 'alpha' && (
                <span className="mi" style={{ fontSize: '1rem', marginLeft: 'auto', color: 'var(--accent)' }}>check</span>
              )}
            </button>
          </div>
        )}
      </div>

      {sectionLabel && <div className={styles.sectionLabel}>{sectionLabel}</div>}

      <div className={styles.scrollArea} onClick={() => filterOpen && setFilterOpen(false)}>
        {customers.length === 0 && (
          <EmptyState />
        )}

        {customers.length > 0 && filtered.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <span className="mi" style={{ fontSize: '3rem', color: 'var(--text3)' }}>search_off</span>
            </div>
            <p>No matches found.</p>
            <span>Try a different name or number</span>
          </div>
        )}

        {Object.entries(grouped).map(([groupKey, groupCustomers]) => (
          <div key={groupKey} className={styles.custGroup}>
            <div className={styles.custGroupDate}>{groupKey}</div>
            <div className={styles.custGroupDivider} />

            {groupCustomers.map((c, idx) => (
              <CustomerRow
                key={c.id}
                customer={c}
                isLast={idx === groupCustomers.length - 1}
                onOpen={() => navigate(`/customers/${c.id}`)}
                onDelete={(cust) => setDeleteTarget(cust)}
              />
            ))}
          </div>
        ))}
      </div>

      <button className={styles.fab} onClick={() => setFormOpen(true)}>
        <span className="mi">add</span>
      </button>

      <AddCustomerModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        isPremium={isPremium}
      />

      <DeleteConfirmSheet
        customer={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast message={toastMsg} />
      <BottomNav />
    </div>
  )
}
