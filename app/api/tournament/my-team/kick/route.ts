import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { removePlayer } from '@/lib/tournament-db'
import { z } from 'zod'

const KickPlayerSchema = z.object({
    teamId: z.string(),
    userIdToKick: z.string()
})

export async function POST(request: Request) {
    try {
        const user = await getUserFromSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsedBody = KickPlayerSchema.safeParse(body)
        if (!parsedBody.success) {
            return NextResponse.json({ error: parsedBody.error.issues[0].message }, { status: 400 })
        }

        const { teamId, userIdToKick } = parsedBody.data

        await removePlayer(teamId, userIdToKick, user.id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Kick player error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to remove player' },
            { status: 500 }
        )
    }
}
