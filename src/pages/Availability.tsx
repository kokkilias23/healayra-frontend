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

interface DayAvailabilityForm {
    id?: number
    dayOfWeek: DayOfWeek
    label: string
    shortLabel: string
    enabled: boolean
    startTime: string
    endTime: string
}

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

    useEffect(() => {
        loadAvailability()
    }, [])

    async function loadAvailability() {
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

            const data =
                await getAvailabilityByDoctor(
                    doctorData.id,
                )

            const mergedAvailability =
                dayDefinitions.map(
                    (day) => {
                        const existing =
                            data.find(
                                (item) =>
                                    item.dayOfWeek ===
                                    day.dayOfWeek,
                            )

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

    async function handleSave() {
        if (!doctorId) {
            return
        }

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
            const savedAvailability =
                await Promise.all(
                    availability.map(
                        async (item) => {
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

    function handleLogout() {
        logout()

        navigate('/login')
    }

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

                {success && (
                    <div className="availability-alert success">
                        <span>
                            ✓
                        </span>

                        {success}
                    </div>
                )}

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