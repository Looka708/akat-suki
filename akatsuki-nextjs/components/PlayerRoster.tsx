'use client'

import { useEffect, useRef } from 'react'
import anime from 'animejs'

export default function PlayerRoster() {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: '.coming-soon-content',
                            translateY: [40, 0],
                            opacity: [0, 1],
                            duration: 1000,
                            easing: 'easeOutQuad',
                        })
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.2 }
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <section
            id="roster"
            ref={sectionRef}
            className="py-32 border-y border-white/5 bg-white/[0.01] relative overflow-hidden"
        >
            {/* Background Text Effect */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
                <span className="text-[20vw] font-rajdhani font-black uppercase leading-none">
                    AKATSUKI
                </span>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]"></div>
                        <span className="text-[#dc143c] tracking-[0.3em] text-xs font-semibold uppercase">
                            Elite Athletes
                        </span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]"></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-rajdhani font-bold tracking-tight mb-4 text-white">
                        ACTIVE ROSTER
                    </h2>
                </div>

                {/* Coming Soon Message */}
                <div className="coming-soon-content opacity-0 py-20 text-center space-y-8">
                    <div className="inline-block relative">
                        <div className="absolute -inset-4 bg-[#dc143c]/10 blur-xl rounded-full"></div>
                        <h3 className="text-6xl md:text-8xl font-rajdhani font-black text-white tracking-[0.1em] uppercase relative">
                            Coming <span className="text-[#dc143c]">Soon</span>
                        </h3>
                    </div>

                    <div className="max-w-xl mx-auto">
                        <p className="text-gray-400 text-sm md:text-md font-mono tracking-widest leading-relaxed uppercase">
                            We are currently scouting for the most elite talent to represent the AKATSUKI banner.
                            The next generation of champions is being forged in the shadows.
                        </p>
                    </div>

                    <div className="flex justify-center gap-8 pt-6">
                        <div className="w-16 h-[1px] bg-white/10 mt-3"></div>
                        <div className="flex gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-2 h-2 bg-[#dc143c] animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                            ))}
                        </div>
                        <div className="w-16 h-[1px] bg-white/10 mt-3"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}
