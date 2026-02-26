import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { data: tournaments, error } = await supabaseAdmin
            .from('tournaments')
            .select(`
                *,
                registered_teams:tournament_teams (
                    id, name, logo_url, captain_id,
                    tournament_players (
                        id, user_id, steam_id,
                        users (username, avatar)
                    )
                ),
                matches:tournament_matches (id)
            `)
            .order('start_date', { ascending: false })

        if (error) throw error

        return NextResponse.json({ tournaments }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        })
    } catch (error: any) {
        console.error('Fetch tournaments error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch tournaments' },
            { status: 500 }
        )
    }
}
