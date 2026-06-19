import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import RequireAuth from './components/RequireAuth/RequireAuth'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import SideBar from './components/SideBar/SideBar'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Home from './pages/Home/Home'
import Customers from './pages/Customers/Customers'
import CustomerDetail from './pages/CustomerDetail/CustomerDetail'
import CustomerBodyMeasurements from './pages/CustomerBodyMeasurements/CustomerBodyMeasurements'
import Tasks from './pages/Tasks/Tasks'
import Orders from './pages/Orders/Orders'
import Invoices from './pages/Invoices/Invoices'
import Receipts from './pages/Receipts/Receipts'
import AllPayments from './pages/AllPayments/AllPayments'
import Inventory from './pages/Inventory/Inventory'
import Reports from './pages/Reports/Reports'
import Gallery from './pages/Gallery/Gallery'
import Settings from './pages/Settings/Settings'
import Profile from './pages/Profile/Profile'
import Contact from './pages/Contact/Contact'
import FAQ from './pages/FAQ/FAQ'
import Appointments from './pages/Appointments/Appointments'
import Reviews from './pages/Reviews/Reviews'
import Agent from './pages/Agent/Agent'
import AgentChat from './pages/AgentChat/AgentChat'
import TermsAndConditions from './pages/TermsAndConditions/TermsAndConditions'
import RefundPolicy from './pages/RefundPolicy/RefundPolicy'
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy'
import './index.css'

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const menuClick = () => setSidebarOpen(true)

  return (
    <div className="appShell">
      <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="appContent">
        <ScrollToTop />
        <Routes>
          <Route path="/"                                element={<Home                     onMenuClick={menuClick} />} />
          <Route path="/appointments"                    element={<Appointments             onMenuClick={menuClick} />} />
          <Route path="/customers"                       element={<Customers                onMenuClick={menuClick} />} />
          <Route path="/customers/:id"                   element={<CustomerDetail           onMenuClick={menuClick} />} />
          <Route path="/customers/:id/body-measurements" element={<CustomerBodyMeasurements onMenuClick={menuClick} />} />
          <Route path="/tasks"                           element={<Tasks                    onMenuClick={menuClick} />} />
          <Route path="/orders"                          element={<Orders                   onMenuClick={menuClick} onGoToCustomer={id => navigate(`/customers/${id}`)} />} />
          <Route path="/invoices"                        element={<Invoices                 onMenuClick={menuClick} />} />
          <Route path="/receipts"                        element={<Receipts                 onMenuClick={menuClick} />} />
          <Route path="/payments"                        element={<AllPayments              onMenuClick={menuClick} />} />
          <Route path="/inventory"                       element={<Inventory                onMenuClick={menuClick} />} />
          <Route path="/reports"                         element={<Reports                  onMenuClick={menuClick} />} />
          <Route path="/gallery"                         element={<Gallery                  onMenuClick={menuClick} />} />
          <Route path="/settings"                        element={<Settings                 onMenuClick={menuClick} />} />
          <Route path="/profile"                         element={<Profile                  onMenuClick={menuClick} />} />
          <Route path="/contact"                         element={<Contact                  onMenuClick={menuClick} />} />
          <Route path="/faq"                             element={<FAQ                      onMenuClick={menuClick} />} />
          <Route path="/reviews"                         element={<Reviews                  onMenuClick={menuClick} />} />
          <Route path="/agent"                           element={<Agent />} />
          <Route path="/agent/chat"                      element={<AgentChat />} />
          <Route path="/terms"                           element={<TermsAndConditions       onMenuClick={menuClick} />} />
          <Route path="/refund"                          element={<RefundPolicy             onMenuClick={menuClick} />} />
          <Route path="/privacy"                         element={<PrivacyPolicy            onMenuClick={menuClick} />} />
          <Route path="*"                                element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"  element={<GuestRoute><Login  /></GuestRoute>} />
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
  )
}