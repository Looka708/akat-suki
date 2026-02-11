'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

interface ProtectedRouteProps {
    children: ReactNode
    fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated, login } = useAuth()
    const router = useRouter()
    const [shouldRender, setShouldRender] = useState(false)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            login()
        } else if (!isLoading && isAuthenticated) {
            setShouldRender(true)
        }
    }, [isLoading, isAuthenticated, login])


    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 text-sm">Verifying authentication...</p>
                </div>
            </div>
        )
    }

    // Show fallback while redirecting
    if (!isAuthenticated && fallback) {
        return <>{fallback}</>
    }

    // Render children only if authenticated
    return shouldRender ? <>{children}</> : null
}
