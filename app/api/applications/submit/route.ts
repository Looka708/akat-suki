import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { createApplication, upsertUser } from '@/lib/db'
import { sendApplicationSubmittedNotification } from '@/lib/discord-notifications'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserFromSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { full_name, email, discord_username, position, experience, why_join, availability } = body

        // 0. Ensure user exists in database (safety for pre-existing sessions)
        await upsertUser({
            id: session.id,
            username: session.username,
            discriminator: session.discriminator,
            avatar: session.avatar,
            email: session.email,
        })

        // 1. Save to Database using the admin client (via utility function)

        const application = await createApplication({
            discord_id: session.id,
            discord_username: session.username,
            discord_discriminator: session.discriminator,
            discord_avatar: session.avatar,
            email: email,
            full_name: full_name,
            position: position,
            experience: experience,
            why_join: why_join,
            availability: availability
        })

        // 2. Send Discord Notification
        try {
            await sendApplicationSubmittedNotification({
                applicantName: full_name,
                applicantDiscord: `${session.username}${session.discriminator !== '0' ? '#' + session.discriminator : ''}`,
                position: position,
                submittedAt: new Date().toLocaleString()
            })
        } catch (notifyError) {
            console.error('Notification Error (Non-fatal):', notifyError)
        }

        return NextResponse.json({ success: true, application })

    } catch (error: any) {
        console.error('Application submission error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to submit application' },
            { status: 500 }
        )
    }
}
