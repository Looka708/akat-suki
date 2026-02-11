'use client'

import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'

export default function OperationalExcellence() {
    const sectionRef = useRef<HTMLElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [analyticsOpen, setAnalyticsOpen] = useState(false)
    const [talentOpen, setTalentOpen] = useState(false)
    const [brandOpen, setBrandOpen] = useState(false)
    const [dataPoints, setDataPoints] = useState(1247)
    const [uptime, setUptime] = useState(95)
    const [accuracy, setAccuracy] = useState(90)
    const [prospectCount, setProspectCount] = useState(0)

    // Parallel Background Animation (Moving Nodes)
    useEffect(() => {
        const canvas = document.createElement('canvas')
        canvas.className = 'absolute inset-0 pointer-events-none opacity-[0.03]'
        if (sectionRef.current) {
            sectionRef.current.appendChild(canvas)
            const ctx = canvas.getContext('2d')
            let width = (canvas.width = sectionRef.current.offsetWidth)
            let height = (canvas.height = sectionRef.current.offsetHeight)

            const particles: { x: number; y: number; vx: number; vy: number }[] = []
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                })
            }

            const draw = () => {
                if (!ctx) return
                ctx.clearRect(0, 0, width, height)
                ctx.strokeStyle = '#dc143c'
                ctx.lineWidth = 0.5

                particles.forEach((p, i) => {
                    p.x += p.vx
                    p.y += p.vy
                    if (p.x < 0 || p.x > width) p.vx *= -1
                    if (p.y < 0 || p.y > height) p.vy *= -1

                    ctx.beginPath()
                    ctx.arc(p.x, p.y, 1, 0, Math.PI * 2)
                    ctx.fill()

                    for (let j = i + 1; j < particles.length; j++) {
                        const p2 = particles[j]
                        const dist = Math.hypot(p.x - p2.x, p.y - p2.y)
                        if (dist < 150) {
                            ctx.globalAlpha = 1 - dist / 150
                            ctx.beginPath()
                            ctx.moveTo(p.x, p.y)
                            ctx.lineTo(p2.x, p2.y)
                            ctx.stroke()
                        }
                    }
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
                        // Entrance animations for cards
                        anime({
                            targets: '.op-card',
                            translateY: [100, 0],
                            opacity: [0, 1],
                            delay: anime.stagger(200),
                            duration: 1200,
                            easing: 'easeOutElastic(1, .8)',
                        })

                        // Animate counters
                        anime({
                            targets: { uptime: 95, accuracy: 90 },
                            uptime: 99.8,
                            accuracy: 97.3,
                            duration: 3000,
                            easing: 'easeOutExpo',
                            update: function (anim: any) {
                                const uptimeVal = anim.animations[0].currentValue
                                if (uptimeVal) setUptime(parseFloat(Number(uptimeVal).toFixed(1)))
                            },
                        })

                        anime({
                            targets: { accuracy: 90 },
                            accuracy: 97.3,
                            duration: 3000,
                            easing: 'easeOutExpo',
                            update: function (anim: any) {
                                const accuracyVal = anim.animations[0].currentValue
                                if (accuracyVal) setAccuracy(parseFloat(Number(accuracyVal).toFixed(1)))
                            },
                        })

                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1 }
        )

        if (sectionRef.current) observer.observe(sectionRef.current)

        const interval = setInterval(() => {
            setDataPoints((prev) => {
                const variation = Math.floor(Math.random() * 100) - 50
                return Math.max(1000, Math.min(1500, prev + variation))
            })
        }, 2000)

        return () => {
            observer.disconnect()
            clearInterval(interval)
        }
    }, [])

    // Mouse Tilt Effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, targetRef: HTMLDivElement | null) => {
        if (!targetRef) return
        const rect = targetRef.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = (y - centerY) / 20
        const rotateY = (centerX - x) / 20

        anime({
            targets: targetRef,
            rotateX: rotateX,
            rotateY: rotateY,
            duration: 100,
            easing: 'linear',
        })

        // Move the glow effect
        const glow = targetRef.querySelector('.card-glow') as HTMLElement
        if (glow) {
            glow.style.transform = `translate(${x - 200}px, ${y - 200}px)`
            glow.style.opacity = '0.3'
        }
    }

    const handleMouseLeave = (targetRef: HTMLDivElement | null) => {
        if (!targetRef) return
        anime({
            targets: targetRef,
            rotateX: 0,
            rotateY: 0,
            duration: 500,
            easing: 'easeOutQuad',
        })
        const glow = targetRef.querySelector('.card-glow') as HTMLElement
        if (glow) glow.style.opacity = '0'
    }

    return (
        <section
            ref={sectionRef}
            className="py-32 relative bg-black overflow-hidden"
            id="excellence"
        >
            {/* Background Scanner Line Overlay */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-[#dc143c]/20 animate-scanner-line"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="reveal-text">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                            <span className="text-[#dc143c] text-xs font-bold tracking-[0.5em] uppercase">
                                System Protocol 01
                            </span>
                        </div>
                        <h3 className="text-5xl md:text-7xl font-rajdhani font-black tracking-tighter text-white uppercase leading-none">
                            Operational <span className="text-stroke text-transparent">Excellence</span>
                        </h3>
                    </div>
                    <div className="flex flex-col items-end gap-2 group">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono group-hover:text-white transition-colors">
                                Neural Net Link: Stable
                            </span>
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase whitespace-nowrap">
                            LATENCY: 12ms | LOAD: {(dataPoints / 150).toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 perspective-1000">
                    {/* Card 1: Performance Analytics */}
                    <div
                        className="op-card md:col-span-8 relative bg-white/[0.02] border border-white/10 rounded-sm group overflow-hidden transition-all duration-300 transform-style-3d cursor-pointer"
                        onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                        onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                        onClick={() => setAnalyticsOpen(true)}
                    >
                        <div className="card-glow absolute w-[400px] h-[400px] bg-[#dc143c]/20 blur-[100px] rounded-full pointer-events-none opacity-0 transition-opacity duration-300"></div>

                        {/* Interactive UI Overlay */}
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="w-24 h-24 border-r border-t border-white/20 rounded-tr-xl"></div>
                        </div>

                        <div className="p-10 relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start mb-12">
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center rounded-[2px] shadow-2xl group-hover:border-[#dc143c]/50 transition-colors">
                                        <svg className="w-8 h-8 text-[#dc143c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-mono">
                                        Module: Advanced_Analytics_v4
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Uptime Reliability</span>
                                    <div className="text-6xl font-rajdhani font-black text-white leading-none">
                                        {uptime}<span className="text-[#dc143c] text-2xl">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12 items-end">
                                <div>
                                    <h4 className="text-3xl font-rajdhani font-bold mb-4 text-white uppercase tracking-tight">
                                        Performance <br /><span className="text-[#dc143c]">Intelligence</span>
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed font-light mb-8 border-l border-[#dc143c]/30 pl-6 italic">
                                        "Data is the foundation of dominance. Our systems process 10,000+ per-second metrics to optimize athlete trajectory."
                                    </p>

                                    <div className="flex gap-4">
                                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-[2px] text-[10px] text-white font-bold tracking-widest uppercase hover:bg-[#dc143c]/10 hover:border-[#dc143c]/30 transition-all">
                                            Live Stream Data
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-black/40 p-6 rounded-sm border border-white/5">
                                    <div className="flex justify-between items-end">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Neural Accuracy</div>
                                        <div className="text-xl font-rajdhani font-bold text-[#dc143c]">{accuracy}%</div>
                                    </div>
                                    {/* Animated Progress Wave */}
                                    <div className="h-10 flex items-end gap-[2px]">
                                        {[...Array(20)].map((_, i) => (
                                            <AnimatedBar key={i} />
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[8px] text-gray-600 font-mono uppercase tracking-widest">
                                        <span>Sample: {dataPoints.toLocaleString()} FPS</span>
                                        <span>Status: Optimized</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Talent Ecosystem */}
                    <div
                        className="op-card md:col-span-4 relative bg-white/[0.02] border border-white/10 rounded-sm group overflow-hidden transition-all duration-300 transform-style-3d cursor-pointer"
                        onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                        onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                        onClick={() => setTalentOpen(true)}
                    >
                        <div className="card-glow absolute w-[400px] h-[400px] bg-red-800/20 blur-[100px] rounded-full pointer-events-none opacity-0 transition-opacity duration-300"></div>

                        <div className="p-10 relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-10 rounded-[2px] group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-tight mb-4">
                                    Talent <br />Incubation
                                </h4>
                                <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
                                    Identifying raw genetic potential. Transforming gamers into world-class athletes.
                                </p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500 tracking-widest font-mono uppercase">Placement</span>
                                    <span className="text-sm font-rajdhani font-bold text-white tracking-widest uppercase">94.8%</span>
                                </div>
                                <div className="h-[2px] bg-white/5 relative">
                                    <div className="absolute top-0 left-0 h-full bg-[#dc143c] w-[94.8%] shadow-[0_0_10px_#dc143c]"></div>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-gray-600 font-mono tracking-tighter uppercase mt-4">
                                    <span className="w-1.5 h-1.5 bg-[#dc143c] animate-ping rounded-full"></span>
                                    Recruitment Phase: OPEN
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Brand Assets */}
                    <div
                        className="op-card md:col-span-4 relative bg-white/[0.02] border border-white/10 rounded-sm group overflow-hidden transition-all duration-300 transform-style-3d cursor-pointer"
                        onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                        onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                        onClick={() => setBrandOpen(true)}
                    >
                        <div className="p-10 flex flex-col justify-between h-full relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-[2px]">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-1 h-3 bg-[#dc143c]/30"></div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xl font-rajdhani font-bold text-white uppercase tracking-widest mb-2">Protocol: SAFETY</h4>
                                <p className="text-xs text-gray-500 font-light mb-6">Zero incident compliance record with global Tier-1 partners.</p>
                                <div className="flex items-center justify-between text-[10px] text-green-500 font-mono tracking-widest">
                                    <span>STATUS: PROTECTED </span>
                                    <span className="animate-pulse">100% SECURE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Global Influence (Replacement for MD view) */}
                    <div
                        className="op-card md:col-span-8 relative bg-white/[0.02] border border-white/10 rounded-sm group overflow-hidden transition-all duration-300 transform-style-3d bg-[url('https://www.transparenttextures.com/patterns/cyber-dust.png')]"
                        onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                        onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                    >
                        <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-8 h-full">
                            <div className="flex-1">
                                <h4 className="text-4xl font-rajdhani font-black text-white italic tracking-tighter uppercase mb-4">
                                    Global <span className="text-[#dc143c]">Authority</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Regions</div>
                                        <div className="text-2xl font-rajdhani font-bold text-white">EU / JP / NA</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Network</div>
                                        <div className="text-2xl font-rajdhani font-bold text-white">Tier 1</div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-64 h-32 bg-white/5 border border-white/10 rounded-sm relative overflow-hidden group-hover:border-[#dc143c]/30 transition-colors">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-radial from-[#dc143c]/20 to-transparent"></div>
                                    <span className="text-[8px] text-gray-500 font-mono tracking-widest animate-pulse">MAP_PROTOCOL_ACTIVE</span>
                                </div>
                                {/* Simple Scan Animation */}
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#dc143c] animate-bounce-slow"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals / Expanded Screens */}
            {analyticsOpen && <ExpandedModal title="Neural Analytics" onClose={() => setAnalyticsOpen(false)} />}
            {talentOpen && <ExpandedModal title="Talent Pipeline" onClose={() => setTalentOpen(false)} />}
            {brandOpen && <ExpandedModal title="Compliance Logs" onClose={() => setBrandOpen(false)} />}

            <style jsx>{`
                @keyframes bar-grow {
                    from { height: 10%; }
                    to { height: 100%; }
                }
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
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                .animate-scanner-line {
                    animation: scanner-line 8s linear infinite;
                }
                .animate-bounce-slow {
                    animation: bounce 3s infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-40px); }
                }
            `}</style>
        </section>
    )
}

function AnimatedBar() {
    const [barStyle, setBarStyle] = useState({ height: '10%', duration: '1s' });

    useEffect(() => {
        setBarStyle({
            height: `${Math.random() * 100}%`,
            duration: `${1 + Math.random()}s`
        });
    }, []);

    return (
        <div
            className="flex-1 bg-[#dc143c]/20 hover:bg-[#dc143c] transition-all"
            style={{
                height: barStyle.height,
                animation: `bar-grow ${barStyle.duration} infinite alternate ease-in-out`
            }}
        ></div>
    );
}

function ExpandedModal({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div
                className="absolute inset-0 bg-black/98 backdrop-blur-2xl transition-opacity animate-fadeIn"
                onClick={onClose}
            ></div>
            <div className="w-full max-w-4xl bg-[#050505] border border-white/10 p-12 relative z-10 animate-modal-enter shadow-[0_0_100px_rgba(220,20,60,0.15)] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#dc143c]"></div>

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-gray-500 hover:text-[#dc143c] transition-colors uppercase tracking-[0.5em] text-[10px] font-bold"
                >
                    [ Close _ Terminal ]
                </button>

                <div className="flex flex-col md:flex-row gap-12">
                    <div className="flex-1">
                        <span className="text-[#dc143c] text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block underline underline-offset-8">
                            Detailed_Intelligence
                        </span>
                        <h2 className="text-5xl font-rajdhani font-black text-white uppercase tracking-tighter mb-8 italic">
                            {title}
                        </h2>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/10 hover:border-[#dc143c]/30 transition-colors">
                                    <div className="w-1 h-full bg-[#dc143c]"></div>
                                    <div>
                                        <div className="text-white font-rajdhani font-bold uppercase tracking-tight">Protocol_Log_0{i}</div>
                                        <div className="text-xs text-gray-500 font-mono tracking-tighter">SUCCESSFUL_ENCRYPTION_AND_DATA_RELAY</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes modal-enter {
                    from { opacity: 0; transform: scale(0.95) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-enter {
                    animation: modal-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    )
}
