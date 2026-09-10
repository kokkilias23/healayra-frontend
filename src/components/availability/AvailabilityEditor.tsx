import type {
    DayOfWeek,
} from '../../types/Availability'

// Local UI structure used to represent one weekday in the availability editor.
export interface DayAvailabilityForm {
    id?: number
    dayOfWeek: DayOfWeek
    label: string
    shortLabel: string
    enabled: boolean
    startTime: string
    endTime: string
}

interface AvailabilityEditorProps {
    availability:
        DayAvailabilityForm[]
    sessionDuration: number
    onSessionDurationChange:
        (duration: number) => void
    onToggleDay:
        (index: number) => void
    onTimeChange: (
        index: number,
        field:
            | 'startTime'
            | 'endTime',
        value: string,
    ) => void
}

export default function AvailabilityEditor({
                                               availability,
                                               sessionDuration,
                                               onSessionDurationChange,
                                               onToggleDay,
                                               onTimeChange,
                                           }: AvailabilityEditorProps) {
    return (
        <>
            {/* Session duration determines the length of generated booking slots */}
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
                        ) =>
                            onSessionDurationChange(
                                Number(
                                    event
                                        .target
                                        .value,
                                ),
                            )
                        }
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

            {/* Introduce the weekly availability configuration */}
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

            {/* Render one availability card for each weekday */}
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

                                {/* Toggle whether this weekday accepts appointments */}
                                <button
                                    type="button"
                                    className={`availability-switch ${
                                        item.enabled
                                            ? 'enabled'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        onToggleDay(
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

                            {/* Time controls are relevant only when the weekday is enabled */}
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
                                                onTimeChange(
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
                                                onTimeChange(
                                                    index,
                                                    'endTime',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Give the doctor a compact preview of the selected hours */}
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
        </>
    )
}