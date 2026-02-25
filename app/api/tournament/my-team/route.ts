import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { deleteTeam } from '@/lib/tournament-db'

export async function GET(request: Request) {
    try {
        const user = await getUserFromSession()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 })
        }

        // Fetch team where user is a player
        const { data: player, error: playerError } = await supabaseAdmin
            .from('tournament_players')
            .select(`
                team_id,
                joined_at,
                tournament_teams!inner (
                    id,
                    name,
                    captain_id,
                    invite_code,
                    discord_role_id,
                    discord_voice_channel_id,
                    created_at,
                    tournament_players (
                        id,
                        user_id,
                        discord_id,
                        steam_id,
                        joined_at,
                        users (
                            username,
                            avatar,
                            discriminator
                        )
                    )
                )
            `)
            .eq('user_id', user.id)
            .single()

        if (playerError && playerError.code !== 'PGRST116') {
            console.error('Error fetching player team:', playerError)
            return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 })
        }

        if (!player) {
            return NextResponse.json({ team: null })
        }

        return NextResponse.json({ team: player.tournament_teams })
    } catch (error: any) {
        console.error('Fetch team error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch team' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await getUserFromSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { teamId } = body

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
        }

        await deleteTeam(teamId, user.id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete team error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete team' },
            { status: 500 }
        )
    }
}
