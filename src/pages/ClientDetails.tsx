import { useState } from 'react'
import { useParams } from 'react-router-dom'
import '../styles/ClientDetails.css'

type Visit = {
  id: number
  date: string
  service: string
  notes: string
}

type Client = {
  id: number
  fullName: string
  email: string
  phone: string
  visits: Visit[]
}

const clients: Client[] = [
  {
    id: 1,
    fullName: 'Μαρία Παπαδοπούλου',
    email: 'maria@example.com',
    phone: '6900000001',
    visits: [
      {
        id: 1,
        date: '24/08/2026',
        service: 'Ατομική Συνεδρία',
        notes: 'Πρώτη συνάντηση και αρχική αξιολόγηση.',
      },
      {
        id: 2,
        date: '17/08/2026',
        service: 'Ατομική Συνεδρία',
        notes: 'Συζήτηση σχετικά με τους στόχους της θεραπείας.',
      },
    ],
  },
  {
    id: 2,
    fullName: 'Νίκος Δημητρίου',
    email: 'nikos@example.com',
    phone: '6900000002',
    visits: [
      {
        id: 1,
        date: '20/08/2026',
        service: 'Online Συνεδρία',
        notes: 'Online συνεδρία παρακολούθησης.',
      },
    ],
  },
]

export default function ClientDetails() {
  const { id } = useParams()

  const selectedClient = clients.find(
    (client) => client.id === Number(id),
  )

  const [visits, setVisits] = useState<Visit[]>(
    selectedClient?.visits ?? [],
  )

  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')

  if (!selectedClient) {
    return (
      <section className="client-details-page">
        <h1>Ο θεραπευόμενος δεν βρέθηκε.</h1>
      </section>
    )
  }

  const handleAddNote = () => {
    if (!noteText.trim()) {
      return
    }

    const newVisit: Visit = {
      id: Date.now(),
      date: new Date().toLocaleDateString('el-GR'),
      service: 'Σημείωση Συνεδρίας',
      notes: noteText,
    }

    setVisits((currentVisits) => [
      newVisit,
      ...currentVisits,
    ])

    setNoteText('')
    setShowNoteForm(false)
  }

  return (
    <section className="client-details-page">
      <div className="client-profile">
        <h1>{selectedClient.fullName}</h1>

        <p>
          <strong>Email:</strong> {selectedClient.email}
        </p>

        <p>
          <strong>Τηλέφωνο:</strong> {selectedClient.phone}
        </p>
      </div>

      <div className="client-history-header">
        <h2>Ιστορικό Συνεδριών</h2>

        <button
          type="button"
          className="add-note-btn"
          onClick={() => setShowNoteForm(true)}
        >
          + Προσθήκη Σημείωσης
        </button>
      </div>

      {showNoteForm && (
        <div className="note-form">
          <h3>Νέα Σημείωση</h3>

          <textarea
            rows={6}
            placeholder="Γράψτε τη σημείωση..."
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
          />

          <div className="note-form-actions">
            <button
              type="button"
              className="cancel-note-btn"
              onClick={() => {
                setShowNoteForm(false)
                setNoteText('')
              }}
            >
              Ακύρωση
            </button>

            <button
              type="button"
              className="save-note-btn"
              onClick={handleAddNote}
            >
              Αποθήκευση
            </button>
          </div>
        </div>
      )}

      <div className="client-history">
        {visits.length === 0 ? (
          <p>Δεν υπάρχουν καταχωρημένες συνεδρίες.</p>
        ) : (
          <div className="visit-list">
            {visits.map((visit) => (
              <article
                key={visit.id}
                className="visit-card"
              >
                <div className="visit-header">
                  <h3>{visit.service}</h3>
                  <span>{visit.date}</span>
                </div>

                <p>{visit.notes}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}