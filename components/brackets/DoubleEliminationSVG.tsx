'use client'

import { useState } from 'react'

export default function DoubleEliminationSVG({ matches }: { matches: any[] }) {
    // Separate matches into Upper Bracket, Lower Bracket, and Grand Finals
    const upperBracketMatches = matches.filter(m => m.phase === 'upper_bracket' || m.phase === 'brackets')
    const lowerBracketMatches = matches.filter(m => m.phase === 'lower_bracket')
    const grandFinalsMatches = matches.filter(m => m.phase === 'grand_finals')

    // Group UB by round
    const ubRounds = upperBracketMatches.reduce((acc: any, m: any) => {
        if (!acc[m.round]) acc[m.round] = []
        acc[m.round].push(m)
        return acc
    }, {})

    // Group LB by round
    const lbRounds = lowerBracketMatches.reduce((acc: any, m: any) => {
        if (!acc[m.round]) acc[m.round] = []
        acc[m.round].push(m)
        return acc
    }, {})

    const renderMatchNode = (m: any) => {
        const isCompleted = m.state === 'completed'

        return (
            <div key={m.id} className={`w-56 p-3 border rounded-sm relative z-10 transition-colors ${isCompleted ? 'border-[#dc143c]/30 bg-[#dc143c]/5' : 'border-white/10 bg-black/60 backdrop-blur-sm'}`}>
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm text-xs">
                        <span className={`font-mono truncate max-w-[120px] ${m.winner_id === m.team1_id ? 'text-[#dc143c] font-bold' : isCompleted ? 'text-zinc-600' : m.team1_id ? 'text-white' : 'text-zinc-600'}`}>
                            {m.team1_id ? m.team1?.name || 'Unknown' : 'TBD'}
                        </span>
                        {(isCompleted || m.team1_score > 0) && (
                            <span className="font-bold font-mono text-white text-[10px] bg-black/50 px-1.5 py-0.5 rounded">{m.team1_score}</span>
                        )}
                    </div>

                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm text-xs">
                        <span className={`font-mono truncate max-w-[120px] ${m.winner_id === m.team2_id ? 'text-[#dc143c] font-bold' : isCompleted ? 'text-zinc-600' : m.team2_id ? 'text-white' : 'text-zinc-600'}`}>
                            {m.team2_id ? m.team2?.name || 'Unknown' : 'TBD'}
                        </span>
                        {(isCompleted || m.team2_score > 0) && (
                            <span className="font-bold font-mono text-white text-[10px] bg-black/50 px-1.5 py-0.5 rounded">{m.team2_score}</span>
                        )}
                    </div>
                </div>

                <div className="absolute -top-2 -right-2 bg-black border border-white/10 text-[8px] text-zinc-500 px-1 rounded-sm font-mono">
                    {m.match_format || 'BO1'}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full min-h-[600px] overflow-auto bg-black/40 border border-white/10 rounded-sm p-8 relative scrollbar-thin scrollbar-thumb-white/10">
            <div className="flex flex-col gap-16 min-w-max">

                {/* UPPER BRACKET */}
                <div className="relative">
                    <h3 className="text-xs font-bold text-[#dc143c] uppercase tracking-widest mb-6 px-2 border-l-2 border-[#dc143c]">
                        Upper Bracket
                    </h3>
                    <div className="flex gap-16">
                        {Object.keys(ubRounds).sort((a, b) => Number(a) - Number(b)).map(round => (
                            <div key={`ub-${round}`} className="flex flex-col justify-around gap-8 relative">
                                {ubRounds[round].map((m: any) => renderMatchNode(m))}
                            </div>
                        ))}

                        {/* Grand Finals usually connects to the end of UB */}
                        {grandFinalsMatches.length > 0 && (
                            <div className="flex flex-col justify-center relative pl-16 border-l border-white/10 border-dashed">
                                <div className="absolute -left-16 top-1/2 -translate-y-1/2 text-[10px] text-[#dc143c] font-bold uppercase rotate-[-90deg] tracking-widest whitespace-nowrap">
                                    Grand Finals
                                </div>
                                {renderMatchNode(grandFinalsMatches[0])}
                            </div>
                        )}
                    </div>
                </div>

                {/* LOWER BRACKET */}
                {Object.keys(lbRounds).length > 0 && (
                    <div className="relative pt-8 border-t border-white/10">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 px-2 border-l-2 border-zinc-500">
                            Lower Bracket
                        </h3>
                        <div className="flex gap-16">
                            {Object.keys(lbRounds).sort((a, b) => Number(a) - Number(b)).map(round => (
                                <div key={`lb-${round}`} className="flex flex-col justify-around gap-6 relative">
                                    {lbRounds[round].map((m: any) => renderMatchNode(m))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
