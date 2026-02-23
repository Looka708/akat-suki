export default function TournamentBracketReadOnly({ matches }: { matches: any[] }) {
    if (!matches || matches.length === 0) {
        return (
            <div className="text-center text-gray-500 font-mono py-12">
                [BRACKET DATA NOT YET INITIALIZED]
            </div>
        )
    }

    // Group matches by round
    const roundsMap = matches.reduce((acc: any, m: any) => {
        if (!acc[m.round]) acc[m.round] = []
        acc[m.round].push(m)
        return acc
    }, {})

    return (
        <div className="flex gap-12 overflow-x-auto pb-8 snap-x scrollbar-hide">
            {Object.keys(roundsMap).sort((a, b) => Number(a) - Number(b)).map((round) => (
                <div key={round} className="flex-shrink-0 w-72 space-y-6 snap-start">
                    <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase pb-2 border-b border-white/10">
                        Round {round}
                    </h3>

                    <div className="space-y-4">
                        {roundsMap[round].map((m: any) => {
                            const isCompleted = m.state === 'completed'

                            return (
                                <div key={m.id} className={`p-4 border rounded-sm transition-colors ${isCompleted ? 'border-[#dc143c]/30 bg-[#dc143c]/5' : 'border-white/10 bg-black/40'}`}>

                                    <div className="flex flex-col gap-2 mb-2">
                                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm text-sm">
                                            <span className={`font-mono ${m.winner_id === m.team1_id ? 'text-[#dc143c] font-bold' : isCompleted ? 'text-gray-600' : m.team1_id ? 'text-white' : 'text-gray-600'}`}>
                                                {m.team1_id ? m.team1?.name || 'Unknown' : 'TBD'}
                                            </span>
                                            {isCompleted && (
                                                <span className="font-bold font-mono text-white">{m.team1_score}</span>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm text-sm">
                                            <span className={`font-mono ${m.winner_id === m.team2_id ? 'text-[#dc143c] font-bold' : isCompleted ? 'text-gray-600' : m.team2_id ? 'text-white' : 'text-gray-600'}`}>
                                                {m.team2_id ? m.team2?.name || 'Unknown' : 'TBD'}
                                            </span>
                                            {isCompleted && (
                                                <span className="font-bold font-mono text-white">{m.team2_score}</span>
                                            )}
                                        </div>
                                    </div>

                                    {isCompleted && (
                                        <div className="text-center text-[10px] text-[#dc143c] uppercase tracking-widest font-mono mt-3">
                                            Final
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
