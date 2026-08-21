import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import FirstRunFlow, { useFirstRunStatus } from '../FirstRunFlow/FirstRunFlow'
import styles from './RequireAuth.module.css'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location          = useLocation()
  const firstRun          = useFirstRunStatus()
  const debugOn           = new URLSearchParams(window.location.search).get('debug') === '1'

  const debugBanner = debugOn ? (
    <pre
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: '#000000',
        color: '#00ff00',
        fontSize: 10,
        padding: 8,
        margin: 0,
        whiteSpace: 'pre-wrap',
      }}
    >
      {JSON.stringify(
        {
          authLoading: loading,
          hasUser: !!user,
          uid: user?.uid ?? null,
          firstRunChecking: firstRun.checking,
          firstRunShouldShow: firstRun.shouldShow,
          firstRunError: firstRun.debugError,
        },
        null,
        2
      )}
    </pre>
  ) : null

  if (loading || (user && firstRun.checking)) {
    return (
      <>
        {debugBanner}
        <div className={styles.loader}>
          <span className={`mi-outlined ${styles.spinner}`}>autorenew</span>
        </div>
      </>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (firstRun.shouldShow) {
    return (
      <>
        {debugBanner}
        <FirstRunFlow onComplete={firstRun.markCompleted} />
      </>
    )
  }

  return (
    <>
      {debugBanner}
      {children}
    </>
  )
}
