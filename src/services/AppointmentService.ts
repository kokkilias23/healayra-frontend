import { apiRequest } from '../api/Api'

import type {
    Appointment,
    AppointmentCreateRequest,
    AppointmentStatus,
} from '../types/Appointment'

export async function getAppointmentsByDoctor(
    doctorId: number,
): Promise<Appointment[]> {
    return apiRequest<Appointment[]>(
        `/api/appointments/doctor/${doctorId}`,
    )
}

export async function getMyAppointments(): Promise<Appointment[]> {
    return apiRequest<Appointment[]>(
        '/api/appointments/me',
    )
}

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