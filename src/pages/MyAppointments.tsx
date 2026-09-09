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
    getMyAppointments,
} from '../services/AppointmentService'

import {
    logout,
} from '../services/AuthService'

import type {
    Appointment,
    AppointmentStatus,
} from '../types/Appointment'

import '../styles/MyAppointments.css'

export default function MyAppointments() {
    const navigate =
        useNavigate()

    const [
        appointments,
        setAppointments,
    ] = useState<Appointment[]>([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    // Load the authenticated client's appointments when the page first renders.
    useEffect(() => {
        loadAppointments()
    }, [])

    // Fetch all appointments belonging to the currently authenticated client.
    async function loadAppointments() {
        setLoading(true)
        setError('')

        try {
            const data =
                await getMyAppointments()

            // Keep the main appointment collection ordered from newest to oldest.
            const sortedAppointments =
                [...data].sort(
                    (
                        first,
                        second,
                    ) =>
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
            if (
                error instanceof Error
            ) {
                setError(
                    error.message,
                )
            } else {
                setError(
                    'Δεν ήταν δυνατή η φόρτωση των ραντεβού.',
                )
            }
        } finally {
            setLoading(false)
        }
    }

    // Format the full appointment date for the Greek UI.
    function formatDate(
        appointmentTime: string,
    ): string {
        return new Date(
            appointmentTime,
        ).toLocaleDateString(
            'el-GR',
            {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            },
        )
    }

    // Split the date into a compact day/month format used by appointment cards.
    function formatShortDate(
        appointmentTime: string,
    ): {
        day: string
        month: string
    } {
        const date =
            new Date(
                appointmentTime,
            )

        return {
            day: date.toLocaleDateString(
                'el-GR',
                {
                    day: '2-digit',
                },
            ),
            month:
                date.toLocaleDateString(
                    'el-GR',
                    {
                        month: 'short',
                    },
                ),
        }
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

    // Convert backend appointment statuses into user-friendly Greek labels.
    function getStatusLabel(
        status: AppointmentStatus,
    ): string {
        switch (status) {
            case 'PENDING':
                return 'Αναμένει επιβεβαίωση'

            case 'CONFIRMED':
                return 'Επιβεβαιωμένο'

            case 'COMPLETED':
                return 'Ολοκληρωμένο'

            case 'CANCELLED':
                return 'Ακυρωμένο'
        }
    }

    // Map appointment statuses to the corresponding CSS class.
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

    // Select the small visual icon displayed next to each appointment status.
    function getStatusIcon(
        status: AppointmentStatus,
    ): string {
        switch (status) {
            case 'PENDING':
                return '◷'

            case 'CONFIRMED':
                return '✓'

            case 'COMPLETED':
                return '✓'

            case 'CANCELLED':
                return '×'
        }
    }

    // Clear authentication data and return to the login page.
    function handleLogout() {
        logout()

        navigate('/login')
    }

    const now =
        Date.now()

    // Keep only future appointments that are still active.
    const upcomingAppointments =
        appointments
            .filter(
                (appointment) =>
                    new Date(
                        appointment.appointmentTime,
                    ).getTime() >=
                    now &&
                    appointment.status !==
                    'COMPLETED' &&
                    appointment.status !==
                    'CANCELLED',
            )
            // Upcoming appointments are shown from nearest to furthest.
            .sort(
                (
                    first,
                    second,
                ) =>
                    new Date(
                        first.appointmentTime,
                    ).getTime() -
                    new Date(
                        second.appointmentTime,
                    ).getTime(),
            )

    // Everything that is not upcoming is displayed in the appointment history.
    const previousAppointments =
        appointments.filter(
            (appointment) =>
                !upcomingAppointments.some(
                    (upcoming) =>
                        upcoming.id ===
                        appointment.id,
                ),
        )

    // The first upcoming appointment is the nearest future appointment.
    const nextAppointment =
        upcomingAppointments[0]

    if (loading) {
        return (
            <main className="my-appointments-loading">
                <img
                    src={logo}
                    alt="Healayra"
                />

                <p>
                    Φόρτωση ραντεβού...
                </p>
            </main>
        )
    }

    return (
        <main className="my-appointments-page">

            {/* Client navigation */}
            <header className="appointments-topbar">
                <Link
                    to="/"
                    className="appointments-brand"
                >
                    <img
                        src={logo}
                        alt="Healayra"
                    />

                    <span>
                        HEALAYRA
                    </span>
                </Link>

                <nav className="appointments-navigation">
                    <Link to="/">
                        Αρχική
                    </Link>

                    <Link
                        to="/booking"
                    >
                        Νέο Ραντεβού
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

            <section className="appointments-content">

                {/* Page introduction and shortcut to create a new appointment */}
                <header className="appointments-header">
                    <div>
                        <span className="appointments-eyebrow">
                            My Appointments
                        </span>

                        <h1>
                            Τα Ραντεβού μου
                        </h1>

                        <p>
                            Παρακολουθήστε τα
                            επερχόμενα ραντεβού και
                            το ιστορικό των
                            συνεδριών σας.
                        </p>
                    </div>

                    <Link
                        to="/booking"
                        className="new-appointment-button"
                    >
                        <span>
                            +
                        </span>

                        Κλείσιμο Ραντεβού
                    </Link>
                </header>

                {/* Backend request error */}
                {error && (
                    <div
                        className="appointments-alert"
                        role="alert"
                    >
                        <span>
                            !
                        </span>

                        {error}
                    </div>
                )}

                {/* Highlight the nearest future appointment */}
                {!error &&
                    nextAppointment && (
                        <section className="next-appointment-card">
                            <div className="next-appointment-copy">
                                <span className="next-label">
                                    Next Appointment
                                </span>

                                <h2>
                                    Το επόμενο ραντεβού
                                    σας
                                </h2>

                                <p>
                                    {formatDate(
                                        nextAppointment
                                            .appointmentTime,
                                    )}
                                </p>
                            </div>

                            <div className="next-appointment-time">
                                <span>
                                    Ώρα
                                </span>

                                <strong>
                                    {formatTime(
                                        nextAppointment
                                            .appointmentTime,
                                    )}
                                </strong>
                            </div>

                            <span
                                className={`appointment-status ${getStatusClass(
                                    nextAppointment.status,
                                )}`}
                            >
                                <span>
                                    {getStatusIcon(
                                        nextAppointment.status,
                                    )}
                                </span>

                                {getStatusLabel(
                                    nextAppointment.status,
                                )}
                            </span>
                        </section>
                    )}

                {/* Empty state shown when the client has no appointments at all */}
                {!error &&
                    appointments.length ===
                    0 && (
                        <section className="appointments-empty">
                            <div className="appointments-empty-icon">
                                ◷
                            </div>

                            <h2>
                                Δεν υπάρχουν
                                ραντεβού
                            </h2>

                            <p>
                                Δεν έχετε ακόμη
                                καταχωρημένο
                                ραντεβού.
                            </p>

                            <Link
                                to="/booking"
                            >
                                Κλείσιμο πρώτου
                                ραντεβού
                            </Link>
                        </section>
                    )}

                {!error &&
                    appointments.length >
                    0 && (
                        <>

                            {/* Future active appointments */}
                            <section className="appointments-section">
                                <div className="appointments-section-header">
                                    <div>
                                        <span>
                                            Upcoming
                                        </span>

                                        <h2>
                                            Επερχόμενα
                                        </h2>
                                    </div>

                                    <div className="appointments-count">
                                        {
                                            upcomingAppointments.length
                                        }
                                    </div>
                                </div>

                                {upcomingAppointments.length ===
                                0 ? (
                                    <div className="appointments-section-empty">
                                        Δεν υπάρχουν
                                        επερχόμενα
                                        ραντεβού.
                                    </div>
                                ) : (
                                    <div className="appointments-list">
                                        {upcomingAppointments.map(
                                            (
                                                appointment,
                                            ) => {
                                                const date =
                                                    formatShortDate(
                                                        appointment
                                                            .appointmentTime,
                                                    )

                                                return (
                                                    <article
                                                        key={
                                                            appointment.id
                                                        }
                                                        className="appointment-card upcoming-card"
                                                    >
                                                        <div className="appointment-date-block">
                                                            <strong>
                                                                {
                                                                    date.day
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    date.month
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="appointment-card-main">
                                                            <span className="appointment-card-label">
                                                                Θεραπευτική
                                                                Συνεδρία
                                                            </span>

                                                            <h3>
                                                                {formatDate(
                                                                    appointment
                                                                        .appointmentTime,
                                                                )}
                                                            </h3>

                                                            <div className="appointment-time-row">
                                                                <span>
                                                                    ◷
                                                                </span>

                                                                <strong>
                                                                    {formatTime(
                                                                        appointment
                                                                            .appointmentTime,
                                                                    )}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        <div className="appointment-card-status">
                                                            <span
                                                                className={`appointment-status ${getStatusClass(
                                                                    appointment.status,
                                                                )}`}
                                                            >
                                                                <span>
                                                                    {getStatusIcon(
                                                                        appointment.status,
                                                                    )}
                                                                </span>

                                                                {getStatusLabel(
                                                                    appointment.status,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </article>
                                                )
                                            },
                                        )}
                                    </div>
                                )}
                            </section>

                            {/* Past, completed or cancelled appointments */}
                            <section className="appointments-section history-section">
                                <div className="appointments-section-header">
                                    <div>
                                        <span>
                                            History
                                        </span>

                                        <h2>
                                            Ιστορικό
                                        </h2>
                                    </div>

                                    <div className="appointments-count">
                                        {
                                            previousAppointments.length
                                        }
                                    </div>
                                </div>

                                {previousAppointments.length ===
                                0 ? (
                                    <div className="appointments-section-empty">
                                        Δεν υπάρχει
                                        προηγούμενο
                                        ιστορικό.
                                    </div>
                                ) : (
                                    <div className="appointments-list">
                                        {previousAppointments.map(
                                            (
                                                appointment,
                                            ) => {
                                                const date =
                                                    formatShortDate(
                                                        appointment
                                                            .appointmentTime,
                                                    )

                                                return (
                                                    <article
                                                        key={
                                                            appointment.id
                                                        }
                                                        className="appointment-card history-card"
                                                    >
                                                        <div className="appointment-date-block">
                                                            <strong>
                                                                {
                                                                    date.day
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    date.month
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="appointment-card-main">
                                                            <span className="appointment-card-label">
                                                                Συνεδρία
                                                            </span>

                                                            <h3>
                                                                {formatDate(
                                                                    appointment
                                                                        .appointmentTime,
                                                                )}
                                                            </h3>

                                                            <div className="appointment-time-row">
                                                                <span>
                                                                    ◷
                                                                </span>

                                                                <strong>
                                                                    {formatTime(
                                                                        appointment
                                                                            .appointmentTime,
                                                                    )}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        <div className="appointment-card-status">
                                                            <span
                                                                className={`appointment-status ${getStatusClass(
                                                                    appointment.status,
                                                                )}`}
                                                            >
                                                                <span>
                                                                    {getStatusIcon(
                                                                        appointment.status,
                                                                    )}
                                                                </span>

                                                                {getStatusLabel(
                                                                    appointment.status,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </article>
                                                )
                                            },
                                        )}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
            </section>
        </main>
    )
}