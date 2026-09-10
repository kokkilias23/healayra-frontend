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

import AvailabilityEditor, {
    type DayAvailabilityForm,
} from '../components/availability/AvailabilityEditor'

import {
    getDoctorByUserId,
} from '../services/DoctorService'

import {
    createAvailability,
    getAvailabilityByDoctor,
    updateAvailability,
} from '../services/AvailabilityService'

import {
    logout,
} from '../services/AuthService'

import type {
    DayOfWeek,
} from '../types/Availability'

import type {
    Doctor,
} from '../types/Doctor'

import '../styles/DoctorDashboard.css'
import '../styles/Availability.css'

// Map backend weekday values to the labels displayed in the UI.
const dayDefinitions: {
    dayOfWeek: DayOfWeek
    label: string
    shortLabel: string
}[] = [
    {
        dayOfWeek: 'MONDAY',
        label: 'Δευτέρα',
        shortLabel: 'ΔΕΥ',
    },
    {
        dayOfWeek: 'TUESDAY',
        label: 'Τρίτη',
        shortLabel: 'ΤΡΙ',
    },
    {
        dayOfWeek: 'WEDNESDAY',
        label: 'Τετάρτη',
        shortLabel: 'ΤΕΤ',
    },
    {
        dayOfWeek: 'THURSDAY',
        label: 'Πέμπτη',
        shortLabel: 'ΠΕΜ',
    },
    {
        dayOfWeek: 'FRIDAY',
        label: 'Παρασκευή',
        shortLabel: 'ΠΑΡ',
    },
    {
        dayOfWeek: 'SATURDAY',
        label: 'Σάββατο',
        shortLabel: 'ΣΑΒ',
    },
    {
        dayOfWeek: 'SUNDAY',
        label: 'Κυριακή',
        shortLabel: 'ΚΥΡ',
    },
]

// Create the complete default week before saved backend records are loaded.
function createInitialAvailability():
    DayAvailabilityForm[] {
    return dayDefinitions.map(
        (day) => ({
            ...day,
            enabled: false,
            startTime: '09:00',
            endTime: '17:00',
        }),
    )
}

