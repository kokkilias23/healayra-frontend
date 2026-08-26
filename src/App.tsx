import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Home from './pages/Home'
import Availability from './pages/Availability'
import Booking from './pages/Booking'
import DoctorDashboard from './pages/DoctorDashboard'
import Login from './pages/Login'
import MyAppointments from './pages/MyAppointments'
import Patients from './pages/Patients'
import PatientsDetails from './pages/PatientDetails'
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
        <Route path="/doctor/patients" element={<Patients />} />
        <Route path="/doctor/patients/:id" element={<PatientsDetails />} />
        <Route path="/doctor/availability" element={<Availability />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App