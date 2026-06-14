import { useState, useEffect } from "react"
import styles from "./ManageGarmentTypesSheet.module.css"


export function ManageGarmentTypesSheet({ isOpen, onClose, tabId, types, onSave, photos }) {

  const [items,    setItems]    = useState([...(types || [])])
  const [newLabel, setNewLabel] = useState('')

  useEffect(() => {
    if (isOpen) setItems([...(types || [])])
  }, [isOpen, types])

  if (!isOpen) return null

  const addItem = () => {
    const trimmed = newLabel.trim()
    if (!trimmed) return
    const id = trimmed.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    setItems(prev => [...prev, { id, label: trimmed }])
    setNewLabel('')
  }

  const removeItem = (id) => setItems(prev => prev.filter(t => t.id !== id))
  const handleSave = () => { onSave(tabId, items); onClose() }

  const survivingIds = new Set(items.map(t => t.id))
  const removedTypes = (types || []).filter(t => !survivingIds.has(t.id))
  const affectedCount = removedTypes.reduce((sum, t) => {
    return sum + (photos || []).filter(p => p.category === tabId && p.clothingType === t.id).length
  }, 0)

  return (
    <div className={styles.sheetOverlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>Dress Types</span>
          <button className={styles.sheetClose} onClick={onClose}>
            <span className="mi" style={{ fontSize: '1.2rem' }}>close</span>
          </button>
        </div>

        <div className={styles.sheetBody}>
          {items.length === 0 && (
            <p className={styles.sheetEmpty}>No dress types yet. Add one below.</p>
          )}
          {items.map(item => (
            <div key={item.id} className={styles.manageRow}>
              <span className={styles.manageLabel}>{item.label}</span>
              <button className={styles.manageRemove} onClick={() => removeItem(item.id)}>
                <span className="mi" style={{ fontSize: '1rem', color: 'var(--danger)' }}>delete_outline</span>
              </button>
            </div>
          ))}
          <div className={styles.manageAddRow}>
            <input
              type="text"
              className={styles.manageInput}
              placeholder="e.g. Agbada, Senator, Aso-Oke…"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addItem() }}
            />
            <button className={styles.manageAddBtn} onClick={addItem} disabled={!newLabel.trim()}>
              <span className="mi" style={{ fontSize: '1.1rem' }}>add</span>
            </button>
          </div>

          {affectedCount > 0 && (
            <div className={styles.deleteWarning}>
              <span className="mi" style={{ fontSize: '1rem', flexShrink: 0 }}>warning</span>
              <span>{affectedCount} photo{affectedCount > 1 ? 's' : ''} under removed type{removedTypes.length > 1 ? 's' : ''} will also be deleted.</span>
            </div>
          )}
        </div>

        <div className={styles.sheetFooter}>
          <button className={styles.sheetSaveBtn} onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}