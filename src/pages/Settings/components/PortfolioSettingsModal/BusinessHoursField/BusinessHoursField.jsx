import styles from './BusinessHoursField.module.css'
import { Dropdown } from '../../../../../components/Dropdown/Dropdown'
import { WEEKDAYS, TIME_OPTIONS } from '../datas'

export function BusinessHoursField({ value, onChange }) {
  const startDay = value?.startDay || null
  const endDay = value?.endDay || null
  const openMinutes = typeof value?.openMinutes === 'number' ? value.openMinutes : null
  const closeMinutes = typeof value?.closeMinutes === 'number' ? value.closeMinutes : null

  function update(patch) {
    onChange({ startDay, endDay, openMinutes, closeMinutes, ...patch })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <Dropdown options={WEEKDAYS} value={startDay} onChange={val => update({ startDay: val })} placeholder="Start day" />
        <Dropdown options={WEEKDAYS} value={endDay} onChange={val => update({ endDay: val })} placeholder="End day" />
      </div>
      <div className={styles.row}>
        <Dropdown options={TIME_OPTIONS} value={openMinutes} onChange={val => update({ openMinutes: val })} placeholder="Opens" />
        <Dropdown options={TIME_OPTIONS} value={closeMinutes} onChange={val => update({ closeMinutes: val })} placeholder="Closes" />
      </div>
    </div>
  )
}