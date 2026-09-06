import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import { useParams } from 'react-router-dom'

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

import type { Client } from '../types/Client'
import type { Visit } from '../types/Visit'
import type { Note } from '../types/Note'

import '../styles/ClientDetails.css'

export default function ClientDetails() {
  const { id } = useParams()

  const [client, setClient] =
      useState<Client | null>(null)

  const [visits, setVisits] =
      useState<Visit[]>([])

  const [notesByVisit, setNotesByVisit] =
      useState<Record<number, Note[]>>({})

  const [loading, setLoading] =
      useState(true)

  const [error, setError] =
      useState('')

  const [showVisitForm, setShowVisitForm] =
      useState(false)

  const [visitTime, setVisitTime] =
      useState('')

  const [service, setService] =
      useState('')

  const [savingVisit, setSavingVisit] =
      useState(false)

  const [
    activeNoteVisitId,
    setActiveNoteVisitId,
  ] = useState<number | null>(null)

  const [noteText, setNoteText] =
      useState('')

  const [savingNote, setSavingNote] =
      useState(false)

  useEffect(() => {
    if (!id) {
      setError(
          'Δεν βρέθηκε αναγνωριστικό θεραπευόμενου.',
      )

      setLoading(false)

      return
    }

    loadClientDetails(Number(id))
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
        setError(error.message)
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
        localStorage.getItem('userId')

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

      setVisits((currentVisits) => [
        newVisit,
        ...currentVisits,
      ])

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
        setError(error.message)
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
            content: normalizedNote,
          })

      setNotesByVisit(
          (currentNotes) => ({
            ...currentNotes,
            [visitId]: [
              newNote,
              ...(currentNotes[visitId] ?? []),
            ],
          }),
      )

      setNoteText('')
      setActiveNoteVisitId(null)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η αποθήκευση της σημείωσης.',
        )
      }
    } finally {
      setSavingNote(false)
    }
  }

  function formatVisitDate(
      visitTime: string,
  ): string {
    return new Date(
        visitTime,
    ).toLocaleString(
        'el-GR',
        {
          dateStyle: 'short',
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

  if (loading) {
    return (
        <section className="client-details-page">
          <p>Φόρτωση...</p>
        </section>
    )
  }

  if (error && !client) {
    return (
        <section className="client-details-page">
          <h1>
            Ο θεραπευόμενος δεν βρέθηκε.
          </h1>

          <p role="alert">
            {error}
          </p>
        </section>
    )
  }

  if (!client) {
    return null
  }

  return (
      <section className="client-details-page">
        <div className="client-profile">
          <h1>
            {client.firstName}{' '}
            {client.lastName}
          </h1>

          <p>
            <strong>
              Τηλέφωνο:
            </strong>{' '}
            {client.phone || '—'}
          </p>
        </div>

        <div className="client-history-header">
          <h2>
            Ιστορικό Συνεδριών
          </h2>

          <button
              type="button"
              className="add-note-btn"
              onClick={() =>
                  setShowVisitForm(
                      (currentValue) =>
                          !currentValue,
                  )
              }
          >
            + Νέα Συνεδρία
          </button>
        </div>

        {showVisitForm && (
            <form
                className="note-form"
                onSubmit={handleCreateVisit}
            >
              <h3>
                Νέα Συνεδρία
              </h3>

              <input
                  type="datetime-local"
                  value={visitTime}
                  onChange={(event) =>
                      setVisitTime(
                          event.target.value,
                      )
                  }
                  required
              />

              <input
                  type="text"
                  placeholder="Τύπος συνεδρίας"
                  value={service}
                  onChange={(event) =>
                      setService(
                          event.target.value,
                      )
                  }
                  required
              />

              <div className="note-form-actions">
                <button
                    type="button"
                    className="cancel-note-btn"
                    onClick={() => {
                      setShowVisitForm(false)
                      setVisitTime('')
                      setService('')
                    }}
                >
                  Ακύρωση
                </button>

                <button
                    type="submit"
                    className="save-note-btn"
                    disabled={savingVisit}
                >
                  {savingVisit
                      ? 'Αποθήκευση...'
                      : 'Αποθήκευση'}
                </button>
              </div>
            </form>
        )}

        {error && (
            <p role="alert">
              {error}
            </p>
        )}

        <div className="client-history">
          {visits.length === 0 ? (
              <p>
                Δεν υπάρχουν καταχωρημένες συνεδρίες.
              </p>
          ) : (
              <div className="visit-list">
                {visits.map((visit) => {
                  const visitNotes =
                      notesByVisit[visit.id] ?? []

                  return (
                      <article
                          key={visit.id}
                          className="visit-card"
                      >
                        <div className="visit-header">
                          <div>
                            <h3>
                              {visit.service}
                            </h3>

                            <span>
                        {formatVisitDate(
                            visit.visitTime,
                        )}
                      </span>
                          </div>

                          <button
                              type="button"
                              className="add-note-btn"
                              onClick={() => {
                                setActiveNoteVisitId(
                                    visit.id,
                                )

                                setNoteText('')
                              }}
                          >
                            + Σημείωση
                          </button>
                        </div>

                        {activeNoteVisitId ===
                            visit.id && (
                                <form
                                    className="note-form"
                                    onSubmit={(event) =>
                                        handleCreateNote(
                                            event,
                                            visit.id,
                                        )
                                    }
                                >
                                  <h3>
                                    Νέα Σημείωση
                                  </h3>

                                  <textarea
                                      rows={5}
                                      placeholder="Γράψτε τη σημείωση..."
                                      value={noteText}
                                      onChange={(event) =>
                                          setNoteText(
                                              event.target.value,
                                          )
                                      }
                                      required
                                  />

                                  <div className="note-form-actions">
                                    <button
                                        type="button"
                                        className="cancel-note-btn"
                                        onClick={() => {
                                          setActiveNoteVisitId(
                                              null,
                                          )

                                          setNoteText('')
                                        }}
                                    >
                                      Ακύρωση
                                    </button>

                                    <button
                                        type="submit"
                                        className="save-note-btn"
                                        disabled={savingNote}
                                    >
                                      {savingNote
                                          ? 'Αποθήκευση...'
                                          : 'Αποθήκευση'}
                                    </button>
                                  </div>
                                </form>
                            )}

                        {visitNotes.length === 0 ? (
                            <p>
                              Δεν υπάρχουν σημειώσεις για αυτή τη συνεδρία.
                            </p>
                        ) : (
                            visitNotes.map((note) => (
                                <div
                                    key={note.id}
                                    className="visit-note"
                                >
                                  <p>
                                    {note.content}
                                  </p>

                                  <small>
                                    {formatNoteDate(
                                        note.createdAt,
                                    )}
                                  </small>
                                </div>
                            ))
                        )}
                      </article>
                  )
                })}
              </div>
          )}
        </div>
      </section>
  )
}