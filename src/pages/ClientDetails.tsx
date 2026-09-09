import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'

import {
    Link,
    useNavigate,
    useParams,
} from 'react-router-dom'

import logo from '../assets/healayra-logo.png'

import {
    getClientById,
} from '../services/ClientService'

import {
    createVisit,
    getVisitsByClient,
} from '../services/VisitService'

import {
    getDoctorByUserId,
} from '../services/DoctorService'

import {
    createNote,
    getNotesByVisit,
} from '../services/NoteService'

import {
    logout,
} from '../services/AuthService'

import type {
    Client,
} from '../types/Client'

import type {
    Visit,
} from '../types/Visit'

import type {
    Note,
} from '../types/Note'

import '../styles/DoctorDashboard.css'
import '../styles/ClientDetails.css'

export default function ClientDetails() {
    const { id } = useParams()

    const navigate = useNavigate()

    const [client, setClient] =
        useState<Client | null>(null)

    const [visits, setVisits] =
        useState<Visit[]>([])

    const [
        notesByVisit,
        setNotesByVisit,
    ] = useState<Record<number, Note[]>>({})

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [
        showVisitForm,
        setShowVisitForm,
    ] = useState(false)

    const [
        visitTime,
        setVisitTime,
    ] = useState('')

    const [service, setService] =
        useState('')

    const [
        savingVisit,
        setSavingVisit,
    ] = useState(false)

    const [
        activeNoteVisitId,
        setActiveNoteVisitId,
    ] = useState<number | null>(null)

    const [
        noteText,
        setNoteText,
    ] = useState('')

    const [
        savingNote,
        setSavingNote,
    ] = useState(false)

    useEffect(() => {
        if (!id) {
            setError(
                'Δεν βρέθηκε αναγνωριστικό θεραπευόμενου.',
            )

            setLoading(false)

            return
        }

        loadClientDetails(
            Number(id),
        )
    }, [id])

    async function loadClientDetails(
        clientId: number,
    ) {
        setLoading(true)
        setError('')

        try {
            const [
                clientData,
                visitsData,
            ] = await Promise.all([
                getClientById(clientId),
                getVisitsByClient(clientId),
            ])

            setClient(clientData)
            setVisits(visitsData)

            const notesEntries =
                await Promise.all(
                    visitsData.map(
                        async (visit) => {
                            const notes =
                                await getNotesByVisit(
                                    visit.id,
                                )

                            return [
                                visit.id,
                                notes,
                            ] as const
                        },
                    ),
                )

            setNotesByVisit(
                Object.fromEntries(
                    notesEntries,
                ),
            )
        } catch (error) {
            if (error instanceof Error) {
                setError(
                    error.message,
                )
            } else {
                setError(
                    'Δεν ήταν δυνατή η φόρτωση του θεραπευόμενου.',
                )
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateVisit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        if (!client) {
            return
        }

        const userId =
            localStorage.getItem(
                'userId',
            )

        if (!userId) {
            setError(
                'Δεν βρέθηκαν στοιχεία συνδεδεμένου γιατρού.',
            )

            return
        }

        setSavingVisit(true)
        setError('')

        try {
            const doctor =
                await getDoctorByUserId(
                    Number(userId),
                )

            const newVisit =
                await createVisit({
                    doctorId: doctor.id,
                    clientId: client.id,
                    visitTime,
                    service,
                })

            setVisits(
                (currentVisits) => [
                    newVisit,
                    ...currentVisits,
                ],
            )

            setNotesByVisit(
                (currentNotes) => ({
                    ...currentNotes,
                    [newVisit.id]: [],
                }),
            )

            setVisitTime('')
            setService('')
            setShowVisitForm(false)
        } catch (error) {
            if (error instanceof Error) {
                setError(
                    error.message,
                )
            } else {
                setError(
                    'Δεν ήταν δυνατή η δημιουργία της συνεδρίας.',
                )
            }
        } finally {
            setSavingVisit(false)
        }
    }

    async function handleCreateNote(
        event: FormEvent<HTMLFormElement>,
        visitId: number,
    ) {
        event.preventDefault()

        const normalizedNote =
            noteText.trim()

        if (!normalizedNote) {
            return
        }

        setSavingNote(true)
        setError('')

        try {
            const newNote =
                await createNote({
                    visitId,
                    content:
                    normalizedNote,
                })

            setNotesByVisit(
                (currentNotes) => ({
                    ...currentNotes,
                    [visitId]: [
                        newNote,
                        ...(
                            currentNotes[
                                visitId
                                ] ?? []
                        ),
                    ],
                }),
            )

            setNoteText('')
            setActiveNoteVisitId(
                null,
            )
        } catch (error) {
            if (error instanceof Error) {
                setError(
                    error.message,
                )
            } else {
                setError(
                    'Δεν ήταν δυνατή η αποθήκευση της σημείωσης.',
                )
            }
        } finally {
            setSavingNote(false)
        }
    }

    function handleLogout() {
        logout()

        navigate('/login')
    }

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

    function getInitials(): string {
        if (!client) {
            return 'Θ'
        }

        return `${client.firstName
            .charAt(0)
            .toUpperCase()}${client.lastName
            .charAt(0)
            .toUpperCase()}`
    }

    const doctorEmail =
        localStorage.getItem(
            'email',
        )

    if (loading) {
        return (
            <main className="client-details-loading">
                <img
                    src={logo}
                    alt="Healayra"
                />

                <p>
                    Φόρτωση ιστορικού...
                </p>
            </main>
        )
    }

    if (
        error &&
        !client
    ) {
        return (
            <main className="client-details-loading">
                <img
                    src={logo}
                    alt="Healayra"
                />

                <h2>
                    Ο θεραπευόμενος
                    δεν βρέθηκε
                </h2>

                <p role="alert">
                    {error}
                </p>

                <Link
                    to="/doctor/clients"
                    className="details-back-button"
                >
                    Επιστροφή
                </Link>
            </main>
        )
    }

    if (!client) {
        return null
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
                        D
                    </div>

                    <div>
                        <strong>
                            Doctor Workspace
                        </strong>

                        <span>
                            {doctorEmail ??
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
                        className="doctor-menu-link active"
                    >
                        <span className="menu-icon">
                            ♙
                        </span>

                        Θεραπευόμενοι
                    </Link>

                    <Link
                        to="/doctor/availability"
                        className="doctor-menu-link"
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

            <section className="client-details-content">
                <div className="details-breadcrumb">
                    <Link
                        to="/doctor/clients"
                    >
                        ← Θεραπευόμενοι
                    </Link>

                    <span>
                        /
                    </span>

                    <strong>
                        Προφίλ
                    </strong>
                </div>

                <section className="client-profile-card">
                    <div className="client-profile-main">
                        <div className="client-profile-avatar">
                            {getInitials()}
                        </div>

                        <div>
                            <span className="client-profile-label">
                                Προφίλ Θεραπευόμενου
                            </span>

                            <h1>
                                {
                                    client.firstName
                                }{' '}
                                {
                                    client.lastName
                                }
                            </h1>

                            <div className="client-profile-contact">
                                <span>
                                    ☎
                                </span>

                                <span>
                                    {client.phone ||
                                        'Δεν έχει καταχωρηθεί τηλέφωνο'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="client-profile-stats">
                        <div>
                            <span>
                                Συνεδρίες
                            </span>

                            <strong>
                                {visits.length}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Κατάσταση
                            </span>

                            <strong className="profile-active-status">
                                Ενεργός
                            </strong>
                        </div>
                    </div>
                </section>

                <div className="client-history-header">
                    <div>
                        <span className="history-eyebrow">
                            Therapy History
                        </span>

                        <h2>
                            Ιστορικό Συνεδριών
                        </h2>

                        <p>
                            Συνεδρίες και ιδιωτικές
                            θεραπευτικές σημειώσεις.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="new-visit-button"
                        onClick={() =>
                            setShowVisitForm(
                                (
                                    currentValue,
                                ) =>
                                    !currentValue,
                            )
                        }
                    >
                        <span>
                            +
                        </span>

                        Νέα Συνεδρία
                    </button>
                </div>

                {showVisitForm && (
                    <form
                        className="new-visit-form"
                        onSubmit={
                            handleCreateVisit
                        }
                    >
                        <div className="form-heading">
                            <div>
                                <span>
                                    New Session
                                </span>

                                <h3>
                                    Καταχώρηση
                                    Συνεδρίας
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="form-close"
                                onClick={() => {
                                    setShowVisitForm(
                                        false,
                                    )

                                    setVisitTime(
                                        '',
                                    )

                                    setService(
                                        '',
                                    )
                                }}
                                aria-label="Κλείσιμο"
                            >
                                ×
                            </button>
                        </div>

                        <div className="visit-form-grid">
                            <div className="details-form-field">
                                <label htmlFor="visitTime">
                                    Ημερομηνία και ώρα
                                </label>

                                <input
                                    id="visitTime"
                                    type="datetime-local"
                                    value={
                                        visitTime
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setVisitTime(
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
                                    value={
                                        service
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setService(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="details-form-actions">
                            <button
                                type="button"
                                className="details-cancel-button"
                                onClick={() => {
                                    setShowVisitForm(
                                        false,
                                    )

                                    setVisitTime(
                                        '',
                                    )

                                    setService(
                                        '',
                                    )
                                }}
                            >
                                Ακύρωση
                            </button>

                            <button
                                type="submit"
                                className="details-save-button"
                                disabled={
                                    savingVisit
                                }
                            >
                                {savingVisit
                                    ? 'Αποθήκευση...'
                                    : 'Αποθήκευση Συνεδρίας'}
                            </button>
                        </div>
                    </form>
                )}

                {error && (
                    <div
                        className="client-details-alert"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <section className="client-history">
                    {visits.length ===
                    0 ? (
                        <div className="history-empty">
                            <div className="history-empty-icon">
                                ◷
                            </div>

                            <h3>
                                Δεν υπάρχουν
                                συνεδρίες
                            </h3>

                            <p>
                                Η πρώτη συνεδρία
                                μπορεί να προστεθεί
                                από το κουμπί
                                «Νέα Συνεδρία».
                            </p>
                        </div>
                    ) : (
                        <div className="visit-list">
                            {visits.map(
                                (
                                    visit,
                                    index,
                                ) => {
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
                                                        onClick={() => {
                                                            setActiveNoteVisitId(
                                                                visit.id,
                                                            )

                                                            setNoteText(
                                                                '',
                                                            )
                                                        }}
                                                    >
                                                        <span>
                                                            +
                                                        </span>

                                                        Σημείωση
                                                    </button>
                                                </header>

                                                {activeNoteVisitId ===
                                                    visit.id && (
                                                        <form
                                                            className="new-note-form"
                                                            onSubmit={(
                                                                event,
                                                            ) =>
                                                                handleCreateNote(
                                                                    event,
                                                                    visit.id,
                                                                )
                                                            }
                                                        >
                                                            <div className="note-form-heading">
                                                                <div>
                                                                <span>
                                                                    PRIVATE
                                                                    NOTE
                                                                </span>

                                                                    <h4>
                                                                        Νέα
                                                                        θεραπευτική
                                                                        σημείωση
                                                                    </h4>
                                                                </div>
                                                            </div>

                                                            <textarea
                                                                rows={
                                                                    5
                                                                }
                                                                placeholder="Γράψτε τη σημείωση για τη συνεδρία..."
                                                                value={
                                                                    noteText
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setNoteText(
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
                                                                    onClick={() => {
                                                                        setActiveNoteVisitId(
                                                                            null,
                                                                        )

                                                                        setNoteText(
                                                                            '',
                                                                        )
                                                                    }}
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
                                                            σημειώσεις
                                                            για αυτή τη
                                                            συνεδρία.
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
                    )}
                </section>
            </section>
        </main>
    )
}