export function getDiscordAuthUrl(state: string) {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

    if (!clientId || !redirectUri) {
        console.error('Missing Discord configuration:', { clientId: !!clientId, redirectUri: !!redirectUri })
        throw new Error('Discord configuration is missing')
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'identify email',
        state: state,
    })

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(code: string) {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Discord configuration is missing for token exchange')
    }

    const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
    })

    const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error_description || 'Failed to exchange code for token')
    }

    return response.json()
}

export async function getDiscordUser(accessToken: string) {
    const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch user info from Discord')
    }

    return response.json()
}

export function getDiscordAvatarUrl(userId: string, avatarHash: string | null) {
    if (!avatarHash) {
        const defaultAvatarIndex = Number(BigInt(userId) >> 22n) % 6
        return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`
    }

    const format = avatarHash.startsWith('a_') ? 'gif' : 'png'
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}`
}

export function formatUsername(username: string, discriminator: string) {
    if (discriminator === '0') return username
    return `${username}#${discriminator}`
}
