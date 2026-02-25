import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get tournament info
        const { data: tournament, error: tErr } = await supabaseAdmin
            .from('tournaments')
            .select('*')
            .eq('id', id)
            .single()

        if (tErr || !tournament) {
            return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
        }

        // Get matches with team names
        const { data: matches, error: mErr } = await supabaseAdmin
            .from('tournament_matches')
            .select(`
                id, tournament_id, team1_id, team2_id, winner_id, team1_score, team2_score, round, state, created_at, scheduled_time,
                team1:team1_id(id, name, logo_url),
                team2:team2_id(id, name, logo_url),
                winner:winner_id(name)
            `)
            .eq('tournament_id', id)
            .order('round', { ascending: true })
            .order('created_at', { ascending: true })

        if (mErr) throw mErr

        // Get all teams in this tournament with their players
        const { data: teams, error: teamsErr } = await supabaseAdmin
            .from('tournament_teams')
            .select(`
                id, name, logo_url, captain_id,
                tournament_players (
                    id, user_id, steam_id,
                    users (
                        username, avatar
                    )
                )
            `)
            .eq('tournament_id', id)

        if (teamsErr) throw teamsErr

        return NextResponse.json({ tournament, matches, teams })
    } catch (error: any) {
        console.error('Fetch tournament brackets error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch tournament brackets' },
            { status: 500 }
        )
    }
}
