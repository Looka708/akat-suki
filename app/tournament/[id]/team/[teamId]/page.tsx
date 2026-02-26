'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SafeAvatar from '@/components/SafeAvatar'

interface Team {
    id: string
    name: string
    logo_url: string | null
    captain_id: string
    tournament_id: string | null
    created_at: string
}

interface Player {
    id: string
    user_id: string
    username: string
    avatar: string | null
    steam_id: string | null
    mmr: number
    role_1: string
    role_2: string
    role_3: string
    ping: string
    captain_notes: string
    dota_name: string | null
}

export default function TeamProfilePage() {
    const params = useParams()
    const router = useRouter()
    const teamId = params.teamId as string
    const tournamentId = params.id as string

    const [team, setTeam] = useState<Team | null>(null)
    const [players, setPlayers] = useState<Player[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                // We'll use a new API endpoint or fetch directly if safe
                // For now, let's assume we can fetch team details via /api/tournament/teams?teamId=...
                const res = await fetch(`/api/tournament/teams/${teamId}`)
                if (!res.ok) throw new Error('Team not found')
                const data = await res.json()
                setTeam(data.team)
                setPlayers(data.players || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (teamId) fetchTeamData()
    }, [teamId])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error || !team) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-rajdhani font-bold text-white mb-4 uppercase tracking-tighter">Team Not Found</h1>
                <p className="text-zinc-500 mb-8 max-w-md">The team you are looking for does not exist or has been removed from the tournament.</p>
                <Link
                    href={`/tournament/${tournamentId}/brackets`}
                    className="px-8 py-3 bg-[#dc143c] text-white font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-[#ff1a4d] transition-all"
                >
                    Back to Brackets
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] selection:bg-[#dc143c] selection:text-white">
            <Navbar />

            <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="relative mb-16">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                        {/* Logo */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-[#dc143c]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative w-48 h-48 bg-white/5 border border-white/10 rounded-sm overflow-hidden flex items-center justify-center">
                                {team.logo_url ? (
                                    <img
                                        src={team.logo_url}
                                        alt={team.name}
                                        className="w-full h-full object-contain p-4"
                                    />
                                ) : (
                                    <div className="text-[#dc143c] text-6xl font-rajdhani font-bold">
                                        {team.name[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title Info */}
                        <div className="text-center md:text-left">
                            <p className="text-[#dc143c] font-rajdhani font-bold tracking-[0.3em] uppercase text-sm mb-2">Team Profile</p>
                            <h1 className="text-5xl md:text-7xl font-rajdhani font-bold text-white uppercase tracking-tighter leading-none mb-4 italic">
                                {team.name}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                                    <span className="text-[10px] text-zinc-500 font-mono uppercase">Region</span>
                                    <span className="text-xs text-white font-bold uppercase">SEA / Global</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                                    <span className="text-[10px] text-zinc-500 font-mono uppercase">Status</span>
                                    <span className="text-xs text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Roster Grid */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wider">The Roster</h2>
                        <div className="h-px flex-1 bg-white/10"></div>
                        <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">{players.length} Players</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className="group bg-white/[0.02] border border-white/5 hover:border-[#dc143c]/30 rounded-sm p-6 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#dc143c]/5 to-transparent -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-[#dc143c]/10 transition-colors"></div>

                                <div className="flex items-start gap-4 mb-6 relative">
                                    <div className="w-16 h-16 rounded-sm border border-white/10 overflow-hidden shrink-0">
                                        <SafeAvatar
                                            src={player.avatar || ''}
                                            alt={player.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-rajdhani font-bold text-white uppercase truncate tracking-tight group-hover:text-[#dc143c] transition-colors">
                                            {player.dota_name || player.username}
                                        </h3>
                                        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest truncate">
                                            @{player.username}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 relative">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Main Role</p>
                                            <p className="text-sm text-white font-bold uppercase">{player.role_1 || 'Unassigned'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">MMR</p>
                                            <p className="text-sm text-[#dc143c] font-mono font-bold tracking-tighter">{player.mmr.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5">
                                        <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest mb-2">Favorite Heroes</p>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 bg-white/5 rounded-sm text-[9px] text-zinc-400 font-bold border border-white/5">{player.role_2}</span>
                                            <span className="px-2 py-0.5 bg-white/5 rounded-sm text-[9px] text-zinc-400 font-bold border border-white/5">{player.role_3}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Link
                        href={`/tournament/${tournamentId}/brackets`}
                        className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-rajdhani font-bold uppercase tracking-[0.2em] text-sm">Return to Tournament Brackets</span>
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    )
}
