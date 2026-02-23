'use client'

import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import Image from 'next/image'

import { useAuth } from '@/components/AuthProvider'
import TournamentBracketReadOnly from '@/components/TournamentBracketReadOnly'

export default function Tournaments() {
    const sectionRef = useRef<HTMLElement>(null)
    const [activeTab, setActiveTab] = useState('all')
    const [selectedTournament, setSelectedTournament] = useState<any>(null)
    const [dbTournaments, setDbTournaments] = useState<any[]>([])
    const [applying, setApplying] = useState(false)
    const [applyError, setApplyError] = useState<string | null>(null)
    const [applySuccess, setApplySuccess] = useState(false)
    const [showBracket, setShowBracket] = useState(false)
    const [bracketMatches, setBracketMatches] = useState<any[]>([])
    const [loadingBracket, setLoadingBracket] = useState(false)
    const { isAuthenticated, login } = useAuth()

    const fetchBracket = async (tId: string) => {
        if (tId.startsWith('dummy')) return
        setLoadingBracket(true)
        setShowBracket(true)
        try {
            const res = await fetch(`/api/tournament/${tId}/matches`)
            const data = await res.json()
            if (data.matches) setBracketMatches(data.matches)
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingBracket(false)
        }
    }

    useEffect(() => {
        fetch('/api/tournaments')
            .then(res => res.json())
            .then(data => {
                if (data.tournaments) setDbTournaments(data.tournaments)
            })
            .catch(console.error)
    }, [])

    useEffect(() => {
        const canvas = document.createElement('canvas')
        canvas.className = 'absolute inset-0 pointer-events-none opacity-[0.05]'
        if (sectionRef.current) {
            sectionRef.current.appendChild(canvas)
            const ctx = canvas.getContext('2d')
            let width = (canvas.width = sectionRef.current.offsetWidth)
            let height = (canvas.height = sectionRef.current.offsetHeight)

            const particles: { x: number; y: number; s: number; v: number }[] = []
            for (let i = 0; i < 40; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    s: Math.random() * 2 + 1,
                    v: Math.random() * 0.5 + 0.2
                })
            }

            const draw = () => {
                if (!ctx) return
                ctx.clearRect(0, 0, width, height)
                ctx.fillStyle = '#dc143c'

                particles.forEach(p => {
                    p.y -= p.v
                    if (p.y < -10) p.y = height + 10
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
                    ctx.fill()

                    // Ghosting effect
                    ctx.globalAlpha = 0.2
                    ctx.fillRect(p.x - 0.5, p.y, 1, 30)
                    ctx.globalAlpha = 0.05
                })
                requestAnimationFrame(draw)
            }
            draw()
        }
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: '.tournament-card',
                            translateY: [60, 0],
                            opacity: [0, 1],
                            duration: 1200,
                            delay: anime.stagger(200),
                            easing: 'easeOutElastic(1, .8)',
                        })

                        // Animate prize counters
                        anime({
                            targets: '.prize-counter',
                            innerHTML: [0, 2450000],
                            round: 1,
                            duration: 3000,
                            easing: 'easeOutExpo',
                            formatter: (v: number) => `$${v.toLocaleString()}`
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

    // Mouse Tilt Effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, targetRef: HTMLDivElement | null) => {
        if (!targetRef) return
        const rect = targetRef.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = (y - centerY) / 25
        const rotateY = (centerX - x) / 25

        anime({
            targets: targetRef,
            rotateX: rotateX,
            rotateY: rotateY,
            scale: 1.02,
            duration: 100,
            easing: 'linear',
        })

        const glow = targetRef.querySelector('.card-glow') as HTMLElement
        if (glow) {
            glow.style.transform = `translate(${x - 200}px, ${y - 200}px)`
            glow.style.opacity = '0.4'
        }
    }

    const handleMouseLeave = (targetRef: HTMLDivElement | null) => {
        if (!targetRef) return
        anime({
            targets: targetRef,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 600,
            easing: 'easeOutQuad',
        })
        const glow = targetRef.querySelector('.card-glow') as HTMLElement
        if (glow) glow.style.opacity = '0'
    }

    const dummyTournaments = [
        {
            id: 'dummy-1',
            name: 'AKATSUKI CUP 2024',
            game: 'Valorant',
            prize: '$500,000',
            status: 'LIVE NOW',
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670',
            featured: true,
            format: 'Global Finals',
            regions: 'GLOBAL'
        },
        {
            id: 'dummy-2',
            name: 'SHADOW LEAGUE S4',
            game: 'Valorant',
            prize: '$50,000',
            status: 'REGISTRATION OPEN',
            image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800',
            startsIn: '04d : 12h',
            entry: '$50 / Team'
        },
        {
            id: 'dummy-3',
            name: 'MIDNIGHT RUMBLE',
            game: 'Tekken 8',
            prize: '$1,000',
            status: 'COMMUNITY EVENT',
            image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=800',
            format: '1v1 Duel'
        },
        {
            id: 'dummy-4',
            name: 'EMERALD INVITATIONAL',
            game: 'League of Legends',
            prize: '$25,000',
            status: 'UPCOMING',
            image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=800',
            format: '5v5 Summoners Rift'
        }
    ]

    const tournaments: any[] = [
        ...dbTournaments.map(t => ({
            id: t.id,
            name: t.name,
            game: t.game,
            prize: `$${t.prize_pool}`,
            status: t.status === 'upcoming' ? 'REGISTRATION OPEN' : t.status.toUpperCase(),
            image: t.game.toLowerCase().includes('valorant') ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670' : 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800',
            format: 'Standard',
            entry: t.entry_fee > 0 ? `$${t.entry_fee} / Team` : 'FREE',
            featured: false,
            regions: '',
            startsIn: ''
        })),
        ...dummyTournaments
    ]

    const filteredTournaments = activeTab === 'all'
        ? tournaments
        : tournaments.filter(t => t.game.toLowerCase().includes(activeTab.toLowerCase()))

    return (
        <section
            id="tournaments"
            ref={sectionRef}
            className="relative py-32 overflow-hidden bg-black"
        >
            {/* Background Scanner Overlay */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-[#dc143c]/20 animate-scanner-line pointer-events-none"></div>

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                {/* Tactical Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
                    <div className="reveal-text">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                            <span className="text-[#dc143c] text-xs font-bold tracking-[0.5em] uppercase">
                                Archive_System_v2
                            </span>
                        </div>
                        <h2 className="text-5xl md:text-8xl font-rajdhani font-black tracking-tighter text-white uppercase leading-none">
                            TOURN<span className="text-stroke text-transparent">AMENTS</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-8 p-8 bg-white/5 border border-white/10 rounded-sm hover:border-[#dc143c]/30 transition-colors group">
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">Total Combined Prize</p>
                            <div className="text-4xl font-rajdhani font-black text-[#dc143c] prize-counter">$0</div>
                        </div>
                        <div className="w-[1px] h-12 bg-white/10 group-hover:bg-[#dc143c]/30 transition-colors"></div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">Active Events</p>
                            <div className="text-4xl font-rajdhani font-black text-white">0{tournaments.length}</div>
                        </div>
                    </div>
                </div>

                {/* Cyber Filter Tabs */}
                <div className="flex items-center gap-4 mb-20 overflow-x-auto scrollbar-hide pb-4">
                    {['all', 'valorant', 'lol', 'cs2', 'tekken'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative group/tab ${activeTab === tab
                                ? 'text-white'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            <span className="relative z-10">{tab === 'all' ? 'Archive' : tab}</span>
                            {activeTab === tab && (
                                <div className="absolute inset-0 bg-[#dc143c] -skew-x-12 animate-pulse"></div>
                            )}
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5 group-hover/tab:bg-[#dc143c]/50 transition-colors"></div>
                        </button>
                    ))}
                </div>

                {/* Tournament Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 perspective-1000">
                    {filteredTournaments.map((tournament, idx) => (
                        <div
                            key={tournament.id}
                            className={`tournament-card relative group overflow-hidden border border-white/10 rounded-sm transform-style-3d cursor-pointer ${tournament.featured ? 'md:col-span-8 h-[600px]' : 'md:col-span-4 h-[600px]'
                                }`}
                            onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                            onClick={() => setSelectedTournament(tournament)}
                        >
                            <div className="card-glow absolute w-[400px] h-[400px] bg-[#dc143c]/10 blur-[100px] rounded-full pointer-events-none opacity-0"></div>

                            {/* HUD Corners */}
                            <div className="absolute top-0 left-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 border-l border-t border-[#dc143c]"></div>
                            </div>
                            <div className="absolute bottom-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 border-r border-b border-[#dc143c]"></div>
                            </div>

                            {/* Background Image */}
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={tournament.image}
                                    alt={tournament.name}
                                    fill
                                    className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className={`px-4 py-1 text-[10px] font-bold tracking-[0.2em] uppercase border ${tournament.status === 'LIVE NOW'
                                        ? 'bg-[#dc143c] border-[#dc143c] text-white animate-pulse'
                                        : 'bg-white/5 border-white/20 text-gray-300'
                                        }`}>
                                        {tournament.status}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono tracking-widest bg-black/50 px-3 py-1 backdrop-blur-sm">
                                        ID: {tournament.id.substring(0, 4)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[#dc143c] text-[10px] font-bold tracking-[0.4em] uppercase mb-4">
                                        {tournament.game} / {tournament.format || tournament.regions}
                                    </div>
                                    <h3 className={`font-rajdhani font-black text-white leading-none uppercase tracking-tighter mb-6 ${tournament.featured ? 'text-4xl md:text-7xl' : 'text-3xl'
                                        }`}>
                                        {tournament.name}
                                    </h3>

                                    <div className="flex items-center gap-8">
                                        <div>
                                            <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Prize Fund</p>
                                            <p className="text-2xl font-rajdhani font-bold text-[#ffd700] tracking-tight">{tournament.prize}</p>
                                        </div>
                                        {tournament.startsIn && (
                                            <div>
                                                <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Time Remaining</p>
                                                <p className="text-2xl font-rajdhani font-bold text-white font-mono">{tournament.startsIn}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/10 overflow-hidden">
                                        <div className="flex items-center justify-between group/btn">
                                            <span className="text-[10px] font-bold text-white tracking-[0.3em] uppercase group-hover/btn:text-[#dc143c] transition-colors">
                                                Initialize Access
                                            </span>
                                            <svg className="w-5 h-5 text-white group-hover/btn:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal - Tournament Interface */}
            {selectedTournament && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl animate-fadeIn" onClick={() => setSelectedTournament(null)}></div>
                    <div className="w-full max-w-5xl bg-[#050505] border border-white/10 relative z-10 animate-modal-enter overflow-hidden flex flex-col md:flex-row h-[600px]">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#dc143c] animate-pulse"></div>

                        {/* Modal Hero */}
                        <div className={`relative bg-gray-900 border-r border-white/10 ${showBracket ? 'hidden md:block md:w-1/3' : 'w-full md:w-1/2'}`}>
                            <Image src={selectedTournament.image} alt={selectedTournament.name} fill className="object-cover opacity-70" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-12">
                                <span className="text-[#dc143c] text-xs font-bold tracking-[0.5em] uppercase mb-4 block">Event_Brief</span>
                                <h2 className="text-3xl md:text-5xl font-rajdhani font-black text-white uppercase tracking-tighter italic leading-none">
                                    {selectedTournament.name}
                                </h2>
                            </div>
                        </div>

                        {/* Modal Meta */}
                        <div className={`p-12 flex flex-col justify-between ${showBracket ? 'w-full md:w-2/3 overflow-y-auto' : 'flex-1'}`}>
                            <button
                                onClick={() => {
                                    setSelectedTournament(null)
                                    setShowBracket(false)
                                }}
                                className="absolute top-8 right-8 text-gray-500 hover:text-white font-mono text-xs"
                            >
                                [ X_EXIT ]
                            </button>

                            <div className="space-y-12">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Format</p>
                                        <p className="text-white font-rajdhani font-bold text-xl">{selectedTournament.format || 'Standard'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Platform</p>
                                        <p className="text-white font-rajdhani font-bold text-xl">{selectedTournament.game} PC</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Deployment Protocols</p>
                                    {['Anti-Cheat Enabled', 'Global Connectivity', 'Direct Feed Access', 'Official Sanctioned'].map(p => (
                                        <div key={p} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 hover:border-[#dc143c]/30 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            <span className="text-[10px] text-white font-bold tracking-widest uppercase">{p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4">
                                {applyError && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 text-xs font-mono">
                                        [ERROR]: {applyError}
                                    </div>
                                )}
                                {applySuccess && (
                                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500 text-green-500 text-xs font-mono">
                                        [SUCCESS]: Your team has been registered successfully.
                                    </div>
                                )}

                                {showBracket ? (
                                    <div className="flex-1 min-h-0 relative">
                                        <button
                                            onClick={() => setShowBracket(false)}
                                            className="mb-8 text-xs font-mono text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Return to Access Protocol
                                        </button>

                                        {loadingBracket ? (
                                            <div className="text-center text-gray-400 font-mono py-12 animate-pulse">[LOADING DATA_CORE...]</div>
                                        ) : (
                                            <TournamentBracketReadOnly matches={bracketMatches} />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <button
                                            disabled={applying || applySuccess}
                                            onClick={async () => {
                                                if (!isAuthenticated) {
                                                    if (login) login();
                                                    return;
                                                }
                                                if (selectedTournament.id.startsWith('dummy')) {
                                                    setApplyError('Cannot join a simulation (dummy) event.');
                                                    return;
                                                }
                                                setApplying(true);
                                                setApplyError(null);
                                                setApplySuccess(false);
                                                try {
                                                    const res = await fetch('/api/tournament/apply', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ tournamentId: selectedTournament.id }),
                                                    });
                                                    const data = await res.json();
                                                    if (!res.ok) throw new Error(data.error || 'Failed to apply');
                                                    setApplySuccess(true);
                                                } catch (err: any) {
                                                    setApplyError(err.message);
                                                } finally {
                                                    setApplying(false);
                                                }
                                            }}
                                            className="flex-1 py-5 bg-[#dc143c] text-white text-xs font-bold uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(220,20,60,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {applying ? 'INITIALIZING...' : applySuccess ? 'ACCESS GRANTED' : isAuthenticated ? 'Enter Arena' : 'Authenticate to Enter'}
                                        </button>

                                        <button
                                            onClick={() => fetchBracket(selectedTournament.id)}
                                            className="px-8 py-5 border border-white/20 text-white text-xs font-bold uppercase tracking-[0.5em] hover:bg-white/10 transition-all"
                                        >
                                            View Bracket
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .text-stroke {
                    -webkit-text-stroke: 1px rgba(255,255,255,0.2);
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                @keyframes scanner-line {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(100vh); }
                }
                .animate-scanner-line {
                    animation: scanner-line 10s linear infinite;
                }
                @keyframes bar-grow {
                    from { height: 20%; }
                    to { height: 100%; }
                }
                @keyframes modal-enter {
                    from { opacity: 0; transform: scale(0.9) translateY(40px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-enter {
                    animation: modal-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </section>
    )
}
