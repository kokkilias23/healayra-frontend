import DatePicker
    from 'react-datepicker'

import type {
    Availability,
    DayOfWeek,
} from '../../types/Availability'

// Services currently available for appointment booking.
const services = [
    {
        name:
            'Πρώτη Αξιολογητική Συνεδρία',

        description:
            'Μια πρώτη συνάντηση γνωριμίας και αξιολόγησης των αναγκών σας.',

        icon:
            '○',
    },
    {
        name:
            'Ατομική Συνεδρία',

        description:
            'Προσωπική θεραπευτική συνεδρία σε ένα ασφαλές περιβάλλον.',

        icon:
            '◡',
    },
    {
        name:
            'Online Συνεδρία',

        description:
            'Συνεδρία εξ αποστάσεως με άνεση και ευελιξία.',

        icon:
            '⌁',
    },
]

// Map JavaScript weekday numbers to the backend DayOfWeek values.
const dayOfWeekMap:
    Record<number, DayOfWeek> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
}

interface BookingStepsProps {
    availability:
        Availability[]
    selectedService:
        string
    selectedDate:
        Date | null
    selectedTime:
        string
    saving:
        boolean
    success:
        boolean
    currentTimestamp:
        number
    onServiceChange:
        (service: string) => void
    onDateChange:
        (date: Date | null) => void
    onTimeChange:
        (time: string) => void
    onBooking:
        () => void
}

