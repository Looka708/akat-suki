'use client'

import { useState } from 'react'

export default function CompassDrawSVG({ matches }: { matches: any[] }) {
    // Separate matches into the 4 Compass directions
    const eastMatches = matches.filter(m => m.phase === 'compass_east')
    const westMatches = matches.filter(m => m.phase === 'compass_west')
    const northMatches = matches.filter(m => m.phase === 'compass_north')
    const southMatches = matches.filter(m => m.phase === 'compass_south')

    // Helper to group rounds
    const groupRounds = (arr: any[]) => {
        return arr.reduce((acc: any, m: any) => {
            if (!acc[m.round]) acc[m.round] = []
            acc[m.round].push(m)
            return acc
        }, {})
    }

    const renderMatchNode = (m: any) => {
        const isCompleted = m.state === 'completed'

        return (
            <div key={m.id} className={`w-48 p-2.5 border rounded-sm relative z-10 transition-colors ${isCompleted ? 'border-[#dc143c]/30 bg-[#dc143c]/5' : 'border-white/10 bg-black/60 backdrop-blur-sm'}`}>
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center bg-white/5 px-2 py-1.5 rounded-sm text-xs">
                        <span className={`font-mono truncate max-w-[100px] ${m.winner_id === m.team1_id ? 'text-[#dc143c] font-bold' : isCompleted ? 'text-zinc-600' : m.team1_id ? 'text-white' : 'text-zinc-600'}`}>
                            {m.team1_id ? m.team1?.name || 'Unknown' : 'TBD'}
                        </span>
                        {(isCompleted || m.team1_score > 0) && (
                            <span className="font-bold text-white text-[10px]">{m.team1_score}</span>
                        )}
                    </div>

                    <div className="flex justify-between items-center bg-white/5 px-2 py-1.5 rounded-sm text-xs">
                        <span className={`font-mono truncate max-w-[100px] ${m.winner_id === m.team2_id ? 'text-[#dc143c] font-bold' : isCompleted ? 'text-zinc-600' : m.team2_id ? 'text-white' : 'text-zinc-600'}`}>
                            {m.team2_id ? m.team2?.name || 'Unknown' : 'TBD'}
                        </span>
                        {(isCompleted || m.team2_score > 0) && (
                            <span className="font-bold text-white text-[10px]">{m.team2_score}</span>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const renderBracketBlock = (title: string, color: string, matchArr: any[], isReversed: boolean = false) => {
        if (!matchArr || matchArr.length === 0) return null

        const rounds = groupRounds(matchArr)
        const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b))

        // For West/South logic, draws generally converge right-to-left UI visually if placed on the left side, 
        // but for simplicity, we map them all naturally left-to-right inside their quadrant.
        const displayedRounds = isReversed ? [...roundKeys].reverse() : roundKeys

        return (
            <div className="flex flex-col p-6 border border-white/5 bg-black/20 rounded-sm">
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 px-2 border-l-2`} style={{ borderColor: color, color: color }}>
                    {title} Bracket
                </h3>
                <div className={`flex gap-12 ${isReversed ? 'flex-row-reverse justify-end' : ''}`}>
                    {displayedRounds.map(round => (
                        <div key={`${title}-round-${round}`} className="flex flex-col justify-around gap-6 relative">
                            {rounds[round].map((m: any) => renderMatchNode(m))}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full min-h-[600px] overflow-auto bg-black border border-white/10 rounded-sm p-8 relative scrollbar-thin scrollbar-thumb-white/10">
            {/* Compass Title Legend */}
            <div className="absolute top-4 right-4 bg-zinc-900 border border-white/10 rounded-sm p-4 z-50 text-[10px] font-mono text-zinc-400 space-y-1">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#dc143c]"></div> East: Winners</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> West: Drops from East R1</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> North: Drops from East R2</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> South: Drops from West R1</div>
            </div>

            <div className="flex flex-col gap-12 min-w-max pt-16">
                <div className="flex gap-12">
                    {/* West Quadrant (Top Left) */}
                    <div className="flex-1">
                        {renderBracketBlock('West', '#3b82f6', westMatches, true)}
                    </div>
                    {/* East Quadrant (Top Right) */}
                    <div className="flex-1">
                        {renderBracketBlock('East', '#dc143c', eastMatches)}
                    </div>
                </div>

                <div className="flex gap-12">
                    {/* South Quadrant (Bottom Left) */}
                    <div className="flex-1">
                        {renderBracketBlock('South', '#10b981', southMatches, true)}
                    </div>
                    {/* North Quadrant (Bottom Right) */}
                    <div className="flex-1">
                        {renderBracketBlock('North', '#eab308', northMatches)}
                    </div>
                </div>
            </div>
        </div>
    )
}
