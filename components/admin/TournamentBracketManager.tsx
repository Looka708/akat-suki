'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TournamentBracketManager({
    matches,
    tournamentId
}: {
    matches: any[],
    tournamentId: string
}) {
    const router = useRouter()
    const [updating, setUpdating] = useState<string | null>(null)
    const [scores, setScores] = useState<Record<string, { t1: number, t2: number }>>({})

    if (!matches || matches.length === 0) return null

    // Group matches by round
    const roundsMap = matches.reduce((acc: any, m: any) => {
        if (!acc[m.round]) acc[m.round] = []
        acc[m.round].push(m)
        return acc
    }, {})

    const handleUpdateMatch = async (m: any) => {
        const s = scores[m.id]
        if (!s) return

        let winnerId = null;
        if (s.t1 > s.t2) winnerId = m.team1_id
        else if (s.t2 > s.t1) winnerId = m.team2_id

        if (!winnerId) {
            alert('Matches cannot end in a draw.')
            return
        }

        setUpdating(m.id)
        try {
            const res = await fetch(`/api/tournament/matches/${m.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team1Score: s.t1, team2Score: s.t2, winnerId })
            })

            if (!res.ok) throw new Error('Failed to update score')

            router.refresh()
        } catch (err) {
            console.error(err)
            alert('Failed to update match.')
        } finally {
            setUpdating(null)
        }
    }

    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden p-6 mt-8">
            <h2 className="text-xl font-rajdhani font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-4 h-1 bg-[#dc143c]"></span>
                BRACKET MANAGEMENT
            </h2>

            <div className="flex gap-12 overflow-x-auto pb-8 snap-x">
                {Object.keys(roundsMap).sort((a, b) => Number(a) - Number(b)).map(round => (
                    <div key={round} className="flex-shrink-0 w-80 space-y-6 snap-start">
                        <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase pb-2 border-b border-white/10">
                            Round {round}
                        </h3>

                        <div className="space-y-4">
                            {roundsMap[round].map((m: any) => {
                                const isReady = m.team1_id && m.team2_id
                                const isCompleted = m.state === 'completed'
                                const isUpdating = updating === m.id

                                return (
                                    <div key={m.id} className={`p-4 border rounded-sm transition-colors ${isCompleted ? 'border-green-500/30 bg-green-500/5' : isReady ? 'border-white/20 bg-black/40' : 'border-white/5 bg-transparent'}`}>

                                        <div className="flex flex-col gap-2 mb-4">
                                            {/* Team 1 */}
                                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm text-sm">
                                                <span className={`font-mono ${m.winner_id === m.team1_id ? 'text-green-400 font-bold' : isCompleted ? 'text-red-400' : m.team1_id ? 'text-white' : 'text-gray-600'}`}>
                                                    {m.team1_id ? m.team1?.name || 'Unknown' : 'TBD'}
                                                </span>
                                                {isCompleted ? (
                                                    <span className="font-bold text-white">{m.team1_score}</span>
                                                ) : isReady && (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-12 bg-black border border-white/20 text-white rounded-[2px] px-2 py-0.5 text-center font-mono"
                                                        value={scores[m.id]?.t1 ?? 0}
                                                        onChange={(e) => setScores(prev => ({ ...prev, [m.id]: { t1: parseInt(e.target.value) || 0, t2: prev[m.id]?.t2 ?? 0 } }))}
                                                    />
                                                )}
                                            </div>

                                            {/* Team 2 */}
                                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm text-sm">
                                                <span className={`font-mono ${m.winner_id === m.team2_id ? 'text-green-400 font-bold' : isCompleted ? 'text-red-400' : m.team2_id ? 'text-white' : 'text-gray-600'}`}>
                                                    {m.team2_id ? m.team2?.name || 'Unknown' : 'TBD'}
                                                </span>
                                                {isCompleted ? (
                                                    <span className="font-bold text-white">{m.team2_score}</span>
                                                ) : isReady && (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-12 bg-black border border-white/20 text-white rounded-[2px] px-2 py-0.5 text-center font-mono"
                                                        value={scores[m.id]?.t2 ?? 0}
                                                        onChange={(e) => setScores(prev => ({ ...prev, [m.id]: { t1: prev[m.id]?.t1 ?? 0, t2: parseInt(e.target.value) || 0 } }))}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {!isCompleted && isReady && (
                                            <button
                                                onClick={() => handleUpdateMatch(m)}
                                                disabled={isUpdating || (scores[m.id]?.t1 === scores[m.id]?.t2)}
                                                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50"
                                            >
                                                {isUpdating ? 'UPDATING...' : 'COMPLETE MATCH'}
                                            </button>
                                        )}
                                        {isCompleted && (
                                            <div className="text-center text-[10px] text-green-500 uppercase tracking-widest font-mono">
                                                MATCH CONCLUDED
                                            </div>
                                        )}
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
