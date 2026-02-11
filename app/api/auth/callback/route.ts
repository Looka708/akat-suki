import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getDiscordUser } from '@/lib/discord-auth'
import { createSession } from '@/lib/session'
import { cookies } from 'next/headers'
import { upsertUser } from '@/lib/db'


export async function GET(request: NextRequest) {
    try {
        // Get authorization code and state from URL
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // Handle user cancellation
        if (error) {
            const errorDescription = searchParams.get('error_description') || 'Authorization cancelled'
            return NextResponse.redirect(
                new URL(`/?auth=error&message=${encodeURIComponent(errorDescription)}`, request.url)
            )
        }

        // Validate code exists
        if (!code) {
            return NextResponse.redirect(
                new URL('/?auth=error&message=Missing+authorization+code', request.url)
            )
        }

        // Validate state (CSRF protection)
        const cookieStore = await cookies()
        const storedState = cookieStore.get('oauth_state')?.value

        if (!storedState || state !== storedState) {
            return NextResponse.redirect(
                new URL('/?auth=error&message=Invalid+authorization+state', request.url)
            )
        }

        // Exchange code for access token
        const tokenResponse = await exchangeCodeForToken(code)

        // Get user info from Discord
        const discordUser = await getDiscordUser(tokenResponse.access_token)

        // Create session
        await createSession({
            id: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            email: discordUser.email,
            accessToken: tokenResponse.access_token,
        })

        // Upsert user in database
        await upsertUser({
            id: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            email: discordUser.email,
        })


        // Get return URL
        const returnTo = cookieStore.get('auth_return_to')?.value || '/apply'

        // Clear temporary cookies
        cookieStore.delete('oauth_state')
        cookieStore.delete('auth_return_to')

        // Redirect to return URL
        return NextResponse.redirect(new URL(returnTo, request.url))

    } catch (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(
            new URL('/?auth=error&message=Authentication+failed', request.url)
        )
    }
}
