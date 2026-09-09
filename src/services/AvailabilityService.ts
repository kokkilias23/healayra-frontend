import { apiRequest } from '../api/Api'

import type {
    Availability,
    AvailabilityCreateRequest,
    AvailabilityUpdateRequest,
} from '../types/Availability'

export async function getAvailabilityByDoctor(
    doctorId: number,
): Promise<Availability[]> {
    return apiRequest<Availability[]>(
        `/api/availability/doctor/${doctorId}`,
    )
}

export async function createAvailability(
    request: AvailabilityCreateRequest,
): Promise<Availability> {
    return apiRequest<Availability>(
        '/api/availability',
        {
            method: 'POST',
            body: JSON.stringify(request),
        },
    )
}

// Replace an existing availability record with the updated values.
export async function updateAvailability(
    availabilityId: number,
    request: AvailabilityUpdateRequest,
): Promise<Availability> {
    return apiRequest<Availability>(
        `/api/availability/${availabilityId}`,
        {
            method: 'PUT',
            body: JSON.stringify(request),
        },
    )
}