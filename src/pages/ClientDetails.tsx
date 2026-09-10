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

import logo
    from '../assets/healayra-logo.png'

import DoctorSidebar
    from '../components/client-details/DoctorSidebar'

import NewVisitForm
    from '../components/client-details/NewVisitForm'

import VisitHistory
    from '../components/client-details/VisitHistory'

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
    // Read the client ID from the /doctor/clients/:id route.
    const { id } =
        useParams()

    const navigate =
        useNavigate()

    // Convert the route parameter once and derive whether it is usable.
    const clientId =
        id
            ? Number(id)
            : null

    const hasInvalidClientId =
        clientId === null ||
        Number.isNaN(clientId)

    const [
        client,
        setClient,
    ] =
        useState<Client | null>(
            null,
        )

    const [
        visits,
        setVisits,
    ] =
        useState<Visit[]>([])

    // Store notes by visit ID so each session keeps its own note collection.
    const [
        notesByVisit,
        setNotesByVisit,
    ] =
        useState<
            Record<number, Note[]>
        >({})

    const [
        loading,
        setLoading,
    ] =
        useState(true)

    const [
        error,
        setError,
    ] =
        useState('')

    const [
        showVisitForm,
        setShowVisitForm,
    ] =
        useState(false)

    const [
        visitTime,
        setVisitTime,
    ] =
        useState('')

    const [
        service,
        setService,
    ] =
        useState('')

    const [
        savingVisit,
        setSavingVisit,
    ] =
        useState(false)

    // Track which visit currently has its private note form open.
    const [
        activeNoteVisitId,
        setActiveNoteVisitId,
    ] =
        useState<number | null>(
            null,
        )

    const [
        noteText,
        setNoteText,
    ] =
        useState('')

    const [
        savingNote,
        setSavingNote,
    ] =
        useState(false)

    // Reload the client profile whenever a valid route client ID changes.
    useEffect(() => {
        if (
            clientId === null ||
            Number.isNaN(clientId)
        ) {
            return
        }

        loadClientDetails(
            clientId,
        )
    }, [clientId])

    // Load the client and visit history in parallel.
    async function loadClientDetails(
        targetClientId: number,
    ) {
        setLoading(true)
        setError('')

        try {
            const [
                clientData,
                visitsData,
            ] =
                await Promise.all([
                    getClientById(
                        targetClientId,
                    ),

                    getVisitsByClient(
                        targetClientId,
                    ),
                ])

            setClient(
                clientData,
            )

            setVisits(
                visitsData,
            )

            // Load notes for every visit concurrently instead of one request at a time.
            const notesEntries =
                await Promise.all(
                    visitsData.map(
                        async (
                            visit,
                        ) => {
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

            // Convert [visitId, notes] pairs into a lookup object.
            setNotesByVisit(
                Object.fromEntries(
                    notesEntries,
                ),
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
                    'Δεν ήταν δυνατή η φόρτωση του θεραπευόμενου.',
                )
            }
        } finally {
            setLoading(
                false,
            )
        }
    }

    // Close the visit form and clear any unfinished input.
    function handleCancelVisitForm() {
        setShowVisitForm(
            false,
        )

        setVisitTime('')
        setService('')
    }

    // Create a new therapy visit for the currently displayed client.
    async function handleCreateVisit(
        event:
        FormEvent<HTMLFormElement>,
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

        setSavingVisit(
            true,
        )

        setError('')

        try {
            // Resolve the authenticated user's doctor profile before creating the visit.
            const doctor =
                await getDoctorByUserId(
                    Number(userId),
                )

            const newVisit =
                await createVisit({
                    doctorId:
                    doctor.id,

                    clientId:
                    client.id,

                    visitTime,

                    service,
                })

            // Add the new visit immediately without reloading the entire page.
            setVisits(
                (
                    currentVisits,
                ) => [
                    newVisit,
                    ...currentVisits,
                ],
            )

            // A newly created visit starts with no private notes.
            setNotesByVisit(
                (
                    currentNotes,
                ) => ({
                    ...currentNotes,

                    [newVisit.id]:
                        [],
                }),
            )

            handleCancelVisitForm()
        } catch (error) {
            if (
                error instanceof Error
            ) {
                setError(
                    error.message,
                )
            } else {
                setError(
                    'Δεν ήταν δυνατή η δημιουργία της συνεδρίας.',
                )
            }
        } finally {
            setSavingVisit(
                false,
            )
        }
    }

    // Create a private therapeutic note linked to one specific visit.
    async function handleCreateNote(
        event:
        FormEvent<HTMLFormElement>,
        visitId: number,
    ) {
        event.preventDefault()

        // Remove unnecessary whitespace and prevent empty notes.
        const normalizedNote =
            noteText.trim()

        if (!normalizedNote) {
            return
        }

        setSavingNote(
            true,
        )

        setError('')

        try {
            const newNote =
                await createNote({
                    visitId,

                    content:
                    normalizedNote,
                })

            // Update only the notes collection that belongs to this visit.
            setNotesByVisit(
                (
                    currentNotes,
                ) => ({
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

            handleCloseNoteForm()
        } catch (error) {
            if (
                error instanceof Error
            ) {
                setError(
                    error.message,
                )
            } else {
                setError(
                    'Δεν ήταν δυνατή η αποθήκευση της σημείωσης.',
                )
            }
        } finally {
            setSavingNote(
                false,
            )
        }
    }

    // Open a fresh note form for the selected visit.
    function handleOpenNoteForm(
        visitId: number,
    ) {
        setActiveNoteVisitId(
            visitId,
        )

        setNoteText('')
    }

    // Close the active note form and discard unfinished text.
    function handleCloseNoteForm() {
        setActiveNoteVisitId(
            null,
        )

        setNoteText('')
    }

    // Clear authentication data and return to the login page.
    function handleLogout() {
        logout()

        navigate(
            '/login',
        )
    }

    // Build the profile avatar from the client's first and last initials.
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

    // Display the authenticated doctor's email inside the shared sidebar.
    const doctorEmail =
        localStorage.getItem(
            'email',
        )

    // Invalid route parameters are derived directly instead of stored in state.
    if (hasInvalidClientId) {
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
                    Δεν βρέθηκε έγκυρο
                    αναγνωριστικό θεραπευόμενου.
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

    // Show a full-page error when the client itself could not be loaded.
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
            {/* Shared navigation for the doctor workspace */}
            <DoctorSidebar
                doctorEmail={
                    doctorEmail
                }
                activePage="clients"
                onLogout={
                    handleLogout
                }
            />

            <section className="client-details-content">
                {/* Navigation back to the complete client list */}
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

                {/* Client identity and visit summary */}
                <section className="client-profile-card">
                    <div className="client-profile-main">
                        <div className="client-profile-avatar">
                            {
                                getInitials()
                            }
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
                                {
                                    visits.length
                                }
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

                {/* Therapy history heading and new session action */}
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

                {/* Render the visit creation form only when requested */}
                {showVisitForm && (
                    <NewVisitForm
                        visitTime={
                            visitTime
                        }
                        service={
                            service
                        }
                        savingVisit={
                            savingVisit
                        }
                        onVisitTimeChange={
                            setVisitTime
                        }
                        onServiceChange={
                            setService
                        }
                        onSubmit={
                            handleCreateVisit
                        }
                        onCancel={
                            handleCancelVisitForm
                        }
                    />
                )}

                {/* Display request errors without replacing the loaded client page */}
                {error && (
                    <div
                        className="client-details-alert"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {/* VisitHistory owns the presentation of visits and their notes */}
                <VisitHistory
                    visits={
                        visits
                    }
                    notesByVisit={
                        notesByVisit
                    }
                    activeNoteVisitId={
                        activeNoteVisitId
                    }
                    noteText={
                        noteText
                    }
                    savingNote={
                        savingNote
                    }
                    onOpenNoteForm={
                        handleOpenNoteForm
                    }
                    onCloseNoteForm={
                        handleCloseNoteForm
                    }
                    onNoteTextChange={
                        setNoteText
                    }
                    onCreateNote={
                        handleCreateNote
                    }
                />
            </section>
        </main>
    )
}