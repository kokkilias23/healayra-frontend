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
  getAvailabilityByDoctor,
} from '../services/AvailabilityService'

import {
  createAppointment,
} from '../services/AppointmentService'

import type {
  Doctor,
} from '../types/Doctor'

import type {
  Availability,
  DayOfWeek,
} from '../types/Availability'

import 'react-datepicker/dist/react-datepicker.css'
import '../styles/Booking.css'

const services = [
  'Πρώτη Αξιολογητική Συνεδρία',
  'Ατομική Συνεδρία',
  'Online Συνεδρία',
]

const dayOfWeekMap: Record<number, DayOfWeek> = {
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

  useEffect(() => {
    loadBookingData()
  }, [])

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
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η φόρτωση της διαθεσιμότητας.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

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

  function isAvailableDate(
      date: Date,
  ): boolean {
    return Boolean(
        getAvailabilityForDate(
            date,
        ),
    )
  }

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

  function getTimeSlots(): string[] {
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
        let current = startMinutes;
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
      await createAppointment({
        doctorId: doctor.id,
        appointmentTime:
            formatLocalDateTime(
                appointmentDateTime,
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

  const timeSlots =
      getTimeSlots()

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

                          setSelectedDate(
                              null,
                          )

                          setSelectedTime('')
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
                2. Επιλέξτε διαθέσιμη ημερομηνία
              </h2>

              <DatePicker
                  selected={
                    selectedDate
                  }
                  onChange={(
                      date: Date | null,
                  ) => {
                    setSelectedDate(
                        date,
                    )

                    setSelectedTime('')
                    setSuccess(false)
                  }}
                  minDate={new Date()}
                  filterDate={
                    isAvailableDate
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Επιλέξτε διαθέσιμη ημερομηνία"
              />
            </div>
        )}

        {selectedDate && (
            <div className="booking-step">
              <h2>
                3. Επιλέξτε ώρα
              </h2>

              {timeSlots.length === 0 ? (
                  <p>
                    Δεν υπάρχουν διαθέσιμες ώρες
                    για αυτή την ημέρα.
                  </p>
              ) : (
                  <div className="booking-options">
                    {timeSlots.map(
                        (time) => (
                            <button
                                key={time}
                                type="button"
                                onClick={() => {
                                  setSelectedTime(
                                      time,
                                  )

                                  setSuccess(false)
                                }}
                                className={
                                  selectedTime ===
                                  time
                                      ? 'booking-option selected'
                                      : 'booking-option'
                                }
                            >
                              {time}
                            </button>
                        ),
                    )}
                  </div>
              )}
            </div>
        )}

        {selectedService &&
            selectedDate &&
            selectedTime && (
                <div className="booking-step confirmation">
                  <h2>
                    4. Επιβεβαίωση Ραντεβού
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
                      {selectedDate
                          .toLocaleDateString(
                              'el-GR',
                          )}
                    </p>

                    <p>
                      <strong>
                        Ώρα:
                      </strong>{' '}
                      {selectedTime}
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