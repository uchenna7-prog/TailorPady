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
  const handleNum  = n => onChange(`${n} ${unit}`)
  const handleUnit = u => {
  const safeNum = u === 'days' ? Math.min(parseInt(num), 30) : Math.min(parseInt(num), 12)
    onChange(`${safeNum} ${u}`)
  }
  return (
    <div className={styles.turnaroundRow}>

      <select className={styles.turnaroundSelect} value={num} onChange={e => handleNum(e.target.value)}>
        {numOptions.map(n => <option key={n} value={n}>{n}</option>)}
      </select>

      <select className={styles.turnaroundSelect} value={unit} onChange={e => handleUnit(e.target.value)}>
        <option value="days">Days</option>
        <option value="weeks">Weeks</option>
      </select>
      
    </div>
  )
}