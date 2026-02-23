'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BracketGenerator({ tournamentId, disabled }: { tournamentId: string, disabled?: boolean }) {
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleGenerate = async () => {
        if (!confirm('Are you sure? This will wipe the current bracket and generate a new one based on currently registered teams.')) return

        setGenerating(true)
        setError(null)

        try {
            const res = await fetch(`/api/tournament/${tournamentId}/bracket/generate`, {
                method: 'POST'
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate bracket')
            }

            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="flex items-center gap-4">
            {error && <span className="text-red-500 text-xs font-mono">{error}</span>}
            <button
                onClick={handleGenerate}
                disabled={generating || disabled}
                className="px-4 py-2 bg-[#dc143c]/10 text-[#dc143c] hover:bg-[#dc143c] hover:text-white transition-colors rounded-sm border border-[#dc143c]/30 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
            >
                {generating ? 'SIMULATING BRACKET...' : 'GENERATE BRACKET'}
            </button>
        </div>
    )
}
