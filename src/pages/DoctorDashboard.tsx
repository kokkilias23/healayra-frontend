import {
  useEffect,
  useState,
} from 'react'

import {
  getDoctorByUserId,
} from '../services/DoctorService'

import {
  getAppointmentsByDoctor,
  updateAppointmentStatus,
} from '../services/AppointmentService'

import {
  getClients,
} from '../services/ClientService'

import type {
  Appointment,
  AppointmentStatus,
} from '../types/Appointment'

import type {
  Client,
} from '../types/Client'

import '../styles/DoctorDashboard.css'

export default function DoctorDashboard() {
  const [appointments, setAppointments] =
      useState<Appointment[]>([])

  const [clients, setClients] =
      useState<Client[]>([])

  const [loading, setLoading] =
      useState(true)

  const [error, setError] =
      useState('')

  const [
    updatingAppointmentId,
    setUpdatingAppointmentId,
  ] = useState<number | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const userId =
        localStorage.getItem('userId')

    if (!userId) {
      setError(
          'Δεν βρέθηκαν στοιχεία συνδεδεμένου γιατρού.',
      )

      setLoading(false)

      return
    }

    setLoading(true)
    setError('')

    try {
      const doctor =
          await getDoctorByUserId(
              Number(userId),
          )

      const [
        appointmentsData,
        clientsData,
      ] = await Promise.all([
        getAppointmentsByDoctor(
            doctor.id,
        ),
        getClients(),
      ])

      setAppointments(
          appointmentsData,
      )

      setClients(
          clientsData,
      )
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η φόρτωση του dashboard.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmAppointment(
      appointmentId: number,
  ) {
    setUpdatingAppointmentId(
        appointmentId,
    )

    setError('')

    try {
      const updatedAppointment =
          await updateAppointmentStatus(
              appointmentId,
              'CONFIRMED',
          )

      setAppointments(
          (currentAppointments) =>
              currentAppointments.map(
                  (appointment) =>
                      appointment.id ===
                      appointmentId
                          ? updatedAppointment
                          : appointment,
              ),
      )
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η επιβεβαίωση του ραντεβού.',
        )
      }
    } finally {
      setUpdatingAppointmentId(
          null,
      )
    }
  }

  function getTodayDate(): string {
    const now = new Date()

    const year =
        now.getFullYear()

    const month =
        String(
            now.getMonth() + 1,
        ).padStart(2, '0')

    const day =
        String(
            now.getDate(),
        ).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  function getClientName(
      clientId: number,
  ): string {
    const client =
        clients.find(
            (client) =>
                client.id === clientId,
        )

    if (!client) {
      return 'Άγνωστος θεραπευόμενος'
    }

    return `${client.firstName} ${client.lastName}`
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
        return 'ΝΕΟ ΑΙΤΗΜΑ'

      case 'CONFIRMED':
        return 'ΕΠΙΒΕΒΑΙΩΜΕΝΟ'

      case 'COMPLETED':
        return 'ΟΛΟΚΛΗΡΩΜΕΝΟ'

      case 'CANCELLED':
        return 'ΑΚΥΡΩΜΕΝΟ'
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

  const today =
      getTodayDate()

  const pendingAppointments =
      appointments
          .filter(
              (appointment) =>
                  appointment.status ===
                  'PENDING',
          )
          .sort(
              (first, second) =>
                  new Date(
                      first.appointmentTime,
                  ).getTime() -
                  new Date(
                      second.appointmentTime,
                  ).getTime(),
          )

  const todayAppointments =
      appointments
          .filter(
              (appointment) =>
                  appointment.appointmentTime
                      .split('T')[0] === today,
          )
          .sort(
              (first, second) =>
                  new Date(
                      first.appointmentTime,
                  ).getTime() -
                  new Date(
                      second.appointmentTime,
                  ).getTime(),
          )

  const nextAppointment =
      appointments
          .filter(
              (appointment) =>
                  appointment.status !==
                  'CANCELLED' &&
                  appointment.status !==
                  'COMPLETED' &&
                  new Date(
                      appointment.appointmentTime,
                  ).getTime() >=
                  Date.now(),
          )
          .sort(
              (first, second) =>
                  new Date(
                      first.appointmentTime,
                  ).getTime() -
                  new Date(
                      second.appointmentTime,
                  ).getTime(),
          )[0]

  if (loading) {
    return (
        <section className="doctor-dashboard">
          <p>
            Φόρτωση...
          </p>
        </section>
    )
  }

  if (error && appointments.length === 0) {
    return (
        <section className="doctor-dashboard">
          <p role="alert">
            {error}
          </p>
        </section>
    )
  }

  return (
      <section className="doctor-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>
              Doctor Dashboard
            </h1>

            <p>
              Καλώς ήρθατε πίσω.
            </p>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
          <span>
            Σημερινά Ραντεβού
          </span>

            <strong>
              {todayAppointments.length}
            </strong>
          </div>

          <div className="stat-card">
          <span>
            Σύνολο Θεραπευόμενων
          </span>

            <strong>
              {clients.length}
            </strong>
          </div>

          <div className="stat-card">
          <span>
            Νέα Αιτήματα
          </span>

            <strong>
              {pendingAppointments.length}
            </strong>
          </div>

          <div className="stat-card">
          <span>
            Επόμενο Ραντεβού
          </span>

            <strong>
              {nextAppointment
                  ? formatTime(
                      nextAppointment
                          .appointmentTime,
                  )
                  : '—'}
            </strong>
          </div>
        </div>

        {error && (
            <p role="alert">
              {error}
            </p>
        )}

        <div className="dashboard-section">
          <h2>
            Αιτήματα Ραντεβού
          </h2>

          {pendingAppointments.length ===
          0 ? (
              <p>
                Δεν υπάρχουν νέα αιτήματα.
              </p>
          ) : (
              <div className="dashboard-appointments">
                {pendingAppointments.map(
                    (appointment) => (
                        <article
                            key={appointment.id}
                            className="dashboard-appointment-card"
                        >
                          <div>
                            <h3>
                              {getClientName(
                                  appointment.clientId,
                              )}
                            </h3>

                            <p>
                              {formatDate(
                                  appointment
                                      .appointmentTime,
                              )}
                              {' - '}
                              {formatTime(
                                  appointment
                                      .appointmentTime,
                              )}
                            </p>
                          </div>

                          <div className="appointment-meta">
                    <span
                        className={`appointment-status ${getStatusClass(
                            appointment.status,
                        )}`}
                    >
                      {getStatusLabel(
                          appointment.status,
                      )}
                    </span>

                            <button
                                type="button"
                                onClick={() =>
                                    handleConfirmAppointment(
                                        appointment.id,
                                    )
                                }
                                disabled={
                                    updatingAppointmentId ===
                                    appointment.id
                                }
                            >
                              {updatingAppointmentId ===
                              appointment.id
                                  ? 'Επιβεβαίωση...'
                                  : 'Επιβεβαίωση'}
                            </button>
                          </div>
                        </article>
                    ),
                )}
              </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>
            Σημερινά Ραντεβού
          </h2>

          {todayAppointments.length ===
          0 ? (
              <p>
                Δεν υπάρχουν ραντεβού
                για σήμερα.
              </p>
          ) : (
              <div className="dashboard-appointments">
                {todayAppointments.map(
                    (appointment) => (
                        <article
                            key={appointment.id}
                            className="dashboard-appointment-card"
                        >
                          <div>
                            <h3>
                              {getClientName(
                                  appointment.clientId,
                              )}
                            </h3>

                            <p>
                              Ραντεβού
                            </p>
                          </div>

                          <div className="appointment-meta">
                            <strong>
                              {formatTime(
                                  appointment
                                      .appointmentTime,
                              )}
                            </strong>

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
        </div>
      </section>
  )
}