export type Role = 'DOCTOR' | 'CLIENT'

export interface LoginRequest {
    email: string
    password: string
}

export interface AuthResponse {
    userId: number
    email: string
    role: Role
    token: string
}