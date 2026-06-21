import { useState } from 'react'
import BrandColourPicker from '../BrandColourPicker/BrandColourPicker'
import Header from '../Header/Header'
import styles from './BrandColourSheet.module.css'

export function BrandColourSheet({ currentColourId, onClose, onSelect }) {
  const [selected, setSelected] = useState(currentColourId)

  return (
    <div className={styles.container}>
      <Header
        type="back"
        title="Brand Colour"
        onBackClick={onClose}
        showBorderBottom={false}
        customActions={[{
          label:    'Save',
          onClick:  () => onSelect(selected),
          disabled: selected === currentColourId,
        }]}
      />
      <div className={styles.body}>
        <BrandColourPicker value={selected} onChange={setSelected} />
      </div>
    </div>
  )
}