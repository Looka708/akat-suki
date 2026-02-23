import { getTournamentById, getTournamentTeams, getTournamentMatches } from '@/lib/tournament-db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BracketGenerator from '@/components/admin/BracketGenerator'
import TournamentBracketManager from '@/components/admin/TournamentBracketManager'
import { formatCurrency } from '@/lib/currency-utils'
import { TournamentSettings } from '@/components/admin/TournamentSettings'

export default async function TournamentManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const tournament = await getTournamentById(id)

    if (!tournament) {
        notFound()
    }

    const teams = await getTournamentTeams(id)
    const matches = await getTournamentMatches(id)

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/tournaments"
                    className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-sm transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide">
                        {tournament.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-medium text-gray-400 bg-white/5 px-2.5 py-1 rounded">
                            {tournament.game}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold uppercase ${tournament.status === 'live' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            tournament.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                tournament.status === 'registration_open' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                            }`}>
                            {tournament.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            <TournamentSettings tournament={tournament} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Start Date</p>
                    <p className="text-lg font-medium text-white">{new Date(tournament.start_date).toLocaleDateString()}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Filled Slots</p>
                    <p className="text-lg font-medium text-white">{teams.length} / {tournament.max_slots}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Entry Fee</p>
                    <p className="text-lg font-medium text-white">{formatCurrency(tournament.entry_fee, tournament.currency)}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Prize Pool</p>
                    <p className="text-lg font-medium text-[#dc143c]">{formatCurrency(tournament.prize_pool, tournament.currency)}</p>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-rajdhani font-bold text-white">Registered Teams</h2>
                    <BracketGenerator tournamentId={tournament.id} disabled={teams.length < 2} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/10">
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Team Name</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Players</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Region</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Payment</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {teams.map((team: any) => (
                                <tr key={team.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <p className="font-medium text-white flex items-center gap-2">
                                            {team.name}
                                        </p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">
                                        {team.tournament_players.length > 0 ? team.tournament_players[0].count : 0} / 5
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">
                                        {team.region || 'Unknown'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${team.payment_status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                            }`}>
                                            {team.payment_status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-red-500 hover:text-red-400 transition-colors text-sm font-medium uppercase tracking-wider">
                                            Kick
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {teams.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No teams have registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <TournamentBracketManager matches={matches} tournamentId={tournament.id} />
        </div>
    )
}
