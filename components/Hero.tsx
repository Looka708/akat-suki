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
 className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden border-b border-white/5 bg-black"
 >
 {/* Video Background */}
 <div className="absolute inset-0 z-0">
 <video
 autoPlay
 muted
 loop
 playsInline
 className="w-full h-full object-cover opacity-40"
 >
 <source src="/video.mp4" type="video/mp4" />
 </video>
 {/* Overlay Gradient */}
 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
 <div className="absolute inset-0 bg-black/20"></div>
 </div>

 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-glow to-cyan-glow rounded-full blur-[200px] opacity-10 pointer-events-none -slow z-1"></div>

 <div
 className="absolute right-10 top-1/3 text-[200px] opacity-[0.03] pointer-events-none font-bold leading-none select-none z-1"
 style={{ writingMode: 'vertical-rl' }}
 >
 暁
 </div>

 <div className="relative z-10 text-center max-w-5xl px-6">
 <div className="flex items-center justify-center gap-3 mb-6 opacity-0 translate-y-10 reveal-elem">
 <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]"></div>
 <span className="text-[#dc143c] tracking-[0.3em] text-xs font-semibold uppercase ">
 Project Infinite Tsukuyomi
 </span>
 <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]"></div>
 </div>
 <h1 className=" text-6xl md:text-9xl font-black tracking-tighter mb-4 text-white relative leading-none opacity-0 translate-y-10 reveal-elem">
 <span className="glitch-text " data-text="AKATSUKI">
 AKATSUKI
 </span>
 </h1>
 <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed opacity-0 translate-y-10 reveal-elem font-rajdhani tracking-wide">
 The dawn of a new era in competitive gaming. We cultivate elite talent, dominate global tournaments, and redefine the standards of professional esports.
 </p>

 <div className="flex flex-col sm:flex-row items-center justify-center gap-6 opacity-0 translate-y-10 reveal-elem">
 <a
 href="/tournaments"
 className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-sm transition-all hover:scale-105"
 >
 <div className="absolute inset-0 bg-[#dc143c] opacity-10 group-hover:opacity-20 transition-opacity"></div>
 <div className="absolute inset-0 border border-[#dc143c]/50 hover:border-[#dc143c] hover: "></div>
 <span className="relative z-10 font-bold text-[#dc143c] tracking-widest text-sm uppercase">
 Explore Tournaments
 </span>

 {/* Decorative Corners */}
 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#dc143c]"></div>
 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#dc143c]"></div>
 </a>

 <a
 href="/join-us"
 className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-sm transition-all hover:scale-105"
 >
 <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors"></div>
 <div className="absolute inset-0 border border-white/20"></div>
 <span className="relative z-10 font-bold text-white tracking-widest text-sm uppercase group-hover: transition-all">
 Join The Roster
 </span>
 </a>
 </div>
 </div>
 </section>
 )
}
