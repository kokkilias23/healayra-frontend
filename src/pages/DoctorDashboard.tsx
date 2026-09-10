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

import DashboardContent
    from '../components/dashboard/DashboardContent'

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
} from '../types/Appointment'

import type {
    Client,
} from '../types/Client'

import type {
    Doctor,
} from '../types/Doctor'

import '../styles/DoctorDashboard.css'

export default function DoctorDashboard() {
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
        appointments,
        setAppointments,
    ] =
        useState<Appointment[]>([])

    const [
        clients,
        setClients,
    ] =
        useState<Client[]>([])

    const [
        loading,
        setLoading,
    ] =
        useState(true)

    const [
        error,
        setError,
    ] =
        useState('')

    const [
        updatingAppointmentId,
        setUpdatingAppointmentId,
    ] =
        useState<number | null>(
            null,
        )

    // Store one stable timestamp so dashboard calculations remain pure during render.
    const [
        currentTimestamp,
        setCurrentTimestamp,
    ] =
        useState(0)

    // Load the authenticated doctor's profile, appointments and clients.
    useEffect(() => {
        async function loadDashboard() {
            // Use the authenticated user's ID to resolve the linked doctor profile.
            const userId =
                localStorage.getItem(
                    'userId',
                )

            if (!userId) {
                setError(
                    'Δεν βρέθηκαν στοιχεία συνδεδεμένου γιατρού.',
                )

                setLoading(
                    false,
                )

                return
            }

            try {
                // Convert the authenticated user account into its doctor profile.
                const doctorData =
                    await getDoctorByUserId(
                        Number(userId),
                    )

                // Load appointments and clients in parallel to reduce waiting time.
                const [
                    appointmentsData,
                    clientsData,
                ] =
                    await Promise.all([
                        getAppointmentsByDoctor(
                            doctorData.id,
                        ),

                        getClients(),
                    ])

                setDoctor(
                    doctorData,
                )

                setAppointments(
                    appointmentsData,
                )

                setClients(
                    clientsData,
                )

                // Capture the clock outside render for future appointment comparisons.
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
                        'Δεν ήταν δυνατή η φόρτωση του dashboard.',
                    )
                }
            } finally {
                setLoading(
                    false,
                )
            }
        }

        loadDashboard()
    }, [])

    // Confirm a pending appointment and replace only the updated local record.
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
                (
                    currentAppointments,
                ) =>
                    currentAppointments.map(
                        (
                            appointment,
                        ) =>
                            appointment.id ===
                            appointmentId
                                ? updatedAppointment
                                : appointment,
                    ),
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
                    'Δεν ήταν δυνατή η επιβεβαίωση του ραντεβού.',
                )
            }
        } finally {
            setUpdatingAppointmentId(
                null,
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

    // Show a full-page error only when no dashboard appointment data is available.
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
            {/* Doctor navigation sidebar */}
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

                {/* Display the authenticated doctor's profile */}
                <div className="doctor-profile">
                    <div className="doctor-avatar">
                        {doctor
                                ?.firstName
                                ?.charAt(0)
                                .toUpperCase() ??
                            'D'}
                    </div>

                    <div>
                        <strong>
                            {doctor
                                ? `${doctor.firstName} ${doctor.lastName}`
                                : 'Doctor'}
                        </strong>

                        <span>
                            {doctor
                                    ?.specialty ||
                                'Επαγγελματίας Υγείας'}
                        </span>
                    </div>
                </div>

                {/* Main navigation for the doctor workspace */}
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
                        onClick={
                            handleLogout
                        }
                        className="doctor-logout"
                    >
                        <span>
                            ↪
                        </span>

                        Αποσύνδεση
                    </button>
                </div>
            </aside>

            {/* DashboardContent owns dashboard calculations and presentation */}
            <DashboardContent
                doctor={
                    doctor
                }
                appointments={
                    appointments
                }
                clients={
                    clients
                }
                error={
                    error
                }
                updatingAppointmentId={
                    updatingAppointmentId
                }
                currentTimestamp={
                    currentTimestamp
                }
                onConfirmAppointment={
                    handleConfirmAppointment
                }
            />
        </main>
    )
}