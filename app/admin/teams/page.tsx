import { supabaseAdmin } from '@/lib/supabase-admin'
import { PERMISSIONS } from '@/lib/admin-roles'
import { requirePermission } from '@/lib/admin-auth'
import { TeamActions } from '@/components/admin/TeamActions'

export const dynamic = 'force-dynamic'

export default async function AdminTeamsPage() {
    await requirePermission(PERMISSIONS.VIEW_CONTENT)

    const { data: teams, error } = await supabaseAdmin
        .from('tournament_teams')
        .select(`
            *,
            tournaments (name),
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

            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Team Name</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Captain</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Members</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Tournament</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Invite Code</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {teams?.map((team) => (
                            <tr key={team.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-white text-sm font-medium">{team.name}</p>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                    {team.users?.username || 'Unknown'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border bg-white/5 text-gray-400 border-white/10">
                                        {team.tournament_players?.[0]?.count || 0} / 5
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    {team.tournaments ? (
                                        <span className="text-green-500 font-bold uppercase tracking-widest">{team.tournaments.name}</span>
                                    ) : (
                                        <span className="text-yellow-500 uppercase tracking-widest">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                    {team.invite_code}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 font-mono text-right">
                                    <TeamActions
                                        teamId={team.id}
                                        currentTournamentId={team.tournament_id}
                                        tournaments={tournamentsList || []}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

