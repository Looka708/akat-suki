import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const adminUser = await getAdminUser()
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { matchId, slot, teamId } = body

        if (!matchId || !slot || !teamId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (slot !== 1 && slot !== 2) {
            return NextResponse.json({ error: 'Invalid slot' }, { status: 400 })
        }

        const updateData: any = {}
        if (slot === 1) {
            updateData.team1_id = teamId
        } else {
            updateData.team2_id = teamId
        }

        const { error } = await supabaseAdmin
            .from('tournament_matches')
            .update(updateData)
            .eq('id', matchId)
            .eq('tournament_id', id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Failed to assign team:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to assign team' },
            { status: 500 }
        )
    }
}
