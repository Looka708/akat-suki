'use client'

interface Match {
 id: string
 team1: { name: string; logo_url: string | null } | null
 team2: { name: string; logo_url: string | null } | null
 winner: { name: string } | null
 team1_score: number
 team2_score: number
 state: string
 scheduled_time: string | null
 match_format: string
 group_id: string | null
 round: number
}

interface GroupScheduleProps {
 matches: Match[]
}

export default function GroupSchedule({ matches }: GroupScheduleProps) {
 // Group matches by round or date. Here we use round for simplicity if dates are missing.
 // The reference image grouped by dates/times.
 // Assuming we group by scheduled_time or round

 // Sort matches by round then time
 const sortedMatches = [...matches].sort((a, b) => {
 if (a.round !== b.round) return a.round - b.round;
 if (a.scheduled_time && b.scheduled_time) return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
 return 0;
 })

 const bgColors: Record<string, string> = {
 'A': 'bg-[#1a4a2e]/20 border-green-500/20',
 'B': 'bg-[#3b3a1a]/20 border-yellow-500/20',
 'C': 'bg-[#4a2e1a]/20 border-orange-500/20',
 'D': 'bg-[#1c2128]/40 border-blue-500/20',
 }
 const textColors: Record<string, string> = {
 'A': 'text-green-400',
 'B': 'text-yellow-400',
 'C': 'text-orange-400',
 'D': 'text-blue-400',
 }

 return (
 <div className="flex flex-col gap-3 font-mono">
 {sortedMatches.map(m => {
 const isCompleted = m.state === 'completed'
 const groupColorBg = m.group_id && bgColors[m.group_id] ? bgColors[m.group_id] : 'bg-zinc-900/40 border-zinc-800'
 const groupColorText = m.group_id && textColors[m.group_id] ? textColors[m.group_id] : 'text-zinc-400'

 return (
 <div key={m.id} className={`flex flex-col border rounded-sm overflow-hidden ${groupColorBg}`}>
 <div className="flex items-center justify-between px-3 py-1 bg-black/40 border-b border-black/20 text-[10px] uppercase tracking-wider text-zinc-500">
 <div className="flex items-center gap-2">
 <span className={`font-bold ${groupColorText}`}>Group {m.group_id || '?'}</span>
 {m.match_format && <span>• {m.match_format.toUpperCase()}</span>}
 </div>
 <span>
 {m.scheduled_time ? new Date(m.scheduled_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : `Round ${m.round}`}
 </span>
 </div>

 <div className="grid grid-cols-[1fr_60px_1fr] items-center p-2 gap-2 text-sm bg-black/10">
 <div className={`text-right truncate font-rajdhani tracking-wide font-semibold ${isCompleted && m.team1_score < m.team2_score ? 'text-zinc-600' : 'text-white'}`}>
 {m.team1?.name || 'TBD'}
 </div>

 <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-black/60 border border-zinc-800 rounded font-bold">
 {isCompleted ? (
 <>
 <span className={m.team1_score > m.team2_score ? 'text-green-400' : 'text-zinc-400'}>{m.team1_score}</span>
 <span className="text-zinc-600">-</span>
 <span className={m.team2_score > m.team1_score ? 'text-green-400' : 'text-zinc-400'}>{m.team2_score}</span>
 </>
 ) : (
 <span className="text-[10px] text-zinc-500 tracking-widest uppercase">VS</span>
 )}
 </div>

 <div className={`text-left truncate font-rajdhani tracking-wide font-semibold ${isCompleted && m.team2_score < m.team1_score ? 'text-zinc-600' : 'text-white'}`}>
 {m.team2?.name || 'TBD'}
 </div>
 </div>
 </div>
 )
 })}
 {sortedMatches.length === 0 && (
 <div className="text-center py-8 text-zinc-600 font-mono text-sm border border-zinc-900 border-dashed rounded bg-black/20">
 No group matches scheduled.
 </div>
 )}
 </div>
 )
}
