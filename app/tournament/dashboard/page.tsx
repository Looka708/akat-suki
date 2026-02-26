'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import SafeAvatar from '@/components/SafeAvatar'

export default function TournamentDashboard() {
    const { isAuthenticated, user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    const [team, setTeam] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/')
        }
    }, [isAuthenticated, authLoading, router])

    useEffect(() => {
        const fetchTeam = async () => {
            if (!isAuthenticated) return

            try {
                const res = await fetch('/api/tournament/my-team')
                if (!res.ok) {
                    throw new Error('Failed to fetch team data')
                }
                const data = await res.json()
                setTeam(data.team)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchTeam()
    }, [isAuthenticated])

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    if (!team) {
        return (
            <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
                <Navbar />
                <div className="pt-32 pb-20 px-6 mx-auto max-w-4xl min-h-[80vh] flex flex-col items-center justify-center">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-8 md:p-12 rounded-xl backdrop-blur-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />
                        <h1 className="text-3xl font-rajdhani font-bold mb-4 uppercase tracking-wider text-white">
                            No Team Yet
                        </h1>
                        <p className="text-zinc-400 mb-8 font-inter max-w-sm mx-auto">
                            You haven't joined or created a team for the Dota 2 Tournament yet.
                        </p>
                        <Link href="/tournament/register" className="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-rajdhani font-bold tracking-wider uppercase transition-colors rounded-lg">
                            Register a Team
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    const isCaptain = team.captain_id === user?.id
    const inviteLink = `${window.location.origin}/tournament/invite/${team.invite_code}`

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6 mx-auto max-w-6xl min-h-[80vh]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        {/* Team Logo */}
                        <div className="relative group shrink-0">
                            <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                                {team.logo_url ? (
                                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-zinc-600 font-rajdhani font-bold text-2xl">{team.name?.charAt(0)}</span>
                                )}
                            </div>
                            {isCaptain && (
                                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                                    <span className="text-[8px] text-white font-bold uppercase tracking-widest">Change</span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/gif"
                                        className="sr-only"
                                        onChange={async (e) => {
                                            const f = e.target.files?.[0]
                                            if (!f) return
                                            const formData = new FormData()
                                            formData.append('logo', f)
                                            formData.append('teamId', team.id)
                                            try {
                                                const res = await fetch('/api/tournament/upload-logo', { method: 'POST', body: formData })
                                                if (res.ok) window.location.reload()
                                                else alert('Upload failed')
                                            } catch { alert('Upload failed') }
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-rajdhani font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                {team.name}
                            </h1>
                            <p className="text-zinc-400 mt-2 font-inter">
                                Dota 2 Tournament Team Dashboard
                            </p>
                        </div>
                    </div>
                    {isCaptain && (
                        <div className="flex flex-col gap-2 relative">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center gap-4">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-rajdhani font-bold mb-1">Invite Code</p>
                                    <p className="font-mono text-white selection:bg-red-500/50">{team.invite_code}</p>
                                </div>
                                <button
                                    onClick={() => navigator.clipboard.writeText(inviteLink)}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm text-white font-rajdhani uppercase tracking-wider font-bold rounded flex items-center gap-2 transition-colors"
                                >
                                    Copy Link
                                </button>
                            </div>
                            <button
                                onClick={async () => {
                                    if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
                                        try {
                                            const res = await fetch('/api/tournament/my-team', {
                                                method: 'DELETE',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ teamId: team.id })
                                            })
                                            if (res.ok) {
                                                window.location.reload()
                                            } else {
                                                const err = await res.json()
                                                alert(err.error || 'Failed to delete team')
                                            }
                                        } catch (e: any) { alert(e.message) }
                                    }
                                }}
                                className="w-full py-2 bg-red-900/30 hover:bg-red-900/60 border border-red-500/30 text-red-500 text-xs font-rajdhani uppercase tracking-widest font-bold rounded transition-colors"
                            >
                                Delete Team
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                                <h2 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                    <span className="w-8 h-1 bg-red-600"></span>
                                    Roster ({team.tournament_players.length}/5)
                                </h2>
                                {team.tournament_players.length < 5 && (
                                    <span className="text-[10px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded animate-pulse font-bold uppercase tracking-widest w-fit">
                                        Looking for {5 - team.tournament_players.length} more
                                    </span>
                                )}
                                {team.tournament_players.length === 5 && (
                                    <span className="text-[10px] text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded font-bold uppercase tracking-widest w-fit">
                                        Roster Full
                                    </span>
                                )}
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">
                                    <span>Completeness</span>
                                    <span>{team.tournament_players.length * 20}%</span>
                                </div>
                                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-zinc-800">
                                    <div
                                        className="h-full bg-red-600 transition-all duration-1000 ease-out relative"
                                        style={{ width: `${(team.tournament_players.length / 5) * 100}%` }}
                                    >
                                        <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {team.tournament_players.map((player: any) => (
                                    <PlayerRow
                                        key={player.id}
                                        player={player}
                                        team={team}
                                        isCaptain={isCaptain}
                                        onKick={(userId) => {
                                            setTeam({
                                                ...team,
                                                tournament_players: team.tournament_players.filter((p: any) => p.user_id !== userId)
                                            })
                                        }}
                                    />
                                ))}

                                {Array.from({ length: Math.max(0, 5 - team.tournament_players.length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="flex items-center gap-4 p-4 bg-zinc-950/40 border border-dashed border-zinc-800/50 rounded-lg opacity-50">
                                        <div className="w-12 h-12 bg-zinc-900 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                                            <span className="text-zinc-600 font-bold">+</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-zinc-500 font-rajdhani text-xl tracking-wide">Empty Slot</h3>
                                            <p className="text-sm text-zinc-600 font-inter">Waiting for player...</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm relative overflow-hidden">
                            <h2 className="text-xl font-rajdhani font-bold mb-4 text-white uppercase tracking-wider flex items-center gap-3">
                                <span className="w-4 h-1 bg-[#5865F2]"></span>
                                Discord Status
                            </h2>
                            <div className="space-y-4 font-inter text-sm">
                                <div className="flex justify-between items-center bg-black/40 p-3 rounded border border-zinc-800/50">
                                    <span className="text-zinc-400">Team Role</span>
                                    {team.discord_role_id ? (
                                        <span className="text-green-400 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Active
                                        </span>
                                    ) : (
                                        <span className="text-yellow-400 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span> Pending
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center bg-black/40 p-3 rounded border border-zinc-800/50">
                                    <span className="text-zinc-400">Voice Channel</span>
                                    {team.discord_voice_channel_id ? (
                                        <span className="text-green-400 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Ready
                                        </span>
                                    ) : (
                                        <span className="text-yellow-400 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span> Pending
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Steam Connection */}
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm relative overflow-hidden">
                            <h2 className="text-xl font-rajdhani font-bold mb-4 text-white uppercase tracking-wider flex items-center gap-3">
                                <span className="w-4 h-1 bg-[#1b2838]"></span>
                                Steam Connection
                            </h2>
                            <p className="text-xs text-zinc-500 font-mono mb-4">
                                Link your Steam account for automated match scoring and Dota 2 profile stats.
                            </p>
                            <Link
                                href="/tournament/connect-steam"
                                className="block w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-center text-white text-xs font-rajdhani uppercase tracking-wider font-bold rounded transition-colors"
                            >
                                Manage Steam Link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}

function PlayerRow({ player, team, isCaptain, onKick }: { player: any, team: any, isCaptain: boolean, onKick: (userId: string) => void }) {
    const [dotaData, setDotaData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [kicking, setKicking] = useState(false)

    useEffect(() => {
        if (!player.steam_id) return

        const fetchDotaStats = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/dota/player/${player.steam_id}`)
                if (res.ok) {
                    const data = await res.json()
                    setDotaData(data)
                }
            } catch (err) {
                console.error('Failed to fetch player stats:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchDotaStats()
    }, [player.steam_id])

    const handleKick = async () => {
        if (!confirm(`Are you sure you want to remove ${player.users?.username} from the team?`)) return
        setKicking(true)
        try {
            const res = await fetch('/api/tournament/my-team/kick', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId: team.id, userIdToKick: player.user_id })
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to kick player')
            }
            onKick(player.user_id)
        } catch (err: any) {
            alert(err.message)
            setKicking(false)
        }
    }

    return (
        <div key={player.id} className="flex flex-col gap-3 p-4 bg-black/40 border border-zinc-800/50 rounded-lg group hover:border-red-600/30 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden border-2 border-zinc-700/50 shrink-0 relative">
                    <SafeAvatar
                        src={dotaData?.player?.avatarfull || player.users?.avatar}
                        alt={player.users?.username}
                        size={48}
                        fallbackName={player.users?.username}
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white font-rajdhani text-xl tracking-wide group-hover:text-red-500 transition-colors">
                            {player.users?.username || 'Unknown User'}
                        </h3>
                        {dotaData?.player?.rank_tier && (
                            <div className="bg-red-600/20 text-[#dc143c] text-[8px] font-bold px-1.5 py-0.5 rounded border border-[#dc143c]/20 uppercase tracking-widest">
                                Rank {dotaData.player.rank_tier}
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                        {player.steam_id ? `STEAM: ${player.steam_id}` : 'STEAM ID NOT LINKED'}
                    </p>
                </div>
                {player.user_id === team.captain_id ? (
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest rounded border border-yellow-500/20">
                        Captain
                    </span>
                ) : (
                    isCaptain && (
                        <button
                            onClick={handleKick}
                            disabled={kicking}
                            className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded border border-red-500/20 hover:bg-red-500/20 hover:text-white transition-colors"
                        >
                            {kicking ? 'Removing...' : 'Kick'}
                        </button>
                    )
                )}
            </div>

            {player.steam_id && dotaData?.matches && dotaData.matches.length > 0 && (
                <div className="pt-3 border-t border-zinc-900 mt-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Recent Matches</span>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-white">
                            Win Rate <span className="text-[#dc143c]">
                                {Math.round((dotaData.matches.filter((m: any) => (m.player_slot < 128 && m.radiant_win) || (m.player_slot >= 128 && !m.radiant_win)).length / dotaData.matches.length) * 100)}%
                            </span>
                        </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {dotaData.matches.slice(0, 5).map((match: any) => {
                            const isWin = (match.player_slot < 128 && match.radiant_win) || (match.player_slot >= 128 && !match.radiant_win)
                            return (
                                <div
                                    key={match.match_id}
                                    className={`flex-shrink-0 px-2 py-1 rounded text-[9px] font-bold border ${isWin
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}
                                >
                                    {isWin ? 'W' : 'L'} • {match.kills}/{match.deaths}/{match.assists}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

