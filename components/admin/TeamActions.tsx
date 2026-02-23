'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TeamActionsProps {
    teamId: string
    currentTournamentId: string | null
    tournaments: { id: string, name: string }[]
}

export function TeamActions({ teamId, currentTournamentId, tournaments }: TeamActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this team?')) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/teams/${teamId}`, { method: 'DELETE' })
            if (res.ok) router.refresh()
            else alert('Failed to delete team')
        } catch (err) {
            console.error(err)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleAssign = async (tournamentId: string) => {
        setIsUpdating(true)
        try {
            const res = await fetch(`/api/admin/teams/${teamId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tournamentId })
            })
            if (res.ok) router.refresh()
            else alert('Failed to assign tournament')
        } catch (err) {
            console.error(err)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="flex items-center justify-end gap-3">
            <select
                value={currentTournamentId || ''}
                onChange={(e) => handleAssign(e.target.value)}
                disabled={isUpdating}
                className="bg-black border border-white/10 rounded-sm px-2 py-1 text-[10px] uppercase font-bold text-gray-400 focus:outline-none focus:border-[#dc143c] w-32"
            >
                <option value="">Unassigned</option>
                {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-gray-500 hover:text-red-500 transition-colors p-1"
                title="Delete Team"
            >
                {isDeleting ? '...' : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                )}
            </button>
        </div>
    )
}
