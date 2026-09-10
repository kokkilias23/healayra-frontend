import type {
    FormEvent,
} from 'react'

interface NewVisitFormProps {
    visitTime: string
    service: string
    savingVisit: boolean
    onVisitTimeChange:
        (value: string) => void
    onServiceChange:
        (value: string) => void
    onSubmit: (
        event:
        FormEvent<HTMLFormElement>,
    ) => void
    onCancel: () => void
}

export default function NewVisitForm({
                                         visitTime,
                                         service,
                                         savingVisit,
                                         onVisitTimeChange,
                                         onServiceChange,
                                         onSubmit,
                                         onCancel,
                                     }: NewVisitFormProps) {
    return (
        <form
            className="new-visit-form"
            onSubmit={onSubmit}
        >
            {/* Form title and close action */}
            <div className="form-heading">
                <div>
                    <span>
                        New Session
                    </span>

                    <h3>
                        Καταχώρηση Συνεδρίας
                    </h3>
                </div>

                <button
                    type="button"
                    className="form-close"
                    onClick={onCancel}
                    aria-label="Κλείσιμο"
                >
                    ×
                </button>
            </div>

            {/* Session date, time and service fields */}
            <div className="visit-form-grid">
                <div className="details-form-field">
                    <label htmlFor="visitTime">
                        Ημερομηνία και ώρα
                    </label>

                    <input
                        id="visitTime"
                        type="datetime-local"
                        value={visitTime}
                        onChange={(
                            event,
                        ) =>
                            onVisitTimeChange(
                                event
                                    .target
                                    .value,
                            )
                        }
                        required
                    />
                </div>

                <div className="details-form-field">
                    <label htmlFor="service">
                        Τύπος συνεδρίας
                    </label>

                    <input
                        id="service"
                        type="text"
                        placeholder="π.χ. Ατομική Συνεδρία"
                        value={service}
                        onChange={(
                            event,
                        ) =>
                            onServiceChange(
                                event
                                    .target
                                    .value,
                            )
                        }
                        required
                    />
                </div>
            </div>

            {/* Allow the doctor to cancel or save the session */}
            <div className="details-form-actions">
                <button
                    type="button"
                    className="details-cancel-button"
                    onClick={onCancel}
                >
                    Ακύρωση
                </button>

                <button
                    type="submit"
                    className="details-save-button"
                    disabled={savingVisit}
                >
                    {savingVisit
                        ? 'Αποθήκευση...'
                        : 'Αποθήκευση Συνεδρίας'}
                </button>
            </div>
        </form>
    )
}