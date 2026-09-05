const API_BASE_URL =
    import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

interface ApiErrorResponse {
    message?: string
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = localStorage.getItem('token')

    const headers = new Headers(options.headers)

    headers.set('Content-Type', 'application/json')

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers,
        },
    )

    if (!response.ok) {
        let message = 'Κάτι πήγε στραβά'

        try {
            const error: ApiErrorResponse =
                await response.json()

            if (error.message) {
                message = error.message
            }
        } catch {
            // Το response δεν είχε JSON body.
        }

        throw new Error(message)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json() as Promise<T>
}