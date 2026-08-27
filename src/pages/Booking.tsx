import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import "../styles/Booking.css";

const services = [
  'Πρώτη Αξιολογητική Συνεδρία',
  'Ατομική Συνεδρία',
  'Online Συνεδρία',
]

type AuthMode = 'login' | 'register'

export default function Booking() {
  const [selectedService, setSelectedService] = useState('')
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)

  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [authCompleted, setAuthCompleted] = useState(false)

  const handleAuthContinue = () => {
    if (!email || !password) {
      return
    }

    if (authMode === 'register' && !fullName) {
      return
    }

    setAuthCompleted(true)
  }

  return (
    <section className="booking-page">
      <h1>Κλείσιμο Ραντεβού</h1>

      {/* STEP 1 */}
      <div className="booking-step">
        <h2>1. Επιλέξτε υπηρεσία</h2>

        <div className="booking-options">
          {services.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => {
                setSelectedService(service)
                setSelectedDateTime(null)
                setAuthCompleted(false)
              }}
              className={
                selectedService === service
                  ? 'booking-option selected'
                  : 'booking-option'
              }
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2 */}
      {selectedService && (
        <div className="booking-step">
          <h2>2. Επιλέξτε ημερομηνία και ώρα</h2>

          <DatePicker
            selected={selectedDateTime}
            onChange={(date: Date | null) => {
              setSelectedDateTime(date)
              setAuthCompleted(false)
            }}
            minDate={new Date()}
            showTimeSelect
            timeIntervals={30}
            timeFormat="HH:mm"
            dateFormat="dd/MM/yyyy HH:mm"
            placeholderText="Επιλέξτε ημερομηνία και ώρα"
          />
        </div>
      )}

      {/* STEP 3 */}
      {selectedService && selectedDateTime && (
        <div className="booking-step">
          <h2>3. Σύνδεση ή Εγγραφή</h2>

          <div className="auth-toggle">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login')
                setAuthCompleted(false)
              }}
              className={
                authMode === 'login'
                  ? 'auth-btn selected'
                  : 'auth-btn'
              }
            >
              Σύνδεση
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register')
                setAuthCompleted(false)
              }}
              className={
                authMode === 'register'
                  ? 'auth-btn selected'
                  : 'auth-btn'
              }
            >
              Εγγραφή
            </button>
          </div>

          <div className="auth-form">
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Ονοματεπώνυμο"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              type="password"
              placeholder="Κωδικός"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button
              type="button"
              className="auth-submit"
              onClick={handleAuthContinue}
            >
              Συνέχεια
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {authCompleted && selectedDateTime && (
        <div className="booking-step confirmation">
          <h2>4. Επιβεβαίωση Ραντεβού</h2>

          <div className="confirmation-details">
            <p>
              <strong>Υπηρεσία:</strong> {selectedService}
            </p>

            <p>
              <strong>Ημερομηνία:</strong>{' '}
              {selectedDateTime.toLocaleDateString('el-GR')}
            </p>

            <p>
              <strong>Ώρα:</strong>{' '}
              {selectedDateTime.toLocaleTimeString('el-GR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>

            <p>
              <strong>Email:</strong> {email}
            </p>

            {authMode === 'register' && (
              <p>
                <strong>Ονοματεπώνυμο:</strong> {fullName}
              </p>
            )}
          </div>

          <button
            type="button"
            className="confirm-booking-btn"
          >
            Επιβεβαίωση Ραντεβού
          </button>
        </div>
      )}
    </section>
  )
}