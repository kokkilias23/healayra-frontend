// Base URL of the Spring Boot API.
// Uses the Vite environment variable when available.
const API_BASE_URL =
    import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

interface ApiErrorResponse {
    message?: string
}

// Generic HTTP client used by all frontend services.
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = localStorage.getItem('token')

    const headers = new Headers(options.headers)

    headers.set('Content-Type', 'application/json')

    // Automatically attach the JWT to protected API requests.
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

    // Convert backend error responses into JavaScript errors.
    if (!response.ok) {
        let message = 'Κάτι πήγε στραβά'

        try {
            const error: ApiErrorResponse =
                await response.json()

            if (error.message) {
                message = error.message
            }
        } catch {
            // The backend response did not contain a JSON body.
        }

        throw new Error(message)
    }

    // HTTP 204 has no response body to parse.
    if (response.status === 204) {
        return undefined as T
    }

    return response.json() as Promise<T>
}