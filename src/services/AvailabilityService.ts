import { apiRequest } from '../api/Api'

import type {
    Availability,
} from '../types/Availability'

export async function getAvailabilityByDoctor(
    doctorId: number,
): Promise<Availability[]> {
    return apiRequest<Availability[]>(
        `/api/availability/doctor/${doctorId}`,
    )
}