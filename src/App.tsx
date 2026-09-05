import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import './styles/App.css'

import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Availability from './pages/Availability'
import Booking from './pages/Booking'
import DoctorDashboard from './pages/DoctorDashboard'
import Login from './pages/Login'
import MyAppointments from './pages/MyAppointments'
import Clients from './pages/Clients'
import ClientDetails from './pages/ClientDetails'
import Register from './pages/Register'

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route
              path="/"
              element={<Home />}
          />

          <Route
              path="/login"
              element={<Login />}
          />

          <Route
              path="/register"
              element={<Register />}
          />

          <Route
              path="/booking"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <Booking />
                </ProtectedRoute>
              }
          />

          <Route
              path="/my-appointments"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <MyAppointments />
                </ProtectedRoute>
              }
          />

          <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
          />

          <Route
              path="/doctor/clients"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <Clients />
                </ProtectedRoute>
              }
          />

          <Route
              path="/doctor/clients/:id"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <ClientDetails />
                </ProtectedRoute>
              }
          />

          <Route
              path="/doctor/availability"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <Availability />
                </ProtectedRoute>
              }
          />
        </Routes>
      </BrowserRouter>
  )
}

export default App