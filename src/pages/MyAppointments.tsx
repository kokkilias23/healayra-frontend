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

import AppointmentsContent
    from '../components/appointments/AppointmentsContent'

import {
    getMyAppointments,
} from '../services/AppointmentService'

import {
    logout,
} from '../services/AuthService'

import type {
    Appointment,
} from '../types/Appointment'

import '../styles/MyAppointments.css'

export default function MyAppointments() {
    const navigate =
        useNavigate()

    const [
        appointments,
        setAppointments,
    ] =
        useState<Appointment[]>(
            [],
        )

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

    // Store one stable timestamp so appointment filtering remains pure during render.
    const [
        currentTimestamp,
        setCurrentTimestamp,
    ] =
        useState(0)

    // Load the authenticated client's appointments when the page first opens.
    useEffect(() => {
        async function loadAppointments() {
            try {
                const data =
                    await getMyAppointments()

                // Keep the main collection ordered from newest to oldest.
                const sortedAppointments =
                    [...data].sort(
                        (
                            first,
                            second,
                        ) =>
                            new Date(
                                second
                                    .appointmentTime,
                            ).getTime() -
                            new Date(
                                first
                                    .appointmentTime,
                            ).getTime(),
                    )

                setAppointments(
                    sortedAppointments,
                )

                // Capture the current time outside render for upcoming appointment checks.
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
                        'Δεν ήταν δυνατή η φόρτωση των ραντεβού.',
                    )
                }
            } finally {
                setLoading(
                    false,
                )
            }
        }

        loadAppointments()
    }, [])

    // Clear authentication data and return to the login page.
    function handleLogout() {
        logout()

        navigate(
            '/login',
        )
    }

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

                    <Link to="/booking">
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

            {/* AppointmentsContent owns filtering, status presentation and appointment lists */}
            <AppointmentsContent
                appointments={
                    appointments
                }
                error={
                    error
                }
                currentTimestamp={
                    currentTimestamp
                }
            />
        </main>
    )
}