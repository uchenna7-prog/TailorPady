import { NIGERIAN_STATES } from "../datas"
import { Dropdown } from "../../../../../components/Dropdown/Dropdown"
import styles from "./ServiceAreaPicker.module.css"

export function ServiceAreaPicker({ value, onChange }) {

  const selected = Array.isArray(value) ? value : []

  const hasNationwide    = selected.includes('Nationwide')
  const hasInternational = selected.includes('International')
  const mode = hasNationwide ? 'nationwide' : 'states'

  const availableStates = NIGERIAN_STATES.filter(s => !selected.includes(s))
  const selectedStates = selected.filter(s => NIGERIAN_STATES.includes(s))

  const setMode = next => {
    if (next === mode) return
    if (next === 'nationwide') {
      onChange(hasInternational ? ['Nationwide', 'International'] : ['Nationwide'])
    } else {
      onChange(selected.filter(s => s !== 'Nationwide'))
    }
  }

  const toggleInternational = () => {
    const next = hasInternational
      ? selected.filter(s => s !== 'International')
      : [...selected, 'International']
    onChange(next)
  }

  const handleAddState = state => {
    if (!state) return
    onChange([...selected, state])
  }

  const removeChip = item => onChange(selected.filter(s => s !== item))

  return (
    <div className={styles.wrap}>

      <div className={styles.segmented}>
        <button
          type="button"
          className={`${styles.segmentBtn} ${mode === 'states' ? styles.segmentBtnActive : ''}`}
          onClick={() => setMode('states')}
        >
          <span className="mi" style={{ fontSize: '0.9rem' }}>map</span>
          Specific states
        </button>
        <button
          type="button"
          className={`${styles.segmentBtn} ${mode === 'nationwide' ? styles.segmentBtnActive : ''}`}
          onClick={() => setMode('nationwide')}
        >
          <span className="mi" style={{ fontSize: '0.9rem' }}>flag</span>
          Nationwide
        </button>
      </div>

      {mode === 'states' && (
        <>
          <Dropdown
            options={availableStates}
            value={null}
            onChange={handleAddState}
            placeholder="Add a state"
            searchable
            searchPlaceholder="Search states"
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
        </>
      )}

      <div className={styles.toggleRow}>
        <div className={styles.toggleLabel}>
          <span className={`mi ${styles.toggleIcon}`}>public</span>
          <div className={styles.toggleText}>
            <span className={styles.toggleTitle}>International clients</span>
            <span className={styles.toggleSub}>Also show your services to clients outside Nigeria</span>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={hasInternational}
          className={`${styles.switch} ${hasInternational ? styles.switchOn : ''}`}
          onClick={toggleInternational}
        >
          <span className={styles.switchThumb} />
        </button>
      </div>

    </div>
  )
}
