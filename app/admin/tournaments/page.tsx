import { getTournaments } from '@/lib/tournament-db'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminTournamentsPage() {
    const tournaments = await getTournaments()

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide">
                        Tournaments
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Manage your Dota 2 competitions
                    </p>
                </div>
                <Link
                    href="/admin/tournaments/new"
                    className="px-6 py-2 bg-[#dc143c] text-white font-rajdhani font-bold tracking-wider hover:bg-white hover:text-black transition-all duration-300 rounded-[2px] uppercase text-sm"
                >
                    Create Tournament
                </Link>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Slots</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tournaments.map((tournament) => (
                                <tr key={tournament.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <p className="font-medium text-white">{tournament.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{tournament.game}</p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">
                                        {new Date(tournament.start_date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">
                                        {tournament.max_slots}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${tournament.status === 'live' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            tournament.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                tournament.status === 'registration_open' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                            }`}>
                                            {tournament.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/admin/tournaments/${tournament.id}`}
                                            className="text-[#dc143c] hover:text-white transition-colors text-sm font-medium"
                                        >
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {tournaments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No tournaments created yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
