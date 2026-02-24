import { getTournamentById, getTournamentLeaderboard } from '@/lib/tournament-db'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default async function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const tournament = await getTournamentById(id)

    if (!tournament) {
        notFound()
    }

    const leaderboard = await getTournamentLeaderboard(id)

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6 mx-auto max-w-6xl min-h-[80vh]">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-rajdhani font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-900 mb-2">
                        {tournament.name} Leaderboard
                    </h1>
                    <p className="text-zinc-400 font-inter max-w-2xl mx-auto">
                        Official standings, points, and win/loss records. The top teams will secure their legacy.
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/40 border-b border-zinc-800">
                                    <th className="p-4 md:p-6 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-center w-16">Rank</th>
                                    <th className="p-4 md:p-6 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Team</th>
                                    <th className="p-4 md:p-6 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-center">Played</th>
                                    <th className="p-4 md:p-6 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-center text-green-500">W</th>
                                    <th className="p-4 md:p-6 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-center text-red-500">L</th>
                                    <th className="p-4 md:p-6 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {leaderboard.map((team, index) => (
                                    <tr key={team.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 md:p-6 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-rajdhani font-bold text-lg ${index === 0 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]' :
                                                index === 1 ? 'bg-zinc-300/10 text-zinc-300 border border-zinc-300/20' :
                                                    index === 2 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                        'bg-black text-zinc-500'
                                                }`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="p-4 md:p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                                                    {team.logo_url ? (
                                                        <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-zinc-500 font-bold font-rajdhani">{team.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <span className="font-bold text-white font-rajdhani text-xl tracking-wide group-hover:text-red-400 transition-colors">
                                                    {team.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-6 text-center font-mono text-zinc-400">
                                            {team.matchesPlayed}
                                        </td>
                                        <td className="p-4 md:p-6 text-center font-mono text-green-400 font-bold">
                                            {team.wins}
                                        </td>
                                        <td className="p-4 md:p-6 text-center font-mono text-red-400 font-bold">
                                            {team.losses}
                                        </td>
                                        <td className="p-4 md:p-6 text-right">
                                            <span className="font-rajdhani font-black text-2xl text-white">
                                                {team.points}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1">PTS</span>
                                        </td>
                                    </tr>
                                ))}

                                {leaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-zinc-500 font-inter">
                                            No teams or matches have been recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/#tournaments" className="inline-block px-6 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-widest text-sm font-rajdhani font-bold rounded">
                        Back to Arena
                    </Link>
                </div>
            </div>

            <Footer />
        </main>
    )
}
