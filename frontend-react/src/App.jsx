import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminManagement from './pages/AdminManagement'
import LicenseManagement from './pages/LicenseManagement'
import DeviceManagement from './pages/DeviceManagement'
import RegisterRedirect from './pages/RegisterRedirect'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './layouts/Layout'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterRedirect />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admins" element={<AdminManagement />} />
          <Route path="/licenses" element={<LicenseManagement />} />
          <Route path="/devices" element={<DeviceManagement />} />
          {/* Add more protected routes here */}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
