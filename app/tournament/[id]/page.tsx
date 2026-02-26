import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SafeAvatar from '@/components/SafeAvatar'
import ActivityFeed from '@/components/ActivityFeed'
import TournamentTabs from '@/components/TournamentTabs'
import DoubleElimBracket from '@/components/DoubleElimBracket'
import GroupStandings from '@/components/GroupStandings'
import GroupSchedule from '@/components/GroupSchedule'
import MiniTwitchPlayer from '@/components/MiniTwitchPlayer'

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
    group_id?: string | null
    tournament_players: {
        id: string;
        user_id: string;
        steam_id: string | null;
        users: { username: string; avatar: string | null } | null
    }[]
}

interface Match {
    id: string
    round: number
    state: string
    phase?: string
    team1_id: string | null
    team2_id: string | null
    winner_id: string | null
    team1: { id: string; name: string; logo_url: string | null } | null
    team2: { id: string; name: string; logo_url: string | null } | null
    winner: { name: string } | null
    team1_score: number
    team2_score: number
    scheduled_time: string | null
    created_at: string
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'brackets', label: 'Brackets', icon: '⚔' },
    { id: 'groups', label: 'Groups', icon: '📊' },
    { id: 'roster', label: 'Roster', icon: '👥' },
]

export default function TournamentHubPage() {
    const params = useParams()
    const tournamentId = params.id as string

    const [activeTab, setActiveTab] = useState('overview')
    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    const [matches, setMatches] = useState<Match[]>([])
    const [groupsData, setGroupsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            // Fetch everything in parallel
            const [bracketRes, groupRes] = await Promise.all([
                fetch(`/api/tournaments/${tournamentId}/brackets`),
                fetch(`/api/tournaments/${tournamentId}/groups`).catch(() => null)
            ])

            if (!bracketRes.ok) throw new Error('Failed to load tournament data')

            const bracketData = await bracketRes.json()
            setTournament(bracketData.tournament)
            setTeams(bracketData.teams || [])
            setMatches(bracketData.matches || [])

            if (groupRes?.ok) {
                const groupData = await groupRes.json()
                setGroupsData(groupData)
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (tournamentId) fetchData()
    }, [tournamentId])

    // Live polling for brackets
    useEffect(() => {
        if (!tournament || tournament.status !== 'live') return
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [tournament, tournamentId])

    const completedMatches = useMemo(() => matches.filter(m => m.state === 'completed'), [matches])
    const liveMatches = useMemo(() => matches.filter(m => m.state === 'live'), [matches])
    const totalRounds = useMemo(() => matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0, [matches])

    // Find champion
    const finalMatch = useMemo(() => matches.find(m => m.round === totalRounds && m.state === 'completed'), [matches, totalRounds])
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
                        <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-mono">Loading Tournament Hub</p>
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
                        <h1 className="text-3xl font-rajdhani font-bold text-[#dc143c] mb-4 text-glow">TOURNAMENT NOT FOUND</h1>
                        <p className="text-zinc-500 font-mono text-sm mb-8">{error || 'This tournament does not exist.'}</p>
                        <Link href="/#tournaments" className="px-6 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all uppercase tracking-widest text-xs font-bold rounded-sm">
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

            {/* Live Stream Overlay Component */}
            {tournament.status === 'live' && <MiniTwitchPlayer />}

            {/* Hero Section - Optimized for Multi-Tab Hub */}
            <div className="relative overflow-hidden border-b border-white/5 bg-zinc-950/50">
                {/* Background Mesh Gradient */}
                <div className="absolute inset-0 bg-[#dc143c]/[0.02] mix-blend-overlay"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[70%] bg-[#dc143c]/10 blur-[120px] rounded-full mix-blend-screen opacity-30 animate-pulse-slow"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen opacity-20 animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#dc143c]/[0.05] via-transparent to-transparent"></div>

                <div className="relative pt-32 pb-12 px-6 mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                        {/* Title & Info */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] border ${status.color} ${status.bg} ${status.border}`}>
                                    {tournament.status === 'live' && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>}
                                    {status.label}
                                </span>
                                <span className="text-zinc-600 font-mono text-[9px] uppercase tracking-widest pl-3 border-l border-white/10">
                                    {tournament.game} / {tournament.id.substring(0, 8)}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-rajdhani font-black uppercase tracking-tight mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                {tournament.name}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                                <span>📅 {new Date(tournament.start_date).toLocaleDateString()}</span>
                                <span>🏆 {tournament.currency === 'USD' ? '$' : tournament.currency}{tournament.prize_pool.toLocaleString()} Pool</span>
                                <span>👥 {teams.length} / {tournament.max_slots} Teams</span>
                            </div>
                        </div>

                        {/* Champion Quick View */}
                        {championName && (
                            <div className="hidden lg:flex items-center gap-4 px-6 py-4 bg-yellow-500/5 border border-yellow-500/10 rounded-sm backdrop-blur-md">
                                <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]">👑</span>
                                <div>
                                    <p className="text-[8px] text-yellow-500/60 font-bold uppercase tracking-widest mb-1">Defending Champion</p>
                                    <p className="text-xl font-rajdhani font-black text-yellow-400 uppercase tracking-wide">{championName}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-12">
                        <TournamentTabs
                            tabs={TABS}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-6 py-12 mx-auto max-w-7xl min-h-[60vh]">

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Tournament Details & Feed */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Bio / Description */}
                                <div className="p-8 border border-white/5 bg-zinc-900/20 rounded-sm">
                                    <h2 className="text-xs text-[#dc143c] font-bold tracking-[0.5em] uppercase mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 bg-[#dc143c] rounded-full"></span>
                                        About Tournament
                                    </h2>
                                    <p className="text-zinc-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                        {tournament.description || "No description available for this event."}
                                    </p>
                                </div>

                                {/* Activity Feed */}
                                <ActivityFeed matches={matches as any} />
                            </div>

                            {/* Right: Stats & Quick Brackets */}
                            <div className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 border border-white/5 bg-zinc-900/40 rounded-sm text-center">
                                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Played</p>
                                        <p className="text-2xl font-rajdhani font-black text-white">{completedMatches.length}</p>
                                    </div>
                                    <div className="p-4 border border-white/5 bg-zinc-900/40 rounded-sm text-center">
                                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Live</p>
                                        <p className={`text-2xl font-rajdhani font-black ${liveMatches.length > 0 ? 'text-green-400' : 'text-zinc-700'}`}>
                                            {liveMatches.length}
                                        </p>
                                    </div>
                                </div>

                                {/* Top 8 Roster Preview */}
                                <div className="p-6 border border-white/5 bg-zinc-900/20 rounded-sm">
                                    <h3 className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-4">Participating Teams</h3>
                                    <div className="space-y-2">
                                        {teams.slice(0, 8).map(team => (
                                            <div key={team.id} className="flex items-center gap-3 p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/5 rounded-sm transition-all group">
                                                <div className="w-8 h-8 rounded-[2px] overflow-hidden border border-white/10 shrink-0">
                                                    <SafeAvatar src={team.logo_url} alt="" size={32} fallbackName={team.name} />
                                                </div>
                                                <span className="text-xs font-rajdhani font-bold text-zinc-300 group-hover:text-white transition-colors">{team.name}</span>
                                            </div>
                                        ))}
                                        {teams.length > 8 && (
                                            <button onClick={() => setActiveTab('roster')} className="w-full py-2 text-[9px] text-zinc-600 hover:text-white font-bold uppercase tracking-widest transition-colors border-t border-white/5 mt-2">
                                                View all {teams.length} teams →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BRACKETS TAB */}
                {activeTab === 'brackets' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {matches.length > 0 ? (
                            <DoubleElimBracket matches={matches as any} teams={teams as any} />
                        ) : (
                            <div className="py-20 text-center border border-dashed border-white/10 rounded-sm">
                                <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Brackets have not been started yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* GROUPS TAB */}
                {activeTab === 'groups' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {groupsData?.groupNames?.length > 0 ? (
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="w-full lg:w-2/3">
                                    <h2 className="text-xs text-blue-400 font-bold tracking-[0.5em] uppercase mb-8 flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        Group Standings
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {groupsData.groupNames.map((name: string) => (
                                            <GroupStandings key={name} groupName={name} teams={groupsData.groups[name]} />
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full lg:w-1/3">
                                    <h2 className="text-xs text-zinc-500 font-bold tracking-[0.5em] uppercase mb-8 flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></span>
                                        Match Schedule
                                    </h2>
                                    <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                        <GroupSchedule matches={groupsData.matches} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center border border-dashed border-white/10 rounded-sm">
                                <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">No group stages configured for this tournament</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ROSTER TAB */}
                {activeTab === 'roster' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {teams.map((team) => (
                                <div key={team.id} className="group border border-white/5 bg-zinc-900/20 rounded-sm p-5 text-center transition-all hover:bg-zinc-800/40 hover:border-white/10">
                                    <div className="w-16 h-16 bg-zinc-800 border-[3px] border-zinc-900 shadow-xl overflow-hidden flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-500">
                                        <SafeAvatar src={team.logo_url} alt={team.name} size={64} fallbackName={team.name} />
                                    </div>
                                    <h3 className="font-rajdhani font-black text-white text-[15px] uppercase tracking-wide truncate group-hover:text-[#dc143c] transition-colors">
                                        {team.name}
                                    </h3>
                                    <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.2em] mt-1 mb-4">
                                        {team.tournament_players.length} Players
                                    </p>

                                    {/* Mini roster preview */}
                                    <div className="flex justify-center -space-x-1.5">
                                        {team.tournament_players.slice(0, 5).map((p, idx) => (
                                            <div key={p.id} className="w-6 h-6 rounded-full border-2 border-zinc-900 overflow-hidden bg-zinc-800" title={p.users?.username || 'Unknown'}>
                                                <SafeAvatar src={p.users?.avatar} alt="" size={24} fallbackName={p.users?.username || '?'} />
                                            </div>
                                        ))}
                                        {Array.from({ length: Math.max(0, 5 - team.tournament_players.length) }).map((_, i) => (
                                            <div key={`e-${i}`} className="w-6 h-6 rounded-full border border-dashed border-white/10 flex items-center justify-center bg-transparent">
                                                <span className="text-[8px] text-zinc-800">+</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            <Footer />
        </main>
    )
}
