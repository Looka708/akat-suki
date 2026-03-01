'use client'

import { useMemo } from 'react'

export default function RoundRobinView({ matches }: { matches: any[] }) {
    // 1. Calculate Standings
    const standings = useMemo(() => {
        const table: Record<string, { team: any, played: number, wins: number, losses: number, points: number, diff: number }> = {}

        matches.forEach(m => {
            // Ensure teams exist in table
            if (m.team1_id && !table[m.team1_id]) {
                table[m.team1_id] = { team: m.team1, played: 0, wins: 0, losses: 0, points: 0, diff: 0 }
            }
            if (m.team2_id && !table[m.team2_id]) {
                table[m.team2_id] = { team: m.team2, played: 0, wins: 0, losses: 0, points: 0, diff: 0 }
            }

            if (m.state === 'completed') {
                if (m.team1_id) {
                    table[m.team1_id].played++
                    table[m.team1_id].diff += (m.team1_score || 0) - (m.team2_score || 0)
                }
                if (m.team2_id) {
                    table[m.team2_id].played++
                    table[m.team2_id].diff += (m.team2_score || 0) - (m.team1_score || 0)
                }

                if (m.winner_id === m.team1_id) {
                    table[m.team1_id].wins++
                    table[m.team1_id].points += 3 // Standard 3 pts for win
                    if (m.team2_id) table[m.team2_id].losses++
                } else if (m.winner_id === m.team2_id) {
                    table[m.team2_id].wins++
                    table[m.team2_id].points += 3
                    if (m.team1_id) table[m.team1_id].losses++
                } else if (m.team1_score === m.team2_score) {
                    // Tie scenario (if applicable in BO1)
                    if (m.team1_id) table[m.team1_id].points += 1
                    if (m.team2_id) table[m.team2_id].points += 1
                }
            }
        })

        return Object.values(table).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points
            if (b.diff !== a.diff) return b.diff - a.diff
            return b.wins - a.wins
        })
    }, [matches])


    // Group matches by round for the schedule list
    const roundsMap = matches.reduce((acc: any, m: any) => {
        if (!acc[m.round]) acc[m.round] = []
        acc[m.round].push(m)
        return acc
    }, {})

    return (
        <div className="w-full flex gap-8">

            {/* Standings Table */}
            <div className="flex-1 border border-white/10 rounded-sm bg-black/40 overflow-hidden self-start">
                <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Global Standings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-zinc-500 uppercase font-mono bg-black/60 border-b border-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Pos</th>
                                <th className="px-4 py-3 font-medium">Team</th>
                                <th className="px-4 py-3 font-medium text-center">P</th>
                                <th className="px-4 py-3 font-medium text-center">W</th>
                                <th className="px-4 py-3 font-medium text-center">L</th>
                                <th className="px-4 py-3 font-medium text-center">+/-</th>
                                <th className="px-4 py-3 font-medium text-center text-white">Pts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {standings.map((row, idx) => (
                                <tr key={row.team?.id || idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 font-mono text-zinc-500">{idx + 1}</td>
                                    <td className="px-4 py-3 font-bold text-white">{row.team?.name || 'Unknown'}</td>
                                    <td className="px-4 py-3 text-center font-mono">{row.played}</td>
                                    <td className="px-4 py-3 text-center font-mono text-emerald-500">{row.wins}</td>
                                    <td className="px-4 py-3 text-center font-mono text-[#dc143c]">{row.losses}</td>
                                    <td className="px-4 py-3 text-center font-mono">{row.diff > 0 ? `+${row.diff}` : row.diff}</td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-[#dc143c] bg-[#dc143c]/5">{row.points}</td>
                                </tr>
                            ))}
                            {standings.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-600 font-mono text-xs">No teams tracked yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Match Schedule List */}
            <div className="w-[350px] flex-shrink-0 border border-white/10 rounded-sm bg-black/40 overflow-hidden h-[600px] flex flex-col">
                <div className="px-4 py-3 border-b border-white/10 bg-white/5 shrink-0">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Match Schedule</h3>
                </div>
                <div className="overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
                    {Object.keys(roundsMap).sort((a, b) => Number(a) - Number(b)).map((round) => (
                        <div key={`rr-round-${round}`}>
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pb-1 border-b border-white/10">
                                Round {round}
                            </h4>
                            <div className="space-y-2">
                                {roundsMap[round].map((m: any) => {
                                    const isCompleted = m.state === 'completed'
                                    return (
                                        <div key={m.id} className={`p-2 border rounded-sm text-xs transition-colors flex flex-col gap-1 ${isCompleted ? 'border-[#dc143c]/30 bg-[#dc143c]/5' : 'border-white/10 bg-black/60'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className={`font-mono truncate w-[100px] ${m.winner_id === m.team1_id ? 'text-[#dc143c] font-bold' : isCompleted ? 'text-zinc-500' : 'text-zinc-300'}`}>
                                                    {m.team1?.name || 'TBD'}
                                                </span>
                                                {isCompleted ? (
                                                    <span className="font-mono text-[10px] bg-black/50 px-1 rounded text-white">{m.team1_score}</span>
                                                ) : <span className="text-[10px] text-zinc-600">vs</span>}
                                                <span className={`font-mono truncate w-[100px] text-right ${m.winner_id === m.team2_id ? 'text-[#dc143c] font-bold' : isCompleted ? 'text-zinc-500' : 'text-zinc-300'}`}>
                                                    {m.team2?.name || 'TBD'}
                                                </span>
                                                {isCompleted && (
                                                    <span className="font-mono text-[10px] bg-black/50 px-1 rounded text-white">{m.team2_score}</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
