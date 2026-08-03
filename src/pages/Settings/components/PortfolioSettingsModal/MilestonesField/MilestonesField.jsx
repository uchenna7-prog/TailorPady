import { MAX_MILESTONE_LABEL_LENGTH } from '../datas'
import styles from './MilestonesField.module.css'

export function MilestonesField({ value, onChange }) {
  const milestones = Array.isArray(value) && value.length === 2
    ? value
    : [{ number: '', label: '' }, { number: '', label: '' }]

  function updateRow(index, key, val) {
    const next = milestones.map((m, i) => i === index ? { ...m, [key]: val } : m)
    onChange(next)
  }

  return (
    <div className={styles.wrap}>
      {milestones.map((m, i) => (
        <div key={i} className={styles.row}>
          <input
            type="text"
            inputMode="numeric"
            className={styles.numberInput}
            placeholder="e.g. 500+"
            value={m.number}
            onChange={e => updateRow(i, 'number', e.target.value)}
          />
          <input
            type="text"
            className={styles.labelInput}
            placeholder="e.g. Happy Clients"
            value={m.label}
            maxLength={MAX_MILESTONE_LABEL_LENGTH}
            onChange={e => updateRow(i, 'label', e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}
