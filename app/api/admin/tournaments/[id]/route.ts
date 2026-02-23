import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requirePermission } from '@/lib/admin-auth'
import { PERMISSIONS } from '@/lib/admin-roles'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requirePermission(PERMISSIONS.VIEW_CONTENT)
        const { id } = await params
        const body = await request.json()
        const { status, maxSlots } = body

        if (!status || !maxSlots) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('tournaments')
            .update({ status, max_slots: maxSlots })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Update tournament error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update tournament' },
            { status: 500 }
        )
    }
}
