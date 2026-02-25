import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
    try {
        const user = await getUserFromSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Find the user's tournament_player record
        const { data: player, error } = await supabaseAdmin
            .from('tournament_players')
            .select('id, steam_id, team_id')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        return NextResponse.json({
            steamId: player?.steam_id || null,
            hasTeam: !!player,
        })
    } catch (error: any) {
        console.error('Get Steam link error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to get Steam link status' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUserFromSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { steamId } = body

        if (!steamId || typeof steamId !== 'string' || steamId.trim() === '') {
            return NextResponse.json({ error: 'Steam ID is required' }, { status: 400 })
        }

        const cleanSteamId = steamId.trim()

        // Validate: must be numeric
        if (!/^\d+$/.test(cleanSteamId)) {
            return NextResponse.json({ error: 'Steam ID must be numeric (SteamID64 or Dota 2 Friend Code)' }, { status: 400 })
        }

        // Find the user's tournament_player record
        const { data: player, error: findErr } = await supabaseAdmin
            .from('tournament_players')
            .select('id, team_id')
            .eq('user_id', user.id)
            .single()

        if (findErr && findErr.code !== 'PGRST116') {
            throw findErr
        }

        if (!player) {
            return NextResponse.json(
                { error: 'You must be part of a tournament team before linking your Steam account.' },
                { status: 400 }
            )
        }

        // Update the steam_id
        const { error: updateErr } = await supabaseAdmin
            .from('tournament_players')
            .update({ steam_id: cleanSteamId })
            .eq('id', player.id)

        if (updateErr) {
            throw updateErr
        }

        return NextResponse.json({ success: true, steamId: cleanSteamId })
    } catch (error: any) {
        console.error('Link Steam error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to link Steam account' },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    try {
        const user = await getUserFromSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: player, error: findErr } = await supabaseAdmin
            .from('tournament_players')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (findErr && findErr.code !== 'PGRST116') throw findErr
        if (!player) {
            return NextResponse.json({ error: 'No team membership found' }, { status: 400 })
        }

        const { error: updateErr } = await supabaseAdmin
            .from('tournament_players')
            .update({ steam_id: null })
            .eq('id', player.id)

        if (updateErr) throw updateErr

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Unlink Steam error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to unlink Steam account' },
            { status: 500 }
        )
    }
}
