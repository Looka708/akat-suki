'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SwissView({ matches, tournamentId }: { matches: any[], tournamentId: string }) {
    const router = useRouter()
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Group matches by round
    const roundsMap = matches.reduce((acc: any, m: any) => {
        if (!acc[m.round]) acc[m.round] = []
        acc[m.round].push(m)
        return acc
    }, {})

    const rounds = Object.keys(roundsMap).sort((a, b) => Number(a) - Number(b)).map(Number)
    const currentRound = rounds.length > 0 ? Math.max(...rounds) : 0
    const currentRoundMatches = roundsMap[currentRound] || []

    // Check if we can proceed to next round (all current matches completed)
    const isCurrentRoundFinished = currentRoundMatches.length > 0 && currentRoundMatches.every((m: any) => m.state === 'completed')

    const generateNextRound = async () => {
        if (!confirm('Generate next Swiss round? Ensure all current scores are correct.')) return

        setGenerating(true)
        setError(null)
        try {
            const res = await fetch(`/api/tournament/${tournamentId}/bracket/swiss/next`, {
                method: 'POST'
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to generate next round')

            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="w-full flex flex-col gap-8 pb-12">
            {/* Header / Admin Controls */}
            <div className="flex justify-between items-center bg-black/40 border border-white/10 p-6 rounded-sm">
                <div>
                    <h2 className="text-xl font-rajdhani font-bold text-white tracking-widest uppercase">
                        Swiss System <span className="text-[#dc143c]">— Round {currentRound}</span>
                    </h2>
                    <p className="text-zinc-500 font-mono text-xs mt-1">
                        {isCurrentRoundFinished
                            ? 'All matches completed. Ready for next round.'
                            : 'Awaiting completion of current round matches.'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {error && <span className="text-xs text-red-500 font-mono">{error}</span>}
                    <button
                        onClick={generateNextRound}
                        disabled={!isCurrentRoundFinished || generating}
                        className="px-6 py-2.5 bg-[#dc143c]/10 text-[#dc143c] hover:bg-[#dc143c] hover:text-white border border-[#dc143c]/30 uppercase text-xs font-bold tracking-widest rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {generating ? 'GENERATING...' : 'GENERATE NEXT ROUND'}
                    </button>
                </div>
            </div>

            {/* Rounds List */}
            <div className="flex gap-8 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {rounds.map(round => (
                    <div key={`swiss-round-${round}`} className="flex-shrink-0 w-80 space-y-4 snap-start">
                        <h3 className="text-xs font-bold text-zinc-500 tracking-widest uppercase pb-2 border-b border-white/10">
                            Round {round}
                        </h3>

                        <div className="space-y-3">
                            {roundsMap[round].map((m: any) => {
                                const isCompleted = m.state === 'completed'
                                const isBye = (m.team1_id && !m.team2_id) || (!m.team1_id && m.team2_id)

                                return (
                                    <div key={m.id} className={`p-4 border rounded-sm transition-all ${isCompleted ? 'border-[#dc143c]/30 bg-[#dc143c]/5' : 'border-white/10 bg-black/60'} relative overflow-hidden`}>

                                        {isBye && (
                                            <div className="absolute top-0 right-0 bg-[#dc143c]/20 text-[#dc143c] text-[8px] font-bold px-2 py-0.5 uppercase">
                                                BYE
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2 relative z-10">
                                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm text-sm">
                                                <span className={`font-mono truncate w-[180px] ${m.winner_id === m.team1_id ? 'text-[#dc143c] font-bold' : isCompleted ? 'text-zinc-600' : 'text-zinc-300'}`}>
                                                    {m.team1?.name || (isBye && !m.team1_id ? '---' : 'TBD')}
                                                </span>
                                                {(isCompleted || isBye) && (
                                                    <span className="font-bold font-mono text-white text-xs bg-black/50 px-2 py-0.5 rounded">
                                                        {m.team1_score || 0}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm text-sm">
                                                <span className={`font-mono truncate w-[180px] ${m.winner_id === m.team2_id ? 'text-[#dc143c] font-bold' : isCompleted ? 'text-zinc-600' : 'text-zinc-300'}`}>
                                                    {m.team2?.name || (isBye && !m.team2_id ? '---' : 'TBD')}
                                                </span>
                                                {(isCompleted || isBye) && (
                                                    <span className="font-bold font-mono text-white text-xs bg-black/50 px-2 py-0.5 rounded">
                                                        {m.team2_score || 0}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
