import { apiRequest } from '../api/Αpi.ts'
import type {
    AuthResponse,
    LoginRequest,
} from '../types/Αuth.ts'

export async function login(
    credentials: LoginRequest,
): Promise<AuthResponse> {
    const response =
        await apiRequest<AuthResponse>(
            '/api/auth/login',
            {
                method: 'POST',
                body: JSON.stringify(credentials),
            },
        )

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

    return response
}

export function logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
}

export function getToken(): string | null {
    return localStorage.getItem('token')
}

export function getRole(): string | null {
    return localStorage.getItem('role')
}

export function isAuthenticated(): boolean {
    return Boolean(getToken())
}