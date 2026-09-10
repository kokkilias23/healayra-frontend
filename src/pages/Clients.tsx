import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import DoctorSidebar
  from '../components/client-details/DoctorSidebar'

import ClientsContent
  from '../components/client-details/ClientsContent'

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
  const navigate =
      useNavigate()

  const [
    clients,
    setClients,
  ] =
      useState<Client[]>([])

  const [
    query,
    setQuery,
  ] =
      useState('')

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

  // Load all clients when the page first opens.
  useEffect(() => {
    async function loadInitialClients() {
      try {
        const data =
            await getClients()

        setClients(
            data,
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
              'Δεν ήταν δυνατή η φόρτωση των θεραπευόμενων.',
          )
        }
      } finally {
        setLoading(
            false,
        )
      }
    }

    loadInitialClients()
  }, [])

  // Reload the complete client collection outside the initial page lifecycle.
  async function loadAllClients() {
    setLoading(true)
    setError('')

    try {
      const data =
          await getClients()

      setClients(
          data,
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
            'Δεν ήταν δυνατή η φόρτωση των θεραπευόμενων.',
        )
      }
    } finally {
      setLoading(
          false,
      )
    }
  }

  // Search clients through the backend using a normalized query.
  async function handleSearch(
      event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const normalizedQuery =
        query.trim()

    // An empty search restores the complete client list.
    if (!normalizedQuery) {
      await loadAllClients()
      return
    }

    setLoading(true)
    setError('')

    try {
      const data =
          await searchClients(
              normalizedQuery,
          )

      setClients(
          data,
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
            'Δεν ήταν δυνατή η αναζήτηση.',
        )
      }
    } finally {
      setLoading(
          false,
      )
    }
  }

  // Clear the search term and restore the complete client collection.
  async function handleClearSearch() {
    setQuery('')

    await loadAllClients()
  }

  // Clear authentication data and return to the login page.
  function handleLogout() {
    logout()

    navigate(
        '/login',
    )
  }

  // Display the authenticated doctor inside the shared workspace sidebar.
  const doctorEmail =
      localStorage.getItem(
          'email',
      )

  return (
      <main className="doctor-dashboard-page">
        <DoctorSidebar
            doctorEmail={
              doctorEmail
            }
            activePage="clients"
            onLogout={
              handleLogout
            }
        />

        <ClientsContent
            clients={
              clients
            }
            query={
              query
            }
            loading={
              loading
            }
            error={
              error
            }
            onQueryChange={
              setQuery
            }
            onSearch={
              handleSearch
            }
            onClearSearch={
              handleClearSearch
            }
        />
      </main>
  )
}