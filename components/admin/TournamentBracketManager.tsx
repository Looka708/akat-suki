'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const MATCH_HEIGHT = 110
const MATCH_WIDTH = 300
const ROUND_GAP = 60
const CONNECTOR_WIDTH = 40

export default function TournamentBracketManager({
    matches,
    tournamentId,
    challongeUrl,
    teams = []
}: {
    matches: any[],
    tournamentId: string,
    challongeUrl?: string | null,
    teams?: any[]
}) {
    const router = useRouter()
    const [updating, setUpdating] = useState<string | null>(null)
    const [scores, setScores] = useState<Record<string, { t1: number, t2: number }>>({})
    const [verifyIds, setVerifyIds] = useState<Record<string, string>>({})
    const [verifyError, setVerifyError] = useState<Record<string, string>>({})
    const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)
    const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
    const [scheduleTimes, setScheduleTimes] = useState<Record<string, string>>({})
    const [seriesFormats, setSeriesFormats] = useState<Record<string, string>>({})

    if (challongeUrl) {
        return (
            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden h-[800px]">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-sm font-rajdhani font-bold text-[#dc143c] uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-4 h-1 bg-[#dc143c]"></span>
                        Challonge Bracket
                    </h2>
                    <a href={challongeUrl} target="_blank" rel="noreferrer" className="text-[9px] text-zinc-400 hover:text-white font-mono uppercase tracking-widest transition-colors flex items-center gap-1">
                        Open in Challonge ↗
                    </a>
                </div>
                <iframe src={`${challongeUrl}/module`} width="100%" height="100%" frameBorder="0" scrolling="auto" allowTransparency={true}></iframe>
            </div>
        )
    }

    if (!matches || matches.length === 0) return null

    // Group matches by round
    const roundsMap = matches.reduce((acc: any, m: any) => {
        if (!acc[m.round]) acc[m.round] = []
        acc[m.round].push(m)
        return acc
    }, {})

    const roundNumbers = Object.keys(roundsMap).map(Number).sort((a, b) => a - b)
    const totalRounds = roundNumbers.length > 0 ? Math.max(...roundNumbers) : 0
    const round1Count = roundsMap[roundNumbers[0]]?.length || 0

    // Compute unassigned teams
    const unassignedTeams = teams.filter(t =>
        !matches.some((m: any) => m.team1_id === t.id || m.team2_id === t.id)
    )

    const getRoundLabel = (round: number) => {
        if (round === totalRounds) return 'GRAND FINAL'
        if (round === totalRounds - 1 && totalRounds > 2) return 'SEMI-FINALS'
        if (round === totalRounds - 2 && totalRounds > 3) return 'QUARTER-FINALS'
        return `ROUND ${round}`
    }

    // Layout calculations
    const MATCH_VERTICAL_GAP = 20
    const totalHeight = round1Count * (MATCH_HEIGHT + MATCH_VERTICAL_GAP) - MATCH_VERTICAL_GAP
    const totalWidth = roundNumbers.length * (MATCH_WIDTH + ROUND_GAP + CONNECTOR_WIDTH) - ROUND_GAP

    const getMatchY = useCallback((roundIdx: number, matchIdx: number, matchesInRound: number): number => {
        if (roundIdx === 0) {
            const blockHeight = totalHeight / matchesInRound
            return matchIdx * blockHeight + (blockHeight - MATCH_HEIGHT) / 2
        }
        const prevRoundMatchCount = matchesInRound * 2
        const feeder1Y = getMatchY(roundIdx - 1, matchIdx * 2, prevRoundMatchCount)
        const feeder2Y = getMatchY(roundIdx - 1, matchIdx * 2 + 1, prevRoundMatchCount)
        return (feeder1Y + feeder2Y) / 2
    }, [totalHeight])

    // Action handlers
    const handleUpdateMatch = async (m: any) => {
        const s = scores[m.id]
        if (!s) return
        let winnerId = null
        if (s.t1 > s.t2) winnerId = m.team1_id
        else if (s.t2 > s.t1) winnerId = m.team2_id
        if (!winnerId) { alert('Matches cannot end in a draw.'); return }
        setUpdating(m.id)
        try {
            const res = await fetch(`/api/tournament/matches/${m.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team1Score: s.t1, team2Score: s.t2, winnerId })
            })
            if (!res.ok) throw new Error('Failed to update score')
            router.refresh()
        } catch { alert('Failed to update match.') }
        finally { setUpdating(null) }
    }

    const handleVerify = async (matchId: string) => {
        const dotaMatchId = verifyIds[matchId]
        if (!dotaMatchId) { setVerifyError(prev => ({ ...prev, [matchId]: 'Enter a Dota Match ID' })); return }
        setUpdating(matchId)
        setVerifyError(prev => ({ ...prev, [matchId]: '' }))
        try {
            const res = await fetch(`/api/tournament/matches/${matchId}/verify`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dotaMatchId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Verification failed')
            router.refresh()
        } catch (err: any) { setVerifyError(prev => ({ ...prev, [matchId]: err.message })) }
        finally { setUpdating(null) }
    }

    const handleReset = async (matchId: string) => {
        if (!confirm('Reset this match? Scores, winner, and advancement will be cleared.')) return
        setUpdating(matchId)
        try {
            const res = await fetch(`/api/tournament/matches/${matchId}/reset`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to reset')
            router.refresh()
        } catch { alert('Failed to reset match.') }
        finally { setUpdating(null) }
    }

    const handleDropSwap = async (
        sourceMatchId: string, sourceSlot: number, sourceTeamId: string,
        targetMatchId: string, targetSlot: number, targetTeamId: string
    ) => {
        if (sourceMatchId === targetMatchId && sourceSlot === targetSlot) return
        if (!confirm('Swap these two teams in the bracket?')) return
        setUpdating('swapping')
        try {
            const res = await fetch(`/api/tournaments/${tournamentId}/brackets/swap`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceMatchId, sourceSlot, sourceTeamId, targetMatchId, targetSlot, targetTeamId })
            })
            if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to swap teams') }
            router.refresh()
        } catch (err: any) { alert(err.message) }
        finally { setUpdating(null); setDragOverSlot(null) }
    }

    const handleRemoveTeam = async (matchId: string, slot: number) => {
        if (!confirm('Remove this team from the match slot?')) return
        setUpdating('removing')
        try {
            const res = await fetch(`/api/tournaments/${tournamentId}/brackets/remove-team`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId, slot })
            })
            if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to remove team') }
            router.refresh()
        } catch (err: any) { alert(err.message) }
        finally { setUpdating(null) }
    }

    const handleAssignTeam = async (matchId: string, slot: number, teamId: string) => {
        setUpdating('assigning')
        try {
            const res = await fetch(`/api/tournaments/${tournamentId}/brackets/assign-team`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId, slot, teamId })
            })
            if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to assign team') }
            router.refresh()
        } catch (err: any) { alert(err.message) }
        finally { setUpdating(null); setDragOverSlot(null) }
    }

    const handleSetLive = async (matchId: string) => {
        setUpdating(matchId)
        try {
            const res = await fetch(`/api/tournament/matches/${matchId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: 'live', scheduledTime: new Date().toISOString() })
            })
            if (res.ok) router.refresh()
        } finally { setUpdating(null) }
    }

    const handleScheduleMatch = async (matchId: string) => {
        const time = scheduleTimes[matchId]
        const format = seriesFormats[matchId]
        if (!time && !format) return
        setUpdating(matchId)
        try {
            const body: any = { state: 'pending' }
            if (time) body.scheduledTime = new Date(time).toISOString()
            if (format) body.seriesFormat = format

            const res = await fetch(`/api/tournament/matches/${matchId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (!res.ok) throw new Error('Failed to update match settings')
            router.refresh()
        } catch { alert('Failed to update match settings.') }
        finally { setUpdating(null) }
    }

    // Render a team slot (draggable)
    const TeamSlot = ({ match, slot, teamId, teamName, isWinner, isLoser, isCompleted }: {
        match: any; slot: number; teamId: string | null; teamName: string; isWinner: boolean; isLoser: boolean; isCompleted: boolean
    }) => {
        const slotKey = `${match.id}-${slot}`
        const isDragOver = dragOverSlot === slotKey

        return (
            <div
                draggable={!isCompleted && !!teamId}
                onDragStart={(e) => {
                    e.dataTransfer.setData('sourceMatchId', match.id)
                    e.dataTransfer.setData('sourceSlot', String(slot))
                    e.dataTransfer.setData('sourceTeamId', teamId || '')
                    e.dataTransfer.effectAllowed = 'move'
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOverSlot(slotKey) }}
                onDragLeave={() => setDragOverSlot(null)}
                onDrop={(e) => {
                    e.preventDefault()
                    setDragOverSlot(null)

                    const sourceMatchId = e.dataTransfer.getData('sourceMatchId')
                    const sourceSlot = e.dataTransfer.getData('sourceSlot')
                    const sourceTeamId = e.dataTransfer.getData('sourceTeamId')

                    if (sourceMatchId === 'unassigned') {
                        handleAssignTeam(match.id, slot, sourceTeamId)
                    } else {
                        handleDropSwap(
                            sourceMatchId,
                            parseInt(sourceSlot),
                            sourceTeamId,
                            match.id, slot, teamId || ''
                        )
                    }
                }}
                className={`group flex items-center justify-between px-3 py-2 rounded-[2px] text-xs transition-all duration-150 border
                    ${isDragOver ? 'border-[#dc143c] bg-[#dc143c]/10 scale-[1.02] shadow-lg shadow-[#dc143c]/20' :
                        !isCompleted && teamId ? 'border-transparent bg-white/5 cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-[#dc143c]/40' :
                            teamId ? 'border-transparent bg-white/5' :
                                'border-dashed border-white/10 bg-transparent'
                    }`}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {teamId && (
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isWinner ? 'bg-green-400' : isLoser ? 'bg-red-400' : 'bg-zinc-600'}`} />
                    )}
                    <span className={`font-mono truncate text-[11px] ${isWinner ? 'text-green-400 font-bold' :
                        isLoser ? 'text-red-400/70' :
                            teamId ? 'text-white' : 'text-zinc-700 italic'
                        }`}>
                        {teamId ? teamName : 'TBD'}
                    </span>
                    {!isCompleted && teamId && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveTeam(match.id, slot) }}
                            className="text-zinc-600 hover:text-[#dc143c] opacity-0 group-hover:opacity-100 transition-all ml-auto shrink-0"
                            title="Remove"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
                {isCompleted && (
                    <span className={`font-bold text-sm font-mono ml-2 ${isWinner ? 'text-green-400' : 'text-red-400/60'}`}>
                        {slot === 1 ? match.team1_score : match.team2_score}
                    </span>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-sm font-rajdhani font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-4 h-1 bg-[#dc143c]"></span>
                    Visual Bracket
                </h2>
                <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Drag teams to swap positions</span>
            </div>

            <div className="overflow-x-auto p-6">
                {/* Round labels */}
                <div className="flex mb-4" style={{ width: totalWidth + 60 }}>
                    {roundNumbers.map((round, idx) => {
                        const x = idx * (MATCH_WIDTH + ROUND_GAP + CONNECTOR_WIDTH)
                        const label = getRoundLabel(round)
                        const isFinal = round === totalRounds
                        return (
                            <div key={round} className="flex-shrink-0" style={{ width: MATCH_WIDTH, marginLeft: idx === 0 ? 0 : ROUND_GAP + CONNECTOR_WIDTH }}>
                                <span className={`text-[9px] font-bold tracking-[0.3em] uppercase ${isFinal ? 'text-[#dc143c]' : 'text-zinc-600'}`}>
                                    {label}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Bracket SVG + Match Cards */}
                <div className="relative" style={{ width: totalWidth + 60, height: Math.max(totalHeight + 40, 200) }}>
                    {/* SVG Connectors */}
                    <svg className="absolute inset-0 pointer-events-none" style={{ width: totalWidth + 60, height: totalHeight + 40 }}>
                        {roundNumbers.slice(1).map((round, idx) => {
                            const roundIdx = idx + 1
                            const currentMatches = roundsMap[round]
                            return currentMatches.map((_: any, matchIdx: number) => {
                                const currentX = roundIdx * (MATCH_WIDTH + ROUND_GAP + CONNECTOR_WIDTH)
                                const prevX = (roundIdx - 1) * (MATCH_WIDTH + ROUND_GAP + CONNECTOR_WIDTH) + MATCH_WIDTH
                                const currentY = getMatchY(roundIdx, matchIdx, currentMatches.length) + MATCH_HEIGHT / 2
                                const feeder1Y = getMatchY(roundIdx - 1, matchIdx * 2, currentMatches.length * 2) + MATCH_HEIGHT / 2
                                const feeder2Y = getMatchY(roundIdx - 1, matchIdx * 2 + 1, currentMatches.length * 2) + MATCH_HEIGHT / 2
                                const midX = prevX + (currentX - prevX) / 2

                                return (
                                    <g key={`connector-${round}-${matchIdx}`}>
                                        {/* Top feeder horizontal */}
                                        <line x1={prevX} y1={feeder1Y} x2={midX} y2={feeder1Y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                                        {/* Bottom feeder horizontal */}
                                        <line x1={prevX} y1={feeder2Y} x2={midX} y2={feeder2Y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                                        {/* Vertical connector */}
                                        <line x1={midX} y1={feeder1Y} x2={midX} y2={feeder2Y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                                        {/* Center to current match */}
                                        <line x1={midX} y1={currentY} x2={currentX} y2={currentY} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                                    </g>
                                )
                            })
                        })}
                    </svg>

                    {/* Match Cards */}
                    {roundNumbers.map((round, roundIdx) => {
                        const roundMatches = roundsMap[round]
                        return roundMatches.map((m: any, matchIdx: number) => {
                            const x = roundIdx * (MATCH_WIDTH + ROUND_GAP + CONNECTOR_WIDTH)
                            const y = getMatchY(roundIdx, matchIdx, roundMatches.length)
                            const isReady = m.team1_id && m.team2_id
                            const isCompleted = m.state === 'completed'
                            const isLive = m.state === 'live'
                            const isExpanded = expandedMatch === m.id
                            const isUpdating = updating === m.id
                            const isFinal = round === totalRounds

                            return (
                                <div
                                    key={m.id}
                                    className="absolute"
                                    style={{ left: x, top: y, width: MATCH_WIDTH }}
                                >
                                    <div
                                        onClick={() => setExpandedMatch(isExpanded ? null : m.id)}
                                        className={`rounded-sm border transition-all duration-200 cursor-pointer
                                            ${isFinal ? 'ring-1 ring-[#dc143c]/20' : ''}
                                            ${isCompleted ? 'border-green-500/30 bg-green-500/[0.03]' :
                                                isLive ? 'border-yellow-500/40 bg-yellow-500/[0.03]' :
                                                    isReady ? 'border-white/15 bg-black/60' :
                                                        'border-white/5 bg-black/30'
                                            }
                                            ${isExpanded ? 'shadow-xl shadow-black/40 z-20' : 'hover:border-white/20'}
                                        `}
                                    >
                                        {/* Match header */}
                                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
                                            <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${isCompleted ? 'text-green-500' : isLive ? 'text-yellow-500' : 'text-zinc-600'
                                                }`}>
                                                {isCompleted ? '✓ Done' : isLive ? '● Live' : 'Pending'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {m.series_format && m.series_format !== 'bo1' && (
                                                    <span className="text-[8px] text-[#dc143c] font-black uppercase tracking-widest">{m.series_format}</span>
                                                )}
                                                <span className="text-[8px] text-zinc-700 font-mono">M{matchIdx + 1}</span>
                                            </div>
                                        </div>

                                        {/* Team slots */}
                                        <div className="p-1.5 space-y-1">
                                            <TeamSlot
                                                match={m} slot={1} teamId={m.team1_id} teamName={m.team1?.name || 'Unknown'}
                                                isWinner={isCompleted && m.winner_id === m.team1_id}
                                                isLoser={isCompleted && m.team1_id && m.winner_id !== m.team1_id}
                                                isCompleted={isCompleted}
                                            />
                                            <TeamSlot
                                                match={m} slot={2} teamId={m.team2_id} teamName={m.team2?.name || 'Unknown'}
                                                isWinner={isCompleted && m.winner_id === m.team2_id}
                                                isLoser={isCompleted && m.team2_id && m.winner_id !== m.team2_id}
                                                isCompleted={isCompleted}
                                            />
                                        </div>
                                    </div>

                                    {/* Expanded actions panel */}
                                    {isExpanded && (
                                        <div className="mt-1 border border-white/10 bg-black/90 backdrop-blur-xl rounded-sm p-3 space-y-3 z-30 relative shadow-2xl shadow-black/60">
                                            {!isCompleted && isReady && (
                                                <>
                                                    {/* Score inputs */}
                                                    <div>
                                                        <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest mb-1.5">Set Scores</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 flex items-center gap-1.5">
                                                                <span className="text-[9px] text-zinc-500 font-mono truncate max-w-[80px]">{m.team1?.name}</span>
                                                                <input type="number" min="0"
                                                                    className="w-10 bg-zinc-950 border border-white/10 text-white rounded-[2px] px-1.5 py-1 text-center font-mono text-xs"
                                                                    value={scores[m.id]?.t1 ?? 0}
                                                                    onClick={e => e.stopPropagation()}
                                                                    onChange={(e) => setScores(prev => ({ ...prev, [m.id]: { t1: parseInt(e.target.value) || 0, t2: prev[m.id]?.t2 ?? 0 } }))}
                                                                />
                                                            </div>
                                                            <span className="text-zinc-700 text-xs">vs</span>
                                                            <div className="flex-1 flex items-center gap-1.5 justify-end">
                                                                <input type="number" min="0"
                                                                    className="w-10 bg-zinc-950 border border-white/10 text-white rounded-[2px] px-1.5 py-1 text-center font-mono text-xs"
                                                                    value={scores[m.id]?.t2 ?? 0}
                                                                    onClick={e => e.stopPropagation()}
                                                                    onChange={(e) => setScores(prev => ({ ...prev, [m.id]: { t1: prev[m.id]?.t1 ?? 0, t2: parseInt(e.target.value) || 0 } }))}
                                                                />
                                                                <span className="text-[9px] text-zinc-500 font-mono truncate max-w-[80px]">{m.team2?.name}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Scheduling & Format */}
                                                    <div className="pt-2 border-t border-white/5 space-y-3">
                                                        <div className="flex gap-3">
                                                            <div className="flex-1">
                                                                <p className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">Schedule</p>
                                                                <input
                                                                    type="datetime-local"
                                                                    className="w-full bg-zinc-950 border border-white/10 text-white rounded-[2px] px-2 py-1 text-[10px] font-mono"
                                                                    value={scheduleTimes[m.id] || (m.scheduled_time ? new Date(m.scheduled_time).toISOString().slice(0, 16) : '')}
                                                                    onClick={e => e.stopPropagation()}
                                                                    onChange={e => setScheduleTimes(prev => ({ ...prev, [m.id]: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="w-24">
                                                                <p className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">Format</p>
                                                                <select
                                                                    className="w-full bg-zinc-950 border border-white/10 text-white rounded-[2px] px-2 py-1 text-[10px] font-mono"
                                                                    value={seriesFormats[m.id] || m.series_format || 'bo1'}
                                                                    onClick={e => e.stopPropagation()}
                                                                    onChange={e => setSeriesFormats(prev => ({ ...prev, [m.id]: e.target.value }))}
                                                                >
                                                                    <option value="bo1">BO1</option>
                                                                    <option value="bo3">BO3</option>
                                                                    <option value="bo5">BO5</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleScheduleMatch(m.id) }}
                                                            disabled={isUpdating || (!scheduleTimes[m.id] && !seriesFormats[m.id])}
                                                            className="w-full py-1 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold uppercase rounded-[2px] border border-white/10 transition-colors disabled:opacity-40"
                                                        >Save Settings</button>
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div className="flex gap-1.5">
                                                        {m.state === 'pending' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleSetLive(m.id) }}
                                                                disabled={isUpdating}
                                                                className="flex-1 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-[9px] font-bold uppercase tracking-widest rounded-[2px] border border-yellow-500/30 transition-colors"
                                                            >● LIVE</button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateMatch(m) }}
                                                            disabled={isUpdating || (scores[m.id]?.t1 === scores[m.id]?.t2)}
                                                            className="flex-1 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[9px] font-bold uppercase tracking-widest rounded-[2px] border border-green-500/30 transition-colors disabled:opacity-40"
                                                        >✓ COMPLETE</button>
                                                    </div>

                                                    {/* OpenDota verify */}
                                                    <div className="pt-2 border-t border-white/5">
                                                        <p className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest mb-1">OpenDota Auto-Verify</p>
                                                        <div className="flex gap-1">
                                                            <input
                                                                type="text" placeholder="Dota Match ID"
                                                                className="flex-1 bg-zinc-950 border border-white/10 text-white rounded-[2px] px-2 py-1 text-[10px] font-mono placeholder:text-zinc-800"
                                                                value={verifyIds[m.id] || ''}
                                                                onClick={e => e.stopPropagation()}
                                                                onChange={e => setVerifyIds(prev => ({ ...prev, [m.id]: e.target.value }))}
                                                            />
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleVerify(m.id) }}
                                                                disabled={isUpdating}
                                                                className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[9px] font-bold uppercase rounded-[2px] border border-sky-500/30"
                                                            >VERIFY</button>
                                                        </div>
                                                        {verifyError[m.id] && <p className="text-[8px] text-red-400 font-mono mt-1">{verifyError[m.id]}</p>}
                                                    </div>
                                                </>
                                            )}

                                            {isCompleted && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] text-green-500 uppercase tracking-widest font-mono font-bold">Match Concluded</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleReset(m.id) }}
                                                        disabled={isUpdating}
                                                        className="text-[9px] text-red-400 hover:text-red-300 font-mono uppercase tracking-widest transition-colors"
                                                    >↺ Reset</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    })}
                </div>
            </div>

            {/* Unassigned Teams Sidebar */}
            {teams.length > 0 && (
                <div className="border-t border-white/10 bg-black/40 p-4">
                    <h3 className="text-xs font-rajdhani font-bold text-zinc-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        Unassigned Teams <span className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[9px]">{unassignedTeams.length}</span>
                    </h3>

                    {unassignedTeams.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {unassignedTeams.map(team => (
                                <div
                                    key={team.id}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('sourceMatchId', 'unassigned');
                                        e.dataTransfer.setData('sourceTeamId', team.id);
                                        e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm text-xs text-white font-mono cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-[#dc143c]/40 transition-colors flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                                    {team.name}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">All teams have been assigned to matches.</p>
                    )}
                </div>
            )}
        </div>
    )
}
