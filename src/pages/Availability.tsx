import {
  useEffect,
  useState,
} from 'react'

import {
  getDoctorByUserId,
} from '../services/DoctorService'

import {
  createAvailability,
  getAvailabilityByDoctor,
  updateAvailability,
} from '../services/AvailabilityService'

import type {
  DayOfWeek,
} from '../types/Availability'

import '../styles/Availability.css'

interface DayAvailabilityForm {
  id?: number
  dayOfWeek: DayOfWeek
  label: string
  enabled: boolean
  startTime: string
  endTime: string
}

const dayDefinitions: {
  dayOfWeek: DayOfWeek
  label: string
}[] = [
  {
    dayOfWeek: 'MONDAY',
    label: 'Δευτέρα',
  },
  {
    dayOfWeek: 'TUESDAY',
    label: 'Τρίτη',
  },
  {
    dayOfWeek: 'WEDNESDAY',
    label: 'Τετάρτη',
  },
  {
    dayOfWeek: 'THURSDAY',
    label: 'Πέμπτη',
  },
  {
    dayOfWeek: 'FRIDAY',
    label: 'Παρασκευή',
  },
  {
    dayOfWeek: 'SATURDAY',
    label: 'Σάββατο',
  },
  {
    dayOfWeek: 'SUNDAY',
    label: 'Κυριακή',
  },
]

function createInitialAvailability():
    DayAvailabilityForm[] {
  return dayDefinitions.map(
      (day) => ({
        ...day,
        enabled: false,
        startTime: '09:00',
        endTime: '17:00',
      }),
  )
}

