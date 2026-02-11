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
