import { Link } from 'react-router-dom'
import '../styles/Clients.css'

type Client = {
  id: number
  fullName: string
  email: string
  phone: string
  lastVisit: string
}

const clients: Client[] = [
  {
    id: 1,
    fullName: 'Μαρία Παπαδοπούλου',
    email: 'maria@example.com',
    phone: '6900000001',
    lastVisit: '24/08/2026',
  },
  {
    id: 2,
    fullName: 'Νίκος Δημητρίου',
    email: 'nikos@example.com',
    phone: '6900000002',
    lastVisit: '20/08/2026',
  },
  {
    id: 3,
    fullName: 'Ελένη Γεωργίου',
    email: 'eleni@example.com',
    phone: '6900000003',
    lastVisit: '17/08/2026',
  },
]

export default function Clients() {
  return (
    <section className="clients-page">
      <div className="clients-header">
        <div>
          <h1>Θεραπευόμενοι</h1>
          <p>Διαχείριση και προβολή ιστορικού θεραπευόμενων.</p>
        </div>
      </div>

      <div className="clients-list">
        {clients.map((client) => (
          <article
            key={client.id}
            className="client-card"
          >
            <div className="client-info">
              <h2>{client.fullName}</h2>

              <p>
                <strong>Email:</strong> {client.email}
              </p>

              <p>
                <strong>Τηλέφωνο:</strong> {client.phone}
              </p>

              <p>
                <strong>Τελευταία επίσκεψη:</strong> {client.lastVisit}
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