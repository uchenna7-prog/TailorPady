import styles from './Textarea.module.css'

export function Textarea({ value, onChange, placeholder, rows = 3, maxLength = 500, error = false }) {
  return (
    <textarea
      className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
      value={value}
      maxLength={maxLength}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  )
}
