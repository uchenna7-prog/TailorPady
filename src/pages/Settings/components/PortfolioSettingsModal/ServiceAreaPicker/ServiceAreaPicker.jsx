import { useState } from "react"
import { NIGERIAN_STATES } from "../datas"
import styles from "./ServiceAreaPicker.module.css"

export function ServiceAreaPicker({ value, onChange }) {

  const selected = value ? value.split(',').map(s => s.trim()).filter(Boolean) : []
  const [dropdownValue, setDropdownValue] = useState('')

  const hasNationwide    = selected.includes('Nationwide')
  const hasInternational = selected.includes('International')
  const hasStates        = selected.some(s => NIGERIAN_STATES.includes(s))
  const isNationwideDisabled = hasStates
  const isStatesDisabled     = hasNationwide

  const availableStates = NIGERIAN_STATES.filter(s => !selected.includes(s))

  const toggleSpecial = opt => {
    if (opt === 'Nationwide') {
      if (isNationwideDisabled) return
      const next = hasNationwide
        ? selected.filter(s => s !== 'Nationwide')
        : [...selected, 'Nationwide']
      onChange(next.join(', '))
    } else {
      const next = hasInternational
        ? selected.filter(s => s !== 'International')
        : [...selected, 'International']
      onChange(next.join(', '))
    }
  }

  const handleDropdownChange = e => {
    const state = e.target.value
    if (!state || isStatesDisabled) return
    setDropdownValue('')
    onChange([...selected, state].join(', '))
  }

  const removeChip = item => onChange(selected.filter(s => s !== item).join(', '))

  return (
    <div className={styles.wrap}>

      {(isNationwideDisabled || isStatesDisabled) && (
        <div className={styles.hint}>
          <span className="mi" style={{ fontSize: '0.85rem' }}>info</span>
          {isStatesDisabled
            ? 'Remove Nationwide to select specific states'
            : 'Remove your selected states to choose Nationwide'}
        </div>
      )}

      <div className={styles.special}>
        <button
          type="button"
          disabled={isNationwideDisabled}
          className={`${styles.specialBtn} ${hasNationwide ? styles.specialBtnActive : ''} ${isNationwideDisabled ? styles.specialBtnDisabled : ''}`}
          onClick={() => toggleSpecial('Nationwide')}
        >
          <span className="mi" style={{ fontSize: '0.9rem' }}>flag</span>
          Nationwide
          {hasNationwide && <span className="mi" style={{ fontSize: '0.85rem', marginLeft: 2 }}>check</span>}
        </button>
        <button
          type="button"
          className={`${styles.specialBtn} ${hasInternational ? styles.specialBtnActive : ''}`}
          onClick={() => toggleSpecial('International')}
        >
          <span className="mi" style={{ fontSize: '0.9rem' }}>public</span>
          International
          {hasInternational && <span className="mi" style={{ fontSize: '0.85rem', marginLeft: 2 }}>check</span>}
        </button>
      </div>

      <div className={`${styles.selectWrap} ${isStatesDisabled ? styles.selectWrapDisabled : ''}`}>
        <select
          className={styles.select}
          value={dropdownValue}
          onChange={handleDropdownChange}
          disabled={isStatesDisabled}
        >
          <option value="">
            {isStatesDisabled ? 'Nationwide selected — states unavailable' : 'Add a state…'}
          </option>
          {availableStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <span className={`mi ${styles.selectIcon}`}>expand_more</span>
      </div>

      {selected.filter(s => NIGERIAN_STATES.includes(s)).length > 0 && (
        <div className={styles.chips}>
          {selected.filter(s => NIGERIAN_STATES.includes(s)).map(s => (
            <button key={s} type="button" className={styles.chip} onClick={() => removeChip(s)}>
              {s}
              <span className="mi" style={{ fontSize: '0.75rem' }}>close</span>
            </button>
          ))}
        </div>
      )}

    </div>
  )
}