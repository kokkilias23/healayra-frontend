import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import {
    getRole,
    isAuthenticated,
} from '../services/ΑuthService'

import type { Role } from '../types/Αuth'

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: Role[]
}

export default function ProtectedRoute({
                                           children,
                                           allowedRoles,
                                       }: ProtectedRouteProps) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    const role = getRole()

    if (
        allowedRoles &&
        (!role || !allowedRoles.includes(role as Role))
    ) {
        return <Navigate to="/" replace />
    }

    return children
}
