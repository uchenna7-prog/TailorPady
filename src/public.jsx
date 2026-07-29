import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebasePublic'
import { InstallProvider } from './contexts/InstallContext'
import Portfolio from './pages/Portfolio/Portfolio'
import ReviewPage from './pages/ReviewPage/ReviewPage'
import LandingPage from './pages/LandingPage/LandingPage'
import PublicFAQ from './pages/PublicFAQ/PublicFAQ'
import PublicContact from './pages/PublicContact/PublicContact'
import PublicPrivacy from './pages/PublicPrivacy/PublicPrivacy'
import PublicTerms from './pages/PublicTerms/PublicTerms'
import PublicRefund from './pages/PublicRefund/PublicRefund'
import PublicFounder from './pages/PublicFounder/PublicFounder'
import './index.css'

function LandingGate() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
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
          <Route path="/faq" element={<PublicFAQ />} />
          <Route path="/contact" element={<PublicContact />} />
          <Route path="/privacy" element={<PublicPrivacy />} />
          <Route path="/terms" element={<PublicTerms />} />
          <Route path="/refund" element={<PublicRefund />} />
          <Route path="/founder" element={<PublicFounder />} />
        </Routes>
      </InstallProvider>
    </BrowserRouter>
  </React.StrictMode>
)