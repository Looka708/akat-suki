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
        const { sourceMatchId, sourceSlot, targetMatchId, targetSlot, sourceTeamId, targetTeamId } = body

        if (!sourceMatchId || !targetMatchId || !sourceSlot || !targetSlot) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Perform the swap in the database
        // Source Match gets Target Team
        const sourceUpdateField = sourceSlot === 1 ? { team1_id: targetTeamId || null } : { team2_id: targetTeamId || null }
        const { error: err1 } = await supabaseAdmin
            .from('tournament_matches')
            .update(sourceUpdateField)
            .eq('id', sourceMatchId)
            .eq('tournament_id', tournamentId)

        if (err1) throw err1

        // Target Match gets Source Team
        const targetUpdateField = targetSlot === 1 ? { team1_id: sourceTeamId || null } : { team2_id: sourceTeamId || null }
        const { error: err2 } = await supabaseAdmin
            .from('tournament_matches')
            .update(targetUpdateField)
            .eq('id', targetMatchId)
            .eq('tournament_id', tournamentId)

        if (err2) throw err2

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Bracket swap error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
