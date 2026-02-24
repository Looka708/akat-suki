import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { applyToTournament, getTeamById, getTournamentById } from '@/lib/tournament-db'
import { z } from 'zod'
import { sendTournamentRegistrationNotification } from '@/lib/discord-notifications'

const ApplyTournamentSchema = z.object({
    teamId: z.string(),
    tournamentId: z.string()
})

export async function POST(request: Request) {
    try {
        const user = await getUserFromSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsedBody = ApplyTournamentSchema.safeParse(body)
        if (!parsedBody.success) {
            return NextResponse.json({ error: parsedBody.error.issues[0].message }, { status: 400 })
        }

        const { teamId, tournamentId } = parsedBody.data

        const team = await getTeamById(teamId)
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }

        if (team.captain_id !== user.id) {
            return NextResponse.json({ error: 'Only the captain can apply to a tournament' }, { status: 403 })
        }

        const tournament = await getTournamentById(tournamentId)
        if (!tournament) {
            return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
        }

        await applyToTournament(teamId, tournamentId)

        // Dispatch Discord Webhook non-blocking
        sendTournamentRegistrationNotification({
            teamName: team.name,
            tournamentName: tournament.name,
            captainName: user.username || 'Unknown Captain'
        }).catch(err => console.error('Failed to send Discord webhook:', err))

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Apply tournament error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to apply to tournament' },
            { status: 500 }
        )
    }
}
