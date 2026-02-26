import { supabaseAdmin } from '@/lib/supabase-admin'
import { PERMISSIONS } from '@/lib/admin-roles'
import { requirePermission } from '@/lib/admin-auth'
import { TeamTable } from '@/components/admin/TeamTable'

export const dynamic = 'force-dynamic'

export default async function AdminTeamsPage() {
    await requirePermission(PERMISSIONS.VIEW_CONTENT)

    const { data: teams, error } = await supabaseAdmin
        .from('tournament_teams')
        .select(`
            *,
            tournaments (id, name),
            users (username),
            tournament_players (count)
        `)
        .order('created_at', { ascending: false })

    const { data: tournamentsList } = await supabaseAdmin
        .from('tournaments')
        .select('id, name')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching teams:', error)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide uppercase">
                    Team Management
                </h1>
                <p className="text-gray-400 mt-1 uppercase tracking-widest text-[10px] font-mono">
                    Manage created teams, assign slots, and control registration
                </p>
            </div>

            <TeamTable
                teams={teams || []}
                tournaments={tournamentsList || []}
            />
        </div>
    )
}

