import { supabaseAdmin } from '@/lib/supabase-admin'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import SafeAvatar from '@/components/SafeAvatar'

export const dynamic = 'force-dynamic'

export default async function TournamentsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string }>
}) {
    const { q, status = 'all' } = await searchParams

    let query = supabaseAdmin
        .from('tournaments')
        .select(`
            *,
            tournament_teams (count)
        `)
        .order('start_date', { ascending: false })

    if (q) {
        query = query.ilike('name', `%${q}%`)
    }

    if (status !== 'all') {
        query = query.eq('status', status)
    }

    const { data: tournaments, error } = await query

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#dc143c] selection:text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
                <header className="mb-12 space-y-4">
                    <h1 className="text-5xl sm:text-7xl font-rajdhani font-bold tracking-tighter uppercase italic leading-none">
                        Tournament <span className="text-[#dc143c]">Directory</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-sm sm:text-base font-mono uppercase tracking-[0.2em]">
                        Explore upcoming, live, and historic events on the AKATSUKI platform.
                    </p>
                </header>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12 items-center justify-between">
                    <form className="w-full sm:w-96 relative group">
                        <input
                            type="text"
                            name="q"
                            defaultValue={q}
                            placeholder="SEARCH TOURNAMENTS..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[#dc143c] transition-all group-hover:bg-white/[0.05]"
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                    </form>

                    <nav className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-sm">
                        {['all', 'upcoming', 'live', 'completed'].map((s) => (
                            <Link
                                key={s}
                                href={`/tournaments?status=${s}${q ? `&q=${q}` : ''}`}
                                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${status === s ? 'bg-[#dc143c] text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                {s}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments?.map((t) => (
                        <Link
                            key={t.id}
                            href={`/tournament/${t.id}/brackets`}
                            className="group relative bg-[#0a0a0a] border border-white/5 rounded-sm overflow-hidden hover:border-[#dc143c]/30 transition-all duration-500"
                        >
                            {/* Accent Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-tr from-[#dc143c]/0 via-[#dc143c]/5 to-[#dc143c]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            <div className="p-8 space-y-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-[0.2em] rounded-sm border ${t.status === 'live' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' :
                                        t.status === 'upcoming' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            'bg-gray-500/10 text-gray-400 border-white/10'
                                        }`}>
                                        {t.status}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                        {new Date(t.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-rajdhani font-bold uppercase tracking-tight group-hover:text-[#dc143c] transition-colors leading-tight">
                                        {t.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">
                                        {t.game}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-6">
                                    <div>
                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Prize Pool</p>
                                        <p className="text-lg font-rajdhani font-bold text-white tracking-wide">
                                            {t.currency} {t.prize_pool.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Participants</p>
                                        <p className="text-lg font-rajdhani font-bold text-white tracking-wide">
                                            {t.tournament_teams?.[0]?.count || 0} / {t.max_slots}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex -space-x-2">
                                        {/* Simplified team preview placeholders */}
                                        <div className="w-6 h-6 rounded-full border border-black bg-zinc-900 flex items-center justify-center text-[8px] text-gray-500">T</div>
                                        <div className="w-6 h-6 rounded-full border border-black bg-zinc-900 flex items-center justify-center text-[8px] text-gray-500">K</div>
                                        <div className="w-6 h-6 rounded-full border border-black bg-zinc-900 flex items-center justify-center text-[8px] text-gray-500">+</div>
                                    </div>
                                    <div className="flex items-center gap-2 group/btn">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#dc143c]">View Event</span>
                                        <svg className="w-3 h-3 text-[#dc143c] transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {(!tournaments || tournaments.length === 0) && (
                        <div className="col-span-full py-32 text-center border border-white/5 bg-white/[0.01] rounded-sm">
                            <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em]">No tournaments found</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}
