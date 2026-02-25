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
    const [verifyIds, setVerifyIds] = useState<Record<string, string>>({})
    const [verifyError, setVerifyError] = useState<Record<string, string>>({})

    if (!matches || matches.length === 0) return null

    // Group matches by round
    const roundsMap = matches.reduce((acc: any, m: any) => {
        if (!acc[m.round]) acc[m.round] = []
        acc[m.round].push(m)
        return acc
    }, {})

    const roundNumbers = Object.keys(roundsMap).map(Number).sort((a, b) => a - b)
    const totalRounds = roundNumbers.length > 0 ? Math.max(...roundNumbers) : 0

    const getRoundLabel = (round: number) => {
        if (round === totalRounds) return 'GRAND FINAL'
        if (round === totalRounds - 1 && totalRounds > 2) return 'SEMI-FINALS'
        if (round === totalRounds - 2 && totalRounds > 3) return 'QUARTER-FINALS'
        return `ROUND ${round}`
    }

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

    const handleVerify = async (matchId: string) => {
        const dotaMatchId = verifyIds[matchId]
        if (!dotaMatchId) {
            setVerifyError(prev => ({ ...prev, [matchId]: 'Enter a Dota Match ID' }))
            return
        }

        setUpdating(matchId)
        setVerifyError(prev => ({ ...prev, [matchId]: '' }))

        try {
            const res = await fetch(`/api/tournament/matches/${matchId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dotaMatchId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Verification failed')
            router.refresh()
        } catch (err: any) {
            setVerifyError(prev => ({ ...prev, [matchId]: err.message }))
        } finally {
            setUpdating(null)
        }
    }

    const handleReset = async (matchId: string) => {
        if (!confirm('Reset this match? Scores, winner, and advancement will be cleared.')) return
        setUpdating(matchId)
        try {
            const res = await fetch(`/api/tournament/matches/${matchId}/reset`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to reset')
            router.refresh()
        } catch (err) {
            console.error(err)
            alert('Failed to reset match.')
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

            <div className="flex gap-8 overflow-x-auto pb-8 snap-x">
                {roundNumbers.map(round => {
                    const roundMatches = roundsMap[round]
                    const label = getRoundLabel(round)
                    const isFinal = round === totalRounds

                    return (
                        <div key={round} className="flex-shrink-0 w-80 space-y-4 snap-start">
                            <h3 className={`text-xs font-bold tracking-[0.3em] uppercase pb-2 border-b ${isFinal ? 'text-[#dc143c] border-[#dc143c]/30' : 'text-gray-500 border-white/10'}`}>
                                {label}
                            </h3>

                            <div className="space-y-4">
                                {roundMatches.map((m: any) => {
                                    const isReady = m.team1_id && m.team2_id
                                    const isCompleted = m.state === 'completed'
                                    const isLive = m.state === 'live'
                                    const isUpdating = updating === m.id
                                    const isBye = (m.team1_id && !m.team2_id) || (!m.team1_id && m.team2_id)

                                    return (
                                        <div key={m.id} className={`p-4 border rounded-sm transition-colors relative
                                            ${isCompleted ? 'border-green-500/30 bg-green-500/5' :
                                                isLive ? 'border-yellow-500/40 bg-yellow-500/5' :
                                                    isReady ? 'border-white/20 bg-black/40' :
                                                        'border-white/5 bg-transparent'}`}
                                        >
                                            {/* State badge */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm border ${isCompleted ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                                                    isLive ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 animate-pulse' :
                                                        isBye ? 'text-zinc-500 bg-zinc-800 border-zinc-700' :
                                                            'text-zinc-500 bg-white/5 border-white/10'
                                                    }`}>
                                                    {isCompleted ? '✓ COMPLETED' : isLive ? '● LIVE' : isBye ? 'BYE' : 'PENDING'}
                                                </span>
                                                {m.scheduled_time && (
                                                    <span className="text-[9px] text-zinc-500 font-mono">
                                                        {new Date(m.scheduled_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Teams */}
                                            <div className="flex flex-col gap-2 mb-3">
                                                {/* Team 1 */}
                                                <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-sm text-sm">
                                                    <span className={`font-mono truncate ${m.winner_id === m.team1_id ? 'text-green-400 font-bold' : isCompleted && m.team1_id ? 'text-red-400' : m.team1_id ? 'text-white' : 'text-gray-600'}`}>
                                                        {m.team1_id ? m.team1?.name || 'Unknown' : 'TBD'}
                                                    </span>
                                                    {isCompleted ? (
                                                        <span className={`font-bold text-lg font-mono ml-2 ${m.winner_id === m.team1_id ? 'text-green-400' : 'text-red-400'}`}>{m.team1_score}</span>
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
                                                <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-sm text-sm">
                                                    <span className={`font-mono truncate ${m.winner_id === m.team2_id ? 'text-green-400 font-bold' : isCompleted && m.team2_id ? 'text-red-400' : m.team2_id ? 'text-white' : 'text-gray-600'}`}>
                                                        {m.team2_id ? m.team2?.name || 'Unknown' : 'TBD'}
                                                    </span>
                                                    {isCompleted ? (
                                                        <span className={`font-bold text-lg font-mono ml-2 ${m.winner_id === m.team2_id ? 'text-green-400' : 'text-red-400'}`}>{m.team2_score}</span>
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

                                            {/* Actions */}
                                            {!isCompleted && isReady && (
                                                <div className="flex flex-col gap-2">
                                                    {m.state === 'pending' && (
                                                        <button
                                                            onClick={async () => {
                                                                setUpdating(m.id)
                                                                try {
                                                                    const res = await fetch(`/api/tournament/matches/${m.id}`, {
                                                                        method: 'PUT',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ state: 'live', scheduledTime: new Date().toISOString() })
                                                                    })
                                                                    if (res.ok) router.refresh()
                                                                } finally { setUpdating(null) }
                                                            }}
                                                            disabled={isUpdating}
                                                            className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border border-yellow-500/30"
                                                        >
                                                            {isUpdating ? 'UPDATING...' : '● SET LIVE'}
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleUpdateMatch(m)}
                                                        disabled={isUpdating || (scores[m.id]?.t1 === scores[m.id]?.t2)}
                                                        className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50 border border-green-500/30"
                                                    >
                                                        {isUpdating ? 'UPDATING...' : '✓ COMPLETE MATCH'}
                                                    </button>

                                                    {/* OpenDota Verify */}
                                                    <div className="pt-2 border-t border-white/5">
                                                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1.5">Auto-verify via OpenDota</p>
                                                        <div className="flex gap-1.5">
                                                            <input
                                                                type="text"
                                                                placeholder="Dota Match ID"
                                                                className="flex-1 bg-black border border-white/10 text-white rounded-[2px] px-2 py-1.5 text-xs font-mono placeholder:text-zinc-700"
                                                                value={verifyIds[m.id] || ''}
                                                                onChange={e => setVerifyIds(prev => ({ ...prev, [m.id]: e.target.value }))}
                                                            />
                                                            <button
                                                                onClick={() => handleVerify(m.id)}
                                                                disabled={isUpdating}
                                                                className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-widest rounded-[2px] border border-sky-500/30 whitespace-nowrap"
                                                            >
                                                                VERIFY
                                                            </button>
                                                        </div>
                                                        {verifyError[m.id] && (
                                                            <p className="text-[9px] text-red-400 font-mono mt-1">{verifyError[m.id]}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Completed state: show reset button */}
                                            {isCompleted && (
                                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                    <span className="text-[10px] text-green-500 uppercase tracking-widest font-mono font-bold">MATCH CONCLUDED</span>
                                                    <button
                                                        onClick={() => handleReset(m.id)}
                                                        disabled={isUpdating}
                                                        className="text-[9px] text-red-400 hover:text-red-300 font-mono uppercase tracking-widest transition-colors disabled:opacity-50"
                                                    >
                                                        ↺ RESET
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
