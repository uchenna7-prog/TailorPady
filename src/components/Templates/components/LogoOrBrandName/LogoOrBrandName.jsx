import styles from "./LogoOrBrandName.module.css"


export function LogoOrName({ invoiceBrandSettings, receiptBrandSettings, darkBg = false }) {
  const settings = invoiceBrandSettings || receiptBrandSettings
  if (!settings) return null

  const logo = settings.logo
  const name = settings.name || settings.ownerName

  if (logo) {
    return (
      <img
        src={logo}
        alt={name || "Brand logo"}
        className={styles.logoImg}
        style={{
          borderColor: darkBg ? "var(--brand-on-primary)" : "var(--brand-primary-dark)",
        }}
      />
    )
  }

  if (name) {
    return (
      <div
        className={styles.logoPlaceholder}
        style={{
          color:       darkBg ? "var(--brand-on-primary)" : "var(--brand-primary)",
          borderColor: darkBg ? "var(--brand-on-primary)" : "var(--brand-primary)",
        }}
      >
        LOGO
      </div>
    )
  }

  return null
}