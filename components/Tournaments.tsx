'use client'

import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { formatCurrency } from '@/lib/currency-utils'

export default function Tournaments() {
    const sectionRef = useRef<HTMLElement>(null)
    const { isAuthenticated, user, login } = useAuth()

    const [tournament, setTournament] = useState<any>(null)
    const [team, setTeam] = useState<any>(null)
    const [registeredTeams, setRegisteredTeams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [tiltStyles, setTiltStyles] = useState<React.CSSProperties>({
        transform: 'perspective(1500px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
    })

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!e.currentTarget) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = ((y - centerY) / centerY) * -2 // Subtle 2 degree max tilt
        const rotateY = ((x - centerX) / centerX) * 2

        setTiltStyles({
            transform: `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'transform 0.1s ease-out'
        })
    }

    const handleMouseLeave = () => {
        setTiltStyles({
            transform: 'perspective(1500px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        })
    }

    // Fetch primary tournament and user's team
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Fetch tournaments (find first active or specific one)
                const tRes = await fetch('/api/tournaments')
                if (!tRes.ok) {
                    console.warn('API /api/tournaments failed with status:', tRes.status)
                    throw new Error('Database connection failed')
                }
                const tData = await tRes.json()
                if (tData.tournaments && tData.tournaments.length > 0) {
                    const activeTournament = tData.tournaments[0];
                    setTournament(activeTournament)

                    // Fetch teams for this tournament
                    try {
                        const teamsRes = await fetch(`/api/tournaments/${activeTournament.id}/teams`)
                        if (teamsRes.ok) {
                            const teamsData = await teamsRes.json()
                            if (teamsData.teams) {
                                setRegisteredTeams(teamsData.teams)
                            }
                        }
                    } catch (e) {
                        console.error('Failed to fetch teams', e)
                    }
                }

                // 2. If logged in, fetch their team
                if (isAuthenticated) {
                    const teamRes = await fetch('/api/tournament/my-team')
                    const teamData = await teamRes.json()
                    if (teamData.team) {
                        setTeam(teamData.team)
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchInitialData()
    }, [isAuthenticated])

    // Animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: '.tournament-hero',
                            translateY: [60, 0],
                            duration: 1200,
                            easing: 'easeOutElastic(1, .8)',
                        })
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1 }
        )

        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    const handleCopyLink = () => {
        if (!team) return
        const inviteLink = `${window.location.origin}/tournament/invite/${team.invite_code}`
        navigator.clipboard.writeText(inviteLink)
        alert('Invite link copied to clipboard!')
    }

    if (loading) {
        return (
            <section className="py-32 bg-black min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
            </section>
        )
    }

    return (
        <section
            id="tournaments"
            ref={sectionRef}
            className="relative py-32 bg-black"
        >
            <div className="max-w-[1400px] mx-auto px-6 relative z-10">

                {/* Tactical Header */}
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                        <span className="text-[#dc143c] text-xs font-bold tracking-[0.5em] uppercase">
                            Featured Event
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-rajdhani font-black tracking-tighter text-white uppercase leading-none">
                        ENTER THE <span className="text-stroke text-transparent">ARENA</span>
                    </h2>
                </div>

                {/* Single Tile Hero */}
                {tournament ? (
                    <div
                        className="tournament-hero relative w-full rounded-sm border border-white/10 overflow-hidden bg-zinc-900 group opacity-100 flex flex-col xl:flex-row min-h-[600px] shadow-2xl"
                        style={tiltStyles}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >

                        {/* Visual Side */}
                        <div className="relative w-full xl:w-1/2 min-h-[400px] xl:min-h-full">
                            <Image
                                src={tournament.game?.toLowerCase() === 'dota 2' ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670' : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670'}
                                alt={tournament.name || "Tournament"}
                                fill
                                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 xl:bg-gradient-to-r xl:to-transparent"></div>

                            <div className="absolute bottom-0 left-0 p-8 xl:p-12">
                                <div className="flex flex-col gap-2 mb-4">
                                    <div className="bg-[#dc143c] text-white text-[10px] font-bold tracking-[0.3em] uppercase px-4 py-1 inline-block w-fit">
                                        {tournament.status?.toUpperCase() || 'LIVE NOW'}
                                    </div>
                                    <div className="text-[#dc143c] text-xs font-bold tracking-[0.2em] uppercase animate-pulse">
                                        ⚠️ LIMITED SLOTS • JOIN FAST
                                    </div>
                                </div>
                                <h3 className="text-5xl xl:text-7xl font-rajdhani font-black text-white leading-none uppercase tracking-tighter mb-4 shadow-black drop-shadow-lg">
                                    {tournament.name}
                                </h3>
                                <div className="flex gap-8 items-center bg-black/60 p-4 backdrop-blur-md rounded-sm border border-white/5 inline-flex">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Prize Pool</p>
                                        <p className="text-2xl font-rajdhani font-bold text-[#ffd700]">
                                            {formatCurrency(tournament.prize_pool || 0, tournament.currency || 'USD')}
                                        </p>
                                    </div>
                                    <div className="w-[1px] h-8 bg-white/20"></div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Format</p>
                                        <p className="text-2xl font-rajdhani font-bold text-white">5v5 OPEN</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interaction Side */}
                        <div className="relative w-full xl:w-1/2 p-8 xl:p-12 bg-black flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-4 opacity-50">
                                <div className="w-8 h-8 border-r border-t border-[#dc143c]"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 p-4 opacity-50">
                                <div className="w-8 h-8 border-l border-b border-[#dc143c]"></div>
                            </div>

                            {(() => {
                                const isSlotsFilled = tournament.max_slots && registeredTeams.length >= tournament.max_slots;

                                if (isSlotsFilled) {
                                    return (
                                        <div className="relative z-10 w-full max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="mb-6">
                                                <h4 className="text-3xl font-rajdhani font-bold text-[#dc143c] uppercase tracking-wide text-center">Registration Closed</h4>
                                                <p className="text-zinc-400 font-mono text-sm text-center">
                                                    All slots are filled. Here are the participating squads.
                                                </p>
                                            </div>
                                            <div className="space-y-6">
                                                {registeredTeams.map((t: any) => (
                                                    <div key={t.id} className="bg-white/5 border border-white/10 p-4 rounded-sm">
                                                        <h5 className="text-xl font-rajdhani font-bold text-white uppercase mb-3 border-b border-white/10 pb-2">
                                                            {t.name}
                                                        </h5>
                                                        <div className="space-y-2">
                                                            {t.tournament_players?.map((p: any) => (
                                                                <a
                                                                    key={p.id}
                                                                    href={p.steam_id ? `https://steamcommunity.com/profiles/${p.steam_id}` : '#'}
                                                                    target={p.steam_id ? "_blank" : "_self"}
                                                                    className={`flex items-center gap-4 bg-black/40 p-2 rounded-sm transition-colors ${p.steam_id ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'}`}
                                                                >
                                                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 border border-white/20">
                                                                        {p.users?.avatar ? (
                                                                            <img src={p.users.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500">?</div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-bold text-white font-rajdhani tracking-wide">{p.users?.username || 'Unknown'}</p>
                                                                    </div>
                                                                    {p.user_id === t.captain_id && (
                                                                        <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest font-mono">CPT</span>
                                                                    )}
                                                                    {p.steam_id && (
                                                                        <span className="text-[9px] text-zinc-500 font-mono">STEAM</span>
                                                                    )}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                }

                                if (!isAuthenticated) {
                                    return (
                                        <div className="text-center max-w-md mx-auto relative z-10 w-full">
                                            <h4 className="text-3xl font-rajdhani font-bold text-white uppercase tracking-wide mb-4 text-center">Welcome to the Arena</h4>
                                            <p className="text-zinc-400 mb-8 font-mono text-sm text-center max-w-sm mx-auto">
                                                Sign in with your Discord account to view your team status, manage your roster, and join the upcoming tournament.
                                            </p>
                                            <button
                                                onClick={() => login()}
                                                className="w-full py-5 bg-[#dc143c] hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(220,20,60,0.4)]"
                                            >
                                                <span>Authenticate via Discord</span>
                                            </button>
                                        </div>
                                    )
                                }

                                if (!team) {
                                    return (
                                        <div className="text-center max-w-md mx-auto relative z-10 w-full">
                                            <h4 className="text-3xl font-rajdhani font-bold text-white uppercase tracking-wide mb-4">No Active Squad</h4>
                                            <p className="text-zinc-400 mb-6 font-mono text-sm border-l-2 border-[#dc143c] pl-4">
                                                You are authenticated but have no active tournament roster. Create a team or get an invite link from a captain.
                                            </p>
                                            <div className="text-[#dc143c] text-[10px] font-bold tracking-[0.2em] uppercase mb-8 animate-pulse text-center">
                                                ⚠️ LIMITED SLOTS • JOIN FAST
                                            </div>
                                            <Link
                                                href="/tournament/register"
                                                className="block w-full py-5 bg-[#dc143c] hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.5em] transition-all rounded-sm shadow-[0_0_30px_rgba(220,20,60,0.2)]"
                                            >
                                                Create New Squad
                                            </Link>
                                        </div>
                                    )
                                }

                                return (
                                    <div className="relative z-10 w-full">
                                        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                                            <div>
                                                <p className="text-[10px] text-[#dc143c] font-bold tracking-[0.3em] uppercase mb-1">Squad Identified</p>
                                                <h4 className="text-3xl font-rajdhani font-bold text-white uppercase tracking-wide">
                                                    {team.name}
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-zinc-500 font-mono">Roster</p>
                                                <p className="text-2xl font-rajdhani font-bold text-white">{team.tournament_players?.length || 0}/5</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            {team.tournament_players?.map((p: any) => (
                                                <div key={p.id} className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-sm">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-black border border-white/20">
                                                        {p.users?.avatar ? (
                                                            <img src={p.users.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">?</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-white font-rajdhani tracking-wide">{p.users?.username || 'Unknown'}</p>
                                                    </div>
                                                    {p.user_id === team.captain_id && (
                                                        <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest font-mono">CPT</span>
                                                    )}
                                                </div>
                                            ))}

                                            {Array.from({ length: Math.max(0, 5 - (team.tournament_players?.length || 0)) }).map((_, i) => (
                                                <div key={`empty-${i}`} className="flex items-center gap-4 bg-black border border-dashed border-white/20 p-3 rounded-sm opacity-50">
                                                    <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                                                        <span className="text-zinc-500 text-xs">+</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-500 font-rajdhani tracking-wide">Awaiting Operative</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-4 flex-col sm:flex-row mt-4">
                                            {team.captain_id === user?.id && !team.tournament_id && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch('/api/tournament/apply', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ teamId: team.id, tournamentId: tournament.id })
                                                            });
                                                            if (res.ok) {
                                                                setTeam({ ...team, tournament_id: tournament.id, payment_status: 'pending' });
                                                                alert('Successfully registered your team to the tournament!');
                                                            } else {
                                                                const d = await res.json();
                                                                alert(d.error || 'Failed to apply');
                                                            }
                                                        } catch (e: any) { alert(e.message); }
                                                    }}
                                                    className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-sm border border-green-500"
                                                >
                                                    REGISTER FOR TOURNAMENT
                                                </button>
                                            )}
                                            {team.tournament_id === tournament.id && (
                                                <div className="flex-1 py-4 bg-green-900/50 text-green-400 text-center text-xs font-bold uppercase tracking-[0.2em] rounded-sm border border-green-800">
                                                    PARTICIPATING (PAYMENT: {team.payment_status?.toUpperCase() || 'PENDING'})
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4 flex-col sm:flex-row mt-4">
                                            {team.captain_id === user?.id && (
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-sm border border-white/10"
                                                >
                                                    COPY INVITE LINK
                                                </button>
                                            )}
                                            <Link
                                                href="/tournament/dashboard"
                                                className="flex-1 py-4 bg-[#dc143c] hover:bg-white hover:text-black text-center text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-sm"
                                            >
                                                SQUAD DASHBOARD
                                            </Link>
                                        </div>
                                        <div className="mt-4">
                                            <Link
                                                href={`/tournament/${tournament.id}/leaderboard`}
                                                className="block w-full py-4 bg-transparent border border-[#dc143c] text-[#dc143c] hover:bg-[#dc143c] hover:text-white text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-sm"
                                            >
                                                VIEW TOURNAMENT LEADERBOARD
                                            </Link>
                                        </div>

                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32 border border-white/10 bg-white/[0.02] rounded-sm">
                        <h3 className="text-3xl font-rajdhani font-bold text-[#dc143c] uppercase tracking-wide mb-2">No Active Tournaments</h3>
                        <p className="text-zinc-500 font-mono text-sm max-w-sm mx-auto">Stay tuned! We are currently organizing our next major event. Check back soon for registration details.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .text-stroke {
                    -webkit-text-stroke: 1px rgba(255,255,255,0.2);
                }
            `}</style>
        </section>
    )
}
