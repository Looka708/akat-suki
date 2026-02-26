import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    const { teamId } = await params

    try {
        // Fetch team details
        const { data: team, error: teamError } = await supabaseAdmin
            .from('tournament_teams')
            .select('*')
            .eq('id', teamId)
            .single()

        if (teamError || !team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }

        // Fetch players with user details
        const { data: players, error: playersError } = await supabaseAdmin
            .from('tournament_players')
            .select(`
                *,
                users:user_id (
                    username,
                    avatar
                )
            `)
            .eq('team_id', teamId)

        if (playersError) {
            throw new Error(playersError.message)
        }

        // Flatten player data for the frontend
        const flattenedPlayers = players.map(p => ({
            ...p,
            username: p.users?.username || 'Unknown',
            avatar: p.users?.avatar || null
        }))

        return NextResponse.json({ team, players: flattenedPlayers })
    } catch (error: any) {
        console.error('Error fetching team profile:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch team profile' }, { status: 500 })
    }
}
