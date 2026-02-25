'use client'

import { useState, useMemo, useEffect } from 'react'

interface PlayerData {
    id: string
    user_id: string
    discord_id: string | null
    steam_id: string | null
    dota_name: string
    mmr: number
    role_1: string
    role_2: string
    role_3: string
    ping: string
    captain_notes: string
    joined_at: string
    team_id: string
    tournament_teams: { id: string; name: string; tournament_id: string } | null
    users: { username: string; avatar: string | null; discriminator: string | null } | null
}

function getOpenDotaUrl(steamId: string | null): string | null {
    if (!steamId) return null
    // Convert SteamID64 to Steam32 (account ID) for OpenDota
    const steam64 = BigInt(steamId)
    const steam32 = steam64 - BigInt('76561197960265728')
    if (steam32 < 0) return null
    return `https://www.opendota.com/players/${steam32}`
}

export default function AdminPlayerPoolPage() {
    const [players, setPlayers] = useState<PlayerData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [updatingMmr, setUpdatingMmr] = useState<string | null>(null)

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
                (p.tournament_teams?.name || '').toLowerCase().includes(q) ||
                (p.steam_id || '').includes(q) ||
                (p.discord_id || '').includes(q)
            )
        }

        return list
    }, [players, search])

    const handleUpdateMmr = async (playerId: string, newMmr: number) => {
        setUpdatingMmr(playerId)
        try {
            const res = await fetch(`/api/admin/player-pool/${playerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mmr: newMmr })
            })

            if (!res.ok) throw new Error('Failed to update MMR')

            // Update local state
            setPlayers(players.map(p => p.id === playerId ? { ...p, mmr: newMmr } : p))
        } catch (err) {
            console.error('Failed to update MMR:', err)
            alert('Failed to update MMR. Check console for details.')
        } finally {
            setUpdatingMmr(null)
        }
    }

    const exportToCSV = () => {
        const headers = ['Dota Name', 'Discord Username', 'Discord ID', 'Steam ID64', 'OpenDota Link', 'Team Name', 'MMR', 'Primary Role', 'Secondary Role', 'Tertiary Role', 'Ping', 'Notes', 'Joined At']
        const csvContent = [
            headers.join(','),
            ...filtered.map(p => {
                const openDotaUrl = getOpenDotaUrl(p.steam_id) || ''
                return [
                    `"${p.dota_name || ''}"`,
                    `"${p.users?.username || ''}"`,
                    `"${p.discord_id || ''}"`,
                    `"${p.steam_id || ''}"`,
                    `"${openDotaUrl}"`,
                    `"${p.tournament_teams?.name || ''}"`,
                    `"${p.mmr || 0}"`,
                    `"${p.role_1 || ''}"`,
                    `"${p.role_2 || ''}"`,
                    `"${p.role_3 || ''}"`,
                    `"${p.ping || ''}"`,
                    `"${(p.captain_notes || '').replace(/"/g, '""')}"`,
                    `"${new Date(p.joined_at).toLocaleString()}"`
                ].join(',')
            })
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `akat_suki_player_pool_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide">
                        Player Pool Database
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Comprehensive view of all registered tournament players.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-[#dc143c]/10 text-[#dc143c] border border-[#dc143c]/30 hover:bg-[#dc143c]/20 rounded-sm font-medium text-sm transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-sm">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white/5 border border-white/10 rounded-sm p-4">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Search by any field..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-sm pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#dc143c]/50 transition-colors"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Spreadsheet Table */}
            <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-4 py-3 font-medium text-gray-400">#</th>
                                <th className="px-4 py-3 font-medium text-gray-400">Dota Name</th>
                                <th className="px-4 py-3 font-medium text-gray-400">Discord</th>
                                <th className="px-4 py-3 font-medium text-gray-400">Team</th>
                                <th className="px-4 py-3 font-medium text-gray-400">MMR</th>
                                <th className="px-4 py-3 font-medium text-gray-400">Primary</th>
                                <th className="px-4 py-3 font-medium text-gray-400">Secondary</th>
                                <th className="px-4 py-3 font-medium text-gray-400">Tertiary</th>
                                <th className="px-4 py-3 font-medium text-gray-400">Steam ID</th>
                                <th className="px-4 py-3 font-medium text-gray-400">OpenDota</th>
                                <th className="px-4 py-3 font-medium text-gray-400">Ping (ms)</th>
                                <th className="px-4 py-3 font-medium text-gray-400">Notes</th>
                                <th className="px-4 py-3 font-medium text-gray-400">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                                        No players found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((player, idx) => {
                                    const openDotaUrl = getOpenDotaUrl(player.steam_id)
                                    return (
                                        <tr key={player.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-gray-500 font-mono">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium text-white">{player.dota_name || '-'}</td>
                                            <td className="px-4 py-3 text-gray-400">
                                                {player.users?.username || '-'}
                                                <span className="text-[10px] block text-gray-600 font-mono mt-0.5">{player.discord_id}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">{player.tournament_teams?.name || '-'}</td>
                                            <td className="px-4 py-3 text-white">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        defaultValue={player.mmr || ''}
                                                        disabled={updatingMmr === player.id}
                                                        onBlur={(e) => {
                                                            const val = parseInt(e.target.value) || 0
                                                            if (val !== (player.mmr || 0)) {
                                                                handleUpdateMmr(player.id, val)
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.currentTarget.blur()
                                                            }
                                                        }}
                                                        className="w-20 bg-black/50 border border-white/10 rounded-sm px-2 py-1 text-xs text-white focus:outline-none focus:border-[#dc143c]/50 transition-colors disabled:opacity-50"
                                                        placeholder="0"
                                                    />
                                                    {updatingMmr === player.id && (
                                                        <div className="w-3 h-3 border border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[#dc143c] text-xs font-bold uppercase tracking-wider">{player.role_1 || '-'}</td>
                                            <td className="px-4 py-3 text-green-500 text-xs font-bold uppercase tracking-wider">{player.role_2 || '-'}</td>
                                            <td className="px-4 py-3 text-yellow-500 text-xs font-bold uppercase tracking-wider">{player.role_3 || '-'}</td>
                                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">{player.steam_id || '-'}</td>
                                            <td className="px-4 py-3">
                                                {openDotaUrl ? (
                                                    <a href={openDotaUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors uppercase text-[10px] font-bold tracking-wider">
                                                        LINK ↗
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 font-mono">{player.ping || '-'}</td>
                                            <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate" title={player.captain_notes}>
                                                {player.captain_notes || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                                                {new Date(player.joined_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-xs text-gray-500 font-mono mt-2">
                Showing {filtered.length} players
            </div>
        </div>
    )
}
