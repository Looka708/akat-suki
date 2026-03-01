'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BRACKET_SIZES = [2, 4, 8, 16, 32]

export default function BracketGenerator({ tournamentId, disabled, teamCount }: { tournamentId: string, disabled?: boolean, teamCount?: number }) {
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<number | null>(null)
    const [showOptions, setShowOptions] = useState(false)
    const [format, setFormat] = useState('single_elimination')
    const router = useRouter()

    // Find the minimum valid size for current teams
    const minSize = (() => {
        let s = 4 // Default to at least an empty 4-slot Bracket
        const count = teamCount || 0
        while (s < count) s *= 2
        return s
    })()

    const handleGenerate = async (size?: number) => {
        let payload: any = {}
        const bracketSize = size || selectedSize || minSize
        const formatLabel = format.replace('_', ' ')
        if (!confirm(`Generate a ${bracketSize}-team ${formatLabel} bracket? This will wipe any existing bracket.`)) return
        payload = { bracketSize, format }

        setGenerating(true)
        setError(null)

        try {
            const res = await fetch(`/api/tournament/${tournamentId}/bracket/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate bracket')
            }

            setShowOptions(false)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="relative">
            <div className="flex items-center gap-3">
                {error && <span className="text-red-500 text-xs font-mono">{error}</span>}

                <button
                    onClick={() => setShowOptions(!showOptions)}
                    disabled={generating}
                    className="px-4 py-2 bg-[#dc143c]/10 text-[#dc143c] hover:bg-[#dc143c] hover:text-white transition-colors rounded-sm border border-[#dc143c]/30 text-sm font-bold uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                >
                    {generating ? 'GENERATING...' : 'GENERATE BRACKET'}
                    {!generating && (
                        <svg className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Config selector dropdown */}
            {showOptions && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl shadow-black/60 z-50 overflow-hidden">
                    <div className="p-4 space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-white uppercase tracking-widest mb-1.5">Bracket Format</label>
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                className="w-full bg-zinc-950 border border-white/20 rounded-sm text-xs text-white p-2 focus:outline-none focus:border-[#dc143c]"
                            >
                                <option value="single_elimination">Single Elimination (Knockout)</option>
                                <option value="double_elimination">Double Elimination</option>
                                <option value="round_robin">Round Robin</option>
                                <option value="swiss">Swiss System</option>
                                <option value="compass">Compass Draw</option>
                            </select>
                            <p className="text-[10px] text-zinc-400 font-mono mt-2">Select the native format for this tournament bracket.</p>
                        </div>
                        <div className="space-y-1.5">
                            {BRACKET_SIZES.map(size => {
                                const tooSmall = teamCount ? size < teamCount : false
                                const isRecommended = size === minSize

                                return (
                                    <button
                                        key={size}
                                        onClick={() => handleGenerate(size)}
                                        disabled={tooSmall || generating}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-left transition-all border ${tooSmall
                                            ? 'border-transparent bg-white/[0.01] opacity-30 cursor-not-allowed'
                                            : isRecommended
                                                ? 'border-[#dc143c]/30 bg-[#dc143c]/5 hover:bg-[#dc143c]/10 text-white'
                                                : 'border-transparent bg-white/[0.02] hover:bg-white/[0.05] text-zinc-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`font-rajdhani font-bold text-lg ${isRecommended ? 'text-[#dc143c]' : 'text-white'}`}>
                                                {size} slots
                                            </span>
                                        </div>
                                        {isRecommended && (
                                            <span className="text-[8px] text-[#dc143c] font-bold uppercase tracking-widest bg-[#dc143c]/10 px-1.5 py-0.5 rounded">
                                                Recommended
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.01]">
                        <p className="text-[8px] text-zinc-600 font-mono">⚠ Generating a bracket will wipe any existing matches</p>
                    </div>
                </div>
            )}
        </div>
    )
}
