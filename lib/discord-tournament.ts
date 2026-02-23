import { addMemberRole } from './discord-notifications'

const DISCORD_API_BASE = 'https://discord.com/api/v10'

async function discordBotFetch(endpoint: string, options: RequestInit = {}) {
    const botToken = process.env.DISCORD_BOT_TOKEN

    if (!botToken) {
        throw new Error('DISCORD_BOT_TOKEN is not configured in .env.local')
    }

    const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Discord API error: ${response.status} - ${error}`)
    }

    if (response.status === 204) {
        return null
    }

    return response.json()
}

export async function createTeamRole(guildId: string, teamName: string) {
    // Generate a random color for the role or use a default
    // We'll use a random RGB color as integer
    const color = Math.floor(Math.random() * 16777215)

    const role = await discordBotFetch(`/guilds/${guildId}/roles`, {
        method: 'POST',
        body: JSON.stringify({
            name: teamName,
            color,
            mentionable: true,
            hoist: false, // Don't show separately in online list unless desired
        })
    })

    return role as { id: string }
}

export async function createTeamVoiceChannel(
    guildId: string,
    teamName: string,
    categoryId: string | undefined, // Gamers category ID
    roleId: string,
    botRoleId?: string // Need this to ensure the bot can still manage the channel
) {
    // Discord Channel Types: 2 is GUILD_VOICE
    const GUILD_VOICE = 2

    // Permission flags
    // https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
    const VIEW_CHANNEL = String(1 << 10) // 1024
    const CONNECT = String(1 << 20) // 1048576

    const permissionOverwrites = [
        // @everyone gets denied View & Connect
        {
            id: guildId, // The @everyone role ID is the same as the guild ID
            type: 0, // 0 for role
            allow: "0",
            deny: String(BigInt(VIEW_CHANNEL) | BigInt(CONNECT))
        },
        // The team role gets allowed View & Connect
        {
            id: roleId,
            type: 0,
            allow: String(BigInt(VIEW_CHANNEL) | BigInt(CONNECT)),
            deny: "0"
        }
    ]

    // If you know the bot's highest role ID, you generally want to add it to the overwrites
    // so the bot doesn't lock itself out of managing the channel.
    // However, if the bot has Administrator permission, it bypasses overwrites.

    const body: any = {
        name: teamName.toLowerCase().replace(/\s+/g, '-'),
        type: GUILD_VOICE,
        permission_overwrites: permissionOverwrites
    }

    if (categoryId) {
        body.parent_id = categoryId
    }

    const channel = await discordBotFetch(`/guilds/${guildId}/channels`, {
        method: 'POST',
        body: JSON.stringify(body)
    })

    return channel as { id: string }
}

export async function assignTeamRoleToMember(guildId: string, userId: string, roleId: string) {
    try {
        await addMemberRole(guildId, userId, roleId, 'Joined Dota 2 Tournament Team')
    } catch (error) {
        console.error(`Failed to assign team role ${roleId} to user ${userId}`, error)
        throw error
    }
}
