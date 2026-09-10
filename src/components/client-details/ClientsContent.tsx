import {
    Link,
} from 'react-router-dom'

import type {
    FormEvent,
} from 'react'

import type {
    Client,
} from '../../types/Client'

interface ClientsContentProps {
    clients: Client[]
    query: string
    loading: boolean
    error: string
    onQueryChange:
        (value: string) => void
    onSearch:
        (
            event:
            FormEvent<HTMLFormElement>,
        ) => void
    onClearSearch:
        () => void
}

export default function ClientsContent({
                                           clients,
                                           query,
                                           loading,
                                           error,
                                           onQueryChange,
                                           onSearch,
                                           onClearSearch,
                                       }: ClientsContentProps) {
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

    return (
        <section className="clients-content">
            {/* Introduce the client management workspace and current total */}
            <header className="clients-header">
                <div>
                    <span className="clients-eyebrow">
                        Client Management
                    </span>

                    <h1>
                        Θεραπευόμενοι
                    </h1>

                    <p>
                        Αναζήτηση, προβολή
                        ιστορικού και διαχείριση
                        θεραπευτικών συνεδριών.
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

            {/* Search clients through the backend by name */}
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
                    onSubmit={onSearch}
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
                                onQueryChange(
                                    event.target.value,
                                )
                            }
                        />

                        {query && (
                            <button
                                type="button"
                                className="clients-clear-search"
                                onClick={
                                    onClearSearch
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

            {/* Keep backend failures visible above the client collection */}
            {error && (
                <div
                    className="clients-alert"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* Switch between loading, empty and populated client states */}
            {loading ? (
                <div className="clients-loading">
                    <div className="clients-loading-icon">
                        ◌
                    </div>

                    <p>
                        Φόρτωση θεραπευόμενων...
                    </p>
                </div>
            ) : clients.length ===
            0 ? (
                <div className="clients-empty">
                    <div className="clients-empty-icon">
                        ♙
                    </div>

                    <h3>
                        Δεν βρέθηκαν
                        θεραπευόμενοι
                    </h3>

                    <p>
                        Δοκιμάστε διαφορετικό
                        όνομα ή καθαρίστε την
                        αναζήτηση.
                    </p>

                    {query && (
                        <button
                            type="button"
                            onClick={
                                onClearSearch
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
                                key={
                                    client.id
                                }
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

                                {/* Open the complete visit and note history for this client */}
                                <div className="client-card-actions">
                                    <Link
                                        to={`/doctor/clients/${client.id}`}
                                        className="client-details-link"
                                    >
                                        <span>
                                            Προβολή
                                            Ιστορικού
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
    )
}