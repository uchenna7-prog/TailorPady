import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  subscribeToInventory,
  createInventoryItem,
  updateInventoryItem,
  adjustInventoryQty,
  deleteInventoryItem,
} from '../../services/inventoryService'
import Header       from '../../components/Header/Header'
import ConfirmSheet from '../../components/ConfirmSheet/ConfirmSheet'
import Toast        from '../../components/Toast/Toast'
import { Dropdown } from '../../components/Dropdown/Dropdown'
import styles from './Inventory.module.css'
import BottomNav from '../../components/BottomNav/BottomNav'

const DONUT_CIRCUMFERENCE = 2 * Math.PI * 26

const CATEGORIES = [
  { id: 'fabric',    label: 'Fabric',    icon: 'layers'         },
  { id: 'thread',    label: 'Thread',    icon: 'linear_scale'   },
  { id: 'button',    label: 'Buttons',   icon: 'radio_button_unchecked' },
  { id: 'zip',       label: 'Zips',      icon: 'compare_arrows' },
  { id: 'lining',    label: 'Lining',    icon: 'texture'        },
  { id: 'padding',   label: 'Padding',   icon: 'select_all'     },
  { id: 'elastic',   label: 'Elastic',   icon: 'expand'         },
  { id: 'supplies',  label: 'Supplies',  icon: 'handyman'       },
  { id: 'other',     label: 'Other',     icon: 'category'       },
]

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

const CATEGORY_FILTER_OPTIONS = [{ id: 'all', label: 'All Categories', icon: 'apps' }, ...CATEGORIES]

const UNITS = ['yards', 'metres', 'pcs', 'rolls', 'kg', 'g', 'packets', 'boxes', 'pairs']

const TABS = [
  { id: 'all',       label: 'All'        },
  { id: 'low',       label: 'Low Stock'  },
  { id: 'ok',        label: 'In Stock' },
  { id: 'out',       label: 'Out'        },
]

function stockStatus(item) {
  const qty = parseFloat(item.quantity) || 0
  if (qty <= 0) return 'out'
  if (qty <= (parseFloat(item.lowStockAt) || 5)) return 'low'
  return 'ok'
}

const STATUS_CONFIG = {
  ok:  { label: 'In Stock',  color: '#15803d', bg: 'rgba(21,128,61,0.12)',  border: 'rgba(21,128,61,0.3)'  },
  low: { label: 'Low Stock', color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.3)' },
  out: { label: 'Out',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)'  },
}

function InventoryRow({ item, isLast, onTap }) {
  const cat    = CAT_MAP[item.category] ?? CAT_MAP.other
  const status = stockStatus(item)
  const sc     = STATUS_CONFIG[status]

  return (
    <div
      className={`${styles.invRow} ${isLast ? styles.invRowLast : ''}`}
      onClick={onTap}
    >
      <div className={styles.invRowIcon}>
        <div className={styles.invRowIconInner}>
          <span className="mi" style={{ fontSize: '1.3rem', color: sc.color }}>{cat.icon}</span>
        </div>
      </div>

      <div className={styles.invRowInfo}>
        <div className={styles.invRowName}>{item.name}</div>
        {item.colour && (
          <div className={styles.invRowMeta}>
            <span className="mi" style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>circle</span>
            <span className={styles.invRowMetaText}>{item.colour}</span>
          </div>
        )}
        <div className={styles.invRowMeta}>
          <span className="mi" style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>category</span>
          <span className={styles.invRowMetaText}>{cat.label}</span>
        </div>
      </div>

      <div className={styles.invRowRight}>
        <span
          className={styles.invRowStatus}
          style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
        >
          {sc.label}
        </span>
        <div className={styles.invRowQty} style={{ color: sc.color }}>
          {item.quantity}
          <span className={styles.invRowUnit}>{item.unit}</span>
        </div>
      </div>
    </div>
  )
}