export default function Availability() {
    const navigate =
        useNavigate()

    const [
        availability,
        setAvailability,
    ] =
        useState<
            DayAvailabilityForm[]
        >(
            createInitialAvailability(),
        )

    const [
        sessionDuration,
        setSessionDuration,
    ] =
        useState(50)

    const [
        doctorId,
        setDoctorId,
    ] =
        useState<number | null>(
            null,
        )

    const [
        doctor,
        setDoctor,
    ] =
        useState<Doctor | null>(
            null,
        )

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
        useState('')

    // Load the authenticated doctor and weekly availability when the page opens.
    useEffect(() => {
        async function loadAvailability() {
            // The authenticated account ID is stored locally after login.
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
                // Convert the authenticated user account into its linked doctor profile.
                const doctorData =
                    await getDoctorByUserId(
                        Number(userId),
                    )

                setDoctor(
                    doctorData,
                )

                setDoctorId(
                    doctorData.id,
                )

                // Retrieve every saved availability record for this doctor.
                const data =
                    await getAvailabilityByDoctor(
                        doctorData.id,
                    )

                // Merge backend records with all seven weekdays so every day remains visible.
                const mergedAvailability =
                    dayDefinitions.map(
                        (day) => {
                            const existing =
                                data.find(
                                    (
                                        item,
                                    ) =>
                                        item.dayOfWeek ===
                                        day.dayOfWeek,
                                )

                            // Days that have never been saved use disabled default working hours.
                            if (!existing) {
                                return {
                                    ...day,
                                    enabled:
                                        false,
                                    startTime:
                                        '09:00',
                                    endTime:
                                        '17:00',
                                }
                            }

                            return {
                                id:
                                existing.id,

                                dayOfWeek:
                                existing.dayOfWeek,

                                label:
                                day.label,

                                shortLabel:
                                day.shortLabel,

                                enabled:
                                existing.enabled,

                                startTime:
                                    existing.startTime
                                        .slice(
                                            0,
                                            5,
                                        ),

                                endTime:
                                    existing.endTime
                                        .slice(
                                            0,
                                            5,
                                        ),
                            }
                        },
                    )

                setAvailability(
                    mergedAvailability,
                )

                // Session duration is shared across the doctor's weekly records.
                if (
                    data.length > 0
                ) {
                    setSessionDuration(
                        data[0]
                            .sessionDuration,
                    )
                }
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

        loadAvailability()
    }, [])

    // Enable or disable one weekday without mutating the remaining schedule.
    function handleToggleDay(
        index: number,
    ) {
        setAvailability(
            (
                currentAvailability,
            ) =>
                currentAvailability.map(
                    (
                        item,
                        currentIndex,
                    ) =>
                        currentIndex ===
                        index
                            ? {
                                ...item,

                                enabled:
                                    !item.enabled,
                            }
                            : item,
                ),
        )

        setSuccess('')
    }

    // Update either the start or end time for one specific weekday.
    function handleTimeChange(
        index: number,
        field:
            | 'startTime'
            | 'endTime',
        value: string,
    ) {
        setAvailability(
            (
                currentAvailability,
            ) =>
                currentAvailability.map(
                    (
                        item,
                        currentIndex,
                    ) =>
                        currentIndex ===
                        index
                            ? {
                                ...item,

                                [field]:
                                value,
                            }
                            : item,
                ),
        )

        setSuccess('')
    }

    // Update the shared session duration and mark the current schedule as changed.
    function handleSessionDurationChange(
        duration: number,
    ) {
        setSessionDuration(
            duration,
        )

        setSuccess('')
    }

    // Validate and save the complete weekly availability configuration.
    async function handleSave() {
        if (!doctorId) {
            return
        }

        // Validate working hours only for weekdays that currently accept appointments.
        const invalidDay =
            availability.find(
                (item) =>
                    item.enabled &&
                    item.startTime >=
                    item.endTime,
            )

        if (invalidDay) {
            setError(
                `Η ώρα έναρξης πρέπει να είναι πριν από την ώρα λήξης για: ${invalidDay.label}`,
            )

            return
        }

        setSaving(true)
        setError('')
        setSuccess('')

        try {
            // Save all weekday records concurrently to reduce total waiting time.
            const savedAvailability =
                await Promise.all(
                    availability.map(
                        async (
                            item,
                        ) => {
                            // Existing records are updated when a backend ID is already known.
                            if (item.id) {
                                return updateAvailability(
                                    item.id,
                                    {
                                        startTime:
                                        item.startTime,

                                        endTime:
                                        item.endTime,

                                        sessionDuration,

                                        enabled:
                                        item.enabled,
                                    },
                                )
                            }

                            // Weekdays without an ID have never been persisted and must be created.
                            return createAvailability(
                                {
                                    doctorId,

                                    dayOfWeek:
                                    item.dayOfWeek,

                                    startTime:
                                    item.startTime,

                                    endTime:
                                    item.endTime,

                                    sessionDuration,

                                    enabled:
                                    item.enabled,
                                },
                            )
                        },
                    ),
                )

            // Synchronize local IDs, enabled state and times with backend responses.
            setAvailability(
                (
                    currentAvailability,
                ) =>
                    currentAvailability.map(
                        (item) => {
                            const saved =
                                savedAvailability.find(
                                    (
                                        savedItem,
                                    ) =>
                                        savedItem.dayOfWeek ===
                                        item.dayOfWeek,
                                )

                            if (!saved) {
                                return item
                            }

                            return {
                                ...item,

                                id:
                                saved.id,

                                enabled:
                                saved.enabled,

                                startTime:
                                    saved.startTime
                                        .slice(
                                            0,
                                            5,
                                        ),

                                endTime:
                                    saved.endTime
                                        .slice(
                                            0,
                                            5,
                                        ),
                            }
                        },
                    ),
            )

            setSuccess(
                'Η διαθεσιμότητα αποθηκεύτηκε επιτυχώς.',
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
                    'Δεν ήταν δυνατή η αποθήκευση της διαθεσιμότητας.',
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

    // Count enabled weekdays for the summary displayed at the top of the page.
    const activeDays =
        availability.filter(
            (item) =>
                item.enabled,
        ).length

    if (loading) {
        return (
            <main className="availability-loading">
                <img
                    src={logo}
                    alt="Healayra"
                />

                <p>
                    Φόρτωση διαθεσιμότητας...
                </p>
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

                {/* Display the authenticated doctor's profile information */}
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

                <nav className="doctor-menu">
                    <Link
                        to="/doctor/dashboard"
                        className="doctor-menu-link"
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
                        className="doctor-menu-link active"
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

            {/* Main availability settings content */}
            <section className="availability-content">
                <header className="availability-header">
                    <div>
                        <span className="availability-eyebrow">
                            Schedule Settings
                        </span>

                        <h1>
                            Διαθεσιμότητα
                        </h1>

                        <p>
                            Ορίστε τις ημέρες και
                            ώρες στις οποίες μπορούν
                            να κλείνουν ραντεβού οι
                            θεραπευόμενοι.
                        </p>
                    </div>

                    {/* Quick summary of the current weekly schedule */}
                    <div className="availability-summary">
                        <div>
                            <span>
                                Ενεργές ημέρες
                            </span>

                            <strong>
                                {activeDays}
                            </strong>

                            <small>
                                από 7 ημέρες
                            </small>
                        </div>

                        <div>
                            <span>
                                Συνεδρία
                            </span>

                            <strong>
                                {
                                    sessionDuration
                                }
                            </strong>

                            <small>
                                λεπτά
                            </small>
                        </div>
                    </div>
                </header>

                {/* AvailabilityEditor owns the complete weekly schedule UI */}
                <AvailabilityEditor
                    availability={
                        availability
                    }
                    sessionDuration={
                        sessionDuration
                    }
                    onSessionDurationChange={
                        handleSessionDurationChange
                    }
                    onToggleDay={
                        handleToggleDay
                    }
                    onTimeChange={
                        handleTimeChange
                    }
                />

                {/* Display validation or backend errors without leaving the page */}
                {error && (
                    <div
                        className="availability-alert error"
                        role="alert"
                    >
                        <span>
                            !
                        </span>

                        {error}
                    </div>
                )}

                {/* Confirm that the latest schedule was successfully persisted */}
                {success && (
                    <div className="availability-alert success">
                        <span>
                            ✓
                        </span>

                        {success}
                    </div>
                )}

                {/* Persist all current local schedule changes */}
                <div className="availability-save-bar">
                    <div>
                        <strong>
                            Εβδομαδιαία
                            διαθεσιμότητα
                        </strong>

                        <span>
                            Οι αλλαγές εφαρμόζονται
                            μετά την αποθήκευση.
                        </span>
                    </div>

                    <button
                        type="button"
                        className="save-availability-btn"
                        onClick={
                            handleSave
                        }
                        disabled={
                            saving
                        }
                    >
                        {saving
                            ? 'Αποθήκευση...'
                            : 'Αποθήκευση Αλλαγών'}
                    </button>
                </div>
            </section>
        </main>
    )
}