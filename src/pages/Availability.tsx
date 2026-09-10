import {
    useEffect,
    useState,
} from 'react'

import {
    useNavigate,
} from 'react-router-dom'

import logo
    from '../assets/healayra-logo.png'

import DoctorSidebar
    from '../components/client-details/DoctorSidebar'

import AvailabilityContent
    from '../components/availability/AvailabilityContent'

import type {
    DayAvailabilityForm,
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

            try {
                // Resolve the doctor profile connected to the authenticated account.
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

                // Retrieve every persisted availability record for this doctor.
                const data =
                    await getAvailabilityByDoctor(
                        doctorData.id,
                    )

                // Merge backend records with all seven weekdays so every day stays visible.
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

    // Update the shared session duration and mark the schedule as changed.
    function handleSessionDurationChange(
        duration: number,
    ) {
        setSessionDuration(
            duration,
        )

        setSuccess('')
    }

    // Validate and persist the complete weekly availability configuration.
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
            // Save all weekday records concurrently to reduce total waiting time.
            const savedAvailability =
                await Promise.all(
                    availability.map(
                        async (item) => {
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

                            // Weekdays without an ID have never been persisted.
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

            // Synchronize local schedule data with the backend responses.
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
            setSaving(false)
        }
    }

    // Clear authentication data and return to the login page.
    function handleLogout() {
        logout()

        navigate(
            '/login',
        )
    }

    const doctorEmail =
        localStorage.getItem(
            'email',
        )

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
            {/* Reuse the shared doctor navigation while preserving profile details */}
            <DoctorSidebar
                doctorEmail={
                    doctorEmail
                }
                activePage="availability"
                onLogout={
                    handleLogout
                }
                doctorName={
                    doctor
                        ? `${doctor.firstName} ${doctor.lastName}`
                        : undefined
                }
                doctorSubtitle={
                    doctor?.specialty ||
                    undefined
                }
                avatarText={
                    doctor
                        ?.firstName
                        ?.charAt(0)
                        .toUpperCase() ||
                    'D'
                }
            />

            <AvailabilityContent
                availability={
                    availability
                }
                sessionDuration={
                    sessionDuration
                }
                saving={
                    saving
                }
                error={
                    error
                }
                success={
                    success
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
                onSave={
                    handleSave
                }
            />
        </main>
    )
}