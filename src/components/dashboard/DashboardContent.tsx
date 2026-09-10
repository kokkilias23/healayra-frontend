import {
    Link,
} from 'react-router-dom'

import type {
    Appointment,
    AppointmentStatus,
} from '../../types/Appointment'

import type {
    Client,
} from '../../types/Client'

import type {
    Doctor,
} from '../../types/Doctor'

interface DashboardContentProps {
    doctor: Doctor | null
    appointments: Appointment[]
    clients: Client[]
    error: string
    updatingAppointmentId:
        number | null
    currentTimestamp: number
    onConfirmAppointment:
        (appointmentId: number) => void
}

export default function DashboardContent({
                                             doctor,
                                             appointments,
                                             clients,
                                             error,
                                             updatingAppointmentId,
                                             currentTimestamp,
                                             onConfirmAppointment,
                                         }: DashboardContentProps) {
    // Build today's date in YYYY-MM-DD format using the timestamp captured after loading.
    function getTodayDate(): string {
        const currentDate =
            new Date(
                currentTimestamp,
            )

        const year =
            currentDate.getFullYear()

        const month =
            String(
                currentDate.getMonth() + 1,
            ).padStart(
                2,
                '0',
            )

        const day =
            String(
                currentDate.getDate(),
            ).padStart(
                2,
                '0',
            )

        return `${year}-${month}-${day}`
    }

    // Resolve a client ID to the full name displayed throughout the dashboard.
    function getClientName(
        clientId: number,
    ): string {
        const client =
            clients.find(
                (
                    currentClient,
                ) =>
                    currentClient.id ===
                    clientId,
            )

        if (!client) {
            return 'Άγνωστος θεραπευόμενος'
        }

        return `${client.firstName} ${client.lastName}`
    }

    // Format an appointment date for the Greek dashboard UI.
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

    // Format only the appointment time shown in cards and schedule entries.
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

    // Format the current dashboard date without reading the clock during render.
    function formatCurrentDate(): string {
        return new Date(
            currentTimestamp,
        ).toLocaleDateString(
            'el-GR',
            {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            },
        )
    }

    // Convert backend appointment statuses into user-friendly Greek labels.
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

    // Map appointment statuses to their corresponding visual state.
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

    // Keep only pending requests and show the earliest appointment first.
    const pendingAppointments =
        [...appointments]
            .filter(
                (appointment) =>
                    appointment.status ===
                    'PENDING',
            )
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

    // Select today's appointments and sort them chronologically.
    const todayAppointments =
        [...appointments]
            .filter(
                (appointment) =>
                    appointment
                        .appointmentTime
                        .split('T')[0] ===
                    today,
            )
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

    // Find the nearest future appointment that has not been completed or cancelled.
    const nextAppointment =
        [...appointments]
            .filter(
                (appointment) =>
                    appointment.status !==
                    'CANCELLED' &&
                    appointment.status !==
                    'COMPLETED' &&
                    new Date(
                        appointment
                            .appointmentTime,
                    ).getTime() >=
                    currentTimestamp,
            )
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
            )[0]

    return (
        <section className="doctor-dashboard-content">
            {/* Welcome the doctor and display the date captured during dashboard loading */}
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
                        {formatCurrentDate()}
                    </strong>
                </div>
            </header>

            {/* Summarize today's workload and the most important dashboard metrics */}
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
                        {
                            todayAppointments.length
                        }
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
                        {
                            pendingAppointments.length
                        }
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
                                nextAppointment
                                    .clientId,
                            )
                            : 'Δεν υπάρχει επόμενο ραντεβού'}
                    </small>
                </article>
            </section>

            {/* Keep request errors visible without replacing successfully loaded dashboard data */}
            {error && (
                <div
                    className="dashboard-alert"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <div className="dashboard-main-grid">
                {/* Pending requests allow the doctor to confirm new appointments */}
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
                            {
                                pendingAppointments.length
                            }
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
                                Δεν υπάρχουν νέα
                                αιτήματα αυτή τη
                                στιγμή.
                            </p>
                        </div>
                    ) : (
                        <div className="dashboard-appointments">
                            {pendingAppointments.map(
                                (
                                    appointment,
                                ) => {
                                    const clientName =
                                        getClientName(
                                            appointment
                                                .clientId,
                                        )

                                    return (
                                        <article
                                            key={
                                                appointment.id
                                            }
                                            className="dashboard-appointment-card"
                                        >
                                            <div className="appointment-person">
                                                <div className="appointment-avatar">
                                                    {clientName
                                                        .charAt(
                                                            0,
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <h3>
                                                        {
                                                            clientName
                                                        }
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
                                                        onConfirmAppointment(
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
                                    )
                                },
                            )}
                        </div>
                    )}
                </section>

                {/* Show the doctor's complete appointment schedule for today */}
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
                                Δεν υπάρχουν
                                ραντεβού για σήμερα.
                            </p>
                        </div>
                    ) : (
                        <div className="today-schedule">
                            {todayAppointments.map(
                                (
                                    appointment,
                                ) => (
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
                                                    appointment
                                                        .clientId,
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

            {/* Provide direct navigation to the doctor's most common workflows */}
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
                                Προβολή και
                                διαχείριση προφίλ
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
    )
}