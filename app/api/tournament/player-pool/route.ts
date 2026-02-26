import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const tournamentId = searchParams.get('tournamentId')

        let query = supabaseAdmin
            .from('tournament_players')
            .select(`
                id,
                user_id,
                discord_id,
                steam_id,
                dota_name,
                mmr,
                dotabuff_url,
                role_1,
                role_2,
                role_3,
                ping,
                player_stats,
                captain_notes,
                joined_at,
                team_id,
                tournament_teams!inner (
                    id,
                    name,
                    tournament_id
                ),
                users (
                    username,
                    avatar,
                    discriminator
                )
            `)
            .order('mmr', { ascending: false })

        // If tournamentId is provided, filter by it
        if (tournamentId) {
            query = query.eq('tournament_teams.tournament_id', tournamentId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching player pool:', error)
            throw error
        }

        return NextResponse.json({ players: data || [] })
    } catch (error: any) {
        console.error('Player pool error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch player pool' },
            { status: 500 }
        )
    }
}