export default function BookingSteps({
                                         availability,
                                         selectedService,
                                         selectedDate,
                                         selectedTime,
                                         saving,
                                         success,
                                         currentTimestamp,
                                         onServiceChange,
                                         onDateChange,
                                         onTimeChange,
                                         onBooking,
                                     }: BookingStepsProps) {
    // Find the enabled availability record matching the selected calendar date.
    function getAvailabilityForDate(
        date: Date,
    ): Availability | undefined {
        const dayOfWeek =
            dayOfWeekMap[
                date.getDay()
                ]

        return availability.find(
            (item) =>
                item.dayOfWeek ===
                dayOfWeek &&
                item.enabled,
        )
    }

    // Allow the calendar to select only weekdays when the doctor is available.
    function isAvailableDate(
        date: Date,
    ): boolean {
        return Boolean(
            getAvailabilityForDate(
                date,
            ),
        )
    }

    // Convert an HH:mm time value into total minutes.
    function timeToMinutes(
        time: string,
    ): number {
        const [
            hours,
            minutes,
        ] =
            time
                .split(':')
                .map(Number)

        return (
            hours * 60 +
            minutes
        )
    }

    // Convert total minutes back into HH:mm format.
    function minutesToTime(
        totalMinutes: number,
    ): string {
        const hours =
            Math.floor(
                totalMinutes / 60,
            )

        const minutes =
            totalMinutes % 60

        return (
            `${String(hours)
                .padStart(
                    2,
                    '0',
                )}:` +
            `${String(minutes)
                .padStart(
                    2,
                    '0',
                )}`
        )
    }

    // Combine one calendar date and one time slot into a local Date object.
    function combineDateAndTime(
        date: Date,
        time: string,
    ): Date {
        const [
            hours,
            minutes,
        ] =
            time
                .split(':')
                .map(Number)

        const result =
            new Date(date)

        result.setHours(
            hours,
            minutes,
            0,
            0,
        )

        return result
    }

    // Generate appointment slots from working hours and the configured session duration.
    function getTimeSlots():
        string[] {
        if (!selectedDate) {
            return []
        }

        const dayAvailability =
            getAvailabilityForDate(
                selectedDate,
            )

        if (!dayAvailability) {
            return []
        }

        const startMinutes =
            timeToMinutes(
                dayAvailability
                    .startTime,
            )

        const endMinutes =
            timeToMinutes(
                dayAvailability
                    .endTime,
            )

        const duration =
            dayAvailability
                .sessionDuration

        const slots:
            string[] = []

        for (
            let current =
                startMinutes;
            current + duration <=
            endMinutes;
            current += duration
        ) {
            const time =
                minutesToTime(
                    current,
                )

            const slotDate =
                combineDateAndTime(
                    selectedDate,
                    time,
                )

            // Do not display slots that had already passed when booking data loaded.
            if (
                slotDate.getTime() >
                currentTimestamp
            ) {
                slots.push(
                    time,
                )
            }
        }

        return slots
    }

    // Recalculate the available time slots from the current date selection.
    const timeSlots =
        getTimeSlots()

    return (
        <section className="booking-main">
            {/* Step 1: Select the type of therapeutic session */}
            <article className="booking-step">
                <div className="booking-step-header">
                    <span className="booking-step-number">
                        01
                    </span>

                    <div>
                        <span className="booking-step-label">
                            Service
                        </span>

                        <h2>
                            Επιλέξτε υπηρεσία
                        </h2>

                        <p>
                            Ποιος τύπος
                            συνεδρίας σας
                            ενδιαφέρει;
                        </p>
                    </div>
                </div>

                <div className="booking-services">
                    {services.map(
                        (
                            service,
                        ) => (
                            <button
                                key={
                                    service.name
                                }
                                type="button"
                                onClick={() =>
                                    onServiceChange(
                                        service.name,
                                    )
                                }
                                className={`service-booking-card ${
                                    selectedService ===
                                    service.name
                                        ? 'selected'
                                        : ''
                                }`}
                            >
                                <span className="service-booking-icon">
                                    {
                                        service.icon
                                    }
                                </span>

                                <span className="service-booking-content">
                                    <strong>
                                        {
                                            service.name
                                        }
                                    </strong>

                                    <small>
                                        {
                                            service.description
                                        }
                                    </small>
                                </span>

                                <span className="service-booking-check">
                                    {selectedService ===
                                    service.name
                                        ? '✓'
                                        : '○'}
                                </span>
                            </button>
                        ),
                    )}
                </div>
            </article>

            {/* Step 2: Select only a date when the professional is available */}
            {selectedService && (
                <article className="booking-step">
                    <div className="booking-step-header">
                        <span className="booking-step-number">
                            02
                        </span>

                        <div>
                            <span className="booking-step-label">
                                Date
                            </span>

                            <h2>
                                Επιλέξτε
                                ημερομηνία
                            </h2>

                            <p>
                                Εμφανίζονται μόνο
                                οι ημέρες που ο
                                επαγγελματίας είναι
                                διαθέσιμος.
                            </p>
                        </div>
                    </div>

                    <div className="booking-datepicker-wrapper">
                        <DatePicker
                            selected={
                                selectedDate
                            }
                            onChange={(
                                date:
                                    Date | null,
                            ) =>
                                onDateChange(
                                    date,
                                )
                            }
                            minDate={
                                new Date(
                                    currentTimestamp,
                                )
                            }
                            filterDate={
                                isAvailableDate
                            }
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Επιλέξτε διαθέσιμη ημερομηνία"
                        />

                        <span className="datepicker-help">
                            ◷ Επιλέξτε μία
                            διαθέσιμη ημέρα
                        </span>
                    </div>
                </article>
            )}

            {/* Step 3: Select one generated appointment slot */}
            {selectedDate && (
                <article className="booking-step">
                    <div className="booking-step-header">
                        <span className="booking-step-number">
                            03
                        </span>

                        <div>
                            <span className="booking-step-label">
                                Time
                            </span>

                            <h2>
                                Επιλέξτε ώρα
                            </h2>

                            <p>
                                Διαθέσιμα slots
                                για την επιλεγμένη
                                ημέρα.
                            </p>
                        </div>
                    </div>

                    {timeSlots.length ===
                    0 ? (
                        <div className="no-time-slots">
                            <span>
                                ◷
                            </span>

                            <div>
                                <strong>
                                    Δεν υπάρχουν
                                    διαθέσιμες ώρες
                                </strong>

                                <p>
                                    Επιλέξτε άλλη
                                    ημερομηνία.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="booking-time-grid">
                            {timeSlots.map(
                                (
                                    time,
                                ) => (
                                    <button
                                        key={
                                            time
                                        }
                                        type="button"
                                        onClick={() =>
                                            onTimeChange(
                                                time,
                                            )
                                        }
                                        className={`booking-time-slot ${
                                            selectedTime ===
                                            time
                                                ? 'selected'
                                                : ''
                                        }`}
                                    >
                                        <span>
                                            ◷
                                        </span>

                                        {time}
                                    </button>
                                ),
                            )}
                        </div>
                    )}
                </article>
            )}

            {/* Step 4: Review the complete appointment before sending it */}
            {selectedService &&
                selectedDate &&
                selectedTime && (
                    <article className="booking-step booking-confirmation">
                        <div className="booking-step-header">
                        <span className="booking-step-number">
                            04
                        </span>

                            <div>
                            <span className="booking-step-label">
                                Confirmation
                            </span>

                                <h2>
                                    Επιβεβαίωση
                                    Ραντεβού
                                </h2>

                                <p>
                                    Ελέγξτε τα
                                    στοιχεία πριν
                                    την οριστική
                                    καταχώρηση.
                                </p>
                            </div>
                        </div>

                        <div className="confirmation-details">
                            <div>
                            <span>
                                Υπηρεσία
                            </span>

                                <strong>
                                    {
                                        selectedService
                                    }
                                </strong>
                            </div>

                            <div>
                            <span>
                                Ημερομηνία
                            </span>

                                <strong>
                                    {selectedDate
                                        .toLocaleDateString(
                                            'el-GR',
                                            {
                                                weekday:
                                                    'long',

                                                day:
                                                    'numeric',

                                                month:
                                                    'long',
                                            },
                                        )}
                                </strong>
                            </div>

                            <div>
                            <span>
                                Ώρα
                            </span>

                                <strong>
                                    {
                                        selectedTime
                                    }
                                </strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="confirm-booking-btn"
                            onClick={
                                onBooking
                            }
                            disabled={
                                saving ||
                                success
                            }
                        >
                            {saving
                                ? 'Καταχώρηση...'
                                : success
                                    ? '✓ Το ραντεβού καταχωρήθηκε'
                                    : 'Επιβεβαίωση Ραντεβού'}
                        </button>
                    </article>
                )}
        </section>
    )
}