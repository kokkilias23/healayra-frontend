import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import {
    getRole,
    isAuthenticated,
} from '../../services/AuthService'

import type { Role } from '../../types/Auth'

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: Role[]
}

export default function ProtectedRoute({
                                           children,
                                           allowedRoles,
                                       }: ProtectedRouteProps) {

    // Redirect unauthenticated users to the login page.
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    const role = getRole()

    // Prevent authenticated users from accessing routes outside their role.
    if (
        allowedRoles &&
        (!role || !allowedRoles.includes(role as Role))
    ) {
        return <Navigate to="/" replace />
    }

    // Render the protected page when authentication and role checks succeed.
    return children
}