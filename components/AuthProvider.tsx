'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface User {
    id: string
    username: string
    discriminator: string
    avatar: string | null
    email: string | null
    isAdmin: boolean
    role: string | null
}


interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (returnUrl?: string) => void
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch user on mount
    useEffect(() => {
        refreshUser()
    }, [])

    const refreshUser = async () => {
        try {
            const response = await fetch('/api/auth/me')
            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const login = (returnUrl?: string) => {
        // Store current path and params for redirect after login
        const currentPath = window.location.pathname
        const currentSearch = window.location.search
        const fullPath = currentPath + currentSearch

        // If returnUrl is explicitly provided, use it
        // Otherwise, if on home page or the explicit request, redirect to apply for staff
        const returnTo = returnUrl || (currentPath === '/' ? '/apply?position=Staff' : fullPath)

        // Redirect to Discord OAuth
        window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
    }

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            setUser(null)
            window.location.href = '/'
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
