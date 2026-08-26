import { useState } from 'react'

const services = [
  'Πρώτη Αξιολογητική Συνεδρία',
  'Ατομική Συνεδρία',
  'Online Συνεδρία',
]

export default function Booking() {
  const [selectedService, setSelectedService] = useState('')

  return (
    <section className="booking-page">
      <h1>Κλείσιμο Ραντεβού</h1>

      <h2>1. Επιλέξτε υπηρεσία</h2>

      <div className="booking-options">
        {services.map((service) => (
          <button
            key={service}
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
    </section>
  )
}