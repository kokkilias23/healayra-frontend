import { apiRequest } from '../api/Api'

import type {
    Appointment,
    AppointmentCreateRequest,
    AppointmentStatus,
} from '../types/Appointment'

// Fetch appointments belonging to a specific doctor.
export async function getAppointmentsByDoctor(
    doctorId: number,
): Promise<Appointment[]> {
    return apiRequest<Appointment[]>(
        `/api/appointments/doctor/${doctorId}`,
    )
}

// Fetch appointments for the currently authenticated client.
export async function getMyAppointments(): Promise<Appointment[]> {
    return apiRequest<Appointment[]>(
        '/api/appointments/me',
    )
}
// Create a new appointment using the selected doctor and appointment time.
export async function createAppointment(
    request: AppointmentCreateRequest,
): Promise<Appointment> {
    return apiRequest<Appointment>(
        '/api/appointments',
        {
            method: 'POST',
            body: JSON.stringify(request),
        },
    )
}
// Update only the appointment status without replacing the whole appointment.
export async function updateAppointmentStatus(
    appointmentId: number,
    status: AppointmentStatus,
): Promise<Appointment> {
    return apiRequest<Appointment>(
        `/api/appointments/${appointmentId}/status`,
        {
            method: 'PATCH',
            body: JSON.stringify({
                status,
            }),
        },
    )
}