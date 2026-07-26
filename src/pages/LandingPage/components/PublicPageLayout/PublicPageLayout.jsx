import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import SiteNav from '../../components/SiteNav/SiteNav'
import SiteFooter from '../../components/SiteFooter/SiteFooter'
import styles from './PublicPageLayout.module.css'

export default function PublicPageLayout({ title, subtitle, children }) {
  const [theme, toggleTheme] = useTheme()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className={styles.page} data-theme={theme}>
      <SiteNav theme={theme} onToggleTheme={toggleTheme} />
      <main className={styles.mainContent}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.content}>{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}
