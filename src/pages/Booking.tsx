import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import DatePicker from 'react-datepicker'

import {
  getDoctors,
} from '../services/DoctorService'

import {
  createAppointment,
} from '../services/AppointmentService'

import type {
  Doctor,
} from '../types/Doctor'

import 'react-datepicker/dist/react-datepicker.css'
import '../styles/Booking.css'

const services = [
  'Πρώτη Αξιολογητική Συνεδρία',
  'Ατομική Συνεδρία',
  'Online Συνεδρία',
]

export default function Booking() {
  const navigate =
      useNavigate()

  const [doctor, setDoctor] =
      useState<Doctor | null>(null)

  const [
    selectedService,
    setSelectedService,
  ] = useState('')

  const [
    selectedDateTime,
    setSelectedDateTime,
  ] = useState<Date | null>(null)

  const [loading, setLoading] =
      useState(true)

  const [saving, setSaving] =
      useState(false)

  const [error, setError] =
      useState('')

  const [success, setSuccess] =
      useState(false)

  useEffect(() => {
    loadDoctor()
  }, [])

  async function loadDoctor() {
    setLoading(true)
    setError('')

    try {
      const doctors =
          await getDoctors()

      if (doctors.length === 0) {
        setError(
            'Δεν υπάρχει διαθέσιμος γιατρός.',
        )

        return
      }

      setDoctor(
          doctors[0],
      )
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η φόρτωση του γιατρού.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  function formatLocalDateTime(
      date: Date,
  ): string {
    const year =
        date.getFullYear()

    const month =
        String(
            date.getMonth() + 1,
        ).padStart(2, '0')

    const day =
        String(
            date.getDate(),
        ).padStart(2, '0')

    const hours =
        String(
            date.getHours(),
        ).padStart(2, '0')

    const minutes =
        String(
            date.getMinutes(),
        ).padStart(2, '0')

    return (
        `${year}-${month}-${day}` +
        `T${hours}:${minutes}:00`
    )
  }

  async function handleBooking() {
    if (
        !doctor ||
        !selectedDateTime
    ) {
      return
    }

    setSaving(true)
    setError('')

    try {
      await createAppointment({
        doctorId: doctor.id,
        appointmentTime:
            formatLocalDateTime(
                selectedDateTime,
            ),
      })

      setSuccess(true)

      setTimeout(() => {
        navigate(
            '/my-appointments',
        )
      }, 1200)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η δημιουργία του ραντεβού.',
        )
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
        <section className="booking-page">
          <p>
            Φόρτωση...
          </p>
        </section>
    )
  }

  return (
      <section className="booking-page">
        <h1>
          Κλείσιμο Ραντεβού
        </h1>

        {doctor && (
            <div className="booking-step">
              <h2>
                Γιατρός
              </h2>

              <p>
                {doctor.firstName}{' '}
                {doctor.lastName}
              </p>

              <p>
                {doctor.specialty}
              </p>
            </div>
        )}

        <div className="booking-step">
          <h2>
            1. Επιλέξτε υπηρεσία
          </h2>

          <div className="booking-options">
            {services.map(
                (service) => (
                    <button
                        key={service}
                        type="button"
                        onClick={() => {
                          setSelectedService(
                              service,
                          )

                          setSelectedDateTime(
                              null,
                          )

                          setSuccess(false)
                        }}
                        className={
                          selectedService ===
                          service
                              ? 'booking-option selected'
                              : 'booking-option'
                        }
                    >
                      {service}
                    </button>
                ),
            )}
          </div>
        </div>

        {selectedService && (
            <div className="booking-step">
              <h2>
                2. Επιλέξτε ημερομηνία και ώρα
              </h2>

              <DatePicker
                  selected={
                    selectedDateTime
                  }
                  onChange={(
                      date: Date | null,
                  ) => {
                    setSelectedDateTime(
                        date,
                    )

                    setSuccess(false)
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

        {selectedService &&
            selectedDateTime && (
                <div className="booking-step confirmation">
                  <h2>
                    3. Επιβεβαίωση Ραντεβού
                  </h2>

                  <div className="confirmation-details">
                    <p>
                      <strong>
                        Υπηρεσία:
                      </strong>{' '}
                      {selectedService}
                    </p>

                    <p>
                      <strong>
                        Ημερομηνία:
                      </strong>{' '}
                      {selectedDateTime
                          .toLocaleDateString(
                              'el-GR',
                          )}
                    </p>

                    <p>
                      <strong>
                        Ώρα:
                      </strong>{' '}
                      {selectedDateTime
                          .toLocaleTimeString(
                              'el-GR',
                              {
                                hour:
                                    '2-digit',
                                minute:
                                    '2-digit',
                              },
                          )}
                    </p>
                  </div>

                  <button
                      type="button"
                      className="confirm-booking-btn"
                      onClick={
                        handleBooking
                      }
                      disabled={
                          saving ||
                          success
                      }
                  >
                    {saving
                        ? 'Αποθήκευση...'
                        : success
                            ? 'Το ραντεβού καταχωρήθηκε!'
                            : 'Επιβεβαίωση Ραντεβού'}
                  </button>
                </div>
            )}

        {error && (
            <p role="alert">
              {error}
            </p>
        )}
      </section>
  )
}