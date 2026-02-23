import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { applyToTournament } from '@/lib/tournament-db'

export async function POST(request: Request) {
    try {
        const user = await getUserFromSession()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 })
        }

        const body = await request.json()
        const { tournamentId } = body

        if (!tournamentId) {
            return NextResponse.json({ error: 'Tournament ID is required.' }, { status: 400 })
        }

        // Fetch user's team where they are captain
        const { data: team, error: teamError } = await supabaseAdmin
            .from('tournament_teams')
            .select('id, tournament_id')
            .eq('captain_id', user.id)
            .single()

        if (teamError || !team) {
            return NextResponse.json({ error: 'You must be a team captain to apply.' }, { status: 403 })
        }

        if (team.tournament_id === tournamentId) {
            return NextResponse.json({ error: 'Team is already registered for this tournament.' }, { status: 400 })
        }

        if (team.tournament_id) {
            return NextResponse.json({ error: 'Team is already registered for another tournament.' }, { status: 400 })
        }

        const updatedTeam = await applyToTournament(team.id, tournamentId)

        return NextResponse.json({ success: true, team: updatedTeam })
    } catch (error: any) {
        console.error('Apply to tournament error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to apply' },
            { status: 500 }
        )
    }
}
