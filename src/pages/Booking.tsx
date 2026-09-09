import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import DatePicker from 'react-datepicker'

import logo from '../assets/healayra-logo.png'

import {
  getDoctors,
} from '../services/DoctorService'

import {
  getAvailabilityByDoctor,
} from '../services/AvailabilityService'

import {
  createAppointment,
} from '../services/AppointmentService'

import {
  logout,
} from '../services/AuthService'

import type {
  Doctor,
} from '../types/Doctor'

import type {
  Availability,
  DayOfWeek,
} from '../types/Availability'

import 'react-datepicker/dist/react-datepicker.css'
import '../styles/Booking.css'

// Services currently available for appointment booking.
const services = [
  {
    name: 'Πρώτη Αξιολογητική Συνεδρία',
    description:
        'Μια πρώτη συνάντηση γνωριμίας και αξιολόγησης των αναγκών σας.',
    icon: '○',
  },
  {
    name: 'Ατομική Συνεδρία',
    description:
        'Προσωπική θεραπευτική συνεδρία σε ένα ασφαλές περιβάλλον.',
    icon: '◡',
  },
  {
    name: 'Online Συνεδρία',
    description:
        'Συνεδρία εξ αποστάσεως με άνεση και ευελιξία.',
    icon: '⌁',
  },
]

// Map JavaScript weekday numbers to backend DayOfWeek values.
const dayOfWeekMap:
    Record<number, DayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

