'use client'

interface MatchEvent {
    id: string
    type: 'completed' | 'scheduled' | 'live'
    round: number
    team1Name: string
    team2Name: string
    winnerName?: string
    team1Score?: number
    team2Score?: number
    scheduledTime?: string | null
    timestamp: string
}

interface ActivityFeedProps {
    matches: {
        id: string
        round: number
        state: string
        team1_score: number
        team2_score: number
        scheduled_time: string | null
        created_at: string
        team1: { name: string } | null
        team2: { name: string } | null
        winner: { name: string } | null
    }[]
}

export default function ActivityFeed({ matches }: ActivityFeedProps) {
    const events: MatchEvent[] = matches
        .filter(m => m.state === 'completed' || m.state === 'live' || m.scheduled_time)
        .map(m => ({
            id: m.id,
            type: (m.state === 'completed' ? 'completed' : m.state === 'live' ? 'live' : 'scheduled') as MatchEvent['type'],
            round: m.round,
            team1Name: m.team1?.name || 'TBD',
            team2Name: m.team2?.name || 'TBD',
            winnerName: m.winner?.name || undefined,
            team1Score: m.team1_score,
            team2Score: m.team2_score,
            scheduledTime: m.scheduled_time,
            timestamp: m.created_at
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

    if (events.length === 0) return null

    const icon = (type: string) => {
        switch (type) {
            case 'completed': return '⚔️'
            case 'live': return '🔴'
            case 'scheduled': return '📅'
            default: return '•'
        }
    }

    const accentColor = (type: string) => {
        switch (type) {
            case 'completed': return 'border-[#dc143c]/40'
            case 'live': return 'border-yellow-500/40'
            case 'scheduled': return 'border-sky-500/40'
            default: return 'border-zinc-800'
        }
    }

    const dotColor = (type: string) => {
        switch (type) {
            case 'completed': return 'bg-[#dc143c]'
            case 'live': return 'bg-yellow-500 animate-pulse'
            case 'scheduled': return 'bg-sky-500'
            default: return 'bg-zinc-700'
        }
    }

    return (
        <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                <h2 className="text-xs text-[#dc143c] font-bold tracking-[0.5em] uppercase">Activity Feed</h2>
            </div>

            <div className="relative border-l border-white/10 ml-4 space-y-0">
                {events.map((event, idx) => (
                    <div key={event.id} className="relative pl-8 pb-6 group">
                        {/* Timeline dot */}
                        <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-[5.5px] ${dotColor(event.type)} ring-2 ring-black`}></div>

                        {/* Event card */}
                        <div className={`border-l-2 ${accentColor(event.type)} bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-r-sm px-4 py-3`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm">{icon(event.type)}</span>
                                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${event.type === 'completed' ? 'text-green-400' : event.type === 'live' ? 'text-yellow-400' : 'text-sky-400'}`}>
                                    {event.type === 'completed' ? 'Match Completed' : event.type === 'live' ? 'Live Now' : 'Scheduled'}
                                </span>
                                <span className="text-[9px] text-zinc-600 font-mono ml-auto">
                                    Round {event.round}
                                </span>
                            </div>

                            <p className="text-sm font-rajdhani font-bold text-white">
                                {event.team1Name} <span className="text-zinc-500">vs</span> {event.team2Name}
                            </p>

                            {event.type === 'completed' && event.winnerName && (
                                <p className="text-[10px] font-mono text-zinc-400 mt-1">
                                    <span className="text-green-400 font-bold">{event.winnerName}</span> wins ({event.team1Score}-{event.team2Score})
                                </p>
                            )}

                            {event.type === 'scheduled' && event.scheduledTime && (
                                <p className="text-[10px] font-mono text-zinc-400 mt-1">
                                    Starts at {new Date(event.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </p>
                            )}

                            {event.type === 'live' && (
                                <p className="text-[10px] font-mono text-yellow-500 mt-1 animate-pulse">
                                    Match is currently in progress
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
