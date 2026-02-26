import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default async function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const { data: match, error } = await supabaseAdmin
        .from('tournament_matches')
        .select(`
            *,
            team1:team1_id(name, logo_url),
            team2:team2_id(name, logo_url),
            winner:winner_id(name)
        `)
        .eq('id', id)
        .single()

    if (error || !match) {
        notFound()
    }

    const stats = match.match_stats
    const hasStats = stats && Object.keys(stats).length > 0 && stats.players

    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#dc143c]/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6 mx-auto max-w-6xl min-h-[80vh]">
                <div className="mb-8">
                    <Link href={`/tournament/${match.tournament_id}`} className="text-[#dc143c] hover:text-white font-mono text-sm tracking-widest uppercase transition-colors flex items-center gap-2">
                        ← Back to Tournament
                    </Link>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-rajdhani font-black tracking-tighter uppercase mb-4">
                        Match Details
                        {match.opendota_match_id && (
                            <span className="text-zinc-500 text-lg ml-4 font-mono">ID: {match.opendota_match_id}</span>
                        )}
                    </h1>
                    <div className="flex justify-center items-center gap-4 text-xs font-mono text-zinc-400 uppercase tracking-widest">
                        <span>Round {match.round}</span>
                        <span>•</span>
                        <span>{match.state}</span>
                    </div>
                </div>

                {/* Match Headers */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <span className="text-[200px] font-black italic">VS</span>
                    </div>

                    <div className="flex flex-col items-center gap-4 z-10 w-full md:w-1/3">
                        <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center overflow-hidden bg-zinc-900 ${match.winner_id === match.team1_id ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-zinc-800'}`}>
                            {match.team1?.logo_url ? (
                                <img src={match.team1.logo_url} alt={match.team1.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-rajdhani font-bold text-4xl text-zinc-600">{match.team1?.name?.charAt(0) || '?'}</span>
                            )}
                        </div>
                        <h2 className={`text-2xl font-rajdhani font-bold uppercase tracking-widest ${match.winner_id === match.team1_id ? 'text-green-400' : ''}`}>{match.team1?.name || 'TBD'}</h2>
                        <span className="text-4xl font-black font-mono">{match.team1_score}</span>
                    </div>

                    <div className="z-10 text-zinc-600 font-black italic text-4xl">VS</div>

                    <div className="flex flex-col items-center gap-4 z-10 w-full md:w-1/3">
                        <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center overflow-hidden bg-zinc-900 ${match.winner_id === match.team2_id ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-zinc-800'}`}>
                            {match.team2?.logo_url ? (
                                <img src={match.team2.logo_url} alt={match.team2.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-rajdhani font-bold text-4xl text-zinc-600">{match.team2?.name?.charAt(0) || '?'}</span>
                            )}
                        </div>
                        <h2 className={`text-2xl font-rajdhani font-bold uppercase tracking-widest ${match.winner_id === match.team2_id ? 'text-green-400' : ''}`}>{match.team2?.name || 'TBD'}</h2>
                        <span className="text-4xl font-black font-mono">{match.team2_score}</span>
                    </div>
                </div>

                {hasStats ? (
                    <div className="space-y-12">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-sm">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">Duration</p>
                                <p className="text-xl font-rajdhani font-bold">{Math.floor(stats.duration / 60)}:{String(stats.duration % 60).padStart(2, '0')}</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-sm">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">Game Mode</p>
                                <p className="text-xl font-rajdhani font-bold">{stats.game_mode}</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-sm">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">Radiant Kills</p>
                                <p className="text-xl font-rajdhani font-bold text-green-400">{stats.radiant_score}</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-sm">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">Dire Kills</p>
                                <p className="text-xl font-rajdhani font-bold text-red-400">{stats.dire_score}</p>
                            </div>
                        </div>

                        {/* Player Stats Table */}
                        <div className="bg-black border border-white/10 rounded-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-zinc-900/80 border-b border-white/10">
                                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-widest">Player</th>
                                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-widest">Faction</th>
                                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-widest text-center">K / D / A</th>
                                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-widest text-right">Net Worth</th>
                                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-widest text-right">GPM / XPM</th>
                                            <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-widest text-right">Damage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {stats.players?.map((p: any, idx: number) => {
                                            const isRadiant = p.player_slot < 128;
                                            return (
                                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4 font-mono text-sm text-white">
                                                        {p.personaname || `Player ${p.account_id || 'Unknown'}`}
                                                    </td>
                                                    <td className="p-4 text-xs font-bold uppercase tracking-widest">
                                                        {isRadiant ? <span className="text-green-500">Radiant</span> : <span className="text-red-500">Dire</span>}
                                                    </td>
                                                    <td className="p-4 text-center font-mono font-bold tracking-widest">
                                                        <span className="text-green-400">{p.kills}</span> / <span className="text-red-400">{p.deaths}</span> / <span className="text-zinc-400">{p.assists}</span>
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-[#eab308]">
                                                        {(p.net_worth || 0).toLocaleString()}
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-sm text-zinc-300">
                                                        {p.gold_per_min} / {p.xp_per_min}
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-purple-400">
                                                        {(p.hero_damage || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <a href={`https://www.opendota.com/matches/${match.opendota_match_id}`} target="_blank" className="px-8 py-3 bg-[#dc143c] hover:bg-white hover:text-black font-rajdhani font-bold text-xs uppercase tracking-widest transition-colors rounded-sm">
                                View Full OpenDota Analytics
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 border border-white/5 bg-white/[0.02] rounded-sm">
                        <svg className="w-12 h-12 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-xl font-rajdhani font-bold text-zinc-400 mb-2 uppercase tracking-widest">No Post-Match Analytics Available</h3>
                        <p className="text-sm font-mono text-zinc-600 max-w-md mx-auto">
                            This match either hasn't been played yet, or it was scored manually without OpenDota verification.
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    )
}
