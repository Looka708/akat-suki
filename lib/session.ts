import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const SESSION_SECRET = process.env.AUTH_SECRET || 'your-secret-key-min-32-characters-long'
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '604800') // 7 days

export interface DiscordUserSession {
    id: string
    username: string
    discriminator: string
    avatar: string | null
    email: string | null
    accessToken: string
}

// Encode session data to JWT
async function encodeSession(data: DiscordUserSession): Promise<string> {
    const secret = new TextEncoder().encode(SESSION_SECRET)

    return new SignJWT({ user: data })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_MAX_AGE}s`)
        .sign(secret)
}

// Decode session data from JWT
async function decodeSession(token: string): Promise<DiscordUserSession | null> {
    try {
        const secret = new TextEncoder().encode(SESSION_SECRET)
        const { payload } = await jwtVerify(token, secret)

        return payload.user as DiscordUserSession
    } catch (error) {
        return null
    }
}

// Create session with user data
export async function createSession(user: DiscordUserSession): Promise<void> {
    const cookieStore = await cookies()
    const sessionToken = await encodeSession(user)

    cookieStore.set('akatsuki_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
    })
}

// Get user from session
export async function getUserFromSession(): Promise<DiscordUserSession | null> {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('akatsuki_session')

    if (!sessionToken?.value) {
        return null
    }

    return decodeSession(sessionToken.value)
}

// Clear session (logout)
export async function clearSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete('akatsuki_session')
}

// Check if user is authenticated
export async function requireAuth(): Promise<DiscordUserSession> {
    const user = await getUserFromSession()

    if (!user) {
        throw new Error('Authentication required')
    }

    return user
}
