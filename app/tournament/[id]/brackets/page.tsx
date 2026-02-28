'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DoubleElimBracket from '@/components/DoubleElimBracket'
import SafeAvatar from '@/components/SafeAvatar'

interface Player {
    id: string
    user_id: string
    steam_id: string | null
    users: {
        username: string
        avatar: string | null
    } | null
}

interface Team {
    id: string
    name: string
    logo_url: string | null
    captain_id: string
    tournament_players: Player[]
}

interface Match {
    id: string
    tournament_id: string
    team1_id: string | null
    team2_id: string | null
    winner_id: string | null
    team1_score: number
    team2_score: number
    round: number
    state: string
    phase: string
    match_format: string
    scheduled_time: string | null
    opendota_match_id?: string | null
    stream_url?: string | null
    team1: { id: string; name: string; logo_url: string | null } | null
    team2: { id: string; name: string; logo_url: string | null } | null
    winner: { name: string } | null
}

interface Tournament {
    id: string
    name: string
    game: string
    status: string
    challonge_url?: string | null
}

const MATCH_HEIGHT = 80
const MATCH_WIDTH = 260
const ROUND_GAP = 80
const CONNECTOR_WIDTH = 40

function getRoundLabel(round: number, totalRounds: number): string {
    if (round === totalRounds) return 'GRAND FINAL'
    if (round === totalRounds - 1 && totalRounds > 2) return 'SEMI-FINALS'
    if (round === totalRounds - 2 && totalRounds > 3) return 'QUARTER-FINALS'
    return `ROUND ${round}`
}

const rankTierLabels: Record<number, string> = {
    11: 'Herald I', 12: 'Herald II', 13: 'Herald III', 14: 'Herald IV', 15: 'Herald V',
    21: 'Guardian I', 22: 'Guardian II', 23: 'Guardian III', 24: 'Guardian IV', 25: 'Guardian V',
    31: 'Crusader I', 32: 'Crusader II', 33: 'Crusader III', 34: 'Crusader IV', 35: 'Crusader V',
    41: 'Archon I', 42: 'Archon II', 43: 'Archon III', 44: 'Archon IV', 45: 'Archon V',
    51: 'Legend I', 52: 'Legend II', 53: 'Legend III', 54: 'Legend IV', 55: 'Legend V',
    61: 'Ancient I', 62: 'Ancient II', 63: 'Ancient III', 64: 'Ancient IV', 65: 'Ancient V',
    71: 'Divine I', 72: 'Divine II', 73: 'Divine III', 74: 'Divine IV', 75: 'Divine V',
    80: 'Immortal',
}

