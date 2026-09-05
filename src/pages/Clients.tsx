import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import { Link } from 'react-router-dom'

import {
  getClients,
  searchClients,
} from '../services/ClientService'

import type { Client } from '../types/Client'

import '../styles/Clients.css'

export default function Clients() {
  const [clients, setClients] =
      useState<Client[]>([])

  const [query, setQuery] =
      useState('')

  const [loading, setLoading] =
      useState(true)

  const [error, setError] =
      useState('')

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    setLoading(true)
    setError('')

    try {
      const data = await getClients()

      setClients(data)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η φόρτωση των θεραπευόμενων',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(
      event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setLoading(true)
    setError('')

    try {
      const data =
          await searchClients(query)

      setClients(data)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η αναζήτηση',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
      <section className="clients-page">
        <div className="clients-header">
          <div>
            <h1>Θεραπευόμενοι</h1>

            <p>
              Διαχείριση και προβολή ιστορικού θεραπευόμενων.
            </p>
          </div>
        </div>

        <form
            className="clients-search"
            onSubmit={handleSearch}
        >
          <input
              type="text"
              placeholder="Αναζήτηση με όνομα ή επώνυμο"
              value={query}
              onChange={(event) =>
                  setQuery(event.target.value)
              }
          />

          <button type="submit">
            Αναζήτηση
          </button>
        </form>

        {loading && (
            <p>Φόρτωση...</p>
        )}

        {error && (
            <p role="alert">
              {error}
            </p>
        )}

        {!loading &&
            !error &&
            clients.length === 0 && (
                <p>
                  Δεν βρέθηκαν θεραπευόμενοι.
                </p>
            )}

        <div className="clients-list">
          {!loading &&
              clients.map((client) => (
                  <article
                      key={client.id}
                      className="client-card"
                  >
                    <div className="client-info">
                      <h2>
                        {client.firstName}{' '}
                        {client.lastName}
                      </h2>

                      <p>
                        <strong>
                          Τηλέφωνο:
                        </strong>{' '}
                        {client.phone || '—'}
                      </p>
                    </div>

                    <Link
                        to={`/doctor/clients/${client.id}`}
                        className="client-details-link"
                    >
                      Προβολή Ιστορικού
                    </Link>
                  </article>
              ))}
        </div>
      </section>
  )
}