function ItemModal({ isOpen, editItem, onClose, onSave }) {
  const [name,       setName]       = useState('')
  const [category,   setCategory]   = useState('fabric')
  const [quantity,   setQuantity]   = useState('')
  const [unit,       setUnit]       = useState('yards')
  const [lowStockAt, setLowStockAt] = useState('5')
  const [notes,      setNotes]      = useState('')
  const [colour,     setColour]     = useState('')

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || '')
      setCategory(editItem.category || 'fabric')
      setQuantity(String(editItem.quantity ?? ''))
      setUnit(editItem.unit || 'yards')
      setLowStockAt(String(editItem.lowStockAt ?? '5'))
      setNotes(editItem.notes || '')
      setColour(editItem.colour || '')
    } else {
      setName(''); setCategory('fabric'); setQuantity('')
      setUnit('yards'); setLowStockAt('5'); setNotes(''); setColour('')
    }
  }, [editItem, isOpen])

  const reset = () => {
    setName(''); setCategory('fabric'); setQuantity('')
    setUnit('yards'); setLowStockAt('5'); setNotes(''); setColour('')
  }

  const handleClose = () => { reset(); onClose() }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name:       name.trim(),
      category,
      quantity:   parseFloat(quantity) || 0,
      unit,
      lowStockAt: parseFloat(lowStockAt) || 5,
      notes:      notes.trim(),
      colour:     colour.trim(),
    })
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modalOverlay} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <button className={styles.modalBack} onClick={handleClose}>
              <span className="mi" style={{ fontSize: '1.5rem' }}>arrow_back_ios</span>
            </button>
            <span className={styles.modalTitle}>
              {editItem ? 'Edit Item' : 'New Item'}
            </span>
          </div>
          <button
            className={styles.modalSaveBtn}
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {editItem ? 'Update' : 'Add'}
          </button>
        </div>

        <div className={styles.desktopHeaderWrap}>
          <Header
            type="back"
            title={editItem ? 'Edit Item' : 'New Item'}
            onBackClick={handleClose}
            backIcon="arrow_back_ios"
            customActions={[
              { label: editItem ? 'Update' : 'Add', onClick: handleSave, color: 'var(--accent)', disabled: !name.trim() }
            ]}
          />
        </div>

        <div className={styles.modalBody}>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Item Name *</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Navy Blue Ankara, White Thread…"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Category</label>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.catChip} ${category === cat.id ? styles.catChipActive : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span className="mi" style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Colour / Variant <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Royal Blue, #D4AF37…"
              value={colour}
              onChange={e => setColour(e.target.value)}
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup} style={{ flex: 1 }}>
              <label className={styles.fieldLabel}>Quantity</label>
              <input
                type="number"
                inputMode="decimal"
                className={styles.input}
                placeholder="0"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup} style={{ flex: 1 }}>
              <label className={styles.fieldLabel}>Unit</label>
              <Dropdown
                options={UNITS}
                value={unit}
                onChange={setUnit}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Low Stock Alert Threshold</label>
            <input
              type="number"
              inputMode="decimal"
              className={styles.input}
              placeholder="5"
              value={lowStockAt}
              onChange={e => setLowStockAt(e.target.value)}
            />
            <div className={styles.fieldHint}>
              You'll see a warning when quantity falls to or below this number
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Notes <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              className={styles.textarea}
              placeholder="Supplier, brand, where you buy it…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>

        </div>
      </div>
    </div>
  )
}

