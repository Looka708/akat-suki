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
