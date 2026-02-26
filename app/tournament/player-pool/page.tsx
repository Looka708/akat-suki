'use client'

import { useState, useMemo, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface PlayerData {
    id: string
    user_id: string
    discord_id: string | null
    steam_id: string | null
    dota_name: string
    mmr: number
    dotabuff_url: string | null
    role_1: string
    role_2: string
    role_3: string
    ping: string
    player_stats: {
        matches_played?: number
        kills?: number
        deaths?: number
        assists?: number
        hero_damage?: number
        gpm_sum?: number
        xpm_sum?: number
        net_worth_sum?: number
    } | null
    captain_notes: string
    joined_at: string
    team_id: string
    tournament_teams: { id: string; name: string; tournament_id: string } | null
    users: { username: string; avatar: string | null; discriminator: string | null } | null
}

const ROLE_COLORS: Record<string, string> = {
    'Carry': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    'Mid': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    'Offlane': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Soft Support': 'text-green-400 bg-green-500/10 border-green-500/20',
    'Hard Support': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'Support': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

function getOpenDotaUrl(steamId: string | null): string | null {
    if (!steamId) return null
    // Convert SteamID64 to Steam32 (account ID) for OpenDota
    const steam64 = BigInt(steamId)
    const steam32 = steam64 - BigInt('76561197960265728')
    if (steam32 < 0) return null
    return `https://www.opendota.com/players/${steam32}`
}

function getMmrTier(mmr: number): { label: string; color: string } {
    if (mmr >= 8000) return { label: 'IMMORTAL', color: 'text-red-400 bg-gradient-to-r from-red-500/20 to-yellow-500/10 border border-red-500/30' }
    if (mmr >= 6500) return { label: 'DIVINE', color: 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20' }
    if (mmr >= 5500) return { label: 'ANCIENT', color: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' }
    if (mmr >= 4500) return { label: 'LEGEND', color: 'text-sky-400 bg-sky-500/10 border border-sky-500/20' }
    if (mmr >= 3500) return { label: 'ARCHON', color: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' }
    if (mmr >= 2500) return { label: 'CRUSADER', color: 'text-zinc-400 bg-zinc-500/10 border border-zinc-500/20' }
    if (mmr >= 1500) return { label: 'GUARDIAN', color: 'text-zinc-500 bg-zinc-600/10 border border-zinc-600/20' }
    return { label: 'HERALD', color: 'text-zinc-600 bg-zinc-700/10 border border-zinc-700/20' }
}

type SortKey = 'mmr' | 'dotaName' | 'role1' | 'team'
type RoleFilter = 'all' | 'Carry' | 'Mid' | 'Offlane' | 'Soft Support' | 'Hard Support'

export default function PlayerPoolPage() {
    const [players, setPlayers] = useState<PlayerData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>('mmr')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
    const [hoveredPlayer, setHoveredPlayer] = useState<number | null>(null)

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await fetch('/api/tournament/player-pool')
                if (!res.ok) throw new Error('Failed to fetch player pool')
                const data = await res.json()
                setPlayers(data.players || [])
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        fetchPlayers()
    }, [])

    const filtered = useMemo(() => {
        let list = [...players]

        // Search
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(p =>
                (p.dota_name || '').toLowerCase().includes(q) ||
                (p.users?.username || '').toLowerCase().includes(q) ||
                (p.tournament_teams?.name || '').toLowerCase().includes(q)
            )
        }

        // Role filter
        if (roleFilter !== 'all') {
            list = list.filter(p =>
                p.role_1 === roleFilter || p.role_2 === roleFilter || p.role_3 === roleFilter
            )
        }

        // Sort
        list.sort((a, b) => {
            if (sortKey === 'mmr') return sortDir === 'desc' ? (b.mmr || 0) - (a.mmr || 0) : (a.mmr || 0) - (b.mmr || 0)
            if (sortKey === 'dotaName') {
                const na = a.dota_name || a.users?.username || ''
                const nb = b.dota_name || b.users?.username || ''
                return sortDir === 'desc' ? nb.localeCompare(na) : na.localeCompare(nb)
            }
            if (sortKey === 'role1') return sortDir === 'desc' ? (b.role_1 || '').localeCompare(a.role_1 || '') : (a.role_1 || '').localeCompare(b.role_1 || '')
            if (sortKey === 'team') {
                const ta = a.tournament_teams?.name || ''
                const tb = b.tournament_teams?.name || ''
                return sortDir === 'desc' ? tb.localeCompare(ta) : ta.localeCompare(tb)
            }
            return 0
        })

        return list
    }, [players, search, sortKey, sortDir, roleFilter])

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDir(key === 'mmr' ? 'desc' : 'asc') }
    }

    const stats = useMemo(() => {
        if (players.length === 0) return { total: 0, teamCount: 0, coreCount: 0, supportCount: 0, avgMmr: 0 }
        const coreRoles = ['Carry', 'Mid', 'Offlane']
        const coreCount = players.filter(p => coreRoles.includes(p.role_1)).length
        const supportCount = players.filter(p => ['Soft Support', 'Hard Support', 'Support'].includes(p.role_1)).length
        const teams = new Set(players.map(p => p.tournament_teams?.id).filter(Boolean))

        const withMmr = players.filter(p => (p.mmr || 0) > 0)
        const avgMmr = withMmr.length > 0 ? Math.round(withMmr.reduce((s, p) => s + (p.mmr || 0), 0) / withMmr.length) : 0

        return { total: players.length, teamCount: teams.size, coreCount, supportCount, avgMmr }
    }, [players])

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="pt-32 pb-20 flex items-center justify-center min-h-[80vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-mono">Loading Player Pool</p>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-4 sm:px-6 mx-auto max-w-[1600px]">
                {/* Hero */}
                <div className="text-center mb-12 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                        <span className="text-[180px] font-rajdhani font-black text-white uppercase leading-none">PLAYER POOL</span>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                            <span className="text-[#dc143c] text-[10px] font-bold tracking-[0.5em] uppercase">Dota 2 League</span>
                            <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-rajdhani font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400/80 mb-3">
                            Player Pool
                        </h1>
                        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                            Draft Board • {players.length} Players Registered
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 border border-red-500/20 bg-red-500/5 rounded-sm text-center">
                        <p className="text-red-400 text-sm font-mono">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                    <div className="border border-white/10 bg-zinc-900/60 rounded-sm p-4 text-center">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Total Players</p>
                        <p className="text-2xl font-rajdhani font-black text-white">{stats.total}</p>
                    </div>
                    <div className="border border-white/10 bg-zinc-900/60 rounded-sm p-4 text-center">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Teams</p>
                        <p className="text-2xl font-rajdhani font-black text-white">{stats.teamCount}</p>
                    </div>
                    <div className="border border-white/10 bg-zinc-900/60 rounded-sm p-4 text-center">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Avg MMR</p>
                        <p className="text-2xl font-rajdhani font-black text-[#dc143c]">{stats.avgMmr.toLocaleString()}</p>
                    </div>
                    <div className="border border-white/10 bg-zinc-900/60 rounded-sm p-4 text-center">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Core Players</p>
                        <p className="text-2xl font-rajdhani font-black text-white">{stats.coreCount}</p>
                    </div>
                    <div className="border border-white/10 bg-zinc-900/60 rounded-sm p-4 text-center">
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Support Players</p>
                        <p className="text-2xl font-rajdhani font-black text-white">{stats.supportCount}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search player, discord or team name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-zinc-900/80 border border-white/10 rounded-sm px-4 py-2.5 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#dc143c]/40 transition-colors"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">🔍</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'] as RoleFilter[]).map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-all whitespace-nowrap
                                    ${roleFilter === role
                                        ? 'bg-[#dc143c]/10 border-[#dc143c]/30 text-[#dc143c]'
                                        : 'bg-zinc-900/50 border-white/10 text-zinc-500 hover:text-white hover:border-white/20'}`}
                            >
                                {role === 'all' ? 'All' : role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count + sort */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">{filtered.length} players shown</p>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
                        <span className="uppercase tracking-widest">Sort by:</span>
                        {(['mmr', 'dotaName', 'role1', 'team'] as SortKey[]).map(k => (
                            <button key={k} onClick={() => handleSort(k)}
                                className={`px-2 py-0.5 rounded-sm ml-1 uppercase tracking-wider transition-colors ${sortKey === k ? 'text-[#dc143c] bg-[#dc143c]/10' : 'text-zinc-500 hover:text-white'}`}>
                                {k === 'dotaName' ? 'Name' : k === 'role1' ? 'Role' : k === 'mmr' ? 'MMR' : 'Team'} {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                            </button>
                        ))}
                    </div>
                </div>

                {players.length === 0 ? (
                    <div className="border border-white/10 rounded-sm p-16 text-center">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mx-auto mb-6">
                            <span className="text-2xl text-zinc-700">⚔</span>
                        </div>
                        <h2 className="text-xl font-rajdhani font-bold text-zinc-500 uppercase mb-2">No Players Registered Yet</h2>
                        <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">
                            Players will appear here once they join a team with their Dota 2 profile info.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="border border-white/10 rounded-sm overflow-hidden bg-zinc-900/30">
                            {/* Header */}
                            <div className="hidden md:grid grid-cols-[50px_1fr_1fr_120px_80px_100px_100px_100px_80px_80px] border-b border-white/10 bg-white/[0.03]">
                                <div className="px-3 py-3 text-[9px] text-zinc-500 font-mono uppercase tracking-widest">#</div>
                                <div className="px-3 py-3 text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Player</div>
                                <div className="px-3 py-3 text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Discord</div>
                                <div className="px-3 py-3 text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Team</div>
                                <div className="px-3 py-3 text-[9px] text-zinc-500 font-mono uppercase tracking-widest text-right">MMR</div>
                                <div className="px-3 py-3 text-[9px] text-[#dc143c] font-mono uppercase tracking-widest text-center">★★★★★</div>
                                <div className="px-3 py-3 text-[9px] text-green-500 font-mono uppercase tracking-widest text-center">★★★★</div>
                                <div className="px-3 py-3 text-[9px] text-yellow-500 font-mono uppercase tracking-widest text-center">★★★</div>
                                <div className="px-3 py-3 text-[9px] text-zinc-500 font-mono uppercase tracking-widest text-center">Ping</div>
                                <div className="px-3 py-3 text-[9px] text-zinc-500 font-mono uppercase tracking-widest text-center">Profile</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-white/[0.04]">
                                {filtered.map((player, idx) => {
                                    const tier = getMmrTier(player.mmr || 0)
                                    const isHovered = hoveredPlayer === idx
                                    const isTopPlayer = (player.mmr || 0) >= 8000
                                    const displayName = player.dota_name || player.users?.username || 'Unknown'
                                    const discordName = player.users?.username || player.discord_id || ''
                                    const openDotaUrl = getOpenDotaUrl(player.steam_id)
                                    const rank = idx + 1

                                    return (
                                        <div
                                            key={player.id}
                                            onMouseEnter={() => setHoveredPlayer(idx)}
                                            onMouseLeave={() => setHoveredPlayer(null)}
                                            className={`grid grid-cols-1 md:grid-cols-[50px_1fr_1fr_120px_80px_100px_100px_100px_80px_80px] items-center transition-all duration-200
                                                ${isHovered ? 'bg-white/[0.04]' : idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}
                                                ${isTopPlayer ? 'border-l-2 border-l-[#dc143c]/40' : ''}`}
                                        >
                                            {/* Rank */}
                                            <div className="hidden md:flex px-3 py-3 items-center">
                                                <span className={`text-sm font-mono font-bold ${rank <= 3 ? 'text-[#dc143c]' : 'text-zinc-600'}`}>
                                                    {rank}
                                                </span>
                                            </div>

                                            {/* Dota Name */}
                                            <div className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-rajdhani font-bold text-white truncate">{displayName}</span>
                                                    {player.tournament_teams && (
                                                        <span className="text-[8px] text-zinc-700 font-mono shrink-0 md:hidden">
                                                            [{player.tournament_teams.name}]
                                                        </span>
                                                    )}
                                                </div>
                                                {player.captain_notes && isHovered && (
                                                    <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate max-w-[250px]">"{player.captain_notes}"</p>
                                                )}
                                                {player.player_stats && (player.player_stats.matches_played || 0) > 0 && isHovered && (
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{player.player_stats.matches_played} matches</span>
                                                        <span className="text-[8px] font-mono font-bold">
                                                            <span className="text-green-400">{player.player_stats.kills}</span>{' / '}
                                                            <span className="text-red-400">{player.player_stats.deaths}</span>{' / '}
                                                            <span className="text-zinc-400">{player.player_stats.assists}</span>
                                                        </span>
                                                        <span className="text-[8px] font-mono text-yellow-500">
                                                            {Math.round((player.player_stats.gpm_sum || 0) / (player.player_stats.matches_played || 1))} avg GPM
                                                        </span>
                                                    </div>
                                                )}
                                                {/* Mobile-only extras */}
                                                <div className="md:hidden flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-zinc-500 font-mono">{discordName}</span>
                                                    {(player.mmr || 0) > 0 && <span className="text-[10px] text-[#dc143c] font-mono font-bold">{player.mmr.toLocaleString()} MMR</span>}
                                                </div>
                                            </div>

                                            {/* Discord */}
                                            <div className="hidden md:block px-3 py-3">
                                                <span className="text-xs text-zinc-400 font-mono">{discordName}</span>
                                            </div>

                                            {/* Team */}
                                            <div className="hidden md:block px-3 py-3">
                                                <span className="text-xs text-zinc-400 font-mono truncate block">
                                                    {player.tournament_teams?.name || '-'}
                                                </span>
                                            </div>

                                            {/* MMR */}
                                            <div className="hidden md:block px-3 py-3 text-right">
                                                <span className="text-sm font-mono font-bold text-white">{(player.mmr || 0) > 0 ? player.mmr.toLocaleString() : '-'}</span>
                                            </div>

                                            {/* Role 1 (5 Stars) */}
                                            <div className="hidden md:flex px-3 py-3 justify-center">
                                                {player.role_1 && (
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border ${ROLE_COLORS[player.role_1] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'}`}>
                                                        {player.role_1}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Role 2 (4 Stars) */}
                                            <div className="hidden md:flex px-3 py-3 justify-center">
                                                {player.role_2 && (
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border ${ROLE_COLORS[player.role_2] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'}`}>
                                                        {player.role_2}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Role 3 (3 Stars) */}
                                            <div className="hidden md:flex px-3 py-3 justify-center">
                                                {player.role_3 && (
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border ${ROLE_COLORS[player.role_3] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'}`}>
                                                        {player.role_3}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Ping */}
                                            <div className="hidden md:flex px-3 py-3 justify-center">
                                                <span className="text-[10px] text-zinc-600 font-mono">{player.ping || '-'}</span>
                                            </div>

                                            {/* OpenDota Link */}
                                            <div className="hidden md:flex px-3 py-3 justify-center">
                                                {openDotaUrl ? (
                                                    <a href={openDotaUrl} target="_blank" rel="noopener noreferrer"
                                                        className="text-[9px] text-sky-500 hover:text-sky-400 uppercase font-bold tracking-wider transition-colors">
                                                        OpenDota ↗
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] text-zinc-700 font-mono">-</span>
                                                )}
                                            </div>

                                            {/* Mobile role badges */}
                                            <div className="md:hidden px-3 pb-3 flex gap-1.5 flex-wrap">
                                                {[player.role_1, player.role_2, player.role_3].filter(Boolean).map((role, i) => (
                                                    <span key={i} className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border ${ROLE_COLORS[role] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'}`}>
                                                        {role}
                                                    </span>
                                                ))}
                                                {openDotaUrl && (
                                                    <a href={openDotaUrl} target="_blank" rel="noopener noreferrer"
                                                        className="text-[8px] text-sky-500 font-bold px-1.5 py-0.5 rounded-sm border border-sky-500/20 bg-sky-500/10">
                                                        OpenDota ↗
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Role Legend */}
                        <div className="mt-6 flex flex-wrap items-center gap-4 justify-center">
                            <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Roles:</span>
                            {Object.entries(ROLE_COLORS).filter(([k]) => k !== 'Support').map(([role, color]) => (
                                <div key={role} className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${color.split(' ')[0].replace('text-', 'bg-')}`}></div>
                                    <span className="text-[9px] text-zinc-500 font-mono">{role}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </main>
    )
}
