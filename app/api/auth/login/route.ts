import { NextRequest, NextResponse } from 'next/server'
import { getDiscordAuthUrl } from '@/lib/discord-auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    // Diagnostic logging
    console.log('--- OAuth Login Attempt ---')
    console.log('NEXT_PUBLIC_DISCORD_CLIENT_ID:', process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ? 'LOADED' : 'MISSING')
    console.log('NEXT_PUBLIC_DISCORD_REDIRECT_URI:', process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI ? 'LOADED' : 'MISSING')

    if (!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || !process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI) {
        return NextResponse.json({
            error: 'Discord configuration missing on server',
            check: {
                hasClientId: !!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
                hasRedirectUri: !!process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
                nodeEnv: process.env.NODE_ENV
            }
        }, { status: 500 })
    }

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
    const returnTo = searchParams.get('returnTo') || '/'
    cookieStore.set('auth_return_to', returnTo, {
        path: '/',
        maxAge: 600,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    })

    // Redirect to Discord OAuth
    try {
        const authUrl = getDiscordAuthUrl(state)
        console.log('Redirecting to:', authUrl.split('?')[0] + '?...')
        return NextResponse.redirect(authUrl)
    } catch (error: any) {
        console.error('Failed to generate Auth URL:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