export default function Availability() {
  const [
    availability,
    setAvailability,
  ] = useState<DayAvailabilityForm[]>(
      createInitialAvailability(),
  )

  const [
    sessionDuration,
    setSessionDuration,
  ] = useState(50)

  const [
    doctorId,
    setDoctorId,
  ] = useState<number | null>(null)

  const [loading, setLoading] =
      useState(true)

  const [saving, setSaving] =
      useState(false)

  const [error, setError] =
      useState('')

  const [success, setSuccess] =
      useState('')

  useEffect(() => {
    loadAvailability()
  }, [])

  async function loadAvailability() {
    const userId =
        localStorage.getItem('userId')

    if (!userId) {
      setError(
          'Δεν βρέθηκαν στοιχεία συνδεδεμένου γιατρού.',
      )

      setLoading(false)

      return
    }

    setLoading(true)
    setError('')

    try {
      const doctor =
          await getDoctorByUserId(
              Number(userId),
          )

      setDoctorId(
          doctor.id,
      )

      const data =
          await getAvailabilityByDoctor(
              doctor.id,
          )

      const mergedAvailability =
          dayDefinitions.map(
              (day) => {
                const existing =
                    data.find(
                        (item) =>
                            item.dayOfWeek ===
                            day.dayOfWeek,
                    )

                if (!existing) {
                  return {
                    ...day,
                    enabled: false,
                    startTime: '09:00',
                    endTime: '17:00',
                  }
                }

                return {
                  id: existing.id,
                  dayOfWeek:
                  existing.dayOfWeek,
                  label: day.label,
                  enabled:
                  existing.enabled,
                  startTime:
                      existing.startTime
                          .slice(0, 5),
                  endTime:
                      existing.endTime
                          .slice(0, 5),
                }
              },
          )

      setAvailability(
          mergedAvailability,
      )

      if (data.length > 0) {
        setSessionDuration(
            data[0].sessionDuration,
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η φόρτωση της διαθεσιμότητας.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  function handleToggleDay(
      index: number,
  ) {
    setAvailability(
        (currentAvailability) =>
            currentAvailability.map(
                (item, currentIndex) =>
                    currentIndex === index
                        ? {
                          ...item,
                          enabled:
                              !item.enabled,
                        }
                        : item,
            ),
    )

    setSuccess('')
  }

  function handleTimeChange(
      index: number,
      field:
          | 'startTime'
          | 'endTime',
      value: string,
  ) {
    setAvailability(
        (currentAvailability) =>
            currentAvailability.map(
                (item, currentIndex) =>
                    currentIndex === index
                        ? {
                          ...item,
                          [field]: value,
                        }
                        : item,
            ),
    )

    setSuccess('')
  }

  async function handleSave() {
    if (!doctorId) {
      return
    }

    const invalidDay =
        availability.find(
            (item) =>
                item.startTime >=
                item.endTime,
        )

    if (invalidDay) {
      setError(
          `Η ώρα έναρξης πρέπει να είναι πριν από την ώρα λήξης για: ${invalidDay.label}`,
      )

      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const savedAvailability =
          await Promise.all(
              availability.map(
                  async (item) => {
                    if (item.id) {
                      return updateAvailability(
                          item.id,
                          {
                            startTime:
                            item.startTime,
                            endTime:
                            item.endTime,
                            sessionDuration,
                            enabled:
                            item.enabled,
                          },
                      )
                    }

                    return createAvailability(
                        {
                          doctorId,
                          dayOfWeek:
                          item.dayOfWeek,
                          startTime:
                          item.startTime,
                          endTime:
                          item.endTime,
                          sessionDuration,
                          enabled:
                          item.enabled,
                        },
                    )
                  },
              ),
          )

      setAvailability(
          (currentAvailability) =>
              currentAvailability.map(
                  (item) => {
                    const saved =
                        savedAvailability.find(
                            (savedItem) =>
                                savedItem.dayOfWeek ===
                                item.dayOfWeek,
                        )

                    if (!saved) {
                      return item
                    }

                    return {
                      ...item,
                      id: saved.id,
                      enabled:
                      saved.enabled,
                      startTime:
                          saved.startTime
                              .slice(0, 5),
                      endTime:
                          saved.endTime
                              .slice(0, 5),
                    }
                  },
              ),
      )

      setSuccess(
          'Η διαθεσιμότητα αποθηκεύτηκε επιτυχώς.',
      )
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
            'Δεν ήταν δυνατή η αποθήκευση της διαθεσιμότητας.',
        )
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
        <section className="availability-page">
          <p>
            Φόρτωση...
          </p>
        </section>
    )
  }

  return (
      <section className="availability-page">
        <div className="availability-header">
          <h1>
            Διαθεσιμότητα
          </h1>

          <p>
            Ορίστε τις ημέρες και ώρες
            στις οποίες μπορούν να
            κλείνουν ραντεβού οι
            θεραπευόμενοι.
          </p>
        </div>

        <div className="duration-card">
          <label htmlFor="session-duration">
            Διάρκεια συνεδρίας
          </label>

          <select
              id="session-duration"
              value={
                sessionDuration
              }
              onChange={(event) => {
                setSessionDuration(
                    Number(
                        event.target.value,
                    ),
                )

                setSuccess('')
              }}
          >
            <option value={30}>
              30 λεπτά
            </option>

            <option value={45}>
              45 λεπτά
            </option>

            <option value={50}>
              50 λεπτά
            </option>

            <option value={60}>
              60 λεπτά
            </option>

            <option value={90}>
              90 λεπτά
            </option>
          </select>
        </div>

        <div className="availability-list">
          {availability.map(
              (item, index) => (
                  <article
                      key={
                        item.dayOfWeek
                      }
                      className={`availability-card ${
                          item.enabled
                              ? 'active'
                              : 'inactive'
                      }`}
                  >
                    <div className="availability-day">
                      <div>
                        <h2>
                          {item.label}
                        </h2>

                        <span>
                    {item.enabled
                        ? 'Διαθέσιμη ημέρα'
                        : 'Μη διαθέσιμη'}
                  </span>
                      </div>

                      <button
                          type="button"
                          className={`day-toggle ${
                              item.enabled
                                  ? 'enabled'
                                  : ''
                          }`}
                          onClick={() =>
                              handleToggleDay(
                                  index,
                              )
                          }
                      >
                        {item.enabled
                            ? 'Ενεργή'
                            : 'Ανενεργή'}
                      </button>
                    </div>

                    {item.enabled && (
                        <div className="time-range">
                          <div>
                            <label
                                htmlFor={`start-${index}`}
                            >
                              Από
                            </label>

                            <input
                                id={`start-${index}`}
                                type="time"
                                value={
                                  item.startTime
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handleTimeChange(
                                        index,
                                        'startTime',
                                        event.target
                                            .value,
                                    )
                                }
                            />
                          </div>

                          <div>
                            <label
                                htmlFor={`end-${index}`}
                            >
                              Έως
                            </label>

                            <input
                                id={`end-${index}`}
                                type="time"
                                value={
                                  item.endTime
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handleTimeChange(
                                        index,
                                        'endTime',
                                        event.target
                                            .value,
                                    )
                                }
                            />
                          </div>
                        </div>
                    )}
                  </article>
              ),
          )}
        </div>

        {error && (
            <p role="alert">
              {error}
            </p>
        )}

        {success && (
            <p>
              {success}
            </p>
        )}

        <button
            type="button"
            className="save-availability-btn"
            onClick={
              handleSave
            }
            disabled={saving}
        >
          {saving
              ? 'Αποθήκευση...'
              : 'Αποθήκευση Διαθεσιμότητας'}
        </button>
      </section>
  )
}