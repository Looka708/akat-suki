const CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

export function getDiscordAuthUrl(state: string) {
    const params = new URLSearchParams({
        client_id: CLIENT_ID!,
        redirect_uri: REDIRECT_URI!,
        response_type: 'code',
        scope: 'identify email',
        state: state,
    })

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(code: string) {
    const params = new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI!,
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
