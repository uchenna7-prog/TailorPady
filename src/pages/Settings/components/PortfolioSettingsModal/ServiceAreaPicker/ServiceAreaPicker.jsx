import { NIGERIAN_STATES } from "../datas"
import { Dropdown } from "../../../../../components/Dropdown/Dropdown"
import styles from "./ServiceAreaPicker.module.css"

export function ServiceAreaPicker({ value, onChange }) {

  const selected = Array.isArray(value) ? value : []

  const hasNationwide    = selected.includes('Nationwide')
  const hasInternational = selected.includes('International')
  const hasStates        = selected.some(s => NIGERIAN_STATES.includes(s))
  const isNationwideDisabled = hasStates
  const isStatesDisabled     = hasNationwide

  const availableStates = NIGERIAN_STATES.filter(s => !selected.includes(s))
  const selectedStates = selected.filter(s => NIGERIAN_STATES.includes(s))

  const toggleSpecial = opt => {
    if (opt === 'Nationwide') {
      if (isNationwideDisabled) return
      const next = hasNationwide
        ? selected.filter(s => s !== 'Nationwide')
        : [...selected, 'Nationwide']
      onChange(next)
    } else {
      const next = hasInternational
        ? selected.filter(s => s !== 'International')
        : [...selected, 'International']
      onChange(next)
    }
  }

  const handleAddState = state => {
    if (!state || isStatesDisabled) return
    onChange([...selected, state])
  }

  const removeSpecial = (e, opt) => {
    e.stopPropagation()
    toggleSpecial(opt)
  }

  const removeChip = item => onChange(selected.filter(s => s !== item))

  return (
    <div className={styles.wrap}>

      <Dropdown
        options={availableStates}
        value={null}
        onChange={handleAddState}
        placeholder={isStatesDisabled ? 'Nationwide selected — states unavailable' : 'Add a state…'}
        searchable
        searchPlaceholder="Search states…"
        disabled={isStatesDisabled}
      />

      {selectedStates.length > 0 && (
        <div className={styles.chips}>
          {selectedStates.map(s => (
            <button key={s} type="button" className={styles.chip} onClick={() => removeChip(s)}>
              {s}
              <span className="mi" style={{ fontSize: '0.75rem' }}>close</span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.special}>
        <button
          type="button"
          disabled={isNationwideDisabled}
          className={`${styles.specialBtn} ${hasNationwide ? styles.specialBtnActive : ''} ${isNationwideDisabled ? styles.specialBtnDisabled : ''}`}
          onClick={() => !hasNationwide && toggleSpecial('Nationwide')}
        >
          <span className="mi" style={{ fontSize: '0.9rem' }}>flag</span>
          Nationwide
          {hasNationwide && (
            <span className={`mi ${styles.specialBtnRemove}`} onClick={e => removeSpecial(e, 'Nationwide')}>
              close
            </span>
          )}
        </button>
        <button
          type="button"
          className={`${styles.specialBtn} ${hasInternational ? styles.specialBtnActive : ''}`}
          onClick={() => !hasInternational && toggleSpecial('International')}
        >
          <span className="mi" style={{ fontSize: '0.9rem' }}>public</span>
          International
          {hasInternational && (
            <span className={`mi ${styles.specialBtnRemove}`} onClick={e => removeSpecial(e, 'International')}>
              close
            </span>
          )}
        </button>
      </div>

      {(isNationwideDisabled || isStatesDisabled) && (
        <div className={styles.hint}>
          <span className="mi" style={{ fontSize: '0.85rem' }}>info</span>
          {isStatesDisabled
            ? 'Remove Nationwide to select specific states'
            : 'Remove your selected states to choose Nationwide'}
        </div>
      )}

    </div>
  )
}
