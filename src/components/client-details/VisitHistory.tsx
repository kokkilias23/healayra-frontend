import type {
    FormEvent,
} from 'react'

import type {
    Visit,
} from '../../types/Visit'

import type {
    Note,
} from '../../types/Note'

interface VisitHistoryProps {
    visits: Visit[]
    notesByVisit:
        Record<number, Note[]>
    activeNoteVisitId:
        number | null
    noteText: string
    savingNote: boolean
    onOpenNoteForm:
        (visitId: number) => void
    onCloseNoteForm:
        () => void
    onNoteTextChange:
        (value: string) => void
    onCreateNote: (
        event:
        FormEvent<HTMLFormElement>,
        visitId: number,
    ) => void
}

export default function VisitHistory({
                                         visits,
                                         notesByVisit,
                                         activeNoteVisitId,
                                         noteText,
                                         savingNote,
                                         onOpenNoteForm,
                                         onCloseNoteForm,
                                         onNoteTextChange,
                                         onCreateNote,
                                     }: VisitHistoryProps) {
    // Format visit timestamps using the Greek locale.
    function formatVisitDate(
        visitTime: string,
    ): string {
        return new Date(
            visitTime,
        ).toLocaleString(
            'el-GR',
            {
                dateStyle: 'medium',
                timeStyle: 'short',
            },
        )
    }

    // Notes use a more compact timestamp than visit headers.
    function formatNoteDate(
        createdAt: string,
    ): string {
        return new Date(
            createdAt,
        ).toLocaleString(
            'el-GR',
            {
                dateStyle: 'short',
                timeStyle: 'short',
            },
        )
    }

    // Show an empty state until the client has at least one recorded visit.
    if (visits.length === 0) {
        return (
            <section className="client-history">
                <div className="history-empty">
                    <div className="history-empty-icon">
                        ◷
                    </div>

                    <h3>
                        Δεν υπάρχουν συνεδρίες
                    </h3>

                    <p>
                        Η πρώτη συνεδρία
                        μπορεί να προστεθεί
                        από το κουμπί
                        «Νέα Συνεδρία».
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="client-history">
            <div className="visit-list">
                {visits.map(
                    (
                        visit,
                        index,
                    ) => {
                        // Read only the notes associated with the current visit.
                        const visitNotes =
                            notesByVisit[
                                visit.id
                                ] ?? []

                        return (
                            <article
                                key={
                                    visit.id
                                }
                                className="visit-card"
                            >
                                {/* Number visits according to their position in the history */}
                                <div className="visit-timeline">
                                    <div className="visit-number">
                                        {
                                            visits.length -
                                            index
                                        }
                                    </div>

                                    <div className="visit-timeline-line" />
                                </div>

                                <div className="visit-card-content">
                                    {/* Visit summary and action for adding a private note */}
                                    <header className="visit-header">
                                        <div>
                                            <span className="visit-date">
                                                {formatVisitDate(
                                                    visit.visitTime,
                                                )}
                                            </span>

                                            <h3>
                                                {
                                                    visit.service
                                                }
                                            </h3>
                                        </div>

                                        <button
                                            type="button"
                                            className="add-note-button"
                                            onClick={() =>
                                                onOpenNoteForm(
                                                    visit.id,
                                                )
                                            }
                                        >
                                            <span>
                                                +
                                            </span>

                                            Σημείωση
                                        </button>
                                    </header>

                                    {/* Only the selected visit displays its note form */}
                                    {activeNoteVisitId ===
                                        visit.id && (
                                            <form
                                                className="new-note-form"
                                                onSubmit={(
                                                    event,
                                                ) =>
                                                    onCreateNote(
                                                        event,
                                                        visit.id,
                                                    )
                                                }
                                            >
                                                <div className="note-form-heading">
                                                    <div>
                                                    <span>
                                                        PRIVATE NOTE
                                                    </span>

                                                        <h4>
                                                            Νέα θεραπευτική
                                                            σημείωση
                                                        </h4>
                                                    </div>
                                                </div>

                                                <textarea
                                                    rows={5}
                                                    placeholder="Γράψτε τη σημείωση για τη συνεδρία..."
                                                    value={
                                                        noteText
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        onNoteTextChange(
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    required
                                                />

                                                <div className="details-form-actions">
                                                    <button
                                                        type="button"
                                                        className="details-cancel-button"
                                                        onClick={
                                                            onCloseNoteForm
                                                        }
                                                    >
                                                        Ακύρωση
                                                    </button>

                                                    <button
                                                        type="submit"
                                                        className="details-save-button"
                                                        disabled={
                                                            savingNote
                                                        }
                                                    >
                                                        {savingNote
                                                            ? 'Αποθήκευση...'
                                                            : 'Αποθήκευση Σημείωσης'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                    {/* Display all private notes stored for this visit */}
                                    <div className="visit-notes-section">
                                        <div className="visit-notes-heading">
                                            <span>
                                                Σημειώσεις
                                            </span>

                                            <span className="notes-count">
                                                {
                                                    visitNotes.length
                                                }
                                            </span>
                                        </div>

                                        {visitNotes.length ===
                                        0 ? (
                                            <div className="no-visit-notes">
                                                Δεν υπάρχουν
                                                σημειώσεις για
                                                αυτή τη συνεδρία.
                                            </div>
                                        ) : (
                                            <div className="visit-notes-list">
                                                {visitNotes.map(
                                                    (
                                                        note,
                                                    ) => (
                                                        <div
                                                            key={
                                                                note.id
                                                            }
                                                            className="visit-note"
                                                        >
                                                            <div className="note-mark">
                                                                “
                                                            </div>

                                                            <div>
                                                                <p>
                                                                    {
                                                                        note.content
                                                                    }
                                                                </p>

                                                                <small>
                                                                    {formatNoteDate(
                                                                        note.createdAt,
                                                                    )}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        )
                    },
                )}
            </div>
        </section>
    )
}