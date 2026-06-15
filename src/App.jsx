import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import DriverLogin from './pages/DriverLogin'
import DriverDashboard from './pages/DriverDashboard'
import TrackingPage from './pages/TrackingPage'

function ProtectedRoute({ children }) {
  const { adminAuth } = useApp()
  return adminAuth ? children : <Navigate to="/admin/login" replace />
}

function DriverProtectedRoute({ children }) {
  const { driverSession } = useApp()
  return driverSession ? children : <Navigate to="/chofer/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/chofer/login" element={<DriverLogin />} />
      <Route path="/chofer" element={
        <DriverProtectedRoute>
          <DriverDashboard />
        </DriverProtectedRoute>
      } />
      <Route path="/seguimiento/:id" element={<TrackingPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