export default function Booking() {
  const navigate =
      useNavigate()

  const [doctor, setDoctor] =
      useState<Doctor | null>(null)

  const [
    availability,
    setAvailability,
  ] = useState<Availability[]>([])

  const [
    selectedService,
    setSelectedService,
  ] = useState('')

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<Date | null>(null)

  const [
    selectedTime,
    setSelectedTime,
  ] = useState('')

  const [loading, setLoading] =
      useState(true)

  const [saving, setSaving] =
      useState(false)

  const [error, setError] =
      useState('')

  const [success, setSuccess] =
      useState(false)

  // Load the doctor and availability data when the booking page first opens.
  useEffect(() => {
    loadBookingData()
  }, [])

  // Load the doctor used for booking and their weekly availability.
  async function loadBookingData() {
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

      // MVP currently uses the first available doctor.
      const selectedDoctor =
          doctors[0]

      setDoctor(
          selectedDoctor,
      )

      const availabilityData =
          await getAvailabilityByDoctor(
              selectedDoctor.id,
          )

      setAvailability(
          availabilityData,
      )
    } catch (error) {
      if (error instanceof Error) {
        setError(
            error.message,
        )
      } else {
        setError(
            'Δεν ήταν δυνατή η φόρτωση της διαθεσιμότητας.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // Find the enabled availability record that matches the selected date.
  function getAvailabilityForDate(
      date: Date,
  ): Availability | undefined {
    const dayOfWeek =
        dayOfWeekMap[
            date.getDay()
            ]

    return availability.find(
        (item) =>
            item.dayOfWeek ===
            dayOfWeek &&
            item.enabled,
    )
  }

  // Used by the date picker to allow only days when the doctor is available.
  function isAvailableDate(
      date: Date,
  ): boolean {
    return Boolean(
        getAvailabilityForDate(
            date,
        ),
    )
  }

  // Convert an HH:mm time value into total minutes.
  function timeToMinutes(
      time: string,
  ): number {
    const [
      hours,
      minutes,
    ] = time
        .split(':')
        .map(Number)

    return (
        hours * 60 +
        minutes
    )
  }

  // Convert total minutes back into HH:mm format.
  function minutesToTime(
      totalMinutes: number,
  ): string {
    const hours =
        Math.floor(
            totalMinutes / 60,
        )

    const minutes =
        totalMinutes % 60

    return (
        `${String(hours).padStart(2, '0')}:` +
        `${String(minutes).padStart(2, '0')}`
    )
  }

  // Generate appointment slots using the doctor's working hours and session duration.
  function getTimeSlots():
      string[] {
    if (!selectedDate) {
      return []
    }

    const dayAvailability =
        getAvailabilityForDate(
            selectedDate,
        )

    if (!dayAvailability) {
      return []
    }

    const startMinutes =
        timeToMinutes(
            dayAvailability.startTime,
        )

    const endMinutes =
        timeToMinutes(
            dayAvailability.endTime,
        )

    const duration =
        dayAvailability.sessionDuration

    const slots: string[] = []

    for (
        let current =
            startMinutes;
        current + duration <=
        endMinutes;
        current += duration
    ) {
      const time =
          minutesToTime(
              current,
          )

      const slotDate =
          combineDateAndTime(
              selectedDate,
              time,
          )

      // Do not offer appointment slots that have already passed.
      if (
          slotDate.getTime() >
          Date.now()
      ) {
        slots.push(
            time,
        )
      }
    }

    return slots
  }

  // Combine the selected calendar date and selected time into one Date object.
  function combineDateAndTime(
      date: Date,
      time: string,
  ): Date {
    const [
      hours,
      minutes,
    ] = time
        .split(':')
        .map(Number)

    const result =
        new Date(date)

    result.setHours(
        hours,
        minutes,
        0,
        0,
    )

    return result
  }

  // Format the selected local date and time for the Spring Boot API.
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

  // Create the appointment and redirect to the user's appointment list.
  async function handleBooking() {
    if (
        !doctor ||
        !selectedDate ||
        !selectedTime
    ) {
      return
    }

    const appointmentDateTime =
        combineDateAndTime(
            selectedDate,
            selectedTime,
        )

    setSaving(true)
    setError('')

    try {
      // Send the selected doctor and appointment time to the backend.
      await createAppointment({
        doctorId:
        doctor.id,
        appointmentTime:
            formatLocalDateTime(
                appointmentDateTime,
            ),
      })

      setSuccess(true)

      // Keep the success state visible briefly before redirecting.
      setTimeout(() => {
        navigate(
            '/my-appointments',
        )
      }, 1200)
    } catch (error) {
      if (error instanceof Error) {
        setError(
            error.message,
        )
      } else {
        setError(
            'Δεν ήταν δυνατή η δημιουργία του ραντεβού.',
        )
      }
    } finally {
      setSaving(false)
    }
  }

  // Clear authentication data and return to the login page.
  function handleLogout() {
    logout()

    navigate('/login')
  }

  // Determine whether each booking step is active, completed or pending.
  function getStepClass(
      step: number,
  ): string {
    if (
        step === 1 &&
        selectedService
    ) {
      return 'completed'
    }

    if (
        step === 2 &&
        selectedDate
    ) {
      return 'completed'
    }

    if (
        step === 3 &&
        selectedTime
    ) {
      return 'completed'
    }

    if (
        step === 4 &&
        success
    ) {
      return 'completed'
    }

    if (
        step === 1 &&
        !selectedService
    ) {
      return 'active'
    }

    if (
        step === 2 &&
        selectedService &&
        !selectedDate
    ) {
      return 'active'
    }

    if (
        step === 3 &&
        selectedDate &&
        !selectedTime
    ) {
      return 'active'
    }

    if (
        step === 4 &&
        selectedTime
    ) {
      return 'active'
    }

    return ''
  }

  // Recalculate the visible time slots whenever the current state changes.
  const timeSlots =
      getTimeSlots()

  if (loading) {
    return (
        <main className="booking-loading">
          <img
              src={logo}
              alt="Healayra"
          />

          <p>
            Φόρτωση διαθέσιμων
            ραντεβού...
          </p>
        </main>
    )
  }

  return (
      <main className="booking-page">

        {/* Booking page navigation */}
        <header className="booking-topbar">
          <Link
              to="/"
              className="booking-brand"
          >
            <img
                src={logo}
                alt="Healayra"
            />

            <span>
              HEALAYRA
            </span>
          </Link>

          <nav className="booking-navigation">
            <Link to="/">
              Αρχική
            </Link>

            <Link
                to="/my-appointments"
            >
              Τα ραντεβού μου
            </Link>

            <button
                type="button"
                onClick={
                  handleLogout
                }
            >
              Αποσύνδεση
            </button>
          </nav>
        </header>

        {/* Booking page introduction */}
        <section className="booking-hero">
          <span className="booking-eyebrow">
            Appointment Booking
          </span>

          <h1>
            Κλείστε το επόμενο
            <span>
              {' '}
              ραντεβού σας.
            </span>
          </h1>

          <p>
            Επιλέξτε υπηρεσία,
            ημερομηνία και ώρα.
            Η διαδικασία διαρκεί
            μόνο λίγα λεπτά.
          </p>
        </section>

        {/* Visual progress through the four booking steps */}
        <div className="booking-progress">
          {[1, 2, 3, 4].map(
              (step) => (
                  <div
                      key={step}
                      className={`booking-progress-step ${getStepClass(
                          step,
                      )}`}
                  >
                    <div className="progress-number">
                      {getStepClass(
                          step,
                      ) ===
                      'completed'
                          ? '✓'
                          : step}
                    </div>

                    <span>
                      {step === 1 &&
                          'Υπηρεσία'}

                      {step === 2 &&
                          'Ημερομηνία'}

                      {step === 3 &&
                          'Ώρα'}

                      {step === 4 &&
                          'Επιβεβαίωση'}
                    </span>
                  </div>
              ),
          )}
        </div>

        {error && (
            <div
                className="booking-alert"
                role="alert"
            >
              <span>
                !
              </span>

              {error}
            </div>
        )}

        <div className="booking-layout">
          <section className="booking-main">

            {/* Step 1: Select the type of session */}
            <article className="booking-step">
              <div className="booking-step-header">
                <span className="booking-step-number">
                  01
                </span>

                <div>
                  <span className="booking-step-label">
                    Service
                  </span>

                  <h2>
                    Επιλέξτε υπηρεσία
                  </h2>

                  <p>
                    Ποιος τύπος
                    συνεδρίας σας
                    ενδιαφέρει;
                  </p>
                </div>
              </div>

              <div className="booking-services">
                {services.map(
                    (
                        service,
                    ) => (
                        <button
                            key={
                              service.name
                            }
                            type="button"
                            onClick={() => {
                              // Changing service resets the later booking steps.
                              setSelectedService(
                                  service.name,
                              )

                              setSelectedDate(
                                  null,
                              )

                              setSelectedTime(
                                  '',
                              )

                              setSuccess(
                                  false,
                              )
                            }}
                            className={`service-booking-card ${
                                selectedService ===
                                service.name
                                    ? 'selected'
                                    : ''
                            }`}
                        >
                          <span className="service-booking-icon">
                            {
                              service.icon
                            }
                          </span>

                          <span className="service-booking-content">
                            <strong>
                              {
                                service.name
                              }
                            </strong>

                            <small>
                              {
                                service.description
                              }
                            </small>
                          </span>

                          <span className="service-booking-check">
                            {selectedService ===
                            service.name
                                ? '✓'
                                : '○'}
                          </span>
                        </button>
                    ),
                )}
              </div>
            </article>

            {/* Step 2: Select only a date when the doctor is available */}
            {selectedService && (
                <article className="booking-step">
                  <div className="booking-step-header">
                    <span className="booking-step-number">
                      02
                    </span>

                    <div>
                      <span className="booking-step-label">
                        Date
                      </span>

                      <h2>
                        Επιλέξτε
                        ημερομηνία
                      </h2>

                      <p>
                        Εμφανίζονται μόνο
                        οι ημέρες που ο
                        επαγγελματίας είναι
                        διαθέσιμος.
                      </p>
                    </div>
                  </div>

                  <div className="booking-datepicker-wrapper">
                    <DatePicker
                        selected={
                          selectedDate
                        }
                        onChange={(
                            date:
                                Date | null,
                        ) => {
                          setSelectedDate(
                              date,
                          )

                          // A new date requires a new time selection.
                          setSelectedTime(
                              '',
                          )

                          setSuccess(
                              false,
                          )
                        }}
                        minDate={
                          new Date()
                        }
                        filterDate={
                          isAvailableDate
                        }
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Επιλέξτε διαθέσιμη ημερομηνία"
                    />

                    <span className="datepicker-help">
                      ◷ Επιλέξτε μία
                      διαθέσιμη ημέρα
                    </span>
                  </div>
                </article>
            )}

            {/* Step 3: Select one generated appointment slot */}
            {selectedDate && (
                <article className="booking-step">
                  <div className="booking-step-header">
                    <span className="booking-step-number">
                      03
                    </span>

                    <div>
                      <span className="booking-step-label">
                        Time
                      </span>

                      <h2>
                        Επιλέξτε ώρα
                      </h2>

                      <p>
                        Διαθέσιμα slots
                        για την επιλεγμένη
                        ημέρα.
                      </p>
                    </div>
                  </div>

                  {timeSlots.length ===
                  0 ? (
                      <div className="no-time-slots">
                        <span>
                          ◷
                        </span>

                        <div>
                          <strong>
                            Δεν υπάρχουν
                            διαθέσιμες ώρες
                          </strong>

                          <p>
                            Επιλέξτε άλλη
                            ημερομηνία.
                          </p>
                        </div>
                      </div>
                  ) : (
                      <div className="booking-time-grid">
                        {timeSlots.map(
                            (
                                time,
                            ) => (
                                <button
                                    key={
                                      time
                                    }
                                    type="button"
                                    onClick={() => {
                                      setSelectedTime(
                                          time,
                                      )

                                      setSuccess(
                                          false,
                                      )
                                    }}
                                    className={`booking-time-slot ${
                                        selectedTime ===
                                        time
                                            ? 'selected'
                                            : ''
                                    }`}
                                >
                                  <span>
                                    ◷
                                  </span>

                                  {
                                    time
                                  }
                                </button>
                            ),
                        )}
                      </div>
                  )}
                </article>
            )}

            {/* Step 4: Review the selected appointment before saving */}
            {selectedService &&
                selectedDate &&
                selectedTime && (
                    <article className="booking-step booking-confirmation">
                      <div className="booking-step-header">
                        <span className="booking-step-number">
                          04
                        </span>

                        <div>
                          <span className="booking-step-label">
                            Confirmation
                          </span>

                          <h2>
                            Επιβεβαίωση
                            Ραντεβού
                          </h2>

                          <p>
                            Ελέγξτε τα
                            στοιχεία πριν
                            την οριστική
                            καταχώρηση.
                          </p>
                        </div>
                      </div>

                      <div className="confirmation-details">
                        <div>
                          <span>
                            Υπηρεσία
                          </span>

                          <strong>
                            {
                              selectedService
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Ημερομηνία
                          </span>

                          <strong>
                            {selectedDate.toLocaleDateString(
                                'el-GR',
                                {
                                  weekday:
                                      'long',
                                  day: 'numeric',
                                  month: 'long',
                                },
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Ώρα
                          </span>

                          <strong>
                            {
                              selectedTime
                            }
                          </strong>
                        </div>
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
                            ? 'Καταχώρηση...'
                            : success
                                ? '✓ Το ραντεβού καταχωρήθηκε'
                                : 'Επιβεβαίωση Ραντεβού'}
                      </button>
                    </article>
                )}
          </section>

          {/* Booking sidebar with doctor details and live appointment summary */}
          <aside className="booking-sidebar">
            {doctor && (
                <section className="booking-doctor-card">
                  <span className="booking-card-label">
                    Your Professional
                  </span>

                  <div className="booking-doctor-main">
                    <div className="booking-doctor-avatar">
                      {doctor.firstName
                          .charAt(0)
                          .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {
                          doctor.firstName
                        }{' '}
                        {
                          doctor.lastName
                        }
                      </strong>

                      <span>
                        {
                          doctor.specialty
                        }
                      </span>
                    </div>
                  </div>

                  <div className="booking-doctor-message">
                    <span>
                      ♡
                    </span>

                    <p>
                      Επιλέξτε τον χρόνο
                      που σας εξυπηρετεί
                      καλύτερα.
                    </p>
                  </div>
                </section>
            )}

            <section className="booking-summary-card">
              <span className="booking-card-label">
                Appointment Summary
              </span>

              <h3>
                Το ραντεβού σας
              </h3>

              <div className="booking-summary-item">
                <span>
                  Υπηρεσία
                </span>

                <strong>
                  {selectedService ||
                      'Δεν επιλέχθηκε'}
                </strong>
              </div>

              <div className="booking-summary-item">
                <span>
                  Ημερομηνία
                </span>

                <strong>
                  {selectedDate
                      ? selectedDate.toLocaleDateString(
                          'el-GR',
                      )
                      : 'Δεν επιλέχθηκε'}
                </strong>
              </div>

              <div className="booking-summary-item">
                <span>
                  Ώρα
                </span>

                <strong>
                  {selectedTime ||
                      'Δεν επιλέχθηκε'}
                </strong>
              </div>

              <div className="booking-summary-footer">
                <span>
                  ✓
                </span>

                <p>
                  Μετά την καταχώρηση,
                  το αίτημα θα εμφανιστεί
                  στα ραντεβού σας.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>
  )
}