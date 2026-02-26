import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { PERMISSIONS } from '@/lib/admin-roles'
import { requirePermission } from '@/lib/admin-auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        await requirePermission(PERMISSIONS.EDIT_CONTENT)
        const { teamId } = await params
        const { tournamentId } = await request.json()

        if (!tournamentId) {
            return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('tournament_teams')
            .update({ tournament_id: tournamentId })
            .eq('id', teamId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error assigning team:', error)
        return NextResponse.json({ error: error.message || 'Failed to assign team' }, { status: 500 })
    }
}
