import { NextRequest, NextResponse } from 'next/server'
import { getDiscordAuthUrl } from '@/lib/discord-auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    // Generate random state for CSRF protection
    const state = crypto.randomUUID()

    // Store state in cookie for verification on callback
    const cookieStore = await cookies()
    cookieStore.set('oauth_state', state, {
        path: '/',
        maxAge: 600, // 10 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    })

    // Store return URL if provided
    const searchParams = request.nextUrl.searchParams
    const returnTo = searchParams.get('returnTo') || '/apply'
    cookieStore.set('auth_return_to', returnTo, {
        path: '/',
        maxAge: 600,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    })

    // Redirect to Discord OAuth
    const authUrl = getDiscordAuthUrl(state)
    return NextResponse.redirect(authUrl)
}
