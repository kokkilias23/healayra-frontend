import { apiRequest } from '../api/Api'

import type {
    Appointment,
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