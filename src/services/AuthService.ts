import {
    apiRequest,
} from '../api/Api'

import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
} from '../types/Auth'

// Store authentication data returned by the backend
// so the user remains authenticated between page reloads.
function saveAuthData(
    response: AuthResponse,
): void {
    localStorage.setItem(
        'token',
        response.token,
    )

    localStorage.setItem(
        'userId',
        response.userId.toString(),
    )

    localStorage.setItem(
        'email',
        response.email,
    )

    localStorage.setItem(
        'role',
        response.role,
    )
}

// Authenticate the user and store the returned JWT/session data.
export async function login(
    credentials: LoginRequest,
): Promise<AuthResponse> {
    const response =
        await apiRequest<AuthResponse>(
            '/api/auth/login',
            {
                method: 'POST',
                body: JSON.stringify(
                    credentials,
                ),
            },
        )

    saveAuthData(response)

    return response
}
// Register a new account and authenticate it immediately.
export async function register(
    data: RegisterRequest,
): Promise<AuthResponse> {
    const response =
        await apiRequest<AuthResponse>(
            '/api/auth/register',
            {
                method: 'POST',
                body: JSON.stringify(
                    data,
                ),
            },
        )

    saveAuthData(response)

    return response
}
// Clear all locally stored authentication data.
export function logout(): void {
    localStorage.removeItem(
        'token',
    )

    localStorage.removeItem(
        'userId',
    )

    localStorage.removeItem(
        'email',
    )

    localStorage.removeItem(
        'role',
    )
}

export function getToken():
    string | null {
    return localStorage.getItem(
        'token',
    )
}

export function getRole():
    string | null {
    return localStorage.getItem(
        'role',
    )
}

export function isAuthenticated():
    boolean {
    return Boolean(
        getToken(),
    )
}