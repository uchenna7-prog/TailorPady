import { useRef, useEffect } from "react"
import styles from "./TextInput.module.css"

export function TextInput({ value, onChange, placeholder, maxLength = 100 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function handleKeyDown(e) {
    if (e.key === 'Enter') e.preventDefault()
  }

  return (
    <textarea
      ref={ref}
      className={styles.textInput}
      value={value}
      maxLength={maxLength}
      onChange={e => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      rows={1}
    />
  )
}
