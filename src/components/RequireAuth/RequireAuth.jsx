import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import FirstRunFlow, { useFirstRunStatus } from '../FirstRunFlow/FirstRunFlow'
import styles from './RequireAuth.module.css'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location          = useLocation()
  const firstRun          = useFirstRunStatus()

  if (loading || (user && firstRun.checking)) {
    return (
      <div className={styles.loader}>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} />
        </div>
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