function AdjustSheet({ item, onClose, onAdjust }) {
  const [delta, setDelta] = useState('')
  const [mode,  setMode]  = useState('use')

  if (!item) return null

  const handleConfirm = () => {
    const val = parseFloat(delta)
    if (!val || val <= 0) return
    onAdjust(item.id, mode === 'use' ? -val : val)
    setDelta('')
    onClose()
  }

  const qty        = parseFloat(item.quantity) || 0
  const previewQty = mode === 'use'
    ? Math.max(0, qty - (parseFloat(delta) || 0))
    : qty + (parseFloat(delta) || 0)

  return (
    <div className={styles.adjustSheetOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.adjustSheetPanel} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />

        <div className={styles.adjustSheetTitle}>Adjust Stock</div>
        <div className={styles.adjustSheetSubtitle}>{item.name}</div>

        <div className={styles.adjustCurrent}>
          Current: <strong>{item.quantity} {item.unit}</strong>
        </div>

        <div className={styles.adjustModeRow}>
          <button
            className={`${styles.modeBtn} ${mode === 'use' ? styles.modeBtnUse : ''}`}
            onClick={() => setMode('use')}
          >
            <span className="mi" style={{ fontSize: '1rem' }}>remove_circle_outline</span>
            Used / Remove
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'restock' ? styles.modeBtnRestock : ''}`}
            onClick={() => setMode('restock')}
          >
            <span className="mi" style={{ fontSize: '1rem' }}>add_circle_outline</span>
            Restock / Add
          </button>
        </div>

        <div className={styles.fieldGroup} style={{ marginTop: 18 }}>
          <label className={styles.fieldLabel}>
            {mode === 'use' ? 'Amount Used' : 'Amount Added'} ({item.unit})
          </label>
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            className={styles.input}
            placeholder="0"
            value={delta}
            onChange={e => setDelta(e.target.value)}
          />
        </div>

        {delta && parseFloat(delta) > 0 && (
          <div className={styles.adjustPreview}>
            New quantity: <strong style={{ color: previewQty <= 0 ? '#ef4444' : previewQty <= (item.lowStockAt || 5) ? '#fb923c' : '#15803d' }}>
              {previewQty} {item.unit}
            </strong>
          </div>
        )}

        <button
          className={styles.btnPrimary}
          onClick={handleConfirm}
          disabled={!delta || parseFloat(delta) <= 0}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

function ItemDetail({ item, onClose, onEdit, onDelete, onAdjust }) {
  if (!item) return null

  const cat    = CAT_MAP[item.category] ?? CAT_MAP.other
  const status = stockStatus(item)
  const sc     = STATUS_CONFIG[status]

  const [adjustOpen, setAdjustOpen] = useState(false)

  const lowStockAt   = parseFloat(item.lowStockAt) || 5
  const quantity      = parseFloat(item.quantity) || 0
  const target         = Math.max(lowStockAt * 2, 1)
  const stockPercent = Math.round(Math.min(100, (quantity / target) * 100))

  const statusNote = status === 'out'
    ? 'Out of stock'
    : status === 'low'
      ? 'Below threshold'
      : 'Healthy stock'

  return (
    <>
      <div
        className={styles.itemDetailBackdrop}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div className={styles.itemDetailModal}>
          <div className={styles.detailHandle} />

          <div className={styles.mobileHeader}>
            <button className={styles.mobileCloseBtn} onClick={onClose}>
              <span className="mi" style={{ fontSize: '1.35rem' }}>close</span>
            </button>
            <div className={styles.mobileHeaderTitle}>Item Details</div>
            <button className={styles.mobileHeaderDelete} onClick={onDelete}>
              <span className="mi" style={{ fontSize: '1.1rem' }}>delete_outline</span>
            </button>
          </div>

          <div className={styles.desktopHeaderWrap}>
            <Header
              type="back"
              title="Item Details"
              onBackClick={onClose}
              backIcon="arrow_back_ios"
              customActions={[
                { icon: 'delete_outline', onClick: onDelete, color: 'var(--danger)' }
              ]}
            />
          </div>

          <div className={styles.modalBody}>

            <div className={styles.detailTitleRow}>
              <div className={styles.detailIconWrap} style={{ background: sc.bg, borderColor: sc.border }}>
                <span className="mi" style={{ fontSize: '1.5rem', color: sc.color }}>{cat.icon}</span>
              </div>
              <div>
                <div className={styles.detailTitle}>{item.name}</div>
                {item.colour && <div className={styles.detailSubtitle}>{item.colour}</div>}
              </div>
            </div>

            <div className={styles.statusRow}>
              <div className={styles.chipLabel}>Stock Status</div>
              <div className={styles.statusBadge} style={{ background: sc.bg, borderColor: sc.border }}>
                <span className={styles.statusDot} style={{ background: sc.color }} />
                <span style={{ color: sc.color }}>{sc.label}</span>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoGridCell}>
                <div className={styles.infoGridLabel}>Category</div>
                <div className={styles.infoGridValue}>{cat.label}</div>
              </div>
              <div className={styles.infoGridCell}>
                <div className={styles.infoGridLabel}>Quantity</div>
                <div className={styles.infoGridValue}>{item.quantity} {item.unit}</div>
              </div>
              <div className={styles.infoGridCell}>
                <div className={styles.infoGridLabel}>Low Stock At</div>
                <div className={styles.infoGridValue}>{lowStockAt} {item.unit}</div>
              </div>
              <div className={styles.infoGridCell}>
                <div className={styles.infoGridLabel}>Unit</div>
                <div className={styles.infoGridValue}>{item.unit}</div>
              </div>
            </div>

            {item.notes && (
              <div className={styles.detailSectionCard}>
                <div className={styles.detailSectionLabel}>Notes</div>
                <p className={styles.detailNoteText}>{item.notes}</p>
              </div>
            )}

            <div className={styles.premiumCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Stock Level</span>
              </div>
              <div className={styles.donutRow}>
                <div className={styles.donutContent}>
                  <div className={styles.cardValue}>{item.quantity} {item.unit} in stock</div>
                  <div className={styles.donutMeta}>
                    <span className="mi" style={{ fontSize: '0.82rem' }}>warning_amber</span>
                    <span style={{ color: sc.color }}>{statusNote}</span>
                  </div>
                </div>
                <div className={styles.donutWrap}>
                  <svg viewBox="0 0 64 64" className={styles.donutSvg}>
                    <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface2)" strokeWidth="7" />
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke={sc.color}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={DONUT_CIRCUMFERENCE}
                      strokeDashoffset={DONUT_CIRCUMFERENCE - (stockPercent / 100) * DONUT_CIRCUMFERENCE}
                      transform="rotate(-90 32 32)"
                      className={styles.donutProgress}
                    />
                  </svg>
                  <span className={styles.donutLabel} style={{ color: sc.color }}>{stockPercent}%</span>
                </div>
              </div>
            </div>

            <div className={styles.footerButtons}>
              <button className={styles.btnPrimary} onClick={() => setAdjustOpen(true)}>
                <span className="mi" style={{ fontSize: '1.05rem' }}>tune</span>
                Adjust Stock
              </button>
              <button className={styles.btnSecondary} onClick={onEdit}>
                <span className="mi" style={{ fontSize: '1rem' }}>edit</span>
                Edit Item
              </button>
            </div>

          </div>
        </div>
      </div>

      {adjustOpen && (
        <AdjustSheet
          item={item}
          onClose={() => setAdjustOpen(false)}
          onAdjust={(id, delta) => { onAdjust(id, delta); setAdjustOpen(false) }}
        />
      )}
    </>
  )
}

export default function Inventory({ onMenuClick }) {
  const { user } = useAuth()

  const [items,       setItems]       = useState([])
  const [activeTab,   setActiveTab]   = useState('all')
  const [search,      setSearch]      = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editItem,    setEditItem]    = useState(null)
  const [detailItem,  setDetailItem]  = useState(null)
  const [confirmDel,  setConfirmDel]  = useState(null)
  const [toastMsg,    setToastMsg]    = useState('')
  const [filterCat,   setFilterCat]   = useState('all')
  const toastTimer = useRef(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToInventory(
      user.uid,
      (data) => {
        setItems(data)
        setDetailItem(prev => prev ? data.find(i => i.id === prev.id) ?? null : null)
      },
      (err) => console.error('[Inventory]', err)
    )
    return unsub
  }, [user])

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400)
  }, [])

  const handleSave = async (data) => {
    if (!user) return
    try {
      if (editItem) {
        await updateInventoryItem(user.uid, editItem.id, data)
        showToast('Item updated ✓')
      } else {
        await createInventoryItem(user.uid, data)
        showToast(`${data.name} added ✓`)
      }
    } catch {
      showToast('Failed to save item.')
    }
    setEditItem(null)
  }

  const handleAdjust = async (itemId, delta) => {
    if (!user) return
    try {
      await adjustInventoryQty(user.uid, itemId, delta)
      showToast(delta > 0 ? `+${delta} restocked ✓` : `${Math.abs(delta)} used ✓`)
    } catch {
      showToast('Failed to adjust quantity.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDel || !user) return
    try {
      await deleteInventoryItem(user.uid, confirmDel.id)
      showToast('Item deleted')
      setDetailItem(null)
    } catch {
      showToast('Failed to delete item.')
    }
    setConfirmDel(null)
  }

  const filtered = items.filter(item => {
    if (activeTab !== 'all' && stockStatus(item) !== activeTab) return false
    if (filterCat !== 'all' && item.category !== filterCat) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        (item.colour && item.colour.toLowerCase().includes(q)) ||
        (item.notes  && item.notes.toLowerCase().includes(q))
      )
    }
    return true
  })

  const counts = {
    all: items.length,
    ok:  items.filter(i => stockStatus(i) === 'ok').length,
    low: items.filter(i => stockStatus(i) === 'low').length,
    out: items.filter(i => stockStatus(i) === 'out').length,
  }

  const grouped = filtered.reduce((acc, item) => {
    const cat = CAT_MAP[item.category]?.label ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const lowStockCount = counts.low + counts.out

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="Inventory" />

      <div className={styles.searchContainer}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <span className="mi" style={{ color: 'var(--text3)', fontSize: '1.1rem' }}>search</span>
            <input
              type="text"
              placeholder="Search items…"
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

          <div className={`${styles.categoryFilterWrap} ${filterCat !== 'all' ? styles.categoryFilterWrapActive : ''}`}>
            <Dropdown
              options={CATEGORY_FILTER_OPTIONS}
              value={filterCat}
              onChange={setFilterCat}
              getOptionLabel={c => c.label}
              getOptionValue={c => c.id}
              isOptionSelected={c => c.id === filterCat}
              className={styles.categoryFilterDropdown}
              menuMinWidth={220}
              menuHeader="Filter by Category"
              renderTrigger={() => (
                <span className="mi" style={{ fontSize: '1.2rem' }}>tune</span>
              )}
              renderOption={(c, active) => (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <span className="mi" style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                  <span style={{ flex: 1 }}>{c.label}</span>
                  {active && <span className="mi" style={{ fontSize: '1rem', color: 'var(--accent)' }}>check</span>}
                </span>
              )}
            />
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <div
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`${styles.tabBadge} ${tab.id === 'low' ? styles.badgeLow : tab.id === 'out' ? styles.badgeOut : ''}`}>
                {counts[tab.id]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.listArea}>

        {items.length === 0 && (
          <div className={styles.emptyState}>
            <span className="mi" style={{ fontSize: '3rem', opacity: 0.15 }}>inventory_2</span>
            <p>No items yet.</p>
            <span>Tap + to add your first inventory item</span>
          </div>
        )}

        {items.length > 0 && filtered.length === 0 && (
          <div className={styles.emptyState}>
            <span className="mi" style={{ fontSize: '2.8rem', opacity: 0.15 }}>search_off</span>
            <p>No items match your filters.</p>
          </div>
        )}

        {activeTab === 'all' && lowStockCount > 0 && (
          <div className={styles.alertBanner} onClick={() => setActiveTab('low')}>
            <span className="mi" style={{ fontSize: '1rem', color: '#fb923c' }}>warning_amber</span>
            <span className={styles.alertText}>
              {lowStockCount} item{lowStockCount !== 1 ? 's' : ''} need attention
            </span>
            <span className="mi" style={{ fontSize: '0.9rem', color: 'var(--text3)', marginLeft: 'auto' }}>chevron_right</span>
          </div>
        )}

        {Object.entries(grouped).map(([groupLabel, groupItems]) => (
          <div key={groupLabel} className={styles.itemGroup}>
            <div className={styles.groupLabel}>{groupLabel}</div>
            <div className={styles.groupDivider} />
            {groupItems.map((item, idx) => (
              <InventoryRow
                key={item.id}
                item={item}
                isLast={idx === groupItems.length - 1}
                onTap={() => setDetailItem(item)}
              />
            ))}
          </div>
        ))}

        <div style={{ height: 32 }} />
      </div>

      <button className={styles.fab} onClick={() => { setEditItem(null); setModalOpen(true) }}>
        <span className="mi">add</span>
      </button>

      <ItemModal
        isOpen={modalOpen}
        editItem={editItem}
        onClose={() => { setModalOpen(false); setEditItem(null) }}
        onSave={handleSave}
      />

      {detailItem && (
        <ItemDetail
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={() => {
            setEditItem(detailItem)
            setDetailItem(null)
            setModalOpen(true)
          }}
          onDelete={() => setConfirmDel(detailItem)}
          onAdjust={handleAdjust}
        />
      )}

      <ConfirmSheet
        open={!!confirmDel}
        title="Delete Item?"
        message="This will permanently remove the item from your inventory."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDel(null)}
      />

      <Toast message={toastMsg} />
      <BottomNav></BottomNav>
    </div>
  )
}
