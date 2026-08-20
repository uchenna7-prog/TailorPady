import { useState } from 'react'
import Header from '../../components/Header/Header'
import styles from './FAQ.module.css'
import BottomNav from '../../components/BottomNav/BottomNav'
import { APP_FAQ } from '../../datas/faqDatas'

function AccordionItem({ q, a, isOpen, onToggle, divider = true }) {
  return (
    <div className={`${styles.item} ${!divider ? styles.noDivider : ''}`}>
      <button className={styles.itemHeader} onClick={onToggle}>
        <span className={styles.itemQ}>{q}</span>
        <span className={`mi ${styles.itemChevron} ${isOpen ? styles.itemChevronOpen : ''}`}>
          expand_more
        </span>
      </button>
      {isOpen && (
        <div className={styles.itemBody}>
          <p className={styles.itemA}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ({ onMenuClick }) {
  const [openKey, setOpenKey] = useState(null)
  const [search, setSearch] = useState('')

  const toggle = key => setOpenKey(prev => prev === key ? null : key)
  const query = search.trim().toLowerCase()

  const filtered = APP_FAQ.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.q.toLowerCase().includes(query) ||
        item.a.toLowerCase().includes(query)
    ),
  })).filter(cat => cat.items.length > 0)

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="FAQs" showNotifications={false} />

      <div className={styles.scrollArea}>
        <p className={styles.pageSub}>Frequently asked questions about TailorPady.</p>

        <div className={styles.searchPadding}>
          <div className={styles.searchWrap}>
            <span className={`mi ${styles.searchIcon}`}>search</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search questions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>
                <span className="mi-outlined" style={{ fontSize: '1rem' }}>close</span>
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className="mi-outlined" style={{ fontSize: '2.5rem', color: 'var(--text3)' }}>search_off</span>
            <p className={styles.emptyText}>No results for "{search}"</p>
          </div>
        ) : (
          filtered.map((cat, ci) => (
            <div key={cat.category}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIconWrap}>
                  <span className="mi-outlined" style={{ fontSize: '1rem' }}>{cat.icon}</span>
                </div>
                <span className={styles.sectionLabel}>{cat.category}</span>
              </div>

              {cat.items.map((item, ii) => {
                const key = `${ci}-${ii}`
                return (
                  <AccordionItem
                    key={key}
                    q={item.q}
                    a={item.a}
                    isOpen={openKey === key}
                    onToggle={() => toggle(key)}
                    divider={ii < cat.items.length - 1}
                  />
                )
              })}
            </div>
          ))
        )}

        {!query && (
          <div className={styles.footerPadding}>
            <div className={styles.footerCta}>
              <span className="mi-outlined" style={{ fontSize: '1.4rem', color: 'var(--accent)' }}>support_agent</span>
              <div className={styles.footerCtaText}>
                <div className={styles.footerCtaTitle}>Still have questions?</div>
                <div className={styles.footerCtaSub}>Reach out via the Contact page — we're happy to help.</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>
      <BottomNav></BottomNav>
    </div>
  )
}