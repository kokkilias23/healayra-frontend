import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/App.css'

import Home from './pages/Home'
import Availability from './pages/Availability'
import Booking from './pages/Booking'
import DoctorDashboard from './pages/DoctorDashboard'
import Login from './pages/Login'
import MyAppointments from './pages/MyAppointments'
import Clients from './pages/TherapyClient'
import ClientsDetails from './pages/ClientDetails'
import Register from './pages/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-appointments" element={<MyAppointments />} />

        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<Clients />} />
        <Route path="/doctor/clients/:id" element={<ClientsDetails />} />
        <Route path="/doctor/availability" element={<Availability />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App