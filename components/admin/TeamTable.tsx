'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TeamActions } from '@/components/admin/TeamActions'

interface TeamTableProps {
    teams: any[]
    tournaments: any[]
}

export function TeamTable({ teams, tournaments }: TeamTableProps) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [processing, setProcessing] = useState(false)

    const toggleSelectAll = () => {
        if (selectedIds.length === teams.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(teams.map(t => t.id))
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} teams?`)) return
        setProcessing(true)
        try {
            // We'll call the delete API for each (sequential or Promise.all)
            // Ideally we'd have a bulk delete API, but let's stick to existing for now or add it later
            await Promise.all(selectedIds.map(id =>
                fetch(`/api/tournament/teams/${id}`, { method: 'DELETE' })
            ))
            setSelectedIds([])
            router.refresh()
        } catch (err) {
            alert('Failed to delete some teams.')
        } finally {
            setProcessing(false)
        }
    }

    const handleBulkAssign = async (tournamentId: string) => {
        if (!tournamentId) return
        setProcessing(true)
        try {
            await Promise.all(selectedIds.map(id =>
                fetch(`/api/tournament/teams/${id}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tournamentId })
                })
            ))
            setSelectedIds([])
            router.refresh()
        } catch (err) {
            alert('Failed to assign some teams.')
        } finally {
            setProcessing(false)
        }
    }

    const handleExportCSV = () => {
        const selectedTeams = teams.filter(t => selectedIds.includes(t.id))
        const csvContent = [
            ['Team Name', 'Captain', 'Members', 'Tournament', 'Invite Code'],
            ...selectedTeams.map(t => [
                t.name,
                t.users?.username || 'Unknown',
                t.tournament_players?.[0]?.count || 0,
                t.tournaments?.name || 'Unassigned',
                t.invite_code
            ])
        ].map(e => e.join(",")).join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `teams_export_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-[#dc143c]/10 border border-[#dc143c]/30 rounded-sm p-4 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-30 backdrop-blur-md animate-slideDown">
                    <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-sm tracking-tight">
                            {selectedIds.length} Teams Selected
                        </span>
                        <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-white/40 hover:text-white text-[10px] uppercase tracking-widest font-bold"
                        >
                            Deselect All
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            onChange={(e) => handleBulkAssign(e.target.value)}
                            disabled={processing}
                            className="bg-black border border-white/10 text-white rounded-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest focus:border-[#dc143c] transition-colors"
                        >
                            <option value="">Assign to Tournament...</option>
                            {tournaments.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>

                        <button
                            onClick={handleExportCSV}
                            disabled={processing}
                            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            Export CSV
                        </button>

                        <button
                            onClick={handleBulkDelete}
                            disabled={processing}
                            className="px-4 py-1.5 bg-[#dc143c]/20 hover:bg-[#dc143c] text-[#dc143c] hover:text-white border border-[#dc143c]/30 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-left w-10">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === teams.length && teams.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 bg-zinc-950 border-white/10 rounded-[2px] text-[#dc143c] focus:ring-offset-0 focus:ring-0 checked:bg-[#dc143c]"
                                />
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Team Name</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Captain</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Members</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Tournament</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Invite Code</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {teams.map((team) => {
                            const isSelected = selectedIds.includes(team.id)
                            return (
                                <tr key={team.id} className={`transition-colors ${isSelected ? 'bg-[#dc143c]/[0.03]' : 'hover:bg-white/[0.02]'}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(team.id)}
                                            className="w-4 h-4 bg-zinc-950 border-white/10 rounded-[2px] text-[#dc143c] focus:ring-offset-0 focus:ring-0 checked:bg-[#dc143c]"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-white text-sm font-medium">{team.name}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                        {team.users?.username || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border bg-white/5 text-gray-400 border-white/10">
                                            {team.tournament_players?.[0]?.count || 0} / 5
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {team.tournaments ? (
                                            <span className="text-green-500 font-bold uppercase tracking-widest">{team.tournaments.name}</span>
                                        ) : (
                                            <span className="text-yellow-500 uppercase tracking-widest">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                        {team.invite_code}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-mono text-right">
                                        <TeamActions
                                            teamId={team.id}
                                            currentTournamentId={team.tournament_id}
                                            tournaments={tournaments}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                        {teams.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center">
                                    <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.2em]">No teams found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
