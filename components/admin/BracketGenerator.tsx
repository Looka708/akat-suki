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

    const [bracketMode, setBracketMode] = useState<'standard' | 'challonge'>('standard')
    const [bracketType, setBracketType] = useState<string>('single elimination')

    // Find the minimum valid size for current teams
    const minSize = (() => {
        let s = 2
        const count = teamCount || 2
        while (s < count) s *= 2
        return s
    })()

    const handleGenerate = async (size?: number) => {
        let payload: any = {}
        if (bracketMode === 'standard') {
            const bracketSize = size || selectedSize || minSize
            if (!confirm(`Generate a ${bracketSize}-team standard bracket? This will wipe any existing bracket.`)) return
            payload = { bracketSize }
        } else {
            if (!confirm(`Generate a ${bracketType} bracket via Challonge? This will wipe any existing bracket.`)) return
            payload = { bracketType }
        }

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

            {/* Config selector dropdown */}
            {showOptions && !disabled && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl shadow-black/60 z-50 overflow-hidden">
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setBracketMode('standard')}
                            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${bracketMode === 'standard' ? 'bg-[#dc143c]/20 text-[#dc143c] border-b-2 border-[#dc143c]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Native (SVG)
                        </button>
                        <button
                            onClick={() => setBracketMode('challonge')}
                            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${bracketMode === 'challonge' ? 'bg-[#dc143c]/20 text-[#dc143c] border-b-2 border-[#dc143c]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Challonge API
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        {bracketMode === 'standard' ? (
                            <>
                                <p className="text-[10px] text-zinc-400 font-mono">Generates the native visual bracket. Best for simple 1v1 formats.</p>
                                <div className="space-y-1.5">
                                    {BRACKET_SIZES.map(size => {
                                        const tooSmall = size < (teamCount || 2)
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
                            </>
                        ) : (
                            <>
                                <p className="text-[10px] text-zinc-400 font-mono">Generates and embeds an interactive bracket using the Challonge API.</p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-white uppercase tracking-widest mb-1.5">Bracket Type</label>
                                        <select
                                            value={bracketType}
                                            onChange={(e) => setBracketType(e.target.value)}
                                            className="w-full bg-zinc-950 border border-white/20 rounded-sm text-xs text-white p-2 focus:outline-none focus:border-[#dc143c]"
                                        >
                                            <option value="single elimination">Single Elimination</option>
                                            <option value="double elimination">Double Elimination</option>
                                            <option value="round robin">Round Robin</option>
                                            <option value="swiss">Swiss</option>
                                            <option value="free for all">Free For All</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => handleGenerate()}
                                        disabled={generating}
                                        className="w-full py-2 bg-[#dc143c] hover:bg-[#ef234d] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50"
                                    >
                                        {generating ? 'Working...' : 'Create on Challonge'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.01]">
                        <p className="text-[8px] text-zinc-600 font-mono">⚠ Generating a bracket will wipe any existing matches</p>
                    </div>
                </div>
            )}
        </div>
    )
}
