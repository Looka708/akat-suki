'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import Image from 'next/image'

interface FreeAgent {
    id: string
    user_id: string
    game: string
    rank_tier: number | null
    roles: string[]
    description: string | null
    is_active: boolean
    created_at: string
    users?: {
        username: string
        avatar: string | null
        discriminator: string
    }
}

export default function LFGPage() {
    const { isAuthenticated, user, isLoading: authLoading, login } = useAuth()
    const [agents, setAgents] = useState<FreeAgent[]>([])
    const [myStatus, setMyStatus] = useState<FreeAgent | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [roles, setRoles] = useState<string[]>([])
    const [description, setDescription] = useState('')

    const availableRoles = ['Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support']

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/tournament/lfg')
                if (res.ok) {
                    const data = await res.json()
                    setAgents(data.agents || [])
                }

                if (isAuthenticated) {
                    const statusRes = await fetch('/api/tournament/lfg/my-status')
                    if (statusRes.ok) {
                        const sData = await statusRes.json()
                        if (sData.agent) {
                            setMyStatus(sData.agent)
                            setRoles(sData.agent.roles || [])
                            setDescription(sData.agent.description || '')
                        }
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [isAuthenticated])

    const toggleRole = (role: string) => {
        setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!roles.length) return alert('Please select at least one role.')

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/tournament/lfg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game: 'Dota 2',
                    roles,
                    description,
                    is_active: true
                })
            })

            if (res.ok) {
                const data = await res.json()
                setMyStatus(data.agent)
                setShowForm(false)
                // Refresh list
                const agentsRes = await fetch('/api/tournament/lfg')
                if (agentsRes.ok) {
                    const aData = await agentsRes.json()
                    setAgents(aData.agents || [])
                }
            } else {
                const err = await res.json()
                alert(err.error || 'Failed to update status')
            }
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsSubmitting(true)
            setTimeout(() => setIsSubmitting(false), 500)
        }
    }

    const toggleActiveStatus = async () => {
        if (!myStatus) return
        try {
            const res = await fetch('/api/tournament/lfg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_active: !myStatus.is_active
                })
            })
            if (res.ok) {
                const data = await res.json()
                setMyStatus(data.agent)
                // Refresh list
                const agentsRes = await fetch('/api/tournament/lfg')
                if (agentsRes.ok) {
                    const aData = await agentsRes.json()
                    setAgents(aData.agents || [])
                }
            }
        } catch (err) {
            console.error(err)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6 mx-auto max-w-6xl min-h-[80vh]">
                <div className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                        <span className="text-[#dc143c] text-xs font-bold tracking-[0.5em] uppercase">
                            Free Agents
                        </span>
                        <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-rajdhani font-black tracking-tighter text-white uppercase leading-none mb-4">
                        LOOKING FOR <span className="text-transparent -webkit-text-stroke text-stroke">SQUAD</span>
                    </h1>
                    <p className="text-zinc-400 font-mono text-sm max-w-2xl mx-auto">
                        Find mercenaries to complete your roster or list yourself to get drafted by a team.
                    </p>
                </div>

                {/* My Status Banner */}
                <div className="mb-12">
                    {!isAuthenticated ? (
                        <div className="bg-zinc-900/50 border border-zinc-800 p-8 text-center rounded-sm">
                            <p className="text-zinc-400 mb-4 font-mono text-sm">Sign in via Discord to list yourself as a free agent.</p>
                            <button onClick={() => login()} className="px-8 py-4 bg-[#dc143c] hover:bg-white hover:text-black font-rajdhani font-bold tracking-widest uppercase transition-colors rounded-sm text-sm">
                                Authenticate
                            </button>
                        </div>
                    ) : (
                        <div className="bg-black border border-[#dc143c]/30 p-8 rounded-sm shadow-[0_0_30px_rgba(220,20,60,0.1)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-50"><div className="w-8 h-8 border-r border-t border-[#dc143c]"></div></div>
                            <div className="absolute bottom-0 left-0 p-4 opacity-50"><div className="w-8 h-8 border-l border-b border-[#dc143c]"></div></div>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-rajdhani font-bold uppercase tracking-wider mb-2 flex items-center gap-3">
                                        Your Mercenary Status
                                        {myStatus ? (
                                            <span className={`text-[10px] px-2 py-0.5 rounded ${myStatus.is_active ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                                                {myStatus.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">UNREGISTERED</span>
                                        )}
                                    </h2>
                                    <p className="text-sm font-mono text-zinc-500">
                                        {myStatus?.is_active
                                            ? "You are currently visible to captains looking for players."
                                            : "You are hidden from the agent list. Post your profile to join the draft."}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    {myStatus && (
                                        <button
                                            onClick={toggleActiveStatus}
                                            className="px-6 py-3 border border-white/20 hover:bg-white/10 font-rajdhani font-bold text-xs uppercase tracking-widest transition-colors rounded-sm"
                                        >
                                            {myStatus.is_active ? 'HIDE PROFILE' : 'SET ACTIVE'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowForm(!showForm)}
                                        className="px-6 py-3 bg-[#dc143c] hover:bg-white hover:text-black font-rajdhani font-bold text-xs uppercase tracking-widest transition-colors rounded-sm"
                                    >
                                        {myStatus ? 'EDIT PROFILE' : 'POST PROFILE'}
                                    </button>
                                </div>
                            </div>

                            {showForm && (
                                <form onSubmit={handleSubmit} className="mt-8 pt-6 border-t border-white/10 space-y-6 relative z-10 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold font-mono text-zinc-400 mb-3 uppercase tracking-widest">Select Your Roles (Dota 2)</label>
                                        <div className="flex flex-wrap gap-3">
                                            {availableRoles.map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => toggleRole(role)}
                                                    className={`px-4 py-2 text-xs font-bold font-rajdhani uppercase tracking-widest border rounded-[2px] transition-colors ${roles.includes(role) ? 'bg-[#dc143c] border-[#dc143c] text-white shadow-[0_0_10px_rgba(220,20,60,0.5)]' : 'bg-transparent border-white/20 text-gray-400 hover:border-white/50'}`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold font-mono text-zinc-400 mb-2 uppercase tracking-widest">Description / Achievements</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-black/50 border border-white/20 rounded-[2px] p-4 text-sm font-inter text-white focus:border-[#dc143c] focus:ring-1 focus:ring-[#dc143c] outline-none transition-all placeholder-zinc-700 min-h-[100px]"
                                            placeholder="E.g., 6k MMR, won Battlecup Tier 7 last week. Open to pos 4/5..."
                                            maxLength={300}
                                        />
                                        <div className="text-right text-[10px] text-zinc-600 font-mono mt-1">{description.length}/300</div>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-xs font-bold font-rajdhani uppercase tracking-widest hover:text-white text-zinc-500 transition-colors">Cancel</button>
                                        <button disabled={isSubmitting} type="submit" className="px-8 py-3 bg-white text-black hover:bg-[#dc143c] hover:text-white text-xs font-bold font-rajdhani uppercase tracking-widest transition-colors rounded-[2px]">
                                            {isSubmitting ? 'SAVING...' : 'SAVE & PUBLISH'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* Agents Grid */}
                <h3 className="text-xl font-rajdhani font-bold mb-6 text-white uppercase tracking-wider flex items-center gap-3">
                    <span className="w-4 h-1 bg-[#dc143c]"></span>
                    Available Agents ({agents.length})
                </h3>

                {agents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agents.map((agent) => (
                            <div key={agent.id} className="bg-zinc-900/40 border border-white/10 p-6 rounded-sm hover:border-[#dc143c]/50 transition-colors group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-black rounded-full overflow-hidden border border-white/20">
                                            {agent.users?.avatar ? (
                                                <img src={agent.users.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">?</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg font-rajdhani tracking-wide group-hover:text-[#dc143c] transition-colors">{agent.users?.username || 'Unknown'}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono">DOTA 2 AGENT</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-widest mb-2">Roles</p>
                                    <div className="flex flex-wrap gap-2">
                                        {agent.roles.map(r => (
                                            <span key={r} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded font-bold uppercase tracking-wider text-white">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {agent.description && (
                                    <div className="mb-6">
                                        <p className="text-sm font-inter text-zinc-400 italic">"{agent.description}"</p>
                                    </div>
                                )}

                                <a href={`https://discordapp.com/users/${agent.user_id}`} target="_blank" className="block w-full text-center py-3 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] font-rajdhani font-bold text-xs uppercase tracking-widest transition-colors rounded-sm">
                                    MESSAGE ON DISCORD
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border border-dashed border-white/10 bg-white/[0.02]">
                        <p className="text-zinc-500 font-mono text-sm">No free agents available currently. Be the first to join the draft!</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .text-stroke { -webkit-text-stroke: 1px rgba(255,255,255,0.2); }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <Footer />
        </main>
    )
}
