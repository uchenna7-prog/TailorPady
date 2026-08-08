import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../../contexts/CustomerContext'
import { usePremium } from '../../contexts/PremiumContext'
import { useTour } from '../../contexts/TourContext'
import { USAGE_LIMITS } from '../../datas/usageLimits'
import { DeleteConfirmSheet } from './components/DeleteConfirmSheet/DeleteConfirmSheet'
import { CustomerRow } from './components/CustomerRow/CustomerRow'
import { AddCustomerModal } from './components/AddCustomerModal/AddCustomerModal'
import { EmptyState } from './components/EmptyState/EmptyState'
import { UpgradeSheet } from '../../components/UpgradeSheet/UpgradeSheet'
import { LimitBanner } from '../../components/LimitBanner/LimitBanner'
import BottomNav from '../../components/BottomNav/BottomNav'
import Header from '../../components/Header/Header'
import Toast from '../../components/Toast/Toast'
import styles from './Customers.module.css'


const NEAR_LIMIT_THRESHOLD = 3


export default function Customers({ onMenuClick }) {

  const navigate = useNavigate()
  const {customers, addCustomer,deleteCustomerAndAllData } = useCustomers()
  const { isPremium } = usePremium()
  const { completeStep, pendingCustomerId, currentStep, pauseTour, resumeTour } = useTour()
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false)
  const [query,        setQuery]        = useState('')
  const [formOpen,     setFormOpen]     = useState(false)
  const [upgradeOpen,  setUpgradeOpen]  = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toastMsg,     setToastMsg]     = useState('')
  const [sortMode,     setSortMode]     = useState('date')
  const [filterOpen,   setFilterOpen]   = useState(false)
  const toastTimer = useRef(null)

  const remainingSlots = USAGE_LIMITS.customers - customers.length
  const atLimit         = !isPremium && remainingSlots <= 0
  const nearLimit        = !isPremium && remainingSlots > 0 && remainingSlots <= NEAR_LIMIT_THRESHOLD
  const showLimitBanner  = atLimit || nearLimit

  useEffect(() => {
    if (!formOpen) return
    pauseTour()
    return () => resumeTour()
  }, [formOpen, pauseTour, resumeTour])

  const showToast = (msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400)
  }

  const handleFabClick = () => {
    if (atLimit) {
      setUpgradeOpen(true)
      return
    }
    setFormOpen(true)
  }

  const goToUpgrade = () => {
    navigate('/account', { state: { autoOpenModal: 'upgrade' } })
  }

  const handleUpgrade = () => {
    setUpgradeOpen(false)
    goToUpgrade()
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
      const created = await addCustomer({
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

      const newCustomerId = created?.id ?? created
      if (newCustomerId) {
        completeStep('add-customer', { customerId: newCustomerId })
      }
    } catch (err) {
      if (err?.code === 'limit-reached') {
        setFormOpen(false)
        setUpgradeOpen(true)
        return
      }
      showToast(`ERROR: ${err?.code || err?.message || String(err)}`)
    }
  }

  const handleDeleteConfirm = async () => {
  const target = deleteTarget
  setDeleteConfirmModalOpen(false)
  setDeleteTarget(null)
  showToast(`${target.name} deleted`)
  try {
    await deleteCustomerAndAllData(target.id)
  } catch {
    showToast('Failed to delete customer. Try again.')
  }
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

  function handleOpenCustomer(c) {
    if (currentStep?.id === 'tap-new-customer' && String(c.clientId ?? c.id) === String(pendingCustomerId)) {
      completeStep('tap-new-customer')
    }
    navigate(`/customers/${c.id}`)
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

      {showLimitBanner && (
        <LimitBanner
          atLimit={atLimit}
          icon="group"
          message={
            atLimit
              ? "You've reached your Free plan limit of " + USAGE_LIMITS.customers + " customers"
              : remainingSlots + " customer slot" + (remainingSlots === 1 ? '' : 's') + " left on Free plan"
          }
          onUpgradeClick={goToUpgrade}
        />
      )}

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
              <div
                key={c.id}
                data-tour={String(c.clientId ?? c.id) === String(pendingCustomerId) ? 'new-customer-row' : undefined}
              >
                <CustomerRow
                  customer={c}
                  isLast={idx === groupCustomers.length - 1}
                  onOpen={() => handleOpenCustomer(c)}
                  onDelete={(cust) => {
                    setDeleteTarget(cust)
                    setDeleteConfirmModalOpen(true)
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        className={styles.fab}
        onClick={handleFabClick}
        data-tour="add-customer-fab"
      >
        <span className="mi">add</span>
      </button>

      <AddCustomerModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        isPremium={isPremium}
      />

      <UpgradeSheet
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgrade}
        icon="group"
        title="Customer limit reached"
        message={`You've hit the free plan limit of ${USAGE_LIMITS.customers} customers. Upgrade to Premium for unlimited customers.`}
      />

      {deleteConfirmModalOpen && deleteTarget && (
      <DeleteConfirmSheet
        customer={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmModalOpen(false)
          setDeleteTarget(null)
        }}
      />
    )}

      <Toast message={toastMsg} />
      <BottomNav />
    </div>
  )
}
