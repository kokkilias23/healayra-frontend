import { Link } from 'react-router-dom'
import '../styles/Patients.css'

type Patient = {
  id: number
  fullName: string
  email: string
  phone: string
  lastVisit: string
}

const patients: Patient[] = [
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

export default function Patients() {
  return (
    <section className="patients-page">
      <div className="patients-header">
        <div>
          <h1>Θεραπευόμενοι</h1>
          <p>Διαχείριση και προβολή ιστορικού θεραπευόμενων.</p>
        </div>
      </div>

      <div className="patients-list">
        {patients.map((patient) => (
          <article
            key={patient.id}
            className="patient-card"
          >
            <div className="patient-info">
              <h2>{patient.fullName}</h2>

              <p>
                <strong>Email:</strong> {patient.email}
              </p>

              <p>
                <strong>Τηλέφωνο:</strong> {patient.phone}
              </p>

              <p>
                <strong>Τελευταία επίσκεψη:</strong> {patient.lastVisit}
              </p>
            </div>

            <Link
              to={`/doctor/patients/${patient.id}`}
              className="patient-details-link"
            >
              Προβολή Ιστορικού
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}