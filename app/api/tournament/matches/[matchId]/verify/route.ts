import { NextResponse } from 'next/server'
import { updateMatchScore } from '@/lib/tournament-db'
import { getAdminUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyMatchOutcome } from '@/lib/dota-api'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ matchId: string }> }
) {
    const { matchId } = await params
    try {
        const adminUser = await getAdminUser()
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 })
        }

        const body = await request.json()
        const { dotaMatchId } = body

        if (!dotaMatchId) {
            return NextResponse.json({ error: 'Missing Dota Match ID.' }, { status: 400 })
        }

        // Fetch the match from db
        const { data: dbMatch, error: matchError } = await supabaseAdmin
            .from('tournament_matches')
            .select('team1_id, team2_id')
            .eq('id', matchId)
            .single()

        if (matchError || !dbMatch) {
            return NextResponse.json({ error: 'Tournament match not found.' }, { status: 404 })
        }

        if (!dbMatch.team1_id || !dbMatch.team2_id) {
            return NextResponse.json({ error: 'Match must have two teams to verify.' }, { status: 400 })
        }

        // Fetch team 1 steam IDs
        const { data: team1Players } = await supabaseAdmin
            .from('tournament_players')
            .select('steam_id')
            .eq('team_id', dbMatch.team1_id)
            .not('steam_id', 'is', null)

        const team1SteamIds = (team1Players?.map(p => p.steam_id) || []).filter(Boolean) as string[]

        // Fetch team 2 steam IDs
        const { data: team2Players } = await supabaseAdmin
            .from('tournament_players')
            .select('steam_id')
            .eq('team_id', dbMatch.team2_id)
            .not('steam_id', 'is', null)

        const team2SteamIds = (team2Players?.map(p => p.steam_id) || []).filter(Boolean) as string[]

        if (team1SteamIds.length === 0 && team2SteamIds.length === 0) {
            return NextResponse.json({ error: 'No players have linked their Steam IDs. Cannot verify automatically.' }, { status: 400 })
        }

        let winnerId: string | null = null
        let team1Score = 0
        let team2Score = 0

        try {
            if (team1SteamIds.length > 0) {
                const team1Won = await verifyMatchOutcome(dotaMatchId, team1SteamIds)
                if (team1Won) {
                    winnerId = dbMatch.team1_id
                    team1Score = 1
                } else {
                    winnerId = dbMatch.team2_id
                    team2Score = 1
                }
            } else if (team2SteamIds.length > 0) {
                const team2Won = await verifyMatchOutcome(dotaMatchId, team2SteamIds)
                if (team2Won) {
                    winnerId = dbMatch.team2_id
                    team2Score = 1
                } else {
                    winnerId = dbMatch.team1_id
                    team1Score = 1
                }
            }
        } catch (verifyError: any) {
            return NextResponse.json({ error: verifyError.message || 'Error verifying match' }, { status: 400 })
        }

        if (!winnerId) {
            return NextResponse.json({ error: 'Could not determine winner from OpenDota.' }, { status: 400 })
        }

        const updatedMatch = await updateMatchScore(matchId, team1Score, team2Score, winnerId)

        return NextResponse.json({ success: true, match: updatedMatch, winnerId })
    } catch (error: any) {
        console.error('Failed to verify match:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to verify match' },
            { status: 500 }
        )
    }
}
