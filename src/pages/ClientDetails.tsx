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

import type { Client } from '../types/Client'
import type { Visit } from '../types/Visit'

import '../styles/ClientDetails.css'

export default function ClientDetails() {
  const { id } = useParams()

  const [client, setClient] =
      useState<Client | null>(null)

  const [visits, setVisits] =
      useState<Visit[]>([])

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
                {visits.map((visit) => (
                    <article
                        key={visit.id}
                        className="visit-card"
                    >
                      <div className="visit-header">
                        <h3>
                          {visit.service}
                        </h3>

                        <span>
                    {formatVisitDate(
                        visit.visitTime,
                    )}
                  </span>
                      </div>
                    </article>
                ))}
              </div>
          )}
        </div>
      </section>
  )
}