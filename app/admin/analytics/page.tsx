import { supabaseAdmin } from '@/lib/supabase-admin'
import ClientDashboard from './ClientDashboard'
import { getAdminUser, requirePermission } from '@/lib/admin-auth'
import { PERMISSIONS } from '@/lib/admin-roles'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    const adminUser = await getAdminUser()

    if (!adminUser) {
        redirect('/admin')
    }

    try {
        await requirePermission(PERMISSIONS.VIEW_ANALYTICS)
    } catch {
        redirect('/admin')
    }

    // Fetch aggregate data

    // 1. Total Users
    const { data: users, error: usersErr } = await supabaseAdmin
        .from('users')
        .select('created_at')

    // 2. Applications by Status
    const { data: applications, error: appErr } = await supabaseAdmin
        .from('applications')
        .select('status')

    // 3. Tournaments
    const { data: tournaments, error: tournErr } = await supabaseAdmin
        .from('tournaments')
        .select('id, name, max_slots, status')

    // 4. Teams mapping to tournaments
    const { data: teams, error: teamsErr } = await supabaseAdmin
        .from('tournament_teams')
        .select('tournament_id')

    if (usersErr || appErr || tournErr || teamsErr) {
        throw new Error('Failed to fetch analytics data')
    }

    // Process Basic Metrics
    const totalUsers = users?.length || 0
    const activeTournaments = tournaments?.filter(t => t.status === 'live' || t.status === 'registration_open').length || 0
    const totalTeams = teams?.length || 0
    const totalApps = applications?.length || 0

    // User Growth (Group by day)
    const userGrowthMap: Record<string, number> = {}
    users?.forEach(u => {
        const d = new Date(u.created_at).toLocaleDateString()
        userGrowthMap[d] = (userGrowthMap[d] || 0) + 1
    })

    // Running total or per day? The design says "Growth", let's make it a cumulative total map over sorted dates
    let cumulative = 0
    const userGrowthData = Object.entries(userGrowthMap)
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .map(([date, count]) => {
            cumulative += count
            return { date, users: cumulative }
        })

    // Applications Status
    const appStatusMap: Record<string, number> = {}
    applications?.forEach(a => {
        const s = a.status || 'unknown'
        appStatusMap[s] = (appStatusMap[s] || 0) + 1
    })
    const appStatusData = Object.entries(appStatusMap).map(([status, value]) => ({ name: status, value }))

    // Tournament Fill Rates
    const tournamentMap: Record<string, number> = {}
    teams?.forEach(t => {
        if (t.tournament_id) {
            tournamentMap[t.tournament_id] = (tournamentMap[t.tournament_id] || 0) + 1
        }
    })

    const tournamentFillData = tournaments?.map(t => {
        return {
            name: t.name,
            teams: tournamentMap[t.id] || 0,
            max_slots: t.max_slots
        }
    }) || []

    return (
        <ClientDashboard
            metrics={{ totalUsers, activeTournaments, totalTeams, totalApps }}
            userGrowth={userGrowthData}
            appStatus={appStatusData}
            tournamentFill={tournamentFillData}
        />
    )
}
