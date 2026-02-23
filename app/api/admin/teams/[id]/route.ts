import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requirePermission } from '@/lib/admin-auth'
import { PERMISSIONS } from '@/lib/admin-roles'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requirePermission(PERMISSIONS.VIEW_CONTENT)
        const { id } = await params

        const { error } = await supabaseAdmin
            .from('tournament_teams')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete team error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete team' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requirePermission(PERMISSIONS.VIEW_CONTENT)
        const { id } = await params
        const body = await request.json()
        const { tournamentId } = body

        const { error } = await supabaseAdmin
            .from('tournament_teams')
            .update({ tournament_id: tournamentId || null })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Update team error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update team' },
            { status: 500 }
        )
    }
}
