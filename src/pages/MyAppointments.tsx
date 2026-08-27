import '../styles/MyAppointments.css' 

type Appointment = {
  id: number
  service: string
  date: string
  time: string
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
}

const appointments: Appointment[] = [
  {
    id: 1,
    service: 'Ατομική Συνεδρία',
    date: '05/09/2026',
    time: '17:30',
    status: 'UPCOMING',
  },
  {
    id: 2,
    service: 'Online Συνεδρία',
    date: '20/08/2026',
    time: '11:00',
    status: 'COMPLETED',
  },
]

export default function MyAppointments() {
  return (
    <section className="my-appointments-page">
      <h1>Τα Ραντεβού μου</h1>

      <p>
        Εδώ μπορείτε να δείτε τα επερχόμενα και προηγούμενα ραντεβού σας.
      </p>

      <div className="appointments-list">
        {appointments.map((appointment) => (
          <article
            key={appointment.id}
            className="appointment-card"
          >
            <div>
              <h2>{appointment.service}</h2>

              <p>
                <strong>Ημερομηνία:</strong> {appointment.date}
              </p>

              <p>
                <strong>Ώρα:</strong> {appointment.time}
              </p>
            </div>

            <div>
              <span
                className={`appointment-status ${appointment.status.toLowerCase()}`}
              >
                {appointment.status}
              </span>

              {appointment.status === 'UPCOMING' && (
                <button
                  type="button"
                  className="cancel-appointment-btn"
                >
                  Ακύρωση
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}