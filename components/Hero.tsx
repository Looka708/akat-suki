'use client'

import { useEffect, useRef } from 'react'
import anime from 'animejs'

export default function Hero() {
    const heroRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Animate hero elements on mount
        anime.timeline()
            .add({
                targets: '.reveal-elem',
                translateY: [40, 0],
                opacity: [0, 1],
                duration: 1000,
                delay: anime.stagger(200),
                easing: 'easeOutCubic',
            })
    }, [])

    return (
        <section
            ref={heroRef}
            className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden border-b border-white/5 bg-[#050505]"
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#dc143c] rounded-full blur-[150px] opacity-20 pointer-events-none animate-pulse"></div>
            <div
                className="absolute right-10 top-1/3 text-[200px] opacity-[0.03] pointer-events-none font-rajdhani font-bold leading-none select-none"
                style={{ writingMode: 'vertical-rl' }}
            >
                暁
            </div>

            <div className="relative z-10 text-center max-w-5xl px-6">
                <div className="flex items-center justify-center gap-3 mb-6 opacity-0 translate-y-10 reveal-elem">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]"></div>
                    <span className="text-[#dc143c] tracking-[0.3em] text-xs font-semibold uppercase">
                        Project Infinite Tsukuyomi
                    </span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]"></div>
                </div>
                <h1 className="font-rajdhani text-6xl md:text-9xl font-bold tracking-tighter mb-4 text-white relative leading-none opacity-0 translate-y-10 reveal-elem">
                    <span className="glitch-text" data-text="AKATSUKI">
                        AKATSUKI
                    </span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed opacity-0 translate-y-10 reveal-elem">
                    The dawn of a new era in competitive gaming. We don&apos;t just play the game; we
                    rewrite the rules of the simulation.
                </p>
            </div>
        </section>
    )
}
