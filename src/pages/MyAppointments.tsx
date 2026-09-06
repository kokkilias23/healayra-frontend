import {
  useEffect,
  useState,
} from 'react'

import {
  getMyAppointments,
} from '../services/AppointmentService'

import type {
  Appointment,
  AppointmentStatus,
} from '../types/Appointment'

import '../styles/MyAppointments.css'

export default function MyAppointments() {
  const [appointments, setAppointments] =
      useState<Appointment[]>([])

  const [loading, setLoading] =
      useState(true)

  const [error, setError] =
      useState('')

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    setLoading(true)
    setError('')

    try {
      const data =
          await getMyAppointments()

      const sortedAppointments =
          [...data].sort(
              (first, second) =>
                  new Date(
                      second.appointmentTime,
                  ).getTime() -
                  new Date(
                      first.appointmentTime,
                  ).getTime(),
          )

      setAppointments(
          sortedAppointments,
      )
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η φόρτωση των ραντεβού.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  function formatDate(
      appointmentTime: string,
  ): string {
    return new Date(
        appointmentTime,
    ).toLocaleDateString(
        'el-GR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        },
    )
  }

  function formatTime(
      appointmentTime: string,
  ): string {
    return new Date(
        appointmentTime,
    ).toLocaleTimeString(
        'el-GR',
        {
          hour: '2-digit',
          minute: '2-digit',
        },
    )
  }

  function getStatusLabel(
      status: AppointmentStatus,
  ): string {
    switch (status) {
      case 'PENDING':
        return 'Σε αναμονή'

      case 'CONFIRMED':
        return 'Επιβεβαιωμένο'

      case 'COMPLETED':
        return 'Ολοκληρωμένο'

      case 'CANCELLED':
        return 'Ακυρωμένο'
    }
  }

  function getStatusClass(
      status: AppointmentStatus,
  ): string {
    if (
        status === 'PENDING' ||
        status === 'CONFIRMED'
    ) {
      return 'upcoming'
    }

    if (status === 'COMPLETED') {
      return 'completed'
    }

    return 'cancelled'
  }

  if (loading) {
    return (
        <section className="my-appointments-page">
          <p>
            Φόρτωση...
          </p>
        </section>
    )
  }

  if (error) {
    return (
        <section className="my-appointments-page">
          <p role="alert">
            {error}
          </p>
        </section>
    )
  }

  return (
      <section className="my-appointments-page">
        <h1>
          Τα Ραντεβού μου
        </h1>

        <p>
          Εδώ μπορείτε να δείτε τα επερχόμενα
          και προηγούμενα ραντεβού σας.
        </p>

        {appointments.length === 0 ? (
            <p>
              Δεν υπάρχουν καταχωρημένα ραντεβού.
            </p>
        ) : (
            <div className="appointments-list">
              {appointments.map(
                  (appointment) => (
                      <article
                          key={appointment.id}
                          className="appointment-card"
                      >
                        <div>
                          <h2>
                            Ραντεβού
                          </h2>

                          <p>
                            <strong>
                              Ημερομηνία:
                            </strong>{' '}
                            {formatDate(
                                appointment.appointmentTime,
                            )}
                          </p>

                          <p>
                            <strong>
                              Ώρα:
                            </strong>{' '}
                            {formatTime(
                                appointment.appointmentTime,
                            )}
                          </p>
                        </div>

                        <div>
                  <span
                      className={`appointment-status ${getStatusClass(
                          appointment.status,
                      )}`}
                  >
                    {getStatusLabel(
                        appointment.status,
                    )}
                  </span>
                        </div>
                      </article>
                  ),
              )}
            </div>
        )}
      </section>
  )
}