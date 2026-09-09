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
    service: string
    status: AppointmentStatus
    notes: string | null
}

export interface AppointmentCreateRequest {
    doctorId: number
    appointmentTime: string
    service: string
}