import { NextResponse } from 'next/server'
import { getAdminUser, requirePermission } from '@/lib/admin-auth'
import { PERMISSIONS } from '@/lib/admin-roles'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
    try {
        await requirePermission(PERMISSIONS.VIEW_SETTINGS)

        const { data: settings, error } = await supabaseAdmin
            .from('platform_settings')
            .select('*')

        if (error) throw error

        // Convert the array of {key, value} into a single map object for easier client state
        const settingsMap: Record<string, any> = {}
        for (const item of settings || []) {
            settingsMap[item.key] = item.value
        }

        return NextResponse.json({ settings: settingsMap })
    } catch (error: any) {
        console.error('Fetch settings error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const adminUser = await getAdminUser()
        if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // This is strict: Only Superman/SuperAdmin has this Edit perms usually over MANAGE_ROLES/EDIT_SETTINGS
        await requirePermission(PERMISSIONS.EDIT_SETTINGS)

        const body = await request.json()
        const { moduleKey, data } = body

        if (!moduleKey || !data) {
            return NextResponse.json({ error: 'Invalid payload elements' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('platform_settings')
            .upsert({
                key: moduleKey,
                value: data,
                updated_at: new Date().toISOString(),
                updated_by: adminUser.id
            }, { onConflict: 'key' })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Update settings error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update settings' },
            { status: 500 }
        )
    }
}
