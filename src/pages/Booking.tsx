import { constructor, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

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

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  return (
    <section className="booking-page">
      <h1>Κλείσιμο Ραντεβού</h1>

      {/* Step 1 */}
      <div className='booking-step'>
      <h2>1. Επιλέξτε υπηρεσία</h2>

      <div className="booking-options">
        {services.map((service) => (
          <button
            key={service}
            type="button"
            onClick={() => setSelectedService(service)}
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

      {selectedService && (
        <p>
          Επιλέξατε: <strong>{selectedService}</strong>
        </p>
      )}
      </div>

      {/* Step 2 */}

{selectedService && (
        <div className="booking-step">
          <h2>2. Επιλέξτε ημερομηνία και ώρα</h2>

          <DatePicker
            selected={selectedDateTime}
            onChange={(date: Date | null) => setSelectedDateTime(date)}
            minDate={new Date()}
            showTimeSelect
            timeIntervals={30}
            timeFormat="HH:mm"
            dateFormat="dd/MM/yyyy HH:mm"
            placeholderText="Επιλέξτε ημερομηνία και ώρα"
          />

          {selectedDateTime && (
            <p>
              Επιλέξατε:{' '}
              <strong>
                {selectedDateTime.toLocaleString('el-GR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </strong>
            </p>
          )}
        </div>
      )}

      {/* Step 3*/}

      {selectedService && selectedDateTime && (
        <div className="booking-step">
          <h2>3. Σύνδεση ή Εγγραφή</h2>

          <div className='authtoogle'>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={
                authMode === 'login'
                ? 'auth-btn selected'
                : 'auth-btn'
              }
              >
                Σύνδεση
              </button>

              <button
              type='button'
              onClick={() => setAuthMode('register')}
              className={
                authMode === 'register'
                ? 'auth-btn selected'
                : 'auth-btn'
              }
              >
                Εγγραφή
              </button>
          </div>

          <div className='auth-form'>
            {authMode === 'register' && (
              <input  
                type='text'
                placeholder='Ονοματεπώνυμο'
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            
            )}

            <input
              type='email'
              placeholder='"Email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              />

              <input
              type='password'
              placeholder='Κωδικός'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              />
              
              <button type="button" className="auth-submit">
              {authMode === 'login'
                ? 'Σύνδεση'
                : 'Δημιουργία Λογαριασμού'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}