import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebasePublic'
import { InstallProvider } from './contexts/InstallContext'
import Portfolio from './pages/Portfolio/Portfolio'
import ReviewPage from './pages/ReviewPage/ReviewPage'
import LandingPage from './pages/LandingPage/LandingPage'
import './index.css'

function isStandalonePWA() {
  const isDisplayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches
  const isIOSStandalone = window.navigator?.standalone === true
  return Boolean(isDisplayModeStandalone || isIOSStandalone)
}

function LandingGate() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    if (isStandalonePWA()) {
      window.location.replace('/login')
      return
    }
    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        window.location.replace('/dashboard')
      } else {
        setStatus('show')
      }
    })
    return unsub
  }, [])

  if (status === 'checking') return null
  return <LandingPage />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <InstallProvider>
        <Routes>
          <Route path="/" element={<LandingGate />} />
          <Route path="/portfolio/:handle" element={<Portfolio />} />
          <Route path="/review/:uid/:token" element={<ReviewPage />} />
        </Routes>
      </InstallProvider>
    </BrowserRouter>
  </React.StrictMode>
)