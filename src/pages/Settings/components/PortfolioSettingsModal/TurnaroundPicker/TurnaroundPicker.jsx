import { Dropdown } from "../../../../../components/Dropdown/Dropdown"
import styles from "./TurnaroundPicker.module.css"

export function TurnaroundPicker({ value, onChange }) {

  const parse = v => {
    if (!v) return { num: '1', unit: 'weeks' }
    const match = v.match(/^(\d+)\s+(days|weeks)$/)
    return match ? { num: match[1], unit: match[2] } : { num: '1', unit: 'weeks' }
  }
  const { num, unit } = parse(value)
  const maxNum = unit === 'days' ? 30 : 12
  const numOptions = Array.from({ length: maxNum }, (_, i) => String(i + 1))
  const unitOptions = [
    { label: 'Days', value: 'days' },
    { label: 'Weeks', value: 'weeks' },
  ]

  const handleNum = n => onChange(`${n} ${unit}`)
  const handleUnit = u => {
    const safeNum = u === 'days' ? Math.min(parseInt(num), 30) : Math.min(parseInt(num), 12)
    onChange(`${safeNum} ${u}`)
  }

  return (
    <div className={styles.turnaroundRow}>

      <Dropdown
        options={numOptions}
        value={num}
        onChange={handleNum}
      />

      <Dropdown
        options={unitOptions}
        value={unit}
        onChange={handleUnit}
      />

    </div>
  )
}
