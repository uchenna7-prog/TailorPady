import { getPhoneHint } from "../../utils"
import { Field } from "../Field/Field"
import { CountryCodePicker } from "../../../../components/CountryCodePicker/CountryCodePicker"
import styles from "./PhoneField.module.css"


export function PhoneField({ label, hint, localValue, onLocalChange, country, onCountryChange }) {

  const phoneHint = getPhoneHint(localValue)
  return (
    <Field label={label} hint={hint}>
      <div className={styles.phoneRow}>
        <CountryCodePicker selected={country} onSelect={onCountryChange} />
        <input
          type="tel"
          inputMode="numeric"
          className={styles.textInput}
          style={{ flex: 1 }}
          placeholder="e.g. 09078117654"
          value={localValue}
          onChange={e => onLocalChange(e.target.value)}
          autoComplete="off"
        />
      </div>
      {phoneHint && (
        <p className={styles.phoneHint} style={{ color: phoneHint.ok ? 'var(--accent)' : '#ef4444' }}>
          {phoneHint.msg}
        </p>
      )}
    </Field>
  )
}
