import { useState } from 'react'
import PublicPageLayout from '../LandingPage/components/PublicPageLayout/PublicPageLayout'
import { MARKETING_FAQ } from '../../datas/faqDatas'
import styles from './PublicFAQ.module.css'

export default function PublicFAQ() {
  const [openKey, setOpenKey] = useState(null)
  const toggle = key => setOpenKey(prev => (prev === key ? null : key))

  return (
    <PublicPageLayout
      title="Frequently asked questions"
      subtitle="Answers to the questions people ask before signing up."
      navProps={{ showThemeToggle: false, showInstall: false }}
    >
      {MARKETING_FAQ.map((cat, ci) => (
        <div key={cat.category} className={styles.categoryBlock}>
          <div className={styles.categoryHeader}>
            <span className="mi" style={{ fontSize: '1.1rem', textTransform: "lowercase" }}>{cat.icon}</span>
            {cat.category}
          </div>
          {cat.items.map((item, ii) => {
            const key = `${ci}-${ii}`
            const isOpen = openKey === key
            return (
              <div key={key} className={styles.item}>
                <button className={styles.itemHeader} onClick={() => toggle(key)}>
                  <span className={styles.itemQ}>{item.q}</span>
                  <span className={`mi ${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                    expand_more
                  </span>
                </button>
                {isOpen && <p className={styles.itemA}>{item.a}</p>}
              </div>
            )
          })}
        </div>
      ))}
    </PublicPageLayout>
  )
}