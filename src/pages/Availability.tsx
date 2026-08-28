import { useState } from 'react'
import '../styles/Availability.css'

type DayAvailability = {
  day: string
  enabled: boolean
  startTime: string
  endTime: string
}

const initialAvailability: DayAvailability[] = [
  {
    day: 'Δευτέρα',
    enabled: true,
    startTime: '09:00',
    endTime: '14:00',
  },
  {
    day: 'Τρίτη',
    enabled: true,
    startTime: '09:00',
    endTime: '14:00',
  },
  {
    day: 'Τετάρτη',
    enabled: true,
    startTime: '09:00',
    endTime: '14:00',
  },
  {
    day: 'Πέμπτη',
    enabled: true,
    startTime: '17:00',
    endTime: '21:00',
  },
  {
    day: 'Παρασκευή',
    enabled: true,
    startTime: '17:00',
    endTime: '21:00',
  },
  {
    day: 'Σάββατο',
    enabled: false,
    startTime: '10:00',
    endTime: '14:00',
  },
  {
    day: 'Κυριακή',
    enabled: false,
    startTime: '10:00',
    endTime: '14:00',
  },
]

export default function Availability() {
  const [availability, setAvailability] =
    useState<DayAvailability[]>(initialAvailability)

  const [sessionDuration, setSessionDuration] = useState(50)

  const handleToggleDay = (index: number) => {
    setAvailability((currentAvailability) =>
      currentAvailability.map((item, currentIndex) =>
        currentIndex === index
          ? {
              ...item,
              enabled: !item.enabled,
            }
          : item,
      ),
    )
  }

  const handleTimeChange = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string,
  ) => {
    setAvailability((currentAvailability) =>
      currentAvailability.map((item, currentIndex) =>
        currentIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    )
  }

  const handleSave = () => {
    console.log('Availability:', availability)
    console.log('Session duration:', sessionDuration)
  }

  return (
    <section className="availability-page">
      <div className="availability-header">
        <h1>Διαθεσιμότητα</h1>

        <p>
          Ορίστε τις ημέρες και ώρες στις οποίες μπορούν να
          κλείνουν ραντεβού οι θεραπευόμενοι.
        </p>
      </div>

      <div className="duration-card">
        <label htmlFor="session-duration">
          Διάρκεια συνεδρίας
        </label>

        <select
          id="session-duration"
          value={sessionDuration}
          onChange={(event) =>
            setSessionDuration(Number(event.target.value))
          }
        >
          <option value={30}>30 λεπτά</option>
          <option value={45}>45 λεπτά</option>
          <option value={50}>50 λεπτά</option>
          <option value={60}>60 λεπτά</option>
          <option value={90}>90 λεπτά</option>
        </select>
      </div>

      <div className="availability-list">
        {availability.map((item, index) => (
          <article
            key={item.day}
            className={`availability-card ${
              item.enabled ? 'active' : 'inactive'
            }`}
          >
            <div className="availability-day">
              <div>
                <h2>{item.day}</h2>

                <span>
                  {item.enabled
                    ? 'Διαθέσιμη ημέρα'
                    : 'Μη διαθέσιμη'}
                </span>
              </div>

              <button
                type="button"
                className={`day-toggle ${
                  item.enabled ? 'enabled' : ''
                }`}
                onClick={() => handleToggleDay(index)}
              >
                {item.enabled ? 'Ενεργή' : 'Ανενεργή'}
              </button>
            </div>

            {item.enabled && (
              <div className="time-range">
                <div>
                  <label htmlFor={`start-${index}`}>
                    Από
                  </label>

                  <input
                    id={`start-${index}`}
                    type="time"
                    value={item.startTime}
                    onChange={(event) =>
                      handleTimeChange(
                        index,
                        'startTime',
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div>
                  <label htmlFor={`end-${index}`}>
                    Έως
                  </label>

                  <input
                    id={`end-${index}`}
                    type="time"
                    value={item.endTime}
                    onChange={(event) =>
                      handleTimeChange(
                        index,
                        'endTime',
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <button
        type="button"
        className="save-availability-btn"
        onClick={handleSave}
      >
        Αποθήκευση Διαθεσιμότητας
      </button>
    </section>
  )
}