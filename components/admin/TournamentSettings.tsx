'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TournamentSettingsProps {
    tournament: any
}

export function TournamentSettings({ tournament }: TournamentSettingsProps) {
    const router = useRouter()
    const [status, setStatus] = useState(tournament.status)
    const [maxSlots, setMaxSlots] = useState(tournament.max_slots)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/admin/tournaments/${tournament.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, maxSlots })
            })
            if (res.ok) {
                router.refresh()
                alert('Tournament settings updated!')
            } else {
                alert('Failed to update tournament')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6 space-y-4">
            <h2 className="text-xl font-rajdhani font-bold text-white tracking-widest uppercase flex justify-between items-center">
                Management Settings
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#dc143c] hover:bg-white hover:text-black text-white text-xs tracking-widest transition-colors rounded-sm ml-auto disabled:opacity-50"
                >
                    {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Tournament Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-black border border-white/20 rounded-sm px-4 py-2 text-white text-sm focus:outline-none focus:border-[#dc143c] transition-colors appearance-none cursor-pointer"
                    >
                        <option value="upcoming">Upcoming (Closed)</option>
                        <option value="registration_open">Registration Open</option>
                        <option value="live">Live</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Total Slots Available</label>
                    <input
                        type="number"
                        min="2"
                        max="128"
                        value={maxSlots}
                        onChange={(e) => setMaxSlots(parseInt(e.target.value))}
                        className="w-full bg-black border border-white/20 rounded-sm px-4 py-2 text-white text-sm focus:outline-none focus:border-[#dc143c] transition-colors"
                    />
                </div>
            </div>
        </div>
    )
}
