import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import logo from '../assets/healayra-logo.png'

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

import {
  logout,
} from '../services/AuthService'

import type {
  Appointment,
  AppointmentStatus,
} from '../types/Appointment'

import type {
  Client,
} from '../types/Client'

import type {
  Doctor,
} from '../types/Doctor'

import '../styles/DoctorDashboard.css'

export default function DoctorDashboard() {
  const navigate = useNavigate()

  const [doctor, setDoctor] =
      useState<Doctor | null>(null)

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
      const doctorData =
          await getDoctorByUserId(
              Number(userId),
          )

      setDoctor(doctorData)

      const [
        appointmentsData,
        clientsData,
      ] = await Promise.all([
        getAppointmentsByDoctor(
            doctorData.id,
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

  function handleLogout() {
    logout()
    navigate('/login')
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
    switch (status) {
      case 'PENDING':
        return 'status-pending'

      case 'CONFIRMED':
        return 'status-confirmed'

      case 'COMPLETED':
        return 'status-completed'

      case 'CANCELLED':
        return 'status-cancelled'
    }
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
        <main className="doctor-dashboard-page">
          <div className="dashboard-loading">
            <img
                src={logo}
                alt="Healayra"
            />

            <p>
              Φόρτωση dashboard...
            </p>
          </div>
        </main>
    )
  }

  if (
      error &&
      appointments.length === 0
  ) {
    return (
        <main className="doctor-dashboard-page">
          <div className="dashboard-error-page">
            <img
                src={logo}
                alt="Healayra"
            />

            <h2>
              Κάτι πήγε στραβά
            </h2>

            <p role="alert">
              {error}
            </p>
          </div>
        </main>
    )
  }

  return (
      <main className="doctor-dashboard-page">
        <aside className="doctor-sidebar">
          <Link
              to="/doctor/dashboard"
              className="doctor-sidebar-brand"
          >
            <img
                src={logo}
                alt="Healayra"
            />

            <span>
                        HEALAYRA
                    </span>
          </Link>

          <div className="doctor-profile">
            <div className="doctor-avatar">
              {doctor?.firstName
                  ?.charAt(0)
                  .toUpperCase() ?? 'D'}
            </div>

            <div>
              <strong>
                {doctor
                    ? `${doctor.firstName} ${doctor.lastName}`
                    : 'Doctor'}
              </strong>

              <span>
                            {doctor?.specialty ||
                                'Επαγγελματίας Υγείας'}
                        </span>
            </div>
          </div>

          <nav className="doctor-menu">
            <Link
                to="/doctor/dashboard"
                className="doctor-menu-link active"
            >
                        <span className="menu-icon">
                            ⌂
                        </span>

              Dashboard
            </Link>

            <Link
                to="/doctor/clients"
                className="doctor-menu-link"
            >
                        <span className="menu-icon">
                            ♙
                        </span>

              Θεραπευόμενοι
            </Link>

            <Link
                to="/doctor/availability"
                className="doctor-menu-link"
            >
                        <span className="menu-icon">
                            ◷
                        </span>

              Διαθεσιμότητα
            </Link>
          </nav>

          <div className="doctor-sidebar-footer">
            <button
                type="button"
                onClick={handleLogout}
                className="doctor-logout"
            >
                        <span>
                            ↪
                        </span>

              Αποσύνδεση
            </button>
          </div>
        </aside>

        <section className="doctor-dashboard-content">
          <header className="doctor-dashboard-header">
            <div>
                        <span className="dashboard-eyebrow">
                            Doctor Workspace
                        </span>

              <h1>
                Καλησπέρα
                {doctor
                    ? `, ${doctor.firstName}`
                    : ''}
                .
              </h1>

              <p>
                Δείτε τι χρειάζεται την
                προσοχή σας σήμερα.
              </p>
            </div>

            <div className="dashboard-header-date">
                        <span>
                            Σήμερα
                        </span>

              <strong>
                {new Date().toLocaleDateString(
                    'el-GR',
                    {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    },
                )}
              </strong>
            </div>
          </header>

          <section className="dashboard-stats">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                            <span className="dashboard-stat-icon">
                                ◷
                            </span>

                <span className="dashboard-stat-label">
                                Σημερινά Ραντεβού
                            </span>
              </div>

              <strong className="dashboard-stat-value">
                {todayAppointments.length}
              </strong>

              <small>
                Προγραμματισμένα για σήμερα
              </small>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                            <span className="dashboard-stat-icon">
                                ♙
                            </span>

                <span className="dashboard-stat-label">
                                Θεραπευόμενοι
                            </span>
              </div>

              <strong className="dashboard-stat-value">
                {clients.length}
              </strong>

              <small>
                Σύνολο ενεργών προφίλ
              </small>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                            <span className="dashboard-stat-icon">
                                +
                            </span>

                <span className="dashboard-stat-label">
                                Νέα Αιτήματα
                            </span>
              </div>

              <strong className="dashboard-stat-value">
                {pendingAppointments.length}
              </strong>

              <small>
                Αναμένουν επιβεβαίωση
              </small>
            </article>

            <article className="dashboard-stat-card dashboard-stat-highlight">
              <div className="dashboard-stat-top">
                            <span className="dashboard-stat-icon">
                                →
                            </span>

                <span className="dashboard-stat-label">
                                Επόμενο Ραντεβού
                            </span>
              </div>

              <strong className="dashboard-stat-value">
                {nextAppointment
                    ? formatTime(
                        nextAppointment
                            .appointmentTime,
                    )
                    : '—'}
              </strong>

              <small>
                {nextAppointment
                    ? getClientName(
                        nextAppointment.clientId,
                    )
                    : 'Δεν υπάρχει επόμενο ραντεβού'}
              </small>
            </article>
          </section>

          {error && (
              <div
                  className="dashboard-alert"
                  role="alert"
              >
                {error}
              </div>
          )}

          <div className="dashboard-main-grid">
            <section className="dashboard-panel dashboard-requests-panel">
              <div className="dashboard-panel-header">
                <div>
                                <span className="dashboard-panel-kicker">
                                    Requests
                                </span>

                  <h2>
                    Αιτήματα Ραντεβού
                  </h2>
                </div>

                <span className="dashboard-count">
                                {pendingAppointments.length}
                            </span>
              </div>

              {pendingAppointments.length ===
              0 ? (
                  <div className="dashboard-empty">
                    <div className="dashboard-empty-icon">
                      ✓
                    </div>

                    <strong>
                      Όλα τακτοποιημένα
                    </strong>

                    <p>
                      Δεν υπάρχουν νέα αιτήματα
                      αυτή τη στιγμή.
                    </p>
                  </div>
              ) : (
                  <div className="dashboard-appointments">
                    {pendingAppointments.map(
                        (appointment) => (
                            <article
                                key={
                                  appointment.id
                                }
                                className="dashboard-appointment-card"
                            >
                              <div className="appointment-person">
                                <div className="appointment-avatar">
                                  {getClientName(
                                      appointment.clientId,
                                  )
                                      .charAt(0)
                                      .toUpperCase()}
                                </div>

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
                                    {' · '}
                                    {formatTime(
                                        appointment
                                            .appointmentTime,
                                    )}
                                  </p>
                                </div>
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
                                    className="confirm-appointment-button"
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
            </section>

            <section className="dashboard-panel dashboard-today-panel">
              <div className="dashboard-panel-header">
                <div>
                                <span className="dashboard-panel-kicker">
                                    Today
                                </span>

                  <h2>
                    Σημερινό Πρόγραμμα
                  </h2>
                </div>
              </div>

              {todayAppointments.length ===
              0 ? (
                  <div className="dashboard-empty">
                    <div className="dashboard-empty-icon">
                      ◷
                    </div>

                    <strong>
                      Ελεύθερο πρόγραμμα
                    </strong>

                    <p>
                      Δεν υπάρχουν ραντεβού για
                      σήμερα.
                    </p>
                  </div>
              ) : (
                  <div className="today-schedule">
                    {todayAppointments.map(
                        (appointment) => (
                            <article
                                key={
                                  appointment.id
                                }
                                className="today-schedule-item"
                            >
                              <div className="schedule-time">
                                {formatTime(
                                    appointment
                                        .appointmentTime,
                                )}
                              </div>

                              <div className="schedule-line">
                                <span />
                              </div>

                              <div className="schedule-details">
                                <strong>
                                  {getClientName(
                                      appointment.clientId,
                                  )}
                                </strong>

                                <span>
                                                    Θεραπευτική
                                                    συνεδρία
                                                </span>

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
          </div>

          <section className="dashboard-quick-actions">
            <div>
                        <span className="dashboard-panel-kicker">
                            Quick Actions
                        </span>

              <h2>
                Γρήγορη Πρόσβαση
              </h2>
            </div>

            <div className="quick-actions-grid">
              <Link
                  to="/doctor/clients"
                  className="quick-action-card"
              >
                            <span className="quick-action-icon">
                                ♙
                            </span>

                <div>
                  <strong>
                    Θεραπευόμενοι
                  </strong>

                  <span>
                                    Προβολή και διαχείριση
                                    προφίλ
                                </span>
                </div>

                <span className="quick-action-arrow">
                                →
                            </span>
              </Link>

              <Link
                  to="/doctor/availability"
                  className="quick-action-card"
              >
                            <span className="quick-action-icon">
                                ◷
                            </span>

                <div>
                  <strong>
                    Διαθεσιμότητα
                  </strong>

                  <span>
                                    Ρύθμιση εβδομαδιαίου
                                    προγράμματος
                                </span>
                </div>

                <span className="quick-action-arrow">
                                →
                            </span>
              </Link>
            </div>
          </section>
        </section>
      </main>
  )
}