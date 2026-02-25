'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GroupStandings from '@/components/GroupStandings'
import GroupSchedule from '@/components/GroupSchedule'
import Link from 'next/link'

export default function TournamentGroupsPage() {
    const params = useParams()
    const tournamentId = params.id as string

    const [groupsData, setGroupsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await fetch(`/api/tournaments/${tournamentId}/groups`)
                if (!res.ok) throw new Error('Failed to load group stage data')
                const data = await res.json()
                setGroupsData(data)
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        if (tournamentId) fetchGroups()
    }, [tournamentId])

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="pt-32 pb-20 flex items-center justify-center min-h-[80vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-mono">Loading Group Stages</p>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    if (error || !groupsData) {
        return (
            <main className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="pt-32 pb-20 flex flex-col items-center text-center px-4 min-h-[80vh]">
                    <div className="w-16 h-16 bg-[#dc143c]/10 text-[#dc143c] rounded-full flex items-center justify-center text-2xl mb-6 shadow-[0_0_30px_rgba(220,20,60,0.2)]">
                        ⚠
                    </div>
                    <h1 className="text-4xl font-rajdhani font-bold mb-4 uppercase tracking-widest">Error Loading Groups</h1>
                    <p className="text-zinc-400 mb-8 max-w-md font-mono">{error || 'Tournament groups not found.'}</p>
                    <Link href={`/tournament/${tournamentId}`} className="px-6 py-2 bg-white text-black font-rajdhani font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                        Return to Hub
                    </Link>
                </div>
                <Footer />
            </main>
        )
    }

    const { groups, matches, groupNames } = groupsData

    return (
        <main className="min-h-screen bg-black text-white relative">
            <Navbar />

            {/* Header */}
            <div className="pt-32 pb-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
                    <Link href={`/tournament/${tournamentId}`} className="text-zinc-500 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest mb-4 inline-flex items-center gap-2">
                        <span>← Back to Hub</span>
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-rajdhani font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-zinc-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        Group <span className="text-[#dc143c]">Stages</span>
                    </h1>
                    <p className="text-zinc-400 font-mono tracking-widest text-sm max-w-2xl">
                        Round Robin Phase
                    </p>
                </div>
            </div>

            {/* Content Array */}
            <div className="px-6 mx-auto max-w-7xl pb-24">
                {groupNames.length === 0 ? (
                    <div className="text-center py-20 border border-zinc-800 rounded-sm bg-zinc-900/20">
                        <p className="text-zinc-500 font-mono uppercase tracking-widest">Group stages have not been generated yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Standings Section */}
                        <div className="w-full lg:w-2/3">
                            <h2 className="text-xl font-rajdhani font-bold uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 bg-[#dc143c]"></span> Standings
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {groupNames.map((name: string) => (
                                    <GroupStandings key={name} groupName={name} teams={groups[name]} />
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="mt-8 flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-widest px-4 py-3 bg-zinc-900/40 border border-zinc-800 rounded-sm">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500"></div> <span>1st: Advance to UB R2</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-500"></div> <span>2nd-3rd: Advance to UB R1</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-orange-500"></div> <span>4th: Advance to LB R1</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500"></div> <span>Eliminated</span></div>
                            </div>
                        </div>

                        {/* Schedule Section */}
                        <div className="w-full lg:w-1/3">
                            <h2 className="text-xl font-rajdhani font-bold uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 bg-blue-500"></span> Match Schedule
                            </h2>
                            <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                <GroupSchedule matches={matches} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    )
}
