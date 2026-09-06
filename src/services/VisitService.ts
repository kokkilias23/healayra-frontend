import { apiRequest } from '../api/Api'

import type {
    Visit,
    VisitCreateRequest,
} from '../types/Visit'

export async function getVisitsByClient(
    clientId: number,
): Promise<Visit[]> {
    return apiRequest<Visit[]>(
        `/api/visits/client/${clientId}`,
    )
}

export async function createVisit(
    request: VisitCreateRequest,
): Promise<Visit> {
    return apiRequest<Visit>(
        '/api/visits',
        {
            method: 'POST',
            body: JSON.stringify(request),
        },
    )
}