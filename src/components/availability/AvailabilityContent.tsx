import AvailabilityEditor, {
    type DayAvailabilityForm,
} from './AvailabilityEditor'

interface AvailabilityContentProps {
    availability:
        DayAvailabilityForm[]

    sessionDuration:
        number

    saving:
        boolean

    error:
        string

    success:
        string

    onSessionDurationChange:
        (duration: number) => void

    onToggleDay:
        (index: number) => void

    onTimeChange:
        (
            index: number,
            field:
                | 'startTime'
                | 'endTime',
            value: string,
        ) => void

    onSave:
        () => void
}

export default function AvailabilityContent({
                                                availability,
                                                sessionDuration,
                                                saving,
                                                error,
                                                success,
                                                onSessionDurationChange,
                                                onToggleDay,
                                                onTimeChange,
                                                onSave,
                                            }: AvailabilityContentProps) {
    // Count enabled weekdays for the schedule summary.
    const activeDays =
        availability.filter(
            (item) =>
                item.enabled,
        ).length

    return (
        <section className="availability-content">
            {/* Introduce the schedule settings and summarize the active configuration */}
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
                            {sessionDuration}
                        </strong>

                        <small>
                            λεπτά
                        </small>
                    </div>
                </div>
            </header>

            {/* AvailabilityEditor owns the complete weekly schedule controls */}
            <AvailabilityEditor
                availability={
                    availability
                }
                sessionDuration={
                    sessionDuration
                }
                onSessionDurationChange={
                    onSessionDurationChange
                }
                onToggleDay={
                    onToggleDay
                }
                onTimeChange={
                    onTimeChange
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
                    onClick={onSave}
                    disabled={saving}
                >
                    {saving
                        ? 'Αποθήκευση...'
                        : 'Αποθήκευση Αλλαγών'}
                </button>
            </div>
        </section>
    )
}