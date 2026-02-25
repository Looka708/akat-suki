'use client'

import Image from 'next/image'

interface Team {
    id: string
    name: string
    logo_url: string | null
}

interface Match {
    id: string
    tournament_id: string
    team1_id: string | null
    team2_id: string | null
    winner_id: string | null
    team1_score: number
    team2_score: number
    round: number
    state: string
    phase: string
    match_format: string
    scheduled_time: string | null
    team1: { name: string; logo_url: string | null } | null
    team2: { name: string; logo_url: string | null } | null
}

interface DoubleElimBracketProps {
    matches: Match[]
    teams: Team[]
}

const MatchBox = ({ match, label }: { match?: Match, label?: string }) => {
    if (!match) return <div className="w-[200px] h-[60px] border border-zinc-900 bg-zinc-950/40 rounded flex items-center justify-center text-[10px] text-zinc-600 font-mono">TBD</div>

    const isPending = match.state === 'pending'
    const team1Won = match.team1_score > match.team2_score
    const team2Won = match.team2_score > match.team1_score

    const getScoreColor = (score1: number, score2: number) => {
        if (isPending) return 'text-zinc-500'
        return score1 > score2 ? 'text-green-400' : 'text-zinc-500'
    }

    return (
        <div className="relative flex flex-col w-[200px] h-[64px] border border-zinc-800 bg-black shadow-[0_4px_12px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden z-10 transition-colors hover:border-[#dc143c]/50">
            {label && <div className="absolute -top-[14px] left-0 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{label}</div>}

            <div className={`flex flex-1 justify-between items-center px-2 py-1 border-b border-zinc-900 ${team1Won ? 'bg-zinc-900/60' : 'bg-transparent'}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-4 h-4 bg-zinc-900 rounded-sm overflow-hidden flex-shrink-0 border border-zinc-800">
                        {match.team1?.logo_url && <Image src={match.team1.logo_url} alt="" width={16} height={16} className="w-full h-full object-cover" />}
                    </div>
                    <span className={`text-[11px] font-rajdhani tracking-wide font-bold truncate ${team1Won ? 'text-white' : 'text-zinc-400'}`}>
                        {match.team1?.name || 'TBD'}
                    </span>
                </div>
                <span className={`text-[11px] font-mono font-bold ${getScoreColor(match.team1_score, match.team2_score)}`}>{match.team1_score}</span>
            </div>

            <div className={`flex flex-1 justify-between items-center px-2 py-1 ${team2Won ? 'bg-zinc-900/60' : 'bg-transparent'}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-4 h-4 bg-zinc-900 rounded-sm overflow-hidden flex-shrink-0 border border-zinc-800">
                        {match.team2?.logo_url && <Image src={match.team2.logo_url} alt="" width={16} height={16} className="w-full h-full object-cover" />}
                    </div>
                    <span className={`text-[11px] font-rajdhani tracking-wide font-bold truncate ${team2Won ? 'text-white' : 'text-zinc-400'}`}>
                        {match.team2?.name || 'TBD'}
                    </span>
                </div>
                <span className={`text-[11px] font-mono font-bold ${getScoreColor(match.team2_score, match.team1_score)}`}>{match.team2_score}</span>
            </div>
        </div>
    )
}

export default function DoubleElimBracket({ matches }: DoubleElimBracketProps) {
    const ub = matches.filter(m => m.phase === 'upper_bracket')
    const lb = matches.filter(m => m.phase === 'lower_bracket')
    const gf = matches.find(m => m.phase === 'grand_finals')

    // Find rounds
    const getRoundMatches = (pool: Match[], round: number) => pool.filter(m => m.round === round)

    return (
        <div className="w-full overflow-x-auto custom-scrollbar pb-12 pt-8">
            <div className="min-w-[1200px] flex flex-col gap-12 font-mono">

                {/* Upper Bracket Section */}
                <div className="relative">
                    <div className="flex items-center gap-2 mb-6 ml-4">
                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        <h2 className="text-xl font-rajdhani font-black text-white uppercase tracking-widest">Upper Bracket</h2>
                    </div>

                    <div className="flex gap-16 px-4">
                        {/* UB Rounds flex columns */}
                        {[1, 2, 3, 4].map(round => {
                            const roundMatches = getRoundMatches(ub, round)
                            if (roundMatches.length === 0) return null
                            return (
                                <div key={`ub-${round}`} className="flex flex-col justify-around gap-12 relative">
                                    <div className="absolute -top-8 left-0 text-[10px] text-zinc-500 font-bold tracking-widest bg-zinc-900/40 px-2 py-1 rounded">UB ROUND {round}</div>
                                    {roundMatches.map((m, i) => (
                                        <MatchBox key={m.id} match={m} />
                                    ))}
                                </div>
                            )
                        })}

                        {/* Grand Finals injection */}
                        {gf && (
                            <div className="flex flex-col justify-center ml-8 relative pt-20">
                                <div className="absolute top-12 left-0 text-[12px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 font-black tracking-[0.3em] px-3 py-1.5 rounded-sm uppercase drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">GRAND FINALS (Bo5)</div>
                                <MatchBox match={gf} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent my-4"></div>

                {/* Lower Bracket Section */}
                <div className="relative">
                    <div className="flex items-center gap-2 mb-6 ml-4">
                        <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                        <h2 className="text-xl font-rajdhani font-black text-white uppercase tracking-widest">Lower Bracket</h2>
                    </div>

                    <div className="flex gap-16 px-4">
                        {/* LB Rounds flex columns */}
                        {[1, 2, 3, 4, 5, 6].map(round => {
                            const roundMatches = getRoundMatches(lb, round)
                            if (roundMatches.length === 0) return null
                            return (
                                <div key={`lb-${round}`} className="flex flex-col justify-around gap-8 relative">
                                    <div className="absolute -top-8 left-0 text-[10px] text-zinc-500 font-bold tracking-widest bg-zinc-900/40 px-2 py-1 rounded">
                                        LB {round === 5 ? 'SEMI' : round === 6 ? 'FINALS' : `ROUND ${round}`}
                                    </div>
                                    {roundMatches.map((m, i) => (
                                        <MatchBox key={m.id} match={m} />
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}
