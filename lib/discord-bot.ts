import { discordBotFetch } from './discord-tournament'

const GUILD_TEXT = 0
const VIEW_CHANNEL = String(1 << 10) // 1024
const SEND_MESSAGES = String(1 << 11) // 2048

/**
 * Creates a temporary text channel for two teams to communicate during their match.
 */
export async function createMatchRoom(
    guildId: string,
    matchId: string,
    team1RoleId: string | null,
    team2RoleId: string | null,
    categoryId?: string
) {
    const permissionOverwrites = [
        // Deny @everyone
        {
            id: guildId,
            type: 0,
            allow: "0",
            deny: String(BigInt(VIEW_CHANNEL) | BigInt(SEND_MESSAGES))
        }
    ]

    if (team1RoleId) {
        permissionOverwrites.push({
            id: team1RoleId,
            type: 0,
            allow: String(BigInt(VIEW_CHANNEL) | BigInt(SEND_MESSAGES)),
            deny: "0"
        })
    }

    if (team2RoleId) {
        permissionOverwrites.push({
            id: team2RoleId,
            type: 0,
            allow: String(BigInt(VIEW_CHANNEL) | BigInt(SEND_MESSAGES)),
            deny: "0"
        })
    }

    const body: any = {
        name: `match-${matchId.split('-')[0]}`, // short uuid
        type: GUILD_TEXT,
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

/**
 * Moves a user to a specific voice channel. Note: The user MUST already be in a voice channel
 * in the same server, otherwise Discord API will reject the request.
 */
export async function moveUserToVoiceChannel(guildId: string, userId: string, channelId: string) {
    try {
        await discordBotFetch(`/guilds/${guildId}/members/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ channel_id: channelId })
        })
    } catch (err) {
        // We log error but don't fail the whole operation if they weren't in a voice channel
        console.error(`Could not move user ${userId} to voice channel ${channelId}. They might not be connected to voice.`)
    }
}

/**
 * Auto-generates a Discord Role, Text Channel, and Voice channel for a Team.
 * Requires the Discord Bot to have Manages Roles and Manage Channels permissions.
 */
export async function createTeamRoleAndChannels(
    guildId: string,
    teamName: string,
    categoryId?: string // Optional category ID to nest channels under
) {
    try {
        // 1. Create Role
        const roleData = await discordBotFetch(`/guilds/${guildId}/roles`, {
            method: 'POST',
            body: JSON.stringify({
                name: teamName,
                color: 0xDC143C, // Crimson
                hoist: false,
                mentionable: true
            })
        })
        const roleId = roleData.id

        const permissionOverwrites = [
            {
                id: guildId, // @everyone
                type: 0,
                allow: "0",
                deny: String(BigInt(VIEW_CHANNEL) | BigInt(SEND_MESSAGES))
            },
            {
                id: roleId,
                type: 0,
                allow: String(BigInt(VIEW_CHANNEL) | BigInt(SEND_MESSAGES)),
                deny: "0"
            }
        ]

        // 2. Create Text Channel
        const textBody: any = {
            name: teamName.toLowerCase().replace(/\s+/g, '-'),
            type: GUILD_TEXT,
            permission_overwrites: permissionOverwrites
        }
        if (categoryId) textBody.parent_id = categoryId

        const textChannel = await discordBotFetch(`/guilds/${guildId}/channels`, {
            method: 'POST',
            body: JSON.stringify(textBody)
        })

        // 3. Create Voice Channel
        const voiceBody: any = {
            name: `${teamName} Voice`,
            type: 2, // GUILD_VOICE
            permission_overwrites: permissionOverwrites,
            user_limit: 5 // Optional: limit voice channel to match team size
        }
        if (categoryId) voiceBody.parent_id = categoryId

        const voiceChannel = await discordBotFetch(`/guilds/${guildId}/channels`, {
            method: 'POST',
            body: JSON.stringify(voiceBody)
        })

        return {
            roleId,
            textChannelId: textChannel.id,
            voiceChannelId: voiceChannel.id
        }
    } catch (err) {
        console.error(`Failed to completely setup Discord channels and roles for team ${teamName}:`, err)
        throw err
    }
}

/**
 * Adds a user to the Discord server using their OAuth access token.
 */
export async function joinDiscordServer(guildId: string, userId: string, accessToken: string) {
    try {
        await discordBotFetch(`/guilds/${guildId}/members/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ access_token: accessToken })
        })
    } catch (err) {
        console.error(`Failed to add user ${userId} to guild ${guildId}:`, err)
        throw err
    }
}

