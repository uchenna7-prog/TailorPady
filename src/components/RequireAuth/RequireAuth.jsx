import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import FirstRunFlow, { useFirstRunStatus } from '../FirstRunFlow/FirstRunFlow'
import logoLightMode from '../../assets/logoLightMode.png'
import logoDarkMode from '../../assets/logoDarkMode.png'
import styles from './RequireAuth.module.css'

function getTheme() {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location          = useLocation()
  const firstRun          = useFirstRunStatus()

  if (loading || (user && firstRun.checking)) {
    const theme = getTheme()
    const logoSrc = theme === 'dark' ? logoLightMode : logoDarkMode
    return (
      <div className={styles.loader}>
        <img
          src={logoSrc}
          alt="TailorPady"
          className={styles.splashLogo}
          style={{ background: theme === 'dark' ? '#ffffff' : '#000000' }}
        />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (firstRun.shouldShow) {
    return <FirstRunFlow onComplete={firstRun.markCompleted} />
  }

  return children
}
