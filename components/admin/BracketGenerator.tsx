'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BRACKET_SIZES = [2, 4, 8, 16, 32]

export default function BracketGenerator({ tournamentId, disabled, teamCount }: { tournamentId: string, disabled?: boolean, teamCount?: number }) {
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<number | null>(null)
    const [showOptions, setShowOptions] = useState(false)
    const router = useRouter()

    // Find the minimum valid size for current teams
    const minSize = (() => {
        let s = 2
        const count = teamCount || 2
        while (s < count) s *= 2
        return s
    })()

    const handleGenerate = async (size?: number) => {
        const bracketSize = size || selectedSize || minSize
        if (!confirm(`Generate a ${bracketSize}-team bracket? This will wipe any existing bracket.`)) return

        setGenerating(true)
        setError(null)

        try {
            const res = await fetch(`/api/tournament/${tournamentId}/bracket/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bracketSize })
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
                    disabled={generating || disabled}
                    className="px-4 py-2 bg-[#dc143c]/10 text-[#dc143c] hover:bg-[#dc143c] hover:text-white transition-colors rounded-sm border border-[#dc143c]/30 text-sm font-bold uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                >
                    {disabled ? 'REQUIRES MIN 2 TEAMS' : generating ? 'GENERATING...' : 'GENERATE BRACKET'}
                    {!disabled && !generating && (
                        <svg className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Size selector dropdown */}
            {showOptions && !disabled && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-black/95 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl shadow-black/60 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                        <p className="text-xs font-rajdhani font-bold text-white uppercase tracking-[0.2em]">Bracket Size</p>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                            {teamCount || 0} teams registered • Min bracket: {minSize} slots
                        </p>
                    </div>

                    <div className="p-3 space-y-1.5">
                        {BRACKET_SIZES.map(size => {
                            const tooSmall = size < (teamCount || 2)
                            const isRecommended = size === minSize
                            const numRounds = Math.log2(size)
                            const byeCount = Math.max(0, size - (teamCount || 0))

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
                                            {size}
                                        </span>
                                        <div>
                                            <p className="text-[10px] font-mono text-zinc-400">
                                                {numRounds} rounds • {size / 2} first-round matches
                                            </p>
                                            {byeCount > 0 && !tooSmall && (
                                                <p className="text-[9px] font-mono text-zinc-600">{byeCount} bye slots</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isRecommended && (
                                            <span className="text-[8px] text-[#dc143c] font-bold uppercase tracking-widest bg-[#dc143c]/10 px-1.5 py-0.5 rounded">
                                                Recommended
                                            </span>
                                        )}
                                        {tooSmall && (
                                            <span className="text-[8px] text-zinc-600 font-mono">too small</span>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.01]">
                        <p className="text-[8px] text-zinc-600 font-mono">⚠ Generating a bracket will wipe any existing matches</p>
                    </div>
                </div>
            )}
        </div>
    )
}
