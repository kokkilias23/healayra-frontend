import { apiRequest } from '../api/Api'
import type { Client } from '../types/Client'

export async function getClients(): Promise<Client[]> {
    return apiRequest<Client[]>(
        '/api/clients',
    )
}

export async function getClientById(
    clientId: number,
): Promise<Client> {
    return apiRequest<Client>(
        `/api/clients/${clientId}`,
    )
}
// Search clients using a normalized query, or load all clients when it is empty.
export async function searchClients(
    query: string,
): Promise<Client[]> {
    const normalizedQuery = query.trim()

    if (!normalizedQuery) {
        return getClients()
    }

    return apiRequest<Client[]>(
        `/api/clients/search?query=${encodeURIComponent(normalizedQuery)}`,
    )
}