export default function BracketsPage() {
    const params = useParams()
    const tournamentId = params.id as string

    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
    const [dotaProfiles, setDotaProfiles] = useState<Record<string, any>>({})
    const [loadingProfiles, setLoadingProfiles] = useState<Record<string, boolean>>({})
    const [selectedRosterTeam, setSelectedRosterTeam] = useState<Team | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/tournaments/${tournamentId}/brackets`)
                if (!res.ok) throw new Error('Failed to load bracket data')
                const data = await res.json()
                setTournament(data.tournament)
                setMatches(data.matches || [])
                setTeams(data.teams || [])
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        if (tournamentId) fetchData()
    }, [tournamentId])

    // Live polling — auto-refresh brackets every 30s when a tournament is live
    useEffect(() => {
        if (!tournament || tournament.status !== 'live') return
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/tournaments/${tournamentId}/brackets`)
                if (res.ok) {
                    const data = await res.json()
                    setMatches(data.matches || [])
                    setTeams(data.teams || [])
                }
            } catch { /* silent retry next interval */ }
        }, 30000)
        return () => clearInterval(interval)
    }, [tournament, tournamentId])

    const getTeamData = (teamId: string | null): Team | undefined => {
        if (!teamId) return undefined
        return teams.find(t => t.id === teamId)
    }

    const fetchDotaProfile = async (steamId: string) => {
        if (dotaProfiles[steamId] || loadingProfiles[steamId]) return
        setLoadingProfiles(prev => ({ ...prev, [steamId]: true }))
        try {
            const res = await fetch(`/api/dota/player/${steamId}`)
            if (res.ok) {
                const data = await res.json()
                setDotaProfiles(prev => ({ ...prev, [steamId]: data }))
            }
        } catch { }
        setLoadingProfiles(prev => ({ ...prev, [steamId]: false }))
    }

    // Group matches by round
    const roundsMap = matches.reduce((acc: Record<number, Match[]>, m) => {
        if (!acc[m.round]) acc[m.round] = []
        acc[m.round].push(m)
        return acc
    }, {})

    const roundNumbers = Object.keys(roundsMap).map(Number).sort((a, b) => a - b)
    const totalRounds = roundNumbers.length > 0 ? Math.max(...roundNumbers) : 0
    const round1Count = roundsMap[roundNumbers[0]]?.length || 0

    // Calculate layout dimensions
    const MATCH_VERTICAL_GAP = 24
    const totalHeight = round1Count * (MATCH_HEIGHT + MATCH_VERTICAL_GAP) - MATCH_VERTICAL_GAP
    const totalWidth = roundNumbers.length * (MATCH_WIDTH + ROUND_GAP + CONNECTOR_WIDTH) - ROUND_GAP

    // Calculate vertical position for a match in a given round
    const getMatchY = useCallback((roundIdx: number, matchIdx: number, matchesInRound: number): number => {
        // For round 1, evenly space matches
        if (roundIdx === 0) {
            const totalSpace = totalHeight
            const blockHeight = totalSpace / matchesInRound
            return matchIdx * blockHeight + (blockHeight - MATCH_HEIGHT) / 2
        }
        // For subsequent rounds, center between the two feeder matches
        const prevRoundMatchCount = matchesInRound * 2
        const feeder1Y = getMatchY(roundIdx - 1, matchIdx * 2, prevRoundMatchCount)
        const feeder2Y = getMatchY(roundIdx - 1, matchIdx * 2 + 1, prevRoundMatchCount)
        return (feeder1Y + feeder2Y) / 2
    }, [totalHeight])

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="pt-32 pb-20 flex items-center justify-center min-h-[80vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-mono">Loading Brackets</p>
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
                        <h1 className="text-3xl font-rajdhani font-bold text-[#dc143c] mb-4">BRACKET DATA UNAVAILABLE</h1>
                        <p className="text-zinc-500 font-mono text-sm mb-8">{error || 'Tournament not found.'}</p>
                        <Link href="/#tournaments" className="px-6 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-widest text-sm font-rajdhani font-bold rounded">
                            Back to Arena
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6 mx-auto max-w-[1800px] min-h-[80vh]">
                {/* Header */}
                <div className="mb-12 text-center relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                        <span className="text-[200px] font-rajdhani font-black text-white uppercase">BRACKETS</span>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                            <span className="text-[#dc143c] text-xs font-bold tracking-[0.5em] uppercase">{tournament.game}</span>
                            <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-rajdhani font-black tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            {tournament.name} <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-700">BRACKET</span>
                        </h1>
                        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                            Tournament Brackets • {tournament.status?.toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <Link href={`/tournament/${tournamentId}/leaderboard`}
                        className="px-5 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-widest text-[10px] font-bold rounded-sm">
                        Leaderboard
                    </Link>
                    <Link href="/#tournaments"
                        className="px-5 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-widest text-[10px] font-bold rounded-sm">
                        Back to Arena
                    </Link>
                </div>

                {/* Bracket Display */}
                {(tournament as any).challonge_url ? (
                    <div className="w-full h-[600px] md:h-[800px] rounded-sm overflow-hidden border border-white/10 bg-black">
                        <iframe src={`${(tournament as any).challonge_url}/module?theme=7681`} width="100%" height="100%" frameBorder="0" scrolling="auto" allowTransparency={true}></iframe>
                    </div>
                ) : matches.some(m => m.phase === 'upper_bracket' || m.phase === 'lower_bracket') ? (
                    <DoubleElimBracket matches={matches} teams={teams} />
                ) : matches.length === 0 ? (
                    <div className="text-center py-32 border border-white/10 bg-white/[0.02] rounded-sm">
                        <div className="w-16 h-16 mx-auto mb-6 border-2 border-dashed border-zinc-700 rounded-full flex items-center justify-center">
                            <span className="text-zinc-600 text-2xl">⚔</span>
                        </div>
                        <h3 className="text-2xl font-rajdhani font-bold text-zinc-400 uppercase tracking-wide mb-2">Brackets Not Generated</h3>
                        <p className="text-zinc-600 font-mono text-sm max-w-sm mx-auto">The bracket has not been initialized for this tournament yet.</p>
                    </div>
                ) : (
                    <div className="relative overflow-x-auto pb-8">
                        <div className="relative" style={{ width: totalWidth + 40, height: totalHeight + 40, minWidth: totalWidth + 40 }}>
                            {/* SVG Connector Lines */}
                            <svg
                                className="absolute inset-0 pointer-events-none"
                                width={totalWidth + 40}
                                height={totalHeight + 40}
                                style={{ zIndex: 0 }}
                            >
                                {roundNumbers.slice(0, -1).map((round, roundIdx) => {
                                    const nextRound = roundNumbers[roundIdx + 1]
                                    const currentMatches = roundsMap[round]
                                    const nextMatches = roundsMap[nextRound]
                                    if (!nextMatches) return null

                                    return currentMatches.map((m, matchIdx) => {
                                        const nextMatchIdx = Math.floor(matchIdx / 2)
                                        const isTop = matchIdx % 2 === 0

                                        // Source position (right side of current match)
                                        const srcX = roundIdx * (MATCH_WIDTH + ROUND_GAP + CONNECTOR_WIDTH) + MATCH_WIDTH + 20
                                        const srcY = getMatchY(roundIdx, matchIdx, currentMatches.length) + MATCH_HEIGHT / 2 + 20

                                        // Destination position (left side of next match)
                                        const dstX = (roundIdx + 1) * (MATCH_WIDTH + ROUND_GAP + CONNECTOR_WIDTH) + 20
                                        const dstY = getMatchY(roundIdx + 1, nextMatchIdx, nextMatches.length) + MATCH_HEIGHT / 2 + 20

                                        const midX = (srcX + dstX) / 2

                                        const isCompleted = m.state === 'completed'
                                        const isLive = m.state === 'live'

                                        return (
                                            <g key={`connector-${m.id}`}>
                                                <path
                                                    d={`M ${srcX} ${srcY} H ${midX} V ${dstY} H ${dstX}`}
                                                    fill="none"
                                                    stroke={isCompleted ? '#dc143c' : isLive ? '#eab308' : '#27272a'}
                                                    strokeWidth={isCompleted ? 2 : 1.5}
                                                    strokeOpacity={isCompleted ? 0.6 : isLive ? 0.5 : 0.4}
                                                />
                                                {/* Glow effect for completed */}
                                                {isCompleted && (
                                                    <path
                                                        d={`M ${srcX} ${srcY} H ${midX} V ${dstY} H ${dstX}`}
                                                        fill="none"
                                                        stroke="#dc143c"
                                                        strokeWidth={4}
                                                        strokeOpacity={0.1}
                                                        filter="url(#glow)"
                                                    />
                                                )}
                                            </g>
                                        )
                                    })
                                })}
                                <defs>
                                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                            </svg>

                            {/* Match Cards */}
                            {roundNumbers.map((round, roundIdx) => {
                                const roundMatches = roundsMap[round]
                                const label = getRoundLabel(round, totalRounds)
                                const isFinal = round === totalRounds
                                const roundX = roundIdx * (MATCH_WIDTH + ROUND_GAP + CONNECTOR_WIDTH) + 20

                                return (
                                    <div key={round}>
                                        {/* Round Header */}
                                        <div
                                            className="absolute"
                                            style={{ left: roundX, top: 0, width: MATCH_WIDTH }}
                                        >
                                            <div className={`text-center pb-2 border-b ${isFinal ? 'border-[#dc143c]/40' : 'border-white/10'}`}>
                                                <h3 className={`text-[10px] font-bold tracking-[0.3em] uppercase ${isFinal ? 'text-[#dc143c]' : 'text-zinc-600'}`}>
                                                    {label}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Matches */}
                                        {roundMatches.map((match, matchIdx) => {
                                            const matchY = getMatchY(roundIdx, matchIdx, roundMatches.length) + 20
                                            const isExpanded = expandedMatch === match.id
                                            const isCompleted = match.state === 'completed'
                                            const isLive = match.state === 'live'
                                            const isBye = (match.team1_id && !match.team2_id) || (!match.team1_id && match.team2_id)
                                            const team1Data = getTeamData(match.team1_id)
                                            const team2Data = getTeamData(match.team2_id)

                                            return (
                                                <div
                                                    key={match.id}
                                                    className="absolute"
                                                    style={{
                                                        left: roundX,
                                                        top: matchY,
                                                        width: MATCH_WIDTH,
                                                        zIndex: isExpanded ? 50 : 10
                                                    }}
                                                >
                                                    {/* Match Card */}
                                                    <div
                                                        onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                                                        className={`relative cursor-pointer transition-all duration-300 rounded-sm border overflow-hidden group
                                                            ${isFinal ? 'shadow-[0_0_30px_rgba(220,20,60,0.15)]' : ''}
                                                            ${isLive ? 'border-yellow-500/40 bg-yellow-500/[0.03] shadow-[0_0_20px_rgba(234,179,8,0.08)]' :
                                                                isCompleted ? 'border-[#dc143c]/25 bg-gradient-to-br from-[#dc143c]/[0.04] to-transparent' :
                                                                    'border-white/10 bg-zinc-900/70 hover:border-white/20'}
                                                            ${isExpanded ? 'ring-1 ring-[#dc143c]/40' : ''}
                                                        `}
                                                        style={{ height: MATCH_HEIGHT }}
                                                    >
                                                        {/* Top accent line */}
                                                        {(isFinal || isLive) && (
                                                            <div className={`absolute top-0 left-0 w-full h-0.5 ${isLive ? 'bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse' : 'bg-gradient-to-r from-transparent via-[#dc143c] to-transparent'}`}></div>
                                                        )}

                                                        {/* Live badge */}
                                                        {isLive && (
                                                            <div className="absolute top-1 right-1.5 flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 px-1.5 py-0.5 rounded-sm">
                                                                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                                                                <span className="text-[7px] text-yellow-400 font-bold uppercase tracking-widest">LIVE</span>
                                                            </div>
                                                        )}

                                                        {/* Team rows */}
                                                        <div className="flex flex-col h-full">
                                                            {/* Team 1 */}
                                                            <div className={`flex items-center justify-between px-3 flex-1 transition-colors ${match.winner_id === match.team1_id ? 'bg-[#dc143c]/[0.08]' : ''}`}>
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    <div className={`w-5 h-5 rounded-[2px] flex items-center justify-center shrink-0 overflow-hidden text-[8px] font-bold cursor-pointer hover:border-white/50 transition-colors
                                                                        ${match.winner_id === match.team1_id ? 'bg-[#dc143c]/20 text-[#dc143c] border border-[#dc143c]/30' : 'bg-white/5 text-zinc-500 border border-white/10'}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (match.team1_id) {
                                                                                const t = getTeamData(match.team1_id);
                                                                                if (t) setSelectedRosterTeam(t);
                                                                            }
                                                                        }}>
                                                                        {match.team1?.logo_url ? (
                                                                            <img src={match.team1.logo_url} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <span className="text-[10px] uppercase">{match.team1?.name?.[0] || '?'}</span>
                                                                        )}
                                                                    </div>
                                                                    <span
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (match.team1_id) {
                                                                                const t = getTeamData(match.team1_id);
                                                                                if (t) setSelectedRosterTeam(t);
                                                                            }
                                                                        }}
                                                                        className={`text-[11px] font-bold uppercase truncate tracking-tight hover:text-[#dc143c] transition-colors cursor-pointer
                                                                        ${match.team1_id ? 'text-white' : 'text-zinc-600 italic'}`}
                                                                    >
                                                                        {match.team1?.name || (isBye ? 'BYE' : 'TBD')}
                                                                    </span>
                                                                </div>
                                                                <span className={`font-mono font-bold text-sm ml-2 min-w-[20px] text-right
                                                                    ${match.winner_id === match.team1_id ? 'text-[#dc143c]' : isCompleted ? 'text-zinc-600' : 'text-zinc-700'}`}>
                                                                    {isCompleted || isLive ? match.team1_score : ''}
                                                                </span>
                                                            </div>

                                                            {/* Divider */}
                                                            <div className="h-[1px] bg-white/5 mx-2"></div>

                                                            {/* Team 2 */}
                                                            <div className={`flex items-center justify-between px-3 flex-1 transition-colors ${match.winner_id === match.team2_id ? 'bg-[#dc143c]/[0.08]' : ''}`}>
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    <div className={`w-5 h-5 rounded-[2px] flex items-center justify-center shrink-0 overflow-hidden text-[8px] font-bold cursor-pointer hover:border-white/50 transition-colors
                                                                        ${match.winner_id === match.team2_id ? 'bg-[#dc143c]/20 text-[#dc143c] border border-[#dc143c]/30' : 'bg-white/5 text-zinc-500 border border-white/10'}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (match.team2_id) {
                                                                                const t = getTeamData(match.team2_id);
                                                                                if (t) setSelectedRosterTeam(t);
                                                                            }
                                                                        }}>
                                                                        {match.team2?.logo_url ? (
                                                                            <img src={match.team2.logo_url} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <span className="text-[10px] uppercase">{match.team2?.name?.[0] || '?'}</span>
                                                                        )}
                                                                    </div>
                                                                    <span
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (match.team2_id) {
                                                                                const t = getTeamData(match.team2_id);
                                                                                if (t) setSelectedRosterTeam(t);
                                                                            }
                                                                        }}
                                                                        className={`text-[11px] font-bold uppercase truncate tracking-tight hover:text-[#dc143c] transition-colors cursor-pointer
                                                                        ${match.team2_id ? 'text-white' : 'text-zinc-600 italic'}`}
                                                                    >
                                                                        {match.team2?.name || (isBye ? 'BYE' : 'TBD')}
                                                                    </span>
                                                                </div>
                                                                <span className={`font-mono font-bold text-sm ml-2 min-w-[20px] text-right
                                                                    ${match.winner_id === match.team2_id ? 'text-[#dc143c]' : isCompleted ? 'text-zinc-600' : 'text-zinc-700'}`}>
                                                                    {isCompleted || isLive ? match.team2_score : ''}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Bottom status bar */}
                                                        <div className={`absolute bottom-0 left-0 right-0 h-0.5
                                                            ${isCompleted ? 'bg-[#dc143c]/40' : isLive ? 'bg-yellow-500/50 animate-pulse' : 'bg-zinc-800/50'}`}></div>
                                                    </div>

                                                    {/* Expanded Detail Panel */}
                                                    {isExpanded && (
                                                        <div className="mt-1 border border-white/10 bg-black/95 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl shadow-black/50" style={{ zIndex: 60 }}>
                                                            {/* Match Info Bar */}
                                                            <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                                                                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${isCompleted ? 'text-green-400' : isLive ? 'text-yellow-400' : 'text-zinc-500'}`}>
                                                                    {isCompleted ? '✓ Completed' : isLive ? '● Live Now' : isBye ? 'Bye Match' : 'Upcoming'}
                                                                </span>
                                                                <div className="flex items-center gap-3">
                                                                    {match.stream_url && (
                                                                        <a href={match.stream_url} target="_blank" rel="noreferrer" className="px-2 py-0.5 bg-[#9146FF]/10 text-[#9146FF] hover:bg-[#9146FF] hover:text-white transition-colors text-[9px] uppercase tracking-widest font-bold rounded-[2px] border border-[#9146FF]/30 flex items-center gap-1">
                                                                            ▶ Watch Live
                                                                        </a>
                                                                    )}
                                                                    {match.opendota_match_id && (
                                                                        <Link href={`/tournament/matches/${match.id}`} className="px-2 py-0.5 bg-[#dc143c]/10 text-[#dc143c] hover:bg-[#dc143c] hover:text-white transition-colors text-[9px] uppercase tracking-widest font-bold rounded-[2px] border border-[#dc143c]/30">
                                                                            Analytics
                                                                        </Link>
                                                                    )}
                                                                    {match.scheduled_time && (
                                                                        <span className="text-[9px] text-zinc-600 font-mono">
                                                                            {new Date(match.scheduled_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Team 1 Players */}
                                                            {team1Data && (
                                                                <div className="p-3 border-b border-white/5">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="w-1 h-3 bg-[#dc143c] rounded-full"></div>
                                                                        <h4 className="text-[9px] font-bold text-[#dc143c] uppercase tracking-[0.3em]">{team1Data.name}</h4>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {team1Data.tournament_players.map((player) => (
                                                                            <PlayerRow key={player.id} player={player} isCaptain={player.user_id === team1Data.captain_id} dotaProfile={player.steam_id ? dotaProfiles[player.steam_id] : null} isLoading={player.steam_id ? loadingProfiles[player.steam_id] : false} onHover={() => { if (player.steam_id) fetchDotaProfile(player.steam_id) }} />
                                                                        ))}
                                                                        {team1Data.tournament_players.length === 0 && <p className="text-[9px] text-zinc-600 font-mono py-1">No players registered</p>}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Team 2 Players */}
                                                            {team2Data && (
                                                                <div className="p-3">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="w-1 h-3 bg-zinc-500 rounded-full"></div>
                                                                        <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.3em]">{team2Data.name}</h4>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {team2Data.tournament_players.map((player) => (
                                                                            <PlayerRow key={player.id} player={player} isCaptain={player.user_id === team2Data.captain_id} dotaProfile={player.steam_id ? dotaProfiles[player.steam_id] : null} isLoading={player.steam_id ? loadingProfiles[player.steam_id] : false} onHover={() => { if (player.steam_id) fetchDotaProfile(player.steam_id) }} />
                                                                        ))}
                                                                        {team2Data.tournament_players.length === 0 && <p className="text-[9px] text-zinc-600 font-mono py-1">No players registered</p>}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {!team1Data && !team2Data && (
                                                                <div className="p-4 text-center">
                                                                    <p className="text-zinc-600 font-mono text-xs">Teams to be determined</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}

                            {/* Champion display after Grand Final */}
                            {(() => {
                                const finalRound = roundNumbers[roundNumbers.length - 1]
                                const finalMatch = roundsMap[finalRound]?.[0]
                                if (!finalMatch || !finalMatch.winner_id) return null
                                const winnerName = finalMatch.winner_id === finalMatch.team1_id
                                    ? finalMatch.team1?.name
                                    : finalMatch.team2?.name
                                const championX = (roundNumbers.length - 1) * (MATCH_WIDTH + ROUND_GAP + CONNECTOR_WIDTH) + MATCH_WIDTH + 60
                                const championY = getMatchY(roundNumbers.length - 1, 0, 1) + 20

                                return (
                                    <div
                                        className="absolute flex flex-col items-center gap-2"
                                        style={{ left: championX, top: championY, width: 120 }}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                            <span className="text-xl">👑</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] text-yellow-500 font-bold uppercase tracking-[0.3em]">Champion</p>
                                            <p className="text-sm font-rajdhani font-bold text-white mt-0.5">{winnerName}</p>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                )}

                {/* Teams Overview */}
                {teams.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                            <h2 className="text-xs text-[#dc143c] font-bold tracking-[0.5em] uppercase">All Participating Teams</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {teams.map((team) => (
                                <div key={team.id} className="border border-white/10 bg-zinc-900/40 rounded-sm overflow-hidden hover:border-white/20 transition-colors group">
                                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-sm bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                                {team.logo_url ? (
                                                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-zinc-500 font-bold font-rajdhani text-lg">{team.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-rajdhani font-bold text-white text-lg truncate uppercase tracking-wide group-hover:text-[#dc143c] transition-colors">{team.name}</h3>
                                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{team.tournament_players.length}/5 Players</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-1">
                                        {team.tournament_players.map((player) => (
                                            <PlayerRow key={player.id} player={player} isCaptain={player.user_id === team.captain_id} dotaProfile={player.steam_id ? dotaProfiles[player.steam_id] : null} isLoading={player.steam_id ? loadingProfiles[player.steam_id] : false} onHover={() => { if (player.steam_id) fetchDotaProfile(player.steam_id) }} />
                                        ))}
                                        {Array.from({ length: Math.max(0, 5 - team.tournament_players.length) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="flex items-center gap-3 px-2 py-1.5 opacity-30">
                                                <div className="w-6 h-6 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                                                    <span className="text-zinc-600 text-[9px]">+</span>
                                                </div>
                                                <span className="text-[10px] text-zinc-600 font-mono">Empty Slot</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Team Roster Modal Overlay */}
                {selectedRosterTeam && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-default" onClick={() => setSelectedRosterTeam(null)}>
                        <div className="bg-zinc-950 border border-white/10 rounded-sm max-w-sm w-full shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-lg font-rajdhani font-bold text-white tracking-widest uppercase">{selectedRosterTeam.name} Roster</h3>
                                <button onClick={() => setSelectedRosterTeam(null)} className="text-zinc-500 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                {selectedRosterTeam.tournament_players?.length > 0 ? (
                                    selectedRosterTeam.tournament_players.map((p: any) => (
                                        <div key={p.id} className="flex flex-row items-center gap-3 p-3 border border-white/5 bg-white/[0.01] rounded hover:border-white/10 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
                                                {p.users?.avatar ? (
                                                    <img src={p.users.avatar} alt={p.users.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[10px] text-zinc-500 font-bold">{p.users?.username?.charAt(0) || '?'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-mono text-sm text-white">{p.users?.username || 'Unknown User'}</p>
                                                {p.user_id === selectedRosterTeam.captain_id && <p className="text-[9px] text-[#dc143c] font-bold uppercase tracking-widest">Captain</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-zinc-500 font-mono text-center py-4">No players seeded on this team</p>
                                )}
                                <Link href={`/tournament/${tournamentId}/team/${selectedRosterTeam.id}`} className="block w-full text-center py-2 mt-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-[#dc143c] rounded-[2px] transition-colors">
                                    View Full Team Page
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    )
}

/* ========================
   Player Row Component
   ======================== */
function PlayerRow({ player, isCaptain, dotaProfile, isLoading, onHover }: {
    player: Player; isCaptain: boolean; dotaProfile: any; isLoading: boolean; onHover: () => void
}) {
    const [showTooltip, setShowTooltip] = useState(false)
    // Prefer OpenDota/Steam avatar over Discord avatar
    const avatarUrl = dotaProfile?.player?.avatarfull || player.users?.avatar || null
    const username = player.users?.username || 'Unknown'
    const hasSteam = !!player.steam_id

    const rankLabel = dotaProfile?.player?.rank_tier
        ? rankTierLabels[dotaProfile.player.rank_tier] || `Rank ${dotaProfile.player.rank_tier}`
        : null

    return (
        <div className="relative">
            <div
                className={`flex items-center gap-2.5 px-2 py-1 rounded-sm transition-all ${hasSteam ? 'hover:bg-white/5 cursor-pointer' : ''}`}
                onMouseEnter={() => { setShowTooltip(true); onHover() }}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {hasSteam ? (
                    <a href={`https://www.opendota.com/players/${player.steam_id}`} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} className="relative shrink-0 group/avatar">
                        <div className="rounded-full overflow-hidden border-2 border-transparent group-hover/avatar:border-[#dc143c] transition-colors relative">
                            <SafeAvatar src={avatarUrl} alt={username} size={24} fallbackName={username} />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border-[1.5px] border-black"></div>
                    </a>
                ) : (
                    <div className="rounded-full overflow-hidden border border-white/10 shrink-0 relative">
                        <SafeAvatar src={avatarUrl} alt={username} size={24} fallbackName={username} />
                    </div>
                )}

                <p className="text-[10px] font-bold text-white font-rajdhani tracking-wide truncate flex-1">{username}</p>

                {isCaptain && <span className="text-[7px] text-yellow-500 font-bold uppercase tracking-widest font-mono bg-yellow-500/10 px-1 py-0.5 rounded-sm">CPT</span>}
                {hasSteam && <span className="text-[7px] text-sky-400 font-mono tracking-wider opacity-60">DOTA</span>}
            </div>

            {/* Tooltip */}
            {showTooltip && hasSteam && (
                <div className="absolute left-full ml-2 top-0 z-[100] w-56 bg-black/95 border border-white/10 rounded-sm shadow-2xl backdrop-blur-xl p-3 pointer-events-none">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[9px] text-zinc-500 font-mono">Loading profile...</span>
                        </div>
                    ) : dotaProfile ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                {dotaProfile.player?.avatarfull && <SafeAvatar src={dotaProfile.player.avatarfull} alt="" size={32} fallbackName={dotaProfile.player?.personaname || username} className="rounded-sm border border-white/10" />}
                                <div>
                                    <p className="text-xs font-bold text-white font-rajdhani">{dotaProfile.player?.personaname || username}</p>
                                    {rankLabel && <p className="text-[9px] text-[#dc143c] font-bold uppercase">{rankLabel}</p>}
                                </div>
                            </div>
                            {dotaProfile.matches?.length > 0 && (
                                <div className="pt-1 border-t border-white/5">
                                    <div className="flex gap-0.5">
                                        {dotaProfile.matches.slice(0, 8).map((m: any, i: number) => {
                                            const isRadiant = m.player_slot < 128
                                            const won = (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win)
                                            return <div key={i} className={`w-4 h-4 rounded-sm flex items-center justify-center text-[7px] font-bold ${won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{won ? 'W' : 'L'}</div>
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[9px] text-zinc-500 font-mono">ID: {player.steam_id}</p>
                    )}
                </div>
            )}
        </div>
    )
}
