'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SafeAvatar from '@/components/SafeAvatar'

interface Tournament {
    id: string
    name: string
    game: string
    status: string
    start_date: string
    end_date: string | null
    max_slots: number
    entry_fee: number
    prize_pool: number
    currency: string
    description: string | null
}

interface Team {
    id: string
    name: string
    logo_url: string | null
    tournament_players: { id: string; user_id: string; steam_id: string | null; users: { username: string; avatar: string | null } | null }[]
}

interface Match {
    id: string
    round: number
    state: string
    team1: { name: string } | null
    team2: { name: string } | null
    winner: { name: string } | null
    team1_score: number
    team2_score: number
}

export default function TournamentHubPage() {
    const params = useParams()
    const tournamentId = params.id as string

    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/tournaments/${tournamentId}/brackets`)
                if (!res.ok) throw new Error('Failed to load tournament data')
                const data = await res.json()
                setTournament(data.tournament)
                setTeams(data.teams || [])
                setMatches(data.matches || [])
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        if (tournamentId) fetchData()
    }, [tournamentId])

    const completedMatches = matches.filter(m => m.state === 'completed')
    const liveMatches = matches.filter(m => m.state === 'live')
    const pendingMatches = matches.filter(m => m.state === 'pending' && m.team1 && m.team2)
    const totalRounds = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0

    // Find champion
    const finalMatch = matches.find(m => m.round === totalRounds && m.state === 'completed')
    const championName = finalMatch?.winner?.name

    const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
        'registration_open': { label: 'Registration Open', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
        'upcoming': { label: 'Upcoming', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        'live': { label: 'Live', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        'completed': { label: 'Completed', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="pt-32 pb-20 flex items-center justify-center min-h-[80vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-mono">Loading Tournament</p>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    if (error || !tournament) {
        return (
            <main className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="pt-32 pb-20 flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <h1 className="text-3xl font-rajdhani font-bold text-[#dc143c] mb-4">TOURNAMENT NOT FOUND</h1>
                        <p className="text-zinc-500 font-mono text-sm mb-8">{error || 'This tournament does not exist.'}</p>
                        <Link href="/#tournaments" className="px-6 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-widest text-xs font-bold rounded-sm">
                            Back to Arena
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    const status = statusConfig[tournament.status] || statusConfig['upcoming']

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background elements */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#dc143c]/[0.04] via-transparent to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                    <span className="text-[300px] font-rajdhani font-black text-white uppercase leading-none">{tournament.game}</span>
                </div>

                <div className="relative pt-32 pb-16 px-6 mx-auto max-w-6xl text-center">
                    {/* Status Badge */}
                    <div className="flex justify-center mb-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.3em] border ${status.color} ${status.bg} ${status.border}`}>
                            {tournament.status === 'live' && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>}
                            {status.label}
                        </span>
                    </div>

                    {/* Tournament Name */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#dc143c]"></span>
                        <span className="text-[#dc143c] text-[10px] font-bold tracking-[0.5em] uppercase">{tournament.game} Tournament</span>
                        <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#dc143c]"></span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-rajdhani font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400/80 mb-4">
                        {tournament.name}
                    </h1>

                    {tournament.description && (
                        <p className="text-sm text-zinc-500 font-mono max-w-xl mx-auto mb-8">{tournament.description}</p>
                    )}

                    {/* Champion Banner */}
                    {championName && (
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border border-yellow-500/20 rounded-sm mb-8">
                            <span className="text-2xl">👑</span>
                            <div className="text-left">
                                <p className="text-[9px] text-yellow-500/60 font-bold uppercase tracking-[0.3em]">Tournament Champion</p>
                                <p className="text-lg font-rajdhani font-bold text-yellow-400 uppercase tracking-wide">{championName}</p>
                            </div>
                        </div>
                    )}

                    {/* Prize Pool */}
                    <div className="flex items-center justify-center gap-8 mb-8">
                        <div>
                            <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest mb-1">Prize Pool</p>
                            <p className="text-3xl font-rajdhani font-black text-[#dc143c]">
                                {tournament.currency === 'USD' ? '$' : tournament.currency}{tournament.prize_pool.toLocaleString()}
                            </p>
                        </div>
                        {tournament.entry_fee > 0 && (
                            <div className="pl-8 border-l border-white/10">
                                <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest mb-1">Entry Fee</p>
                                <p className="text-xl font-rajdhani font-bold text-white">
                                    {tournament.currency === 'USD' ? '$' : tournament.currency}{tournament.entry_fee}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Date */}
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                        {new Date(tournament.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        {tournament.end_date && ` — ${new Date(tournament.end_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-6 mx-auto max-w-6xl -mt-4 mb-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border border-white/10 bg-zinc-900/60 p-5 rounded-sm backdrop-blur-sm text-center">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Teams</p>
                        <p className="text-3xl font-rajdhani font-black text-white">{teams.length}</p>
                        <p className="text-[9px] text-zinc-600 font-mono mt-1">of {tournament.max_slots} slots</p>
                    </div>
                    <div className="border border-white/10 bg-zinc-900/60 p-5 rounded-sm backdrop-blur-sm text-center">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Matches Played</p>
                        <p className="text-3xl font-rajdhani font-black text-white">{completedMatches.length}</p>
                        <p className="text-[9px] text-zinc-600 font-mono mt-1">of {matches.length} total</p>
                    </div>
                    <div className="border border-white/10 bg-zinc-900/60 p-5 rounded-sm backdrop-blur-sm text-center">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Live Now</p>
                        <p className={`text-3xl font-rajdhani font-black ${liveMatches.length > 0 ? 'text-green-400' : 'text-zinc-700'}`}>{liveMatches.length}</p>
                        <p className="text-[9px] text-zinc-600 font-mono mt-1">{liveMatches.length > 0 ? 'in progress' : 'none active'}</p>
                    </div>
                    <div className="border border-white/10 bg-zinc-900/60 p-5 rounded-sm backdrop-blur-sm text-center">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Total Players</p>
                        <p className="text-3xl font-rajdhani font-black text-white">{teams.reduce((acc, t) => acc + t.tournament_players.length, 0)}</p>
                        <p className="text-[9px] text-zinc-600 font-mono mt-1">registered</p>
                    </div>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className="px-6 mx-auto max-w-6xl mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* View Brackets */}
                    <Link href={`/tournament/${tournamentId}/brackets`}
                        className="group border border-white/10 bg-zinc-900/40 rounded-sm p-6 hover:border-[#dc143c]/30 transition-all hover:bg-[#dc143c]/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-sm bg-[#dc143c]/10 border border-[#dc143c]/20 flex items-center justify-center group-hover:bg-[#dc143c]/20 transition-colors">
                                <span className="text-xl">⚔</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-rajdhani font-bold text-white uppercase tracking-wide group-hover:text-[#dc143c] transition-colors">View Brackets</h3>
                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Tournament bracket tree</p>
                            </div>
                            <span className="text-zinc-600 group-hover:text-[#dc143c] transition-colors text-xl">→</span>
                        </div>
                    </Link>

                    {/* Group Stages */}
                    <Link href={`/tournament/${tournamentId}/groups`}
                        className="group border border-white/10 bg-zinc-900/40 rounded-sm p-6 hover:border-blue-500/30 transition-all hover:bg-blue-500/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <span className="text-xl">📊</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-rajdhani font-bold text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors">Group Stages</h3>
                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Round Robin & Standings</p>
                            </div>
                            <span className="text-zinc-600 group-hover:text-blue-400 transition-colors text-xl">→</span>
                        </div>
                    </Link>

                    {/* Leaderboard */}
                    <Link href={`/tournament/${tournamentId}/leaderboard`}
                        className="group border border-white/10 bg-zinc-900/40 rounded-sm p-6 hover:border-yellow-500/30 transition-all hover:bg-yellow-500/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-sm bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                                <span className="text-xl">🏆</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-rajdhani font-bold text-white uppercase tracking-wide group-hover:text-yellow-400 transition-colors">Leaderboard</h3>
                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Team standings & stats</p>
                            </div>
                            <span className="text-zinc-600 group-hover:text-yellow-400 transition-colors text-xl">→</span>
                        </div>
                    </Link>

                    {/* Team Dashboard */}
                    <Link href="/tournament/dashboard"
                        className="group border border-white/10 bg-zinc-900/40 rounded-sm p-6 hover:border-sky-500/30 transition-all hover:bg-sky-500/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-sm bg-sky-500/10 border border-sky-500/20 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                                <span className="text-xl">👥</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-rajdhani font-bold text-white uppercase tracking-wide group-hover:text-sky-400 transition-colors">My Team</h3>
                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Dashboard & roster</p>
                            </div>
                            <span className="text-zinc-600 group-hover:text-sky-400 transition-colors text-xl">→</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Matches */}
            {completedMatches.length > 0 && (
                <div className="px-6 mx-auto max-w-6xl mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-8 h-[1px] bg-[#dc143c]"></span>
                        <h2 className="text-xs text-[#dc143c] font-bold tracking-[0.5em] uppercase">Recent Results</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {completedMatches.slice(-6).reverse().map((match) => (
                            <div key={match.id} className="border border-white/10 bg-zinc-900/40 rounded-sm p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">
                                        {match.round === totalRounds ? 'Grand Final' :
                                            match.round === totalRounds - 1 ? 'Semi-Final' : `Round ${match.round}`}
                                    </span>
                                    <span className="text-[8px] text-green-400/60 font-mono uppercase">Completed</span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className={`flex justify-between items-center px-2 py-1.5 rounded-sm ${match.winner?.name === match.team1?.name ? 'bg-[#dc143c]/10 border border-[#dc143c]/20' : 'bg-white/[0.02]'}`}>
                                        <span className={`text-xs font-rajdhani font-bold ${match.winner?.name === match.team1?.name ? 'text-[#dc143c]' : 'text-zinc-500'}`}>
                                            {match.team1?.name || 'TBD'}
                                        </span>
                                        <span className={`font-mono font-bold text-sm ${match.winner?.name === match.team1?.name ? 'text-[#dc143c]' : 'text-zinc-600'}`}>
                                            {match.team1_score}
                                        </span>
                                    </div>
                                    <div className={`flex justify-between items-center px-2 py-1.5 rounded-sm ${match.winner?.name === match.team2?.name ? 'bg-[#dc143c]/10 border border-[#dc143c]/20' : 'bg-white/[0.02]'}`}>
                                        <span className={`text-xs font-rajdhani font-bold ${match.winner?.name === match.team2?.name ? 'text-[#dc143c]' : 'text-zinc-500'}`}>
                                            {match.team2?.name || 'TBD'}
                                        </span>
                                        <span className={`font-mono font-bold text-sm ${match.winner?.name === match.team2?.name ? 'text-[#dc143c]' : 'text-zinc-600'}`}>
                                            {match.team2_score}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Teams Grid */}
            <div className="px-6 mx-auto max-w-6xl mb-20">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-8 h-[1px] bg-[#dc143c]"></span>
                    <h2 className="text-xs text-[#dc143c] font-bold tracking-[0.5em] uppercase">Registered Teams</h2>
                    <span className="text-[10px] text-zinc-600 font-mono ml-2">{teams.length}/{tournament.max_slots}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {teams.map((team) => (
                        <div key={team.id} className="border border-white/10 bg-zinc-900/40 rounded-sm p-4 hover:border-white/20 transition-colors group text-center">
                            <div className="w-14 h-14 bg-zinc-800 border-2 border-transparent hover:border-white/10 overflow-hidden flex items-center justify-center mx-auto mb-3">
                                <SafeAvatar src={team.logo_url} alt={team.name} size={56} fallbackName={team.name} />
                            </div>
                            <h3 className="font-rajdhani font-bold text-white text-sm uppercase tracking-wide truncate group-hover:text-[#dc143c] transition-colors">{team.name}</h3>
                            <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest mt-1">{team.tournament_players.length}/5 Players</p>

                            {/* Player avatars row */}
                            <div className="flex justify-center gap-0.5 mt-3">
                                {team.tournament_players.slice(0, 5).map((p) => (
                                    <div key={p.id} className="w-5 h-5 rounded-full overflow-hidden border border-white/10 bg-zinc-800">
                                        <SafeAvatar src={p.users?.avatar} alt={p.users?.username || '?'} size={20} fallbackName={p.users?.username || '?'} />
                                    </div>
                                ))}
                                {Array.from({ length: Math.max(0, 5 - team.tournament_players.length) }).map((_, i) => (
                                    <div key={`e-${i}`} className="w-5 h-5 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                                        <span className="text-[6px] text-zinc-700">+</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Empty slots */}
                    {Array.from({ length: Math.max(0, Math.min(3, tournament.max_slots - teams.length)) }).map((_, i) => (
                        <div key={`empty-${i}`} className="border border-dashed border-white/10 bg-transparent rounded-sm p-4 flex flex-col items-center justify-center min-h-[140px] opacity-40">
                            <div className="w-14 h-14 rounded-sm border border-dashed border-white/20 flex items-center justify-center mb-3">
                                <span className="text-zinc-600 text-2xl">+</span>
                            </div>
                            <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Open Slot</p>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    )
}
