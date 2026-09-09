import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import logo from '../assets/healayra-logo.png'

import {
  getClients,
  searchClients,
} from '../services/ClientService'

import {
  logout,
} from '../services/AuthService'

import type {
  Client,
} from '../types/Client'

import '../styles/DoctorDashboard.css'
import '../styles/Clients.css'

export default function Clients() {
  const navigate = useNavigate()

  const [clients, setClients] =
      useState<Client[]>([])

  const [query, setQuery] =
      useState('')

  const [loading, setLoading] =
      useState(true)

  const [error, setError] =
      useState('')

  // Load all clients when the page is first rendered.
  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    setLoading(true)
    setError('')

    try {
      const data =
          await getClients()

      setClients(data)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η φόρτωση των θεραπευόμενων.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // Search clients through the backend using the normalized query.
  async function handleSearch(
      event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    // Remove leading and trailing spaces before searching.
    const normalizedQuery =
        query.trim()

    // An empty search restores the full client list.
    if (!normalizedQuery) {
      await loadClients()
      return
    }

    setLoading(true)
    setError('')

    try {
      const data =
          await searchClients(
              normalizedQuery,
          )

      setClients(data)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η αναζήτηση.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // Clear the search field and reload all clients.
  async function handleClearSearch() {
    setQuery('')
    await loadClients()
  }

  // Clear authentication data and return to the login page.
  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Build avatar initials from the client's first and last name.
  function getInitials(
      client: Client,
  ): string {
    const firstInitial =
        client.firstName
            .charAt(0)
            .toUpperCase()

    const lastInitial =
        client.lastName
            .charAt(0)
            .toUpperCase()

    return `${firstInitial}${lastInitial}`
  }

  // Display the authenticated doctor's email in the sidebar.
  const doctorEmail =
      localStorage.getItem('email')

  return (
      <main className="doctor-dashboard-page">
        {/* Doctor navigation sidebar */}
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
                onClick={handleLogout}
                className="doctor-logout"
            >
                        <span>
                            ↪
                        </span>

              Αποσύνδεση
            </button>
          </div>
        </aside>

        <section className="clients-content">
          <header className="clients-header">
            <div>
                        <span className="clients-eyebrow">
                            Client Management
                        </span>

              <h1>
                Θεραπευόμενοι
              </h1>

              <p>
                Αναζήτηση, προβολή ιστορικού
                και διαχείριση θεραπευτικών
                συνεδριών.
              </p>
            </div>

            <div className="clients-total-card">
                        <span>
                            Σύνολο
                        </span>

              <strong>
                {clients.length}
              </strong>

              <small>
                θεραπευόμενοι
              </small>
            </div>
          </header>
          {/* Client search controls */}
          <section className="clients-search-panel">
            <div className="clients-search-copy">
                        <span>
                            Αναζήτηση
                        </span>

              <h2>
                Βρείτε θεραπευόμενο
              </h2>
            </div>

            <form
                className="clients-search"
                onSubmit={handleSearch}
            >
              <div className="clients-search-input-wrapper">
                            <span className="clients-search-icon">
                                ⌕
                            </span>

                <input
                    type="text"
                    placeholder="Όνομα ή επώνυμο..."
                    value={query}
                    onChange={(event) =>
                        setQuery(
                            event.target.value,
                        )
                    }
                />

                {query && (
                    <button
                        type="button"
                        className="clients-clear-search"
                        onClick={
                          handleClearSearch
                        }
                        aria-label="Καθαρισμός αναζήτησης"
                    >
                      ×
                    </button>
                )}
              </div>

              <button
                  type="submit"
                  className="clients-search-button"
              >
                Αναζήτηση
              </button>
            </form>
          </section>

          {error && (
              <div
                  className="clients-alert"
                  role="alert"
              >
                {error}
              </div>
          )}
          
          {/* Loading, empty and client list states */}
          {loading ? (
              <div className="clients-loading">
                <div className="clients-loading-icon">
                  ◌
                </div>

                <p>
                  Φόρτωση θεραπευόμενων...
                </p>
              </div>
          ) : clients.length === 0 ? (
              <div className="clients-empty">
                <div className="clients-empty-icon">
                  ♙
                </div>

                <h3>
                  Δεν βρέθηκαν θεραπευόμενοι
                </h3>

                <p>
                  Δοκιμάστε διαφορετικό όνομα
                  ή καθαρίστε την αναζήτηση.
                </p>

                {query && (
                    <button
                        type="button"
                        onClick={
                          handleClearSearch
                        }
                    >
                      Προβολή όλων
                    </button>
                )}
              </div>
          ) : (
              <div className="clients-list">
                {clients.map(
                    (client) => (
                        <article
                            key={client.id}
                            className="client-card"
                        >
                          <div className="client-main-info">
                            <div className="client-avatar">
                              {getInitials(
                                  client,
                              )}
                            </div>

                            <div className="client-info">
                                            <span className="client-status">
                                                Ενεργό προφίλ
                                            </span>

                              <h2>
                                {
                                  client.firstName
                                }{' '}
                                {
                                  client.lastName
                                }
                              </h2>

                              <div className="client-contact">
                                                <span className="client-contact-icon">
                                                    ☎
                                                </span>

                                <span>
                                                    {client.phone ||
                                                        'Δεν έχει καταχωρηθεί τηλέφωνο'}
                                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="client-card-actions">
                            <Link
                                to={`/doctor/clients/${client.id}`}
                                className="client-details-link"
                            >
                                            <span>
                                                Προβολή Ιστορικού
                                            </span>

                              <span className="client-arrow">
                                                →
                                            </span>
                            </Link>
                          </div>
                        </article>
                    ),
                )}
              </div>
          )}
        </section>
      </main>
  )
}