import { getAdminUser, requirePermission } from '@/lib/admin-auth'
import { PERMISSIONS } from '@/lib/admin-roles'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import ClientSettings from './ClientSettings'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const adminUser = await getAdminUser()

    if (!adminUser) {
        redirect('/admin')
    }

    try {
        await requirePermission(PERMISSIONS.VIEW_SETTINGS)
    } catch {
        redirect('/admin')
    }

    // Fetch aggregates
    const { data: settings, error } = await supabaseAdmin
        .from('platform_settings')
        .select('*')

    if (error && error.code !== '42P01') {
        // 42P01 is relation does not exist, safe to ignore if not run yet
        console.error('Failed to load settings', error)
    }

    const settingsMap: Record<string, any> = {}
    for (const item of settings || []) {
        settingsMap[item.key] = item.value
    }

    return (
        <ClientSettings initialSettings={settingsMap} />
    )
}
