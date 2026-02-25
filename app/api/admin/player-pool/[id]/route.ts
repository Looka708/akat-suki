import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const adminUser = await getAdminUser()
        if (!adminUser) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await request.json()
        const { mmr } = body

        if (typeof mmr !== 'number') {
            return new NextResponse('Bad Request: MMR must be a number', { status: 400 })
        }

        const player_id = id

        // Update the player's MMR
        const { error: updateError } = await supabaseAdmin
            .from('tournament_players')
            .update({ mmr })
            .eq('id', player_id)

        if (updateError) {
            console.error('Error updating player MMR:', updateError)
            return new NextResponse('Internal Server Error', { status: 500 })
        }

        return NextResponse.json({ success: true, mmr })
    } catch (error) {
        console.error('Error in PUT /api/admin/player-pool/[id]:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
