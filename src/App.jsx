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
import './index.css'

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user)    return <Navigate to="/" replace />
  return children
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="appShell">
      <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="appContent">
        <ScrollToTop />
        <Routes>
          <Route path="/"                                element={<Home                    onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/appointments"                    element={<Appointments            onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/customers"                       element={<Customers               onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/customers/:id"                   element={<CustomerDetail          onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/customers/:id/body-measurements" element={<CustomerBodyMeasurements onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/tasks"                           element={<Tasks                   onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/orders"                          element={<Orders                  onMenuClick={() => setSidebarOpen(true)} onGoToCustomer={id => navigate(`/customers/${id}`)} />} />
          <Route path="/invoices"                        element={<Invoices                onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/receipts"                        element={<Receipts                onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/payments"                        element={<AllPayments             onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/inventory"                       element={<Inventory               onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/reports"                         element={<Reports                 onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/gallery"                         element={<Gallery                 onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/settings"                        element={<Settings                onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/profile"                         element={<Profile                 onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/contact"                         element={<Contact                 onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/faq"                             element={<FAQ                     onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/reviews"                         element={<Reviews                 onMenuClick={() => setSidebarOpen(true)} />} />
          <Route path="/agent"                           element={<Agent                   onMenuClick={() => setSidebarOpen(true)} />} />
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