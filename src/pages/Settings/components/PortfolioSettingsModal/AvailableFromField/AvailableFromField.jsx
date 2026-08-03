import styles from './AvailableFromField.module.css'
import { Dropdown } from '../../../../../components/Dropdown/Dropdown'
import { MONTHS, YEARS } from '../datas'

export function AvailableFromField({ value, onChange }) {
  const month = value?.month || null
  const year = value?.year || null

  return (
    <div className={styles.row}>
      <Dropdown
        options={MONTHS}
        value={month}
        onChange={newMonth => onChange({ month: newMonth, year })}
        placeholder="Month"
      />
      <Dropdown
        options={YEARS}
        value={year}
        onChange={newYear => onChange({ month, year: newYear })}
        placeholder="Year"
      />
    </div>
  )
}