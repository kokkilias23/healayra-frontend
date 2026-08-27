import '../styles/DoctorDashboard.css'

type DashboardAppointment = {
  id: number
  patientName: string
  time: string
  service: string
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
}

const todayAppointments: DashboardAppointment[] = [
  {
    id: 1,
    patientName: 'Μαρία Παπαδοπούλου',
    time: '10:00',
    service: 'Ατομική Συνεδρία',
    status: 'UPCOMING',
  },
  {
    id: 2,
    patientName: 'Νίκος Δημητρίου',
    time: '11:30',
    service: 'Online Συνεδρία',
    status: 'UPCOMING',
  },
  {
    id: 3,
    patientName: 'Ελένη Γεωργίου',
    time: '13:00',
    service: 'Πρώτη Αξιολογητική Συνεδρία',
    status: 'COMPLETED',
  },
]

export default function DoctorDashboard() {
  return (
    <section className="doctor-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Doctor Dashboard</h1>
          <p>Καλώς ήρθατε πίσω.</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span>Σημερινά Ραντεβού</span>
          <strong>3</strong>
        </div>

        <div className="stat-card">
          <span>Σύνολο Ασθενών</span>
          <strong>24</strong>
        </div>

        <div className="stat-card">
          <span>Επόμενο Ραντεβού</span>
          <strong>10:00</strong>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Σημερινά Ραντεβού</h2>

        <div className="dashboard-appointments">
          {todayAppointments.map((appointment) => (
            <article
              key={appointment.id}
              className="dashboard-appointment-card"
            >
              <div>
                <h3>{appointment.patientName}</h3>
                <p>{appointment.service}</p>
              </div>

              <div className="appointment-meta">
                <strong>{appointment.time}</strong>

                <span
                  className={`appointment-status ${appointment.status.toLowerCase()}`}
                >
                  {appointment.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}