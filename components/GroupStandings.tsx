'use client'

import Image from 'next/image'

interface TeamStats {
    id: string
    name: string
    logo_url: string | null
    group_id: string | null
    wins: number
    draws: number
    losses: number
    matchesPlayed: number
    points: number
}

interface GroupStandingsProps {
    groupName: string
    teams: TeamStats[]
    // Logic dictates how many go to UB, LB, or Eliminated based on rank
    // From reference: 1st (UB R2), 2nd-3rd (UB R1), 4th (LB R1), bottom 3 Eliminated
}

export default function GroupStandings({ groupName, teams }: GroupStandingsProps) {
    const getRowStyle = (rank: number) => {
        if (rank === 1) return 'bg-[#1a4a2e]/40 border-[#2ea043]/30 text-green-400' // 1st Place (UB R2)
        if (rank === 2 || rank === 3) return 'bg-[#3b3a1a]/40 border-[#d29922]/30 text-yellow-400' // 2nd & 3rd Place (UB R1)
        if (rank === 4) return 'bg-[#4a2e1a]/40 border-[#e36c0a]/30 text-orange-400' // 4th Place (LB R1)
        return 'bg-[#4a1a1a]/40 border-[#dc143c]/30 text-[#ff7b72]' // Eliminated
    }

    const getRankLabel = (rank: number) => {
        if (rank === 1) return '1st'
        if (rank === 2) return '2nd'
        if (rank === 3) return '3rd'
        return `${rank}th`
    }

    return (
        <div className="border border-zinc-800 bg-zinc-950/80 rounded-sm overflow-hidden flex flex-col h-full font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="bg-[#1c2128] border-b border-zinc-700 py-2 text-center shadow-inner">
                <h3 className="font-rajdhani font-bold text-white tracking-widest text-lg">Group {groupName}</h3>
            </div>

            {/* Table */}
            <div className="w-full text-xs text-zinc-400">
                <div className="grid grid-cols-[1fr_80px_60px_60px] border-b border-zinc-800 bg-black/40 py-2 px-3 font-semibold text-center select-none uppercase tracking-wider text-[10px]">
                    <div className="text-left">Teams</div>
                    <div>W-D-L</div>
                    <div>Pts</div>
                    <div>Rank</div>
                </div>

                <div className="flex flex-col gap-[2px] p-[2px] bg-black/20">
                    {teams.map((team, index) => {
                        const rank = index + 1
                        const rowStyle = getRowStyle(rank)
                        return (
                            <div key={team.id} className={`grid grid-cols-[1fr_80px_60px_60px] items-center px-3 py-1.5 border transition-colors hover:brightness-125 ${rowStyle}`}>
                                <div className="flex items-center gap-2 overflow-hidden text-left">
                                    <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-900 border border-current/20 flex-shrink-0 flex items-center justify-center">
                                        {team.logo_url ? (
                                            <Image src={team.logo_url} alt={team.name} width={20} height={20} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] opacity-50">{team.name.substring(0, 1)}</span>
                                        )}
                                    </div>
                                    <span className="truncate font-semibold text-white/90 font-rajdhani text-sm tracking-wide shadow-sm">{team.name}</span>
                                </div>
                                <div className="text-center font-bold font-sans tracking-widest text-white/80">
                                    <span className="text-green-400">{team.wins}</span>-
                                    <span className="text-zinc-400">{team.draws}</span>-
                                    <span className="text-red-400">{team.losses}</span>
                                </div>
                                <div className="text-center font-bold text-white/90 text-sm">{team.points}</div>
                                <div className="text-center font-black uppercase tracking-wider">{getRankLabel(rank)}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
