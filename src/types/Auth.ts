export type Role =
    | 'DOCTOR'
    | 'CLIENT'

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
}

export interface AuthResponse {
    userId: number
    email: string
    role: Role
    token: string
}