import { getAdminUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getTournamentMatches, getTournamentTeams } from '@/lib/tournament-db'
import BracketGenerator from '@/components/admin/BracketGenerator'
import TournamentBracketManager from '@/components/admin/TournamentBracketManager'
import Link from 'next/link'

export default async function BracketManagerPage({
    searchParams
}: {
    searchParams: Promise<{ tournament?: string }>
}) {
    const adminUser = await getAdminUser()
    if (!adminUser) return <p className="text-red-500 p-8">Admin access required.</p>

    const resolvedParams = await searchParams

    // Fetch all tournaments for the selector
    const { data: tournaments } = await supabaseAdmin
        .from('tournaments')
        .select('id, name, game, status, max_slots, start_date')
        .order('created_at', { ascending: false })

    const allTournaments = tournaments || []
    const selectedId = resolvedParams.tournament || allTournaments[0]?.id || null
    const selected = allTournaments.find(t => t.id === selectedId) || null

    let teams: any[] = []
    let matches: any[] = []

    if (selectedId) {
        teams = await getTournamentTeams(selectedId)
        matches = await getTournamentMatches(selectedId)
    }

    const completedCount = matches.filter((m: any) => m.state === 'completed').length
    const liveCount = matches.filter((m: any) => m.state === 'live').length
    const pendingCount = matches.filter((m: any) => m.state === 'pending').length

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide">
                    Bracket Manager
                </h1>
                <p className="text-gray-400 mt-1">
                    Manage tournament brackets, schedule matches, and verify results.
                </p>
            </div>

            {/* Tournament Selector */}
            <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-2">
                            Select Tournament
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {allTournaments.map(t => (
                                <Link
                                    key={t.id}
                                    href={`/admin/bracket-manager?tournament=${t.id}`}
                                    className={`px-4 py-2.5 rounded-sm text-sm font-medium transition-all border ${t.id === selectedId
                                        ? 'bg-[#dc143c]/10 border-[#dc143c]/40 text-[#dc143c] font-bold'
                                        : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-zinc-600'
                                        }`}
                                >
                                    <span className="font-rajdhani">{t.name}</span>
                                    <span className={`ml-2 text-[9px] uppercase tracking-widest font-mono px-1.5 py-0.5 rounded ${t.status === 'live' ? 'bg-green-500/10 text-green-400' :
                                        t.status === 'registration_open' ? 'bg-yellow-500/10 text-yellow-400' :
                                            'bg-zinc-800 text-zinc-500'
                                        }`}>
                                        {t.status.replace('_', ' ')}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selected ? (
                <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white/[0.02] border border-white/10 rounded-sm p-4">
                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Teams</p>
                            <p className="text-xl font-rajdhani font-bold text-white">{teams.length} <span className="text-zinc-600 text-sm">/ {selected.max_slots}</span></p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/10 rounded-sm p-4">
                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Total Matches</p>
                            <p className="text-xl font-rajdhani font-bold text-white">{matches.length}</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/10 rounded-sm p-4">
                            <p className="text-[9px] text-green-500 font-mono uppercase tracking-widest mb-1">Completed</p>
                            <p className="text-xl font-rajdhani font-bold text-green-400">{completedCount}</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/10 rounded-sm p-4">
                            <p className="text-[9px] text-yellow-500 font-mono uppercase tracking-widest mb-1">Live</p>
                            <p className="text-xl font-rajdhani font-bold text-yellow-400">{liveCount}</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/10 rounded-sm p-4">
                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Pending</p>
                            <p className="text-xl font-rajdhani font-bold text-zinc-400">{pendingCount}</p>
                        </div>
                    </div>

                    {/* Generate Bracket Button */}
                    {matches.length === 0 && teams.length >= 2 && (
                        <div className="bg-[#dc143c]/5 border border-[#dc143c]/20 rounded-sm p-6 flex items-center justify-between">
                            <div>
                                <p className="text-white font-rajdhani font-bold text-lg">No bracket generated yet</p>
                                <p className="text-zinc-500 text-sm mt-1">Generate a bracket to start managing matches for {selected.name}.</p>
                            </div>
                            <BracketGenerator tournamentId={selected.id} disabled={teams.length < 2} teamCount={teams.length} />
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <Link
                            href={`/tournament/${selected.id}/brackets`}
                            target="_blank"
                            className="px-4 py-2 bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            View Public Bracket ↗
                        </Link>
                        <Link
                            href={`/admin/tournaments/${selected.id}`}
                            className="px-4 py-2 bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            Tournament Settings
                        </Link>
                        <Link
                            href={`/tournament/${selected.id}`}
                            target="_blank"
                            className="px-4 py-2 bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            Tournament Hub ↗
                        </Link>
                        {matches.length > 0 && (
                            <div className="ml-auto">
                                <BracketGenerator tournamentId={selected.id} disabled={teams.length < 2} teamCount={teams.length} />
                            </div>
                        )}
                    </div>

                    {/* Bracket Manager Component */}
                    <TournamentBracketManager matches={matches} tournamentId={selected.id} />
                </>
            ) : (
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-12 text-center">
                    <span className="text-zinc-600 text-4xl block mb-4">🏆</span>
                    <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">
                        {allTournaments.length === 0 ? 'No tournaments created yet' : 'Select a tournament above'}
                    </p>
                </div>
            )}
        </div>
    )
}
