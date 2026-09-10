import type {
    Doctor,
} from '../../types/Doctor'

interface BookingSidebarProps {
    doctor:
        Doctor | null
    selectedService:
        string
    selectedDate:
        Date | null
    selectedTime:
        string
}

export default function BookingSidebar({
                                           doctor,
                                           selectedService,
                                           selectedDate,
                                           selectedTime,
                                       }: BookingSidebarProps) {
    return (
        <aside className="booking-sidebar">
            {/* Display the professional currently receiving the booking request */}
            {doctor && (
                <section className="booking-doctor-card">
                    <span className="booking-card-label">
                        Your Professional
                    </span>

                    <div className="booking-doctor-main">
                        <div className="booking-doctor-avatar">
                            {doctor.firstName
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {
                                    doctor.firstName
                                }{' '}
                                {
                                    doctor.lastName
                                }
                            </strong>

                            <span>
                                {
                                    doctor.specialty
                                }
                            </span>
                        </div>
                    </div>

                    <div className="booking-doctor-message">
                        <span>
                            ♡
                        </span>

                        <p>
                            Επιλέξτε τον χρόνο
                            που σας εξυπηρετεί
                            καλύτερα.
                        </p>
                    </div>
                </section>
            )}

            {/* Keep a live summary synchronized with the current booking choices */}
            <section className="booking-summary-card">
                <span className="booking-card-label">
                    Appointment Summary
                </span>

                <h3>
                    Το ραντεβού σας
                </h3>

                <div className="booking-summary-item">
                    <span>
                        Υπηρεσία
                    </span>

                    <strong>
                        {selectedService ||
                            'Δεν επιλέχθηκε'}
                    </strong>
                </div>

                <div className="booking-summary-item">
                    <span>
                        Ημερομηνία
                    </span>

                    <strong>
                        {selectedDate
                            ? selectedDate
                                .toLocaleDateString(
                                    'el-GR',
                                )
                            : 'Δεν επιλέχθηκε'}
                    </strong>
                </div>

                <div className="booking-summary-item">
                    <span>
                        Ώρα
                    </span>

                    <strong>
                        {selectedTime ||
                            'Δεν επιλέχθηκε'}
                    </strong>
                </div>

                <div className="booking-summary-footer">
                    <span>
                        ✓
                    </span>

                    <p>
                        Μετά την καταχώρηση,
                        το αίτημα θα εμφανιστεί
                        στα ραντεβού σας.
                    </p>
                </div>
            </section>
        </aside>
    )
}