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
    login: () => void
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

    const login = () => {
        // Store current path for redirect after login
        const currentPath = window.location.pathname
        const returnTo = currentPath === '/' ? '/apply' : currentPath

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
