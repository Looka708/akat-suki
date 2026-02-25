import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tournamentId } = await context.params

        const adminUser = await getAdminUser()
        if (!adminUser) {
            return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
        }

        const body = await request.json()
        const { matchId, slot } = body

        if (!matchId || !slot) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const updateField = slot === 1 ? { team1_id: null } : { team2_id: null }

        const { error } = await supabaseAdmin
            .from('tournament_matches')
            .update(updateField)
            .eq('id', matchId)
            .eq('tournament_id', tournamentId)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Bracket remove-team error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
