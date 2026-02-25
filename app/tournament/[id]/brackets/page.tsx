'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
    team1: { id: string; name: string; logo_url: string | null } | null
    team2: { id: string; name: string; logo_url: string | null } | null
    winner: { name: string } | null
}

interface Tournament {
    id: string
    name: string
    game: string
    status: string
}

function getRoundLabel(round: number, totalRounds: number): string {
    if (round === totalRounds) return 'GRAND FINAL'
    if (round === totalRounds - 1) return 'SEMI-FINALS'
    if (round === totalRounds - 2 && totalRounds > 3) return 'QUARTER-FINALS'
    return `ROUND ${round}`
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
    const scrollRef = useRef<HTMLDivElement>(null)

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

    // Find team data including players from the teams array
    const getTeamData = (teamId: string | null): Team | undefined => {
        if (!teamId) return undefined
        return teams.find(t => t.id === teamId)
    }

    // Fetch a Dota profile for a player
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

            <div className="pt-32 pb-20 px-6 mx-auto max-w-[1600px] min-h-[80vh]">
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
                        <h1 className="text-4xl md:text-6xl font-rajdhani font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-red-500 mb-2">
                            {tournament.name}
                        </h1>
                        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                            Tournament Brackets • {tournament.status?.toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <Link
                        href={`/tournament/${tournamentId}/leaderboard`}
                        className="px-5 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-widest text-[10px] font-bold rounded-sm"
                    >
                        Leaderboard
                    </Link>
                    <Link
                        href="/#tournaments"
                        className="px-5 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-widest text-[10px] font-bold rounded-sm"
                    >
                        Back to Arena
                    </Link>
                </div>

                {/* Bracket Display */}
                {matches.length === 0 ? (
                    <div className="text-center py-32 border border-white/10 bg-white/[0.02] rounded-sm">
                        <div className="w-16 h-16 mx-auto mb-6 border-2 border-dashed border-zinc-700 rounded-full flex items-center justify-center">
                            <span className="text-zinc-600 text-2xl">⚔</span>
                        </div>
                        <h3 className="text-2xl font-rajdhani font-bold text-zinc-400 uppercase tracking-wide mb-2">Brackets Not Generated</h3>
                        <p className="text-zinc-600 font-mono text-sm max-w-sm mx-auto">The bracket has not been initialized for this tournament yet. Check back later.</p>
                    </div>
                ) : (
                    <div ref={scrollRef} className="relative overflow-x-auto pb-8 scrollbar-hide">
                        <div className="flex gap-0 min-w-max">
                            {roundNumbers.map((round, roundIdx) => {
                                const roundMatches = roundsMap[round]
                                const label = getRoundLabel(round, totalRounds)
                                const isFinal = round === totalRounds

                                return (
                                    <div key={round} className="flex flex-col" style={{ minWidth: '340px' }}>
                                        {/* Round Header */}
                                        <div className={`text-center mb-6 pb-3 border-b ${isFinal ? 'border-[#dc143c]/40' : 'border-white/10'}`}>
                                            <h3 className={`text-xs font-bold tracking-[0.3em] uppercase ${isFinal ? 'text-[#dc143c]' : 'text-zinc-500'}`}>
                                                {label}
                                            </h3>
                                        </div>

                                        {/* Matches positioned with flex spacing for bracket alignment */}
                                        <div
                                            className="flex flex-col justify-around flex-1 gap-6 px-4"
                                            style={{ minHeight: `${roundsMap[roundNumbers[0]]?.length * 160}px` }}
                                        >
                                            {roundMatches.map((match) => {
                                                const isExpanded = expandedMatch === match.id
                                                const isCompleted = match.state === 'completed'
                                                const team1Data = getTeamData(match.team1_id)
                                                const team2Data = getTeamData(match.team2_id)

                                                return (
                                                    <div key={match.id} className="relative">
                                                        {/* Match Card */}
                                                        <div
                                                            onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                                                            className={`relative cursor-pointer transition-all duration-300 rounded-sm border overflow-hidden group
                                                                ${isCompleted
                                                                    ? 'border-[#dc143c]/20 bg-gradient-to-br from-[#dc143c]/5 to-black hover:border-[#dc143c]/40'
                                                                    : 'border-white/10 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900/80'
                                                                }
                                                                ${isFinal ? 'shadow-[0_0_30px_rgba(220,20,60,0.1)]' : ''}
                                                                ${isExpanded ? 'ring-1 ring-[#dc143c]/30' : ''}
                                                            `}
                                                        >
                                                            {/* Final Badge */}
                                                            {isFinal && (
                                                                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#dc143c] to-transparent"></div>
                                                            )}

                                                            {/* Team 1 */}
                                                            <div className={`flex items-center justify-between px-4 py-3 transition-colors ${match.winner_id === match.team1_id ? 'bg-[#dc143c]/10' : ''}`}>
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 overflow-hidden border ${match.winner_id === match.team1_id ? 'border-[#dc143c]/50 bg-[#dc143c]/20' : 'border-white/10 bg-white/5'}`}>
                                                                        {match.team1?.logo_url ? (
                                                                            <img src={match.team1.logo_url} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <span className={`text-[10px] font-bold ${match.team1_id ? 'text-zinc-400' : 'text-zinc-700'}`}>
                                                                                {match.team1?.name?.charAt(0) || '?'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className={`font-rajdhani font-bold text-sm truncate ${match.winner_id === match.team1_id ? 'text-[#dc143c]' : match.team1_id ? 'text-white' : 'text-zinc-600'}`}>
                                                                        {match.team1?.name || 'TBD'}
                                                                    </span>
                                                                    {match.winner_id === match.team1_id && (
                                                                        <span className="text-[8px] text-[#dc143c] font-bold tracking-widest uppercase ml-auto shrink-0">WIN</span>
                                                                    )}
                                                                </div>
                                                                {isCompleted && (
                                                                    <span className={`font-mono font-bold text-lg ml-4 ${match.winner_id === match.team1_id ? 'text-[#dc143c]' : 'text-zinc-600'}`}>
                                                                        {match.team1_score}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Divider */}
                                                            <div className="h-[1px] bg-white/5 mx-3"></div>

                                                            {/* Team 2 */}
                                                            <div className={`flex items-center justify-between px-4 py-3 transition-colors ${match.winner_id === match.team2_id ? 'bg-[#dc143c]/10' : ''}`}>
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 overflow-hidden border ${match.winner_id === match.team2_id ? 'border-[#dc143c]/50 bg-[#dc143c]/20' : 'border-white/10 bg-white/5'}`}>
                                                                        {match.team2?.logo_url ? (
                                                                            <img src={match.team2.logo_url} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <span className={`text-[10px] font-bold ${match.team2_id ? 'text-zinc-400' : 'text-zinc-700'}`}>
                                                                                {match.team2?.name?.charAt(0) || '?'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className={`font-rajdhani font-bold text-sm truncate ${match.winner_id === match.team2_id ? 'text-[#dc143c]' : match.team2_id ? 'text-white' : 'text-zinc-600'}`}>
                                                                        {match.team2?.name || 'TBD'}
                                                                    </span>
                                                                    {match.winner_id === match.team2_id && (
                                                                        <span className="text-[8px] text-[#dc143c] font-bold tracking-widest uppercase ml-auto shrink-0">WIN</span>
                                                                    )}
                                                                </div>
                                                                {isCompleted && (
                                                                    <span className={`font-mono font-bold text-lg ml-4 ${match.winner_id === match.team2_id ? 'text-[#dc143c]' : 'text-zinc-600'}`}>
                                                                        {match.team2_score}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Status indicator */}
                                                            <div className={`h-0.5 ${isCompleted ? 'bg-[#dc143c]/30' : match.state === 'live' ? 'bg-green-500/50 animate-pulse' : 'bg-zinc-800'}`}></div>

                                                            {/* Expand hint */}
                                                            <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-[8px] text-zinc-600 uppercase tracking-widest font-mono">
                                                                    {isExpanded ? '▲ Collapse' : '▼ Details'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Team Details Panel */}
                                                        {isExpanded && (
                                                            <div className="mt-2 border border-white/10 bg-black/80 backdrop-blur-xl rounded-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                                                {/* Team 1 Players */}
                                                                {team1Data && (
                                                                    <div className="p-4 border-b border-white/5">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <div className="w-1 h-4 bg-[#dc143c] rounded-full"></div>
                                                                            <h4 className="text-[10px] font-bold text-[#dc143c] uppercase tracking-[0.3em]">{team1Data.name}</h4>
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            {team1Data.tournament_players.map((player) => (
                                                                                <PlayerRow
                                                                                    key={player.id}
                                                                                    player={player}
                                                                                    isCaptain={player.user_id === team1Data.captain_id}
                                                                                    dotaProfile={player.steam_id ? dotaProfiles[player.steam_id] : null}
                                                                                    isLoading={player.steam_id ? loadingProfiles[player.steam_id] : false}
                                                                                    onHover={() => {
                                                                                        if (player.steam_id) fetchDotaProfile(player.steam_id)
                                                                                    }}
                                                                                />
                                                                            ))}
                                                                            {team1Data.tournament_players.length === 0 && (
                                                                                <p className="text-[10px] text-zinc-600 font-mono py-2">No players registered</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Team 2 Players */}
                                                                {team2Data && (
                                                                    <div className="p-4">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <div className="w-1 h-4 bg-zinc-500 rounded-full"></div>
                                                                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">{team2Data.name}</h4>
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            {team2Data.tournament_players.map((player) => (
                                                                                <PlayerRow
                                                                                    key={player.id}
                                                                                    player={player}
                                                                                    isCaptain={player.user_id === team2Data.captain_id}
                                                                                    dotaProfile={player.steam_id ? dotaProfiles[player.steam_id] : null}
                                                                                    isLoading={player.steam_id ? loadingProfiles[player.steam_id] : false}
                                                                                    onHover={() => {
                                                                                        if (player.steam_id) fetchDotaProfile(player.steam_id)
                                                                                    }}
                                                                                />
                                                                            ))}
                                                                            {team2Data.tournament_players.length === 0 && (
                                                                                <p className="text-[10px] text-zinc-600 font-mono py-2">No players registered</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* No team data */}
                                                                {!team1Data && !team2Data && (
                                                                    <div className="p-6 text-center">
                                                                        <p className="text-zinc-600 font-mono text-xs">Teams to be determined</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Connector lines to next round */}
                                                        {roundIdx < roundNumbers.length - 1 && (
                                                            <div className="absolute top-1/2 -right-4 w-4 h-[1px] bg-zinc-800"></div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Teams Overview Section */}
                {teams.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                            <h2 className="text-xs text-[#dc143c] font-bold tracking-[0.5em] uppercase">All Participating Teams</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {teams.map((team) => (
                                <div key={team.id} className="border border-white/10 bg-zinc-900/40 rounded-sm overflow-hidden hover:border-white/20 transition-colors group">
                                    {/* Team Header */}
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
                                                <h3 className="font-rajdhani font-bold text-white text-lg truncate uppercase tracking-wide group-hover:text-[#dc143c] transition-colors">
                                                    {team.name}
                                                </h3>
                                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                                                    {team.tournament_players.length}/5 Players
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Players */}
                                    <div className="p-3 space-y-1.5">
                                        {team.tournament_players.map((player) => (
                                            <PlayerRow
                                                key={player.id}
                                                player={player}
                                                isCaptain={player.user_id === team.captain_id}
                                                dotaProfile={player.steam_id ? dotaProfiles[player.steam_id] : null}
                                                isLoading={player.steam_id ? loadingProfiles[player.steam_id] : false}
                                                onHover={() => {
                                                    if (player.steam_id) fetchDotaProfile(player.steam_id)
                                                }}
                                            />
                                        ))}
                                        {Array.from({ length: Math.max(0, 5 - team.tournament_players.length) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="flex items-center gap-3 px-2 py-1.5 opacity-30">
                                                <div className="w-7 h-7 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                                                    <span className="text-zinc-600 text-[10px]">+</span>
                                                </div>
                                                <span className="text-[11px] text-zinc-600 font-mono">Empty Slot</span>
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

            <style jsx>{`
                @keyframes slide-in-from-top {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-in {
                    animation: slide-in-from-top 0.2s ease-out;
                }
            `}</style>
        </main>
    )
}

/* ========================
   Player Row Component
   ======================== */
function PlayerRow({
    player,
    isCaptain,
    dotaProfile,
    isLoading,
    onHover
}: {
    player: Player
    isCaptain: boolean
    dotaProfile: any
    isLoading: boolean
    onHover: () => void
}) {
    const [showTooltip, setShowTooltip] = useState(false)

    const handleMouseEnter = () => {
        setShowTooltip(true)
        onHover()
    }

    const avatarUrl = player.users?.avatar || null
    const username = player.users?.username || 'Unknown'
    const hasSteam = !!player.steam_id

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

    const rankLabel = dotaProfile?.player?.rank_tier
        ? rankTierLabels[dotaProfile.player.rank_tier] || `Rank ${dotaProfile.player.rank_tier}`
        : null

    return (
        <div className="relative">
            <div
                className={`flex items-center gap-3 px-2 py-1.5 rounded-sm transition-all ${hasSteam ? 'hover:bg-white/5 cursor-pointer' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {/* Avatar - clickable if steam_id is available */}
                {hasSteam ? (
                    <a
                        href={`/api/dota/player/${player.steam_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            e.stopPropagation()
                            // Open OpenDota profile instead
                            e.preventDefault()
                            window.open(`https://www.opendota.com/players/${player.steam_id}`, '_blank')
                        }}
                        className="relative shrink-0 group/avatar"
                    >
                        <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-transparent group-hover/avatar:border-[#dc143c] transition-colors">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold">
                                    {username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {/* Online indicator for linked accounts */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black"></div>
                    </a>
                ) : (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 shrink-0">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold">
                                {username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white font-rajdhani tracking-wide truncate">{username}</p>
                </div>

                {/* Badges */}
                {isCaptain && (
                    <span className="text-[8px] text-yellow-500 font-bold uppercase tracking-widest font-mono bg-yellow-500/10 px-1.5 py-0.5 rounded-sm">CPT</span>
                )}
                {hasSteam && (
                    <span className="text-[8px] text-sky-400 font-mono tracking-wider opacity-60">DOTA</span>
                )}
            </div>

            {/* Dota Profile Tooltip */}
            {showTooltip && hasSteam && (
                <div className="absolute left-full ml-2 top-0 z-50 w-64 bg-black/95 border border-white/10 rounded-sm shadow-2xl backdrop-blur-xl p-3 pointer-events-none">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] text-zinc-500 font-mono">Loading Dota profile...</span>
                        </div>
                    ) : dotaProfile ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                {dotaProfile.player?.avatarfull && (
                                    <img src={dotaProfile.player.avatarfull} alt="" className="w-10 h-10 rounded-sm border border-white/10" />
                                )}
                                <div>
                                    <p className="text-sm font-bold text-white font-rajdhani">{dotaProfile.player?.personaname || username}</p>
                                    {rankLabel && (
                                        <p className="text-[10px] text-[#dc143c] font-bold uppercase tracking-wider">{rankLabel}</p>
                                    )}
                                    {dotaProfile.player?.leaderboard_rank && (
                                        <p className="text-[9px] text-yellow-500 font-mono">#{dotaProfile.player.leaderboard_rank} Leaderboard</p>
                                    )}
                                </div>
                            </div>
                            {dotaProfile.matches && dotaProfile.matches.length > 0 && (
                                <div className="pt-2 border-t border-white/5">
                                    <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Recent ({dotaProfile.matches.length} games)</p>
                                    <div className="flex gap-0.5">
                                        {dotaProfile.matches.slice(0, 10).map((m: any, i: number) => {
                                            const isRadiant = m.player_slot < 128
                                            const won = (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win)
                                            return (
                                                <div
                                                    key={i}
                                                    className={`w-5 h-5 rounded-sm flex items-center justify-center text-[8px] font-bold ${won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                                >
                                                    {won ? 'W' : 'L'}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <a
                                href={`https://www.opendota.com/players/${player.steam_id}`}
                                target="_blank"
                                className="block text-center text-[9px] text-sky-400 font-mono uppercase tracking-widest pt-1 pointer-events-auto hover:text-sky-300"
                            >
                                View Full Profile →
                            </a>
                        </div>
                    ) : (
                        <p className="text-[10px] text-zinc-500 font-mono">Steam ID: {player.steam_id}</p>
                    )}
                </div>
            )}
        </div>
    )
}
