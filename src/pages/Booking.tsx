import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import logo
  from '../assets/healayra-logo.png'

import BookingSteps
  from '../components/booking/BookingSteps'

import BookingSidebar
  from '../components/booking/BookingSidebar'

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
} from '../types/Availability'

import 'react-datepicker/dist/react-datepicker.css'
import '../styles/Booking.css'

export default function Booking() {
  const navigate =
      useNavigate()

  const [
    doctor,
    setDoctor,
  ] =
      useState<Doctor | null>(
          null,
      )

  const [
    availability,
    setAvailability,
  ] =
      useState<Availability[]>(
          [],
      )

  const [
    selectedService,
    setSelectedService,
  ] =
      useState('')

  const [
    selectedDate,
    setSelectedDate,
  ] =
      useState<Date | null>(
          null,
      )

  const [
    selectedTime,
    setSelectedTime,
  ] =
      useState('')

  const [
    loading,
    setLoading,
  ] =
      useState(true)

  const [
    saving,
    setSaving,
  ] =
      useState(false)

  const [
    error,
    setError,
  ] =
      useState('')

  const [
    success,
    setSuccess,
  ] =
      useState(false)

  // Store a stable timestamp so slot calculations do not read the clock during render.
  const [
    currentTimestamp,
    setCurrentTimestamp,
  ] =
      useState(0)

  // Load the booking professional and weekly availability when the page opens.
  useEffect(() => {
    async function loadBookingData() {
      try {
        const doctors =
            await getDoctors()

        if (
            doctors.length ===
            0
        ) {
          setError(
              'Δεν υπάρχει διαθέσιμος γιατρός.',
          )

          return
        }

        // MVP currently books appointments with the first available doctor.
        const selectedDoctor =
            doctors[0]

        const availabilityData =
            await getAvailabilityByDoctor(
                selectedDoctor.id,
            )

        setDoctor(
            selectedDoctor,
        )

        setAvailability(
            availabilityData,
        )

        // Capture the current time after the asynchronous booking data has loaded.
        setCurrentTimestamp(
            Date.now(),
        )
      } catch (error) {
        if (
            error instanceof Error
        ) {
          setError(
              error.message,
          )
        } else {
          setError(
              'Δεν ήταν δυνατή η φόρτωση της διαθεσιμότητας.',
          )
        }
      } finally {
        setLoading(
            false,
        )
      }
    }

    loadBookingData()
  }, [])

  // Changing the service resets every later step in the booking flow.
  function handleServiceChange(
      service: string,
  ) {
    setSelectedService(
        service,
    )

    setSelectedDate(
        null,
    )

    setSelectedTime('')
    setSuccess(false)
  }

  // Changing the date requires the user to select another time slot.
  function handleDateChange(
      date: Date | null,
  ) {
    setSelectedDate(
        date,
    )

    setSelectedTime('')
    setSuccess(false)
  }

  // Store the selected appointment time and clear any previous success state.
  function handleTimeChange(
      time: string,
  ) {
    setSelectedTime(
        time,
    )

    setSuccess(false)
  }

  // Combine the selected date and time into one local Date object.
  function combineDateAndTime(
      date: Date,
      time: string,
  ): Date {
    const [
      hours,
      minutes,
    ] =
        time
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

  // Format the local appointment date and time for the Spring Boot API.
  function formatLocalDateTime(
      date: Date,
  ): string {
    const year =
        date.getFullYear()

    const month =
        String(
            date.getMonth() + 1,
        ).padStart(
            2,
            '0',
        )

    const day =
        String(
            date.getDate(),
        ).padStart(
            2,
            '0',
        )

    const hours =
        String(
            date.getHours(),
        ).padStart(
            2,
            '0',
        )

    const minutes =
        String(
            date.getMinutes(),
        ).padStart(
            2,
            '0',
        )

    return (
        `${year}-${month}-${day}` +
        `T${hours}:${minutes}:00`
    )
  }

  // Create the appointment once all booking steps have been completed.
  async function handleBooking() {
    if (
        !doctor ||
        !selectedService ||
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
      // Send the selected professional, service and appointment time to the backend.
      await createAppointment({
        doctorId:
        doctor.id,

        appointmentTime:
            formatLocalDateTime(
                appointmentDateTime,
            ),

        service:
        selectedService,
      })

      setSuccess(
          true,
      )

      // Keep the success state visible briefly before opening the appointment list.
      setTimeout(
          () => {
            navigate(
                '/my-appointments',
            )
          },
          1200,
      )
    } catch (error) {
      if (
          error instanceof Error
      ) {
        setError(
            error.message,
        )
      } else {
        setError(
            'Δεν ήταν δυνατή η δημιουργία του ραντεβού.',
        )
      }
    } finally {
      setSaving(
          false,
      )
    }
  }

  // Clear authentication data and return to the login page.
  function handleLogout() {
    logout()

    navigate(
        '/login',
    )
  }

  // Determine whether each progress indicator is active, completed or pending.
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

            <Link to="/my-appointments">
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
              (step) => {
                const stepClass =
                    getStepClass(
                        step,
                    )

                return (
                    <div
                        key={
                          step
                        }
                        className={`booking-progress-step ${stepClass}`}
                    >
                      <div className="progress-number">
                        {stepClass ===
                        'completed'
                            ? '✓'
                            : step}
                      </div>

                      <span>
                                    {step ===
                                        1 &&
                                        'Υπηρεσία'}

                        {step ===
                            2 &&
                            'Ημερομηνία'}

                        {step ===
                            3 &&
                            'Ώρα'}

                        {step ===
                            4 &&
                            'Επιβεβαίωση'}
                                </span>
                    </div>
                )
              },
          )}
        </div>

        {/* Display booking or backend failures without leaving the booking flow */}
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

        {/* Preserve the original two-column booking grid */}
        <div className="booking-layout">
          <BookingSteps
              availability={
                availability
              }
              selectedService={
                selectedService
              }
              selectedDate={
                selectedDate
              }
              selectedTime={
                selectedTime
              }
              saving={
                saving
              }
              success={
                success
              }
              currentTimestamp={
                currentTimestamp
              }
              onServiceChange={
                handleServiceChange
              }
              onDateChange={
                handleDateChange
              }
              onTimeChange={
                handleTimeChange
              }
              onBooking={
                handleBooking
              }
          />

          <BookingSidebar
              doctor={
                doctor
              }
              selectedService={
                selectedService
              }
              selectedDate={
                selectedDate
              }
              selectedTime={
                selectedTime
              }
          />
        </div>
      </main>
  )
}