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

// Local form structure used to represent one weekday in the availability editor.
interface DayAvailabilityForm {
    id?: number
    dayOfWeek: DayOfWeek
    label: string
    shortLabel: string
    enabled: boolean
    startTime: string
    endTime: string
}

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

// Create the default weekly schedule before saved backend data is loaded.
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
    ] = useState<DayAvailabilityForm[]>(
        createInitialAvailability(),
    )

    const [
        sessionDuration,
        setSessionDuration,
    ] = useState(50)

    const [
        doctorId,
        setDoctorId,
    ] = useState<number | null>(null)

    const [
        doctor,
        setDoctor,
    ] = useState<Doctor | null>(null)

    const [loading, setLoading] =
        useState(true)

    const [saving, setSaving] =
        useState(false)

    const [error, setError] =
        useState('')

    const [success, setSuccess] =
        useState('')

    // Load the doctor's saved availability when the page is first rendered.
    useEffect(() => {
        loadAvailability()
    }, [])

    // Resolve the authenticated doctor and load the weekly schedule from the backend.
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

            setLoading(false)

            return
        }

        setLoading(true)
        setError('')

        try {
            // Convert the logged-in user account into its linked doctor profile.
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

            // Load all saved availability records for this doctor.
            const data =
                await getAvailabilityByDoctor(
                    doctorData.id,
                )

            // Merge backend records with all seven weekdays so every day appears in the UI.
            const mergedAvailability =
                dayDefinitions.map(
                    (day) => {
                        const existing =
                            data.find(
                                (item) =>
                                    item.dayOfWeek ===
                                    day.dayOfWeek,
                            )

                        // Days not yet saved in the backend start disabled with default hours.
                        if (!existing) {
                            return {
                                ...day,
                                enabled: false,
                                startTime: '09:00',
                                endTime: '17:00',
                            }
                        }

                        return {
                            id: existing.id,
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
                                    .slice(0, 5),
                            endTime:
                                existing.endTime
                                    .slice(0, 5),
                        }
                    },
                )

            setAvailability(
                mergedAvailability,
            )

            // Session duration is shared across the doctor's weekly availability records.
            if (data.length > 0) {
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
            setLoading(false)
        }
    }

    // Enable or disable a single weekday without mutating the other days.
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

    // Update either the start or end time for one weekday.
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

    // Validate and save the complete weekly availability configuration.
    async function handleSave() {
        if (!doctorId) {
            return
        }

        // Validate time ranges only for weekdays that are currently enabled.
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
            // Save all weekdays concurrently to reduce the total waiting time.
            const savedAvailability =
                await Promise.all(
                    availability.map(
                        async (item) => {
                            // Existing backend records are updated when an ID already exists.
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

                            // Weekdays without an ID have not been saved yet and must be created.
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

            // Synchronize the local state with the records returned by the backend.
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
                                id: saved.id,
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
            setSaving(false)
        }
    }

    // Clear authentication data and return the user to the login page.
    function handleLogout() {
        logout()

        navigate('/login')
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

                <div className="doctor-profile">
                    <div className="doctor-avatar">
                        {doctor?.firstName
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
                            {doctor?.specialty ||
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

                    {/* Quick summary of active days and session duration */}
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
                                {sessionDuration}
                            </strong>

                            <small>
                                λεπτά
                            </small>
                        </div>
                    </div>
                </header>

                {/* Session duration used to calculate available booking slots */}
                <section className="duration-card">
                    <div className="duration-info">
                        <div className="duration-icon">
                            ◷
                        </div>

                        <div>
                            <span className="duration-label">
                                Session Duration
                            </span>

                            <h2>
                                Διάρκεια συνεδρίας
                            </h2>

                            <p>
                                Η διάρκεια χρησιμοποιείται
                                για τον υπολογισμό των
                                διαθέσιμων slots.
                            </p>
                        </div>
                    </div>

                    <div className="duration-select-wrapper">
                        <select
                            id="session-duration"
                            aria-label="Διάρκεια συνεδρίας"
                            value={
                                sessionDuration
                            }
                            onChange={(
                                event,
                            ) => {
                                setSessionDuration(
                                    Number(
                                        event
                                            .target
                                            .value,
                                    ),
                                )

                                setSuccess('')
                            }}
                        >
                            <option value={30}>
                                30 λεπτά
                            </option>

                            <option value={45}>
                                45 λεπτά
                            </option>

                            <option value={50}>
                                50 λεπτά
                            </option>

                            <option value={60}>
                                60 λεπτά
                            </option>

                            <option value={90}>
                                90 λεπτά
                            </option>
                        </select>
                    </div>
                </section>

                <div className="availability-section-heading">
                    <div>
                        <span>
                            Weekly Schedule
                        </span>

                        <h2>
                            Εβδομαδιαίο Πρόγραμμα
                        </h2>

                        <p>
                            Ενεργοποιήστε τις ημέρες
                            που δέχεστε ραντεβού και
                            ορίστε το ωράριό σας.
                        </p>
                    </div>
                </div>

                {/* Weekly availability editor */}
                <section className="availability-list">
                    {availability.map(
                        (
                            item,
                            index,
                        ) => (
                            <article
                                key={
                                    item.dayOfWeek
                                }
                                className={`availability-card ${
                                    item.enabled
                                        ? 'active'
                                        : 'inactive'
                                }`}
                            >
                                <div className="availability-day">
                                    <div className="availability-day-info">
                                        <div className="availability-day-icon">
                                            {
                                                item.shortLabel
                                            }
                                        </div>

                                        <div>
                                            <h2>
                                                {
                                                    item.label
                                                }
                                            </h2>

                                            <span>
                                                {item.enabled
                                                    ? 'Διαθέσιμη για ραντεβού'
                                                    : 'Μη διαθέσιμη ημέρα'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className={`availability-switch ${
                                            item.enabled
                                                ? 'enabled'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            handleToggleDay(
                                                index,
                                            )
                                        }
                                        aria-pressed={
                                            item.enabled
                                        }
                                    >
                                        <span className="switch-track">
                                            <span className="switch-circle" />
                                        </span>

                                        <span className="switch-label">
                                            {item.enabled
                                                ? 'Ενεργή'
                                                : 'Ανενεργή'}
                                        </span>
                                    </button>
                                </div>

                                {/* Time controls are visible only for enabled weekdays */}
                                {item.enabled && (
                                    <div className="time-range">
                                        <div className="time-field">
                                            <label
                                                htmlFor={`start-${index}`}
                                            >
                                                <span>
                                                    Από
                                                </span>

                                                Ώρα έναρξης
                                            </label>

                                            <input
                                                id={`start-${index}`}
                                                type="time"
                                                value={
                                                    item.startTime
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    handleTimeChange(
                                                        index,
                                                        'startTime',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="time-separator">
                                            →
                                        </div>

                                        <div className="time-field">
                                            <label
                                                htmlFor={`end-${index}`}
                                            >
                                                <span>
                                                    Έως
                                                </span>

                                                Ώρα λήξης
                                            </label>

                                            <input
                                                id={`end-${index}`}
                                                type="time"
                                                value={
                                                    item.endTime
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    handleTimeChange(
                                                        index,
                                                        'endTime',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="availability-hours-preview">
                                            <span>
                                                Ωράριο
                                            </span>

                                            <strong>
                                                {
                                                    item.startTime
                                                }
                                                {' – '}
                                                {
                                                    item.endTime
                                                }
                                            </strong>
                                        </div>
                                    </div>
                                )}
                            </article>
                        ),
                    )}
                </section>

                {/* Error message returned by validation or backend requests */}
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

                {/* Confirmation shown after a successful save */}
                {success && (
                    <div className="availability-alert success">
                        <span>
                            ✓
                        </span>

                        {success}
                    </div>
                )}

                {/* Save bar applies the current local changes to the backend */}
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