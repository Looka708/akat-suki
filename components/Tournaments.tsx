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
 const [matchCount, setMatchCount] = useState(0)
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
 // Safety timeout to ensure loading never gets stuck longer than 5 seconds
 const timeoutId = setTimeout(() => setLoading(false), 5000)

 try {
 // 1. Fetch tournaments (now includes teams and matches in one payload)
 const tRes = await fetch('/api/tournaments')
 if (!tRes.ok) throw new Error('Database connection failed')

 const tData = await tRes.json()
 const activeTournament = tData.tournaments?.[0]

 if (!activeTournament) {
 setLoading(false)
 clearTimeout(timeoutId)
 return
 }

 setTournament(activeTournament)
 setRegisteredTeams(activeTournament.registered_teams || [])
 setMatchCount(activeTournament.matches?.length || 0)

 // 2. Fetch "my-team" separately as it depends on auth session
 if (isAuthenticated) {
 const myTeamRes = await fetch('/api/tournament/my-team')
 if (myTeamRes.ok) {
 const myTeamData = await myTeamRes.json()
 if (myTeamData.team) setTeam(myTeamData.team)
 }
 }

 } catch (err) {
 console.error('Tournament loading error:', err)
 } finally {
 clearTimeout(timeoutId)
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

 // Animate lists when data is loaded
 useEffect(() => {
 if (!loading && (team || registeredTeams.length > 0)) {
 anime({
 targets: ['.registration-list > div', '.squad-list > div'],
 translateY: [20, 0],
 opacity: [0, 1],
 duration: 800,
 delay: anime.stagger(100),
 easing: 'easeOutQuart',
 })
 }
 }, [loading, team, registeredTeams])

 const handleCopyLink = () => {
 if (!team) return
 const inviteLink = `${window.location.origin}/tournament/invite/${team.invite_code}`
 navigator.clipboard.writeText(inviteLink)
 alert('Invite link copied to clipboard!')
 }

 if (loading) {
 return (
 <section className="relative py-32 bg-transparent min-h-[800px] flex flex-col pt-40">
 <div className="max-w-[1400px] mx-auto px-6 w-full relative z-10 flex flex-col">
 <div className="mb-20 text-center xl:text-left flex flex-col xl:items-start items-center">
 <div className="flex items-center justify-center xl:justify-start gap-3 mb-4 w-full">
 <span className="w-10 h-[1px] bg-white/20"></span>
 <div className="w-32 h-3 bg-white/10 rounded animate-pulse"></div>
 </div>
 <div className="w-64 md:w-96 h-12 md:h-20 bg-white/10 rounded animate-pulse flex-shrink-0"></div>
 </div>

 <div className="relative w-full rounded-xl border border-white/5 overflow-hidden glass-card opacity-100 flex flex-col xl:flex-row min-h-[600px]">
 <div className="relative w-full xl:w-1/2 min-h-[400px] xl:min-h-full bg-white/5 animate-pulse"></div>
 <div className="relative w-full xl:w-1/2 p-8 xl:p-12 bg-black/80 backdrop-blur-md flex flex-col justify-center border-l border-white/5">
 <div className="w-full h-8 bg-white/10 rounded animate-pulse mb-6"></div>
 <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse mb-10"></div>
 <div className="space-y-4 w-full">
 <div className="w-full h-16 bg-white/5 rounded-lg animate-pulse"></div>
 <div className="w-full h-16 bg-white/5 rounded-lg animate-pulse delay-75"></div>
 <div className="w-full h-16 bg-white/5 rounded-lg animate-pulse delay-150"></div>
 </div>
 </div>
 </div>
 </div>
 </section>
 )
 }

 return (
 <section
 id="tournaments"
 ref={sectionRef}
 className="relative py-32 bg-transparent"
 >
 <div className="max-w-[1400px] mx-auto px-6 relative z-10">

 {/* Tactical Header */}
 <div className="mb-20 text-center xl:text-left">
 <div className="flex items-center justify-center xl:justify-start gap-3 mb-4">
 <span className="w-10 h-[1px] bg-[#dc143c]"></span>
 <span className="text-[#dc143c] text-xs font-bold tracking-[0.5em] uppercase ">
 Featured Event
 </span>
 </div>
 <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-[#dc143c] uppercase leading-none">
 ENTER THE <span className="text-transparent" style={{ WebkitTextStroke: '1px #dc143c' }}>ARENA</span>
 </h2>
 </div>

 {/* Single Tile Hero */}
 {tournament ? (
 <div
 className="tournament-hero relative w-full rounded-xl border border-white/10 overflow-hidden glass-card group opacity-100 flex flex-col xl:flex-row min-h-[600px] transition-all duration-300"
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
 className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 xl:bg-gradient-to-r xl:to-transparent"></div>

 <div className="absolute bottom-0 left-0 p-8 xl:p-12">
 <div className="flex flex-col gap-2 mb-4">
 <div className="bg-[#dc143c]/20 text-[#dc143c] border border-[#dc143c]/50 text-[10px] font-bold tracking-[0.3em] uppercase px-4 py-1 inline-block w-fit rounded-full ">
 {tournament.status?.toUpperCase() || 'LIVE NOW'}
 </div>
 <div className="text-[#dc143c] text-xs font-bold tracking-[0.2em] uppercase ">
 ⚠️ LIMITED SLOTS • JOIN FAST
 </div>
 </div>
 <h3 className="text-5xl xl:text-7xl font-black text-white leading-none uppercase tracking-tighter mb-6 shadow-black drop-">
 {tournament.name}
 </h3>
 <div className="flex gap-8 items-center bg-black/40 backdrop-blur-md rounded-xl border border-white/10 inline-flex px-6 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
 <div>
 <p className="text-[10px] text-[#dc143c] uppercase tracking-widest font-mono">Prize Pool</p>
 <p className="text-3xl font-bold text-white ">
 {formatCurrency(tournament.prize_pool || 0, tournament.currency || 'USD')}
 </p>
 </div>
 <div className="w-[1px] h-10 bg-white/20"></div>
 <div>
 <p className="text-[10px] text-[#dc143c] uppercase tracking-widest font-mono">Format</p>
 <p className="text-3xl font-bold text-white">5v5 OPEN</p>
 </div>
 </div>
 </div>
 </div>

 {/* Interaction Side */}
 <div className="relative w-full xl:w-1/2 p-8 xl:p-12 bg-black/80 backdrop-blur-md flex flex-col justify-center border-l border-white/5">
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
 <h4 className="text-3xl font-bold text-[#dc143c] uppercase tracking-wide text-center ">Registration Closed</h4>
 <p className="text-zinc-400 font-mono text-sm text-center mt-2">
 All slots are filled. Here are the participating squads.
 </p>
 </div>
 <div className="space-y-6 registration-list">
 {registeredTeams.map((t: any) => (
 <div key={t.id} className="bg-black/40 border border-[#dc143c]/20 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:hover:border-[#dc143c] hover: transition-all">
 <h5 className="text-xl font-bold text-white uppercase mb-3 border-b border-white/10 pb-2">
 {t.name}
 </h5>
 <div className="space-y-2">
 {t.tournament_players?.map((p: any) => (
 <a
 key={p.id}
 href={p.steam_id ? `https://steamcommunity.com/profiles/${p.steam_id}` : '#'}
 target={p.steam_id ? "_blank" : "_self"}
 className={`flex items-center gap-4 bg-[#1a1f2e]/60 p-2 rounded-lg transition-colors border border-white/5 ${p.steam_id ? 'hover:bg-white/10 hover:border-[#dc143c]/30 cursor-pointer' : 'cursor-default'}`}
 >
 <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 border border-white/20">
 {p.users?.avatar ? (
 <img src={p.users.avatar} alt="Avatar" className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500">?</div>
 )}
 </div>
 <div className="flex-1">
 <p className="text-xs font-bold text-white tracking-wide">{p.users?.username || 'Unknown'}</p>
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
 {matchCount > 0 && (
 <div className="mt-6 flex flex-col gap-3">
 <Link
 href={`/tournament/${tournament.id}/brackets`}
 className="block w-full py-4 bg-[#dc143c]/10 border border-[#dc143c]/50 hover:bg-[#dc143c] hover:text-[#0a0e1a] text-center text-[#dc143c] text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg "
 >
 ⚔ VIEW LIVE BRACKETS
 </Link>
 <Link
  href={`/tournament/${tournament.id}`}
  className="block w-full py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg"
  >
  📜 VIEW PUBLIC TOURNAMENT HUB
  </Link>
  <Link
  href={`/tournament/${tournament.id}/leaderboard`}
 className="block w-full py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg"
 >
 VIEW LEADERBOARD
 </Link>
 <Link
 href={`/tournament/${tournament.id}`}
 className="block w-full py-3 bg-transparent text-zinc-400 hover:text-white text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg"
 >
 TOURNAMENT HUB
 </Link>
 </div>
 )}
 </div>
 )
 }

 if (!isAuthenticated) {
 return (
 <div className="text-center max-w-md mx-auto relative z-10 w-full glass-panel p-8 rounded-xl border-t border-[#dc143c]/30 border-b border-[#dc143c]/30">
 <h4 className="text-3xl font-bold text-[#dc143c]/80 uppercase tracking-wide mb-4 text-center">Welcome to the Arena</h4>
 <p className="text-zinc-400 mb-8 font-mono text-sm text-center max-w-sm mx-auto leading-relaxed">
 Sign in with your Discord account to view your team status, manage your roster, and join the upcoming tournament.
 </p>

 <div className="flex flex-col gap-3">
 <button
 onClick={() => login()}
 className="w-full py-5 bg-[#3a86ff]/20 border border-[#3a86ff]/50 hover:bg-[#3a86ff] hover:text-white text-[#3a86ff] text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg flex items-center justify-center gap-3 "
 >
 <span>Authenticate via Discord</span>
 </button>

 <Link
 href={`/tournament/${tournament.id}`}
 className="block w-full py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg"
 >
 📜 VIEW PUBLIC TOURNAMENT HUB
 </Link>

 {matchCount > 0 && (
 <Link
 href={`/tournament/${tournament.id}/brackets`}
 className="block w-full py-4 bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:border-[#dc143c]/50 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg hover:"
 >
 ⚔ VIEW BRACKETS
 </Link>
 )}
 </div>
 </div>
 )
 }

 if (!team) {
 return (
 <div className="text-center max-w-md mx-auto relative z-10 w-full glass-panel p-8 rounded-xl border-t border-[#dc143c]/30">
 <h4 className="text-3xl font-bold text-white uppercase tracking-wide mb-4 ">No Active Squad</h4>
 <p className="text-zinc-300 mb-6 font-mono text-sm border-l-2 border-[#dc143c] pl-4 text-left">
 You are authenticated but have no active tournament roster. Create a team or get an invite link from a captain.
 </p>
 <div className="text-[#dc143c] text-[10px] font-bold tracking-[0.2em] uppercase mb-8 text-center">
 ⚠️ LIMITED SLOTS • JOIN FAST
 </div>
 <Link
 href="/tournament/register"
 className="block w-full py-5 bg-[#dc143c]/20 border border-[#dc143c]/50 hover:bg-[#dc143c] hover:text-white text-[#dc143c] text-xs font-bold uppercase tracking-[0.5em] transition-all rounded-lg "
 >
 Create New Squad</Link>
  <Link
  href={`/tournament/${tournament.id}`}
  className="mt-3 block w-full py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg"
  >
  📜 VIEW PUBLIC TOURNAMENT HUB
  </Link>
 {matchCount > 0 && (
 <Link
 href={`/tournament/${tournament.id}/brackets`}
 className="mt-3 block w-full py-4 bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:border-[#dc143c]/50 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg hover:"
 >
 ⚔ VIEW BRACKETS
 </Link>
 )}
 </div>
 )
 }

 return (
 <div className="relative z-10 w-full">
 <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
 <div>
 <p className="text-[10px] text-[#dc143c] font-bold tracking-[0.3em] uppercase mb-1 drop-">Squad Identified</p>
 <h4 className="text-3xl font-bold text-white uppercase tracking-wide">
 {team.name}
 </h4>
 </div>
 <div className="text-right">
 <p className="text-xs text-zinc-500 font-mono">Roster</p>
 <p className="text-2xl font-bold text-white">{team.tournament_players?.length || 0}/5</p>
 </div>
 </div>

 <div className="space-y-3 mb-8 squad-list">
 {team.tournament_players?.map((p: any) => (
 <div key={p.id} className="flex items-center gap-4 bg-black/40 border border-white/10 p-3 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-white/30 transition-all">
 <div className="w-8 h-8 rounded-full overflow-hidden bg-transparent border border-white/20">
 {p.users?.avatar ? (
 <img src={p.users.avatar} alt="Avatar" className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">?</div>
 )}
 </div>
 <div className="flex-1">
 <p className="text-sm font-bold text-white tracking-wide">{p.users?.username || 'Unknown'}</p>
 </div>
 {p.user_id === team.captain_id && (
 <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest font-mono">CPT</span>
 )}
 </div>
 ))}

 {Array.from({ length: Math.max(0, 5 - (team.tournament_players?.length || 0)) }).map((_, i) => (
 <div key={`empty-${i}`} className="flex items-center gap-4 bg-[#0a0e1a]/20 border border-dashed border-white/10 p-3 rounded-lg opacity-50">
 <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center">
 <span className="text-zinc-500 text-xs">+</span>
 </div>
 <div>
 <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">Open Slot</p>
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
 <div className="space-y-3">
 {team.captain_id === user?.id && (
 <button
 onClick={handleCopyLink}
 className="w-full py-4 bg-[#3a86ff]/10 border border-[#3a86ff]/50 hover:bg-[#3a86ff] hover:text-[#0a0e1a] text-center text-[#3a86ff] text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg "
 >
 COPY INVITE LINK
 </button>
 )}
 <Link
 href={`/tournament/${tournament.id}/manage`}
 className="block w-full py-4 bg-[#dc143c]/20 border border-[#dc143c]/50 hover:bg-[#dc143c] hover:text-[#0a0e1a] text-center text-[#dc143c] text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg "
 >
 MANAGE SQUAD
 </Link>
 {matchCount > 0 && (
 <Link
 href={`/tournament/${tournament.id}/brackets`}
 className="block w-full py-4 bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:border-[#dc143c]/50 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg hover:"
 >
 ⚔ VIEW BRACKETS
 </Link>
 )}
 </div>
 </div>
 <div className="mt-4 flex flex-col gap-3">
 <Link
  href={`/tournament/${tournament.id}`}
  className="block w-full py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg"
  >
  📜 VIEW PUBLIC TOURNAMENT HUB
  </Link>
  <Link
  href={`/tournament/${tournament.id}/leaderboard`}
 className="block w-full py-4 bg-transparent border border-[#dc143c]/30 text-[#dc143c] hover:bg-[#dc143c]/10 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg"
 >
 VIEW TOURNAMENT LEADERBOARD
 </Link>
 <Link
 href={`/tournament/${tournament.id}/brackets`}
 className="block w-full py-4 bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:border-[#dc143c]/50 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-lg hover:"
 >
 ⚔ VIEW BRACKETS
 </Link>
 </div>

 </div>
 )
 })()}
 </div>
 </div>
 ) : (
 <div className="text-center py-32 border border-white/10 bg-white/[0.02] rounded-xl glass-panel">
 <h3 className="text-3xl font-bold text-[#dc143c] uppercase tracking-wide mb-2 ">No Active Tournaments</h3>
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
