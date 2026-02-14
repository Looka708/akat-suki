// Discord webhook utility for sending notifications
// This replaces the email service (Resend) with Discord notifications

export interface DiscordWebhookOptions {
    content?: string
    embeds?: DiscordEmbed[]
}

export interface DiscordEmbed {
    title?: string
    description?: string
    color?: number
    fields?: Array<{
        name: string
        value: string
        inline?: boolean
    }>
    timestamp?: string
    footer?: {
        text: string
    }
}

// Send a message to Discord webhook
export async function sendDiscordNotification(options: DiscordWebhookOptions) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
        console.warn('Discord webhook URL not configured')
        return null
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        })

        if (!response.ok) {
            throw new Error(`Discord webhook failed: ${response.statusText}`)
        }

        return true
    } catch (error) {
        console.error('Failed to send Discord notification:', error)
        throw error
    }
}

// Application submitted notification
export async function sendApplicationSubmittedNotification(data: {
    applicantName: string
    applicantDiscord: string
    position: string
    submittedAt: string
}) {
    return sendDiscordNotification({
        embeds: [
            {
                title: '📝 New Application Submitted',
                description: `**${data.applicantName}** has applied to join AKATSUKI!`,
                color: 0xdc143c, // Crimson red
                fields: [
                    {
                        name: '👤 Applicant',
                        value: data.applicantName,
                        inline: true,
                    },
                    {
                        name: '🎮 Discord',
                        value: data.applicantDiscord,
                        inline: true,
                    },
                    {
                        name: '📋 Position',
                        value: data.position,
                        inline: true,
                    },
                    {
                        name: '⏰ Submitted',
                        value: data.submittedAt,
                        inline: false,
                    },
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'AKATSUKI Esports',
                },
            },
        ],
    })
}

// Application approved notification
export async function sendApplicationApprovedNotification(data: {
    applicantName: string
    applicantDiscord: string
    position: string
}) {
    return sendDiscordNotification({
        embeds: [
            {
                title: '✅ Application Approved',
                description: `🎉 **${data.applicantName}** has been accepted to join AKATSUKI as **${data.position}**!`,
                color: 0x22c55e, // Green
                fields: [
                    {
                        name: '👤 New Member',
                        value: data.applicantName,
                        inline: true,
                    },
                    {
                        name: '🎮 Discord',
                        value: data.applicantDiscord,
                        inline: true,
                    },
                    {
                        name: '📋 Role',
                        value: data.position,
                        inline: true,
                    },
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Welcome to the team! 🔥',
                },
            },
        ],
    })
}

// Application rejected notification
export async function sendApplicationRejectedNotification(data: {
    applicantName: string
    position: string
}) {
    return sendDiscordNotification({
        embeds: [
            {
                title: '❌ Application Rejected',
                description: `Application from **${data.applicantName}** for **${data.position}** has been declined.`,
                color: 0xef4444, // Red
                fields: [
                    {
                        name: '👤 Applicant',
                        value: data.applicantName,
                        inline: true,
                    },
                    {
                        name: '📋 Position',
                        value: data.position,
                        inline: true,
                    },
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'AKATSUKI Esports',
                },
            },
        ],
    })
}

// Generic admin notification
export async function sendAdminNotification(data: {
    title: string
    description: string
    color?: number
    fields?: Array<{
        name: string
        value: string
        inline?: boolean
    }>
}) {
    return sendDiscordNotification({
        embeds: [
            {
                title: data.title,
                description: data.description,
                color: data.color || 0xdc143c,
                fields: data.fields,
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'AKATSUKI Admin Panel',
                },
            },
        ],
    })
}

// ============================================
// Discord Role Management Functions
// ============================================

const DISCORD_API_BASE = 'https://discord.com/api/v10'

export interface DiscordRole {
    id: string
    name: string
    color: number
    position: number
    managed: boolean
}

export interface DiscordMember {
    user: {
        id: string
        username: string
        discriminator: string
        avatar: string | null
    }
    roles: string[]
    nick: string | null
    joined_at: string
}

// Helper function for Discord API calls
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

    // Some Discord API endpoints return 204 No Content
    if (response.status === 204) {
        return null
    }

    return response.json()
}

// Get all roles in the guild
export async function getGuildRoles(guildId: string): Promise<DiscordRole[]> {
    return discordBotFetch(`/guilds/${guildId}/roles`)
}

// Get a member by their Discord user ID
export async function getGuildMember(guildId: string, userId: string): Promise<DiscordMember> {
    return discordBotFetch(`/guilds/${guildId}/members/${userId}`)
}

// Add a role to a member
export async function addMemberRole(
    guildId: string,
    userId: string,
    roleId: string,
    reason?: string
): Promise<void> {
    await discordBotFetch(
        `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
        {
            method: 'PUT',
            headers: {
                'X-Audit-Log-Reason': reason || 'Role assigned via AKATSUKI website',
            },
        }
    )
}

// Remove a role from a member
export async function removeMemberRole(
    guildId: string,
    userId: string,
    roleId: string,
    reason?: string
): Promise<void> {
    await discordBotFetch(
        `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
        {
            method: 'DELETE',
            headers: {
                'X-Audit-Log-Reason': reason || 'Role removed via AKATSUKI website',
            },
        }
    )
}

// Auto-assign multiple roles to a member
export async function autoAssignRoles(
    guildId: string,
    userId: string,
    roleIds: string[],
    reason?: string
): Promise<{
    success: boolean
    assignedRoles: string[]
    failedRoles: string[]
}> {
    const assignedRoles: string[] = []
    const failedRoles: string[] = []

    for (const roleId of roleIds) {
        try {
            await addMemberRole(guildId, userId, roleId, reason)
            assignedRoles.push(roleId)
        } catch (error) {
            console.error(`Failed to assign role ${roleId}:`, error)
            failedRoles.push(roleId)
        }
    }

    return {
        success: failedRoles.length === 0,
        assignedRoles,
        failedRoles,
    }
}
