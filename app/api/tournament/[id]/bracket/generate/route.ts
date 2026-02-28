import { NextResponse } from 'next/server'
import { generateBracket, updateTournamentChallongeUrl, getTournamentTeams, getTournamentById } from '@/lib/tournament-db'
import { getAdminUser } from '@/lib/admin-auth'
import { createChallongeTournament, bulkAddChallongeParticipants, startChallongeTournament } from '@/lib/challonge'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const adminUser = await getAdminUser()
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 })
        }

        let body: any = {}
        try {
            body = await request.json()
        } catch { }

        const bracketSize = body.bracketSize && [2, 4, 8, 16, 32].includes(body.bracketSize) ? body.bracketSize : undefined
        const bracketType = body.bracketType // e.g. 'single elimination', 'double elimination', 'round robin', etc.

        // If a specific Challonge bracket type is requested...
        if (bracketType && ['single elimination', 'double elimination', 'round robin', 'swiss', 'free for all'].includes(bracketType)) {
            const tournament = await getTournamentById(id)
            if (!tournament) throw new Error('Tournament not found')

            const teams = await getTournamentTeams(id)

            const challongeRes = await createChallongeTournament(`${tournament.name} - ${id.substring(0, 5)}`, bracketType)
            const challongeId = challongeRes.tournament.url

            if (teams && teams.length > 0) {
                // Add teams
                const teamNames = teams.map((t: any) => t.name)
                await bulkAddChallongeParticipants(challongeId, teamNames)

                // Start tournament on Challonge
                await startChallongeTournament(challongeId)
            }

            // Save the URL to supabase
            const fullUrl = challongeRes.tournament.full_challonge_url;
            await updateTournamentChallongeUrl(id, fullUrl)

            return NextResponse.json({ success: true, challonge_url: fullUrl })
        }

        // Legacy / Standard fallback to our custom DB brackets logic (which clears Custom URLs)
        await updateTournamentChallongeUrl(id, null)
        const result = await generateBracket(id, bracketSize)
        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Failed to generate bracket:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate bracket' },
            { status: 500 }
        )
    }
}
