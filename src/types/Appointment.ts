export type AppointmentStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'

export interface Appointment {
    id: number
    doctorId: number
    clientId: number
    appointmentTime: string
    status: AppointmentStatus
    notes: string | null
}