import { apiRequest } from '../api/Api'

import type {
    Doctor,
} from '../types/Doctor'

export async function getDoctorByUserId(
    userId: number,
): Promise<Doctor> {
    return apiRequest<Doctor>(
        `/api/doctors/user/${userId}`,
    )
}

export async function getDoctors(): Promise<Doctor[]> {
    return apiRequest<Doctor[]>(
        '/api/doctors',
    )
}