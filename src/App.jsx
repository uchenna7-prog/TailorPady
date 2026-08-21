import { useState, Component } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { usePremium } from './contexts/PremiumContext'
import { TourProvider } from './contexts/TourContext'
import { PremiumSuccessProvider } from './contexts/PremiumSuccessContext'
import OnboardingTour from './components/OnboardingTour/OnboardingTour'
import ReferralCelebrationFlow from './components/ReferralCelebrationFlow/ReferralCelebrationFlow'
import RequireAuth from './components/RequireAuth/RequireAuth'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import SideBar from './components/SideBar/SideBar'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Dashboard from './pages/Dashboard/Dashboard'
import Customers from './pages/Customers/Customers'
import CustomerDetail from './pages/CustomerDetail/CustomerDetail'
import CustomerBodyMeasurements from './pages/CustomerBodyMeasurements/CustomerBodyMeasurements'
import Tasks from './pages/Tasks/Tasks'
import Orders from './pages/Orders/Orders'
import Invoices from './pages/Invoices/Invoices'
import Receipts from './pages/Receipts/Receipts'
import Payments from './pages/Payments/Payments'
import Inventory from './pages/Inventory/Inventory'
import Reports from './pages/Reports/Reports'
import Gallery from './pages/Gallery/Gallery'
import Settings from './pages/Settings/Settings'
import Account from './pages/Account/Account'
import Contact from './pages/Contact/Contact'
import FAQ from './pages/FAQ/FAQ'
import Appointments from './pages/Appointments/Appointments'
import Reviews from './pages/Reviews/Reviews'
import Agent from './pages/Agent/Agent'
import AgentChat from './pages/AgentChat/AgentChat'
import TermsAndConditions from './pages/TermsAndConditions/TermsAndConditions'
import RefundPolicy from './pages/RefundPolicy/RefundPolicy'
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy'
import BugReport from './pages/BugReport/BugReport'
import './index.css'

class CrashPopup extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 20,
            maxWidth: 420,
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10, color: '#d00000' }}>
            Something broke
          </div>
          <div style={{ marginBottom: 10, whiteSpace: 'pre-wrap', color: '#111111' }}>
            {this.state.error.message}
          </div>
          <div style={{ opacity: 0.6, whiteSpace: 'pre-wrap', color: '#111111' }}>
            {this.state.error.stack}
          </div>
        </div>
      </div>
    )
  }
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function RootRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { isPremium } = usePremium()

  const menuClick = () => setSidebarOpen(true)

  return (
    <TourProvider>
      <PremiumSuccessProvider>
        <div className="appShell">
          <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="appContent">
            <ScrollToTop />
            <Routes>
              <Route path="/dashboard" element={<Dashboard onMenuClick={menuClick} sidebarOpen={sidebarOpen} />} />
              <Route path="/appointments" element={<Appointments onMenuClick={menuClick} />} />
              <Route path="/customers" element={<Customers onMenuClick={menuClick} />} />
              <Route path="/customers/:id" element={<CustomerDetail onMenuClick={menuClick} sidebarOpen={sidebarOpen} />} />
              <Route path="/customers/:id/body-measurements" element={<CustomerBodyMeasurements onMenuClick={menuClick} />} />
              <Route path="/tasks" element={<Tasks onMenuClick={menuClick} />} />
              <Route path="/orders" element={<Orders onMenuClick={menuClick} onGoToCustomer={id => navigate(`/customers/${id}`)} />} />
              <Route path="/invoices" element={<Invoices onMenuClick={menuClick} />} />
              <Route path="/receipts" element={<Receipts onMenuClick={menuClick} />} />
              <Route path="/payments" element={<Payments onMenuClick={menuClick} />} />
              <Route path="/inventory" element={<Inventory onMenuClick={menuClick} />} />
              <Route path="/reports" element={<Reports onMenuClick={menuClick} />} />
              <Route path="/gallery" element={<Gallery onMenuClick={menuClick} />} />
              <Route path="/settings" element={<Settings onMenuClick={menuClick} />} />
              <Route path="/account" element={<Account onMenuClick={menuClick} isPremium={isPremium} />} />
              <Route path="/app/contact" element={<Contact onMenuClick={menuClick} />} />
              <Route path="/app/faq" element={<FAQ onMenuClick={menuClick} />} />
              <Route path="/reviews" element={<Reviews onMenuClick={menuClick} />} />
              <Route path="/agent" element={<Agent />} />
              <Route path="/agent/chat" element={<AgentChat />} />
              <Route path="/app/terms" element={<TermsAndConditions onMenuClick={menuClick} />} />
              <Route path="/app/refund" element={<RefundPolicy onMenuClick={menuClick} />} />
              <Route path="/app/privacy" element={<PrivacyPolicy onMenuClick={menuClick} />} />
              <Route path="/report-bug" element={<BugReport onMenuClick={menuClick} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
          <OnboardingTour />
          <ReferralCelebrationFlow />
        </div>
      </PremiumSuccessProvider>
    </TourProvider>
  )
}

export default function App() {
  return (
    <CrashPopup>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/app" element={<RootRoute />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        />
      </Routes>
    </CrashPopup>
  )
}
