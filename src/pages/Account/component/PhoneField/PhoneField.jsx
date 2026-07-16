import { getPhoneHint } from "../../utils"
import { Field } from "../Field/Field"
import { Dropdown } from "../../../../components/Dropdown/Dropdown"
import { COUNTRIES } from "../../../../datas/dialCodes"
import styles from "./PhoneField.module.css"


function FlagIcon({ cca2 }) {
  if (!cca2) return <span className={styles.flagFallback}>🏳</span>
  return (
    <img
      src={`https://flagcdn.com/24x18/${cca2.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/48x36/${cca2.toLowerCase()}.png 2x`}
      alt=""
      width={24}
      height={18}
      className={styles.flagImg}
      loading="lazy"
    />
  )
}


export function PhoneField({ label, hint, localValue, onLocalChange, country, onCountryChange }) {

  const phoneHint = getPhoneHint(localValue)
  return (
    <Field label={label} hint={hint}>
      <div className={styles.phoneRow}>
        <Dropdown
          options={COUNTRIES}
          value={country}
          onChange={(_, c) => onCountryChange(c)}
          searchable
          searchPlaceholder="Search country or code…"
          className={styles.countryDropdown}
          getOptionLabel={c => c.name}
          getOptionValue={c => c}
          isOptionSelected={c => c.cca2 === country.cca2 && c.dial_code === country.dial_code}
          filterOption={(c, query) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.dial_code.includes(query)
          }
          renderTrigger={() => (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className={styles.ccFlag}>
                <FlagIcon cca2={country.cca2} />
              </span>
              <span className={styles.ccCode}>{country.dial_code}</span>
            </span>
          )}
          renderOption={c => (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <span className={styles.ccFlag}>
                <FlagIcon cca2={c.cca2} />
              </span>
              <span className={styles.ccOptionName}>{c.name}</span>
              <span className={styles.ccOptionCode}>{c.dial_code}</span>
            </span>
          )}
        />
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