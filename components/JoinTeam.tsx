'use client'

import { useEffect, useRef } from 'react'
import anime from 'animejs'
import Link from 'next/link'

export default function JoinTeam() {
 const sectionRef = useRef<HTMLElement>(null)

 useEffect(() => {
 const observer = new IntersectionObserver(
 (entries) => {
 entries.forEach((entry) => {
 if (entry.isIntersecting) {
 anime({
 targets: entry.target.querySelectorAll('.position-card'),
 translateY: [60, 0],
 opacity: [0, 1],
 duration: 1000,
 delay: anime.stagger(150),
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

 const positions = [
 {
 title: 'STAFF',
 description: 'Join our administrative team and help manage operations',
 icon: (
 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
 </svg>
 ),
 color: 'from-blue-600 to-blue-900',
 },
 {
 title: 'MODERATOR',
 description: 'Help maintain our community and enforce guidelines',
 icon: (
 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
 </svg>
 ),
 color: 'from-purple-600 to-purple-900',
 },
 {
 title: 'CONTENT CREATOR',
 description: 'Create engaging content for our social media channels',
 icon: (
 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
 </svg>
 ),
 color: 'from-red-600 to-red-900',
 },
 {
 title: 'ANALYST',
 description: 'Analyze gameplay data and provide strategic insights',
 icon: (
 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 ),
 color: 'from-green-600 to-green-900',
 },
 ]

 return (
 <section
 id="join-team"
 ref={sectionRef}
 className="py-32 border-y border-white/5 bg-black"
 >
 <div className="max-w-[1400px] mx-auto px-6">
 <div className="mb-20 text-center">
 <div className="flex items-center justify-center gap-3 mb-4">
 <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]"></div>
 <span className="text-[#dc143c] tracking-[0.3em] text-[10px] font-bold uppercase drop-">
 Recruitment Open
 </span>
 <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]"></div>
 </div>
 <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white uppercase">
 JOIN OUR TEAM
 </h2>
 <p className="text-xs font-mono text-gray-500 tracking-widest uppercase">
 Applications open for staff, moderators, and content creators
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
 {positions.map((position, idx) => (
 <Link
 key={idx}
 href={`/apply?position=${encodeURIComponent(position.title === 'STAFF' ? 'Staff' : position.title === 'MODERATOR' ? 'Moderator' : position.title === 'CONTENT CREATOR' ? 'Content Creator' : 'Analyst')}`}
 className="position-card group relative aspect-[3/4] overflow-hidden glass-panel border border-white/10 rounded-xl hover:border-[#dc143c]/50 transition-all duration-500 cursor-pointer hover:"
 >
 <div className={`absolute inset-0 bg-gradient-to-br ${position.color} opacity-10 group-hover:opacity-20 transition-opacity duration-700 mix-blend-screen`}></div>

 <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/60 to-transparent"></div>

 <div className="relative h-full p-8 flex flex-col justify-between z-10">
 <div className="flex justify-center">
 <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center bg-white/5 text-white group-hover:border-[#dc143c] group-hover:text-[#dc143c] group-hover: transition-all duration-300 backdrop-blur-sm">
 {position.icon}
 </div>
 </div>

 <div>
 <div className="text-[#dc143c] text-[10px] font-bold tracking-widest uppercase mb-2 text-center drop-">
 Open Position
 </div>
 <h3 className="text-2xl font-bold text-white mb-4 text-center">
 {position.title}
 </h3>
 <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed font-rajdhani">
 {position.description}
 </p>
 <div className="w-full h-[1px] bg-white/10 group-hover:bg-[#dc143c] group-hover: transition-all duration-300 mb-4"></div>
 <div className="flex items-center justify-center gap-2 text-white text-sm font-semibold group-hover:text-[#dc143c] transition-colors uppercase tracking-widest text-[10px]">
 <span>APPLY NOW</span>
 <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </div>
 </div>

 {/* Neon border effect on hover */}
 <div className="absolute inset-0 border border-[#dc143c]/0 group-hover:border-[#dc143c]/50 rounded-xl transition-all duration-500 pointer-events-none"></div>
 </Link>
 ))}
 </div>

 {/* Call to Action */}
 <div className="text-center">
 <p className="text-gray-400 mb-6 text-sm font-mono uppercase tracking-widest">
 Don&apos;t see a position that fits? We&apos;re always looking for talented individuals.
 </p>
 <Link
 href="/apply"
 className="inline-flex items-center gap-3 px-8 py-5 bg-[#dc143c]/20 border border-[#dc143c]/50 text-[#dc143c] font-bold tracking-[0.2em] hover:bg-[#dc143c] hover:text-[#0a0e1a] hover: transition-all duration-300 rounded-lg uppercase text-xs"
 >
 <span>Submit General Application</span>
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
 </svg>
 </Link>
 </div>
 </div>
 </section>
 )
}
