'use client'

import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'

export default function Mission() {
 const sectionRef = useRef<HTMLElement>(null)
 const [counts, setCounts] = useState({ divisions: 0, championships: 0, reach: 0 })

 // Background Canvas Animation (Floating Geometric Network)
 useEffect(() => {
 const canvas = document.createElement('canvas')
 canvas.className = 'absolute inset-0 pointer-events-none opacity-[0.05]'
 if (sectionRef.current) {
 sectionRef.current.appendChild(canvas)
 const ctx = canvas.getContext('2d')
 let width = (canvas.width = sectionRef.current.offsetWidth)
 let height = (canvas.height = sectionRef.current.offsetHeight)

 const shapes: { x: number; y: number; size: number; rot: number; speed: number; type: string }[] = []
 for (let i = 0; i < 15; i++) {
 shapes.push({
 x: Math.random() * width,
 y: Math.random() * height,
 size: Math.random() * 40 + 20,
 rot: Math.random() * Math.PI * 2,
 speed: Math.random() * 0.2 + 0.1,
 type: Math.random() > 0.5 ? 'square' : 'triangle'
 })
 }

 const draw = () => {
 if (!ctx) return
 ctx.clearRect(0, 0, width, height)
 ctx.strokeStyle = '#dc143c'
 ctx.lineWidth = 1

 shapes.forEach(s => {
 s.rot += 0.005
 s.y -= s.speed
 if (s.y < -50) s.y = height + 50

 ctx.save()
 ctx.translate(s.x, s.y)
 ctx.rotate(s.rot)
 ctx.beginPath()
 if (s.type === 'square') {
 ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size)
 } else {
 ctx.moveTo(0, -s.size / 2)
 ctx.lineTo(s.size / 2, s.size / 2)
 ctx.lineTo(-s.size / 2, s.size / 2)
 ctx.closePath()
 }
 ctx.stroke()
 ctx.restore()
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
 // Title glitch entrance
 anime({
 targets: '.mission-heading span',
 translateX: [40, 0],
 opacity: [0, 1],
 delay: anime.stagger(200),
 duration: 1000,
 easing: 'easeOutExpo',
 })

 // Text block entrance
 anime({
 targets: '.mission-text',
 translateY: [30, 0],
 opacity: [0, 1],
 duration: 1200,
 delay: 400,
 easing: 'easeOutQuad',
 })

 // Stats counters
 const statValues = { divisions: 4, championships: 32, reach: 10 }
 anime({
 targets: statValues,
 divisions: 4,
 championships: 32,
 reach: 10,
 round: 1,
 duration: 2500,
 delay: 600,
 easing: 'easeOutExpo',
 update: () => {
 setCounts({ ...statValues })
 }
 })

 observer.unobserve(entry.target)
 }
 })
 },
 { threshold: 0.2 }
 )

 if (sectionRef.current) observer.observe(sectionRef.current)
 return () => observer.disconnect()
 }, [])

 // Mouse Parallax for the right side
 const handleMouseMove = (e: React.MouseEvent) => {
 if (!sectionRef.current) return
 const x = (e.clientX - window.innerWidth / 2) / 50
 const y = (e.clientY - window.innerHeight / 2) / 50

 anime({
 targets: '.parallax-element',
 translateX: x,
 translateY: y,
 duration: 100,
 easing: 'linear'
 })
 }

 return (
 <section
 id="mission"
 ref={sectionRef}
 className="py-40 relative bg-transparent overflow-hidden"
 onMouseMove={handleMouseMove}
 >
 {/* Background HUD Elements */}
 <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
 <div className="absolute top-1/4 left-10 w-[1px] h-64 bg-gradient-to-b from-transparent via-[#dc143c]/30 to-transparent"></div>
 <div className="absolute bottom-1/4 right-10 w-[1px] h-64 bg-gradient-to-b from-transparent via-[#dc143c]/30 to-transparent"></div>
 <div className="absolute top-20 right-[15%] text-[10px] text-gray-800 font-mono tracking-[1em] rotate-90 uppercase select-none">
 Mission_Critical_Protocol
 </div>
 </div>

 <div className="max-w-[1400px] mx-auto px-6 relative z-10">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-40 items-center">

 {/* Left: Dynamic Heading */}
 <div className="mission-heading">
 <div className="flex items-center gap-3 mb-6">
 <span className="w-12 h-[2px] bg-[#dc143c]"></span>
 <span className="text-[#dc143c] text-xs font-bold tracking-[0.6em] uppercase ">Archive 001</span>
 </div>
 <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-white uppercase italic">
 <span className="block opacity-0">Architecting</span>
 <span className="block text-stroke text-transparent opacity-0">The Future</span>
 <span className="block opacity-0 text-[#dc143c] relative">
 Of Play
 <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#dc143c] opacity-[0.15]"></div>
 </span>
 </h2>
 </div>

 {/* Right: Interactive Content Card */}
 <div className="parallax-element">
 <div className="glass-panel p-12 relative overflow-hidden group hover:border-[#dc143c]/50 hover: transition-all duration-700 rounded-xl">
 {/* Card Corner Accent */}
 <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#dc143c]/20 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-45 group-hover:from-[#dc143c]/40 opacity-50 transition-colors"></div>

 <div className="mission-text opacity-0 space-y-12 relative z-10">
 <div className="space-y-6">
 <div className="flex items-center gap-2 mb-4">
 <div className="w-2 h-2 bg-[#dc143c] rounded-full "></div>
 <span className="text-[10px] text-[#dc143c] font-mono tracking-widest uppercase">System: Fully_Autonomous</span>
 </div>
 <p className="text-xl md:text-2xl text-white font-light leading-relaxed italic">
 "Akatsuki is more than an esports organization; it is a high-performance ecosystem designed to cultivate world-class talent."
 </p>
 <p className="text-sm text-gray-300 leading-relaxed max-w-lg border-l-2 border-[#dc143c] pl-8 font-rajdhani tracking-wide">
 Utilizing proprietary data-driven insights, biometric monitoring, and state-of-the-art infrastructure, we dominate competitive landscapes across multiple tier-one titles.
 </p>
 </div>

 {/* Dynamic Stats Area */}
 <div className="grid grid-cols-3 gap-12 pt-12 border-t border-white/10">
 <div className="group/stat">
 <div className="text-5xl font-black text-white group-hover/stat:text-[#dc143c] transition-colors tabular-nums">
 0{counts.divisions}
 </div>
 <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-2 font-mono">
 Divisions
 </div>
 </div>
 <div className="group/stat">
 <div className="text-5xl font-black text-white group-hover/stat:text-[#dc143c] transition-colors tabular-nums">
 {counts.championships}
 </div>
 <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-2 font-mono group-hover/stat:text-[#dc143c] transition-colors">
 Trophy_Room
 </div>
 </div>
 <div className="group/stat">
 <div className="text-5xl font-black text-[#dc143c] tabular-nums">
 {counts.reach}M<span className="text-white">+</span>
 </div>
 <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-2 font-mono">
 Digital_Reach
 </div>
 </div>
 </div>

 <div className="pt-8">
 <button className="flex items-center gap-4 text-[10px] font-bold text-[#dc143c] tracking-[0.4em] uppercase group/btn ">
 <span className="underline underline-offset-8 decoration-[#dc143c]/30 group-hover/btn:decoration-[#dc143c] transition-colors">Execute Protocol</span>
 <svg className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
 </svg>
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <style jsx>{`
 .text-stroke {
 -webkit-text-stroke: 1px rgba(255, 255, 255, 0.2);
 }
 @keyframes float {
 0%, 100% { transform: translateY(0); }
 50% { transform: translateY(-10px); }
 }
 .parallax-element {
 animation: float 6s infinite ease-in-out;
 }
 `}</style>
 </section>
 )
}
