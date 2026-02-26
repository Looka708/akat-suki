'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'

const ROLES = ['Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support']

export default function RegisterTournamentPage() {
    const { isAuthenticated, login } = useAuth()
    const router = useRouter()

    const [teamName, setTeamName] = useState('')
    const [steamId, setSteamId] = useState('')
    const [dotaName, setDotaName] = useState('')
    const [role1, setRole1] = useState('')
    const [role2, setRole2] = useState('')
    const [role3, setRole3] = useState('')
    const [ping, setPing] = useState('')
    const [mmr, setMmr] = useState('')
    const [captainNotes, setCaptainNotes] = useState('')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successTeam, setSuccessTeam] = useState<any | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated) {
            login()
            return
        }

        if (teamName.length < 3) {
            setError('Team name must be at least 3 characters long')
            return
        }
        if (!steamId.trim()) {
            setError('Steam ID is required to score matches automatically.')
            return
        }
        if (!dotaName.trim()) {
            setError('Please enter your Dota 2 in-game name.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/tournament/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: teamName,
                    steamId,
                    dotaName,
                    role1,
                    role2,
                    role3,
                    ping,
                    mmr,
                    captainNotes,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create team')
            }

            // Upload logo if selected
            if (logoFile && data.team?.id) {
                try {
                    const formData = new FormData()
                    formData.append('logo', logoFile)
                    formData.append('teamId', data.team.id)
                    await fetch('/api/tournament/upload-logo', {
                        method: 'POST',
                        body: formData
                    })
                } catch (logoErr) {
                    console.error('Logo upload failed (non-critical):', logoErr)
                }
            }

            setSuccessTeam(data.team)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-red-600 transition-all text-white font-mono text-sm"
    const labelClass = "block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-widest"
    const selectClass = "w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-red-600 transition-all text-white text-sm appearance-none cursor-pointer"

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6 mx-auto max-w-4xl min-h-[80vh] flex flex-col items-center justify-center">
                <div className="w-full max-w-lg relative">
                    {/* Background effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-64 bg-red-600/10 blur-[100px] -z-10 rounded-full" />

                    {!successTeam ? (
                        <div className="bg-zinc-900/50 border border-zinc-800 p-8 md:p-10 rounded-xl backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />

                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-rajdhani font-bold uppercase tracking-wider text-white">
                                    Register Your Team
                                </h1>
                                <p className="text-zinc-400 mt-2 font-inter text-sm">
                                    Create a team and fill in your Dota 2 captain profile
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5 text-left">
                                {/* Team Name — full width */}
                                <div>
                                    <label htmlFor="teamName" className={labelClass}>Team Name *</label>
                                    <input type="text" id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="Enter your team name" className={inputClass} required disabled={loading} />
                                </div>

                                {/* Team Logo */}
                                <div>
                                    <label className={labelClass}>Team Logo</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-zinc-600 text-2xl">🎮</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp,image/gif"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0]
                                                    if (f) {
                                                        setLogoFile(f)
                                                        setLogoPreview(URL.createObjectURL(f))
                                                    }
                                                }}
                                                className="block w-full text-sm text-zinc-500 font-mono file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-zinc-700 file:text-xs file:font-bold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 file:cursor-pointer file:uppercase file:tracking-widest"
                                                disabled={loading}
                                            />
                                            <p className="mt-1 text-[9px] text-zinc-600 font-mono">PNG, JPEG, WebP or GIF • Max 2MB • Used as Discord role icon</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-zinc-800 pt-5">
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-4">Captain Profile</p>
                                </div>

                                {/* Row 1: Steam ID + Dota Name */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="steamId" className={labelClass}>Steam ID (SteamID64) *</label>
                                        <input type="text" id="steamId" value={steamId} onChange={(e) => setSteamId(e.target.value)}
                                            placeholder="76561198031234567" className={inputClass} disabled={loading} />
                                        <p className="mt-1 text-[9px] text-zinc-600 font-mono">Your OpenDota profile will be linked automatically</p>
                                    </div>
                                    <div>
                                        <label htmlFor="dotaName" className={labelClass}>Dota 2 Name *</label>
                                        <input type="text" id="dotaName" value={dotaName} onChange={(e) => setDotaName(e.target.value)}
                                            placeholder="Your in-game name" className={inputClass} disabled={loading} />
                                    </div>
                                </div>

                                {/* Row 2: Role Preferences */}
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-widest">Role Preferences</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[9px] text-[#dc143c] font-mono font-bold block mb-1.5 tracking-wider">★★★★★ PRIMARY</label>
                                            <select value={role1} onChange={(e) => setRole1(e.target.value)} className={selectClass} disabled={loading}>
                                                <option value="">Select...</option>
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-green-500 font-mono font-bold block mb-1.5 tracking-wider">★★★★ SECONDARY</label>
                                            <select value={role2} onChange={(e) => setRole2(e.target.value)} className={selectClass} disabled={loading}>
                                                <option value="">Select...</option>
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-yellow-500 font-mono font-bold block mb-1.5 tracking-wider">★★★ TERTIARY</label>
                                            <select value={role3} onChange={(e) => setRole3(e.target.value)} className={selectClass} disabled={loading}>
                                                <option value="">Select...</option>
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Ping + MMR + Notes */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="ping" className={labelClass}>SEA Ping (ms)</label>
                                        <input type="text" id="ping" value={ping} onChange={(e) => setPing(e.target.value)}
                                            placeholder="e.g. 80" className={inputClass} disabled={loading} />
                                    </div>
                                    <div>
                                        <label htmlFor="mmr" className={labelClass}>Current MMR</label>
                                        <input type="number" id="mmr" value={mmr} onChange={(e) => setMmr(e.target.value)}
                                            placeholder="e.g. 4500" className={inputClass} disabled={loading} min="0" max="15000" />
                                    </div>
                                    <div>
                                        <label htmlFor="notes" className={labelClass}>Captain Notes</label>
                                        <input type="text" id="notes" value={captainNotes} onChange={(e) => setCaptainNotes(e.target.value)}
                                            placeholder="Any notes..." className={inputClass} disabled={loading} />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-inter">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-3 px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-rajdhani font-bold tracking-wider uppercase transition-colors rounded-lg flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : !isAuthenticated ? (
                                        <span>Login to Create</span>
                                    ) : (
                                        <span>Create Team & Get Invite Link</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 border border-zinc-800 p-8 md:p-12 rounded-xl backdrop-blur-sm text-center">
                            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-3xl font-rajdhani font-bold mb-4 text-white">Team Created Successfully!</h2>
                            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                                Your team <strong>{successTeam.name}</strong> has been created. A Discord role and voice channel are being set up.
                            </p>

                            <div className="bg-black/50 border border-zinc-800 p-6 rounded-lg mb-8">
                                <p className="text-sm font-inter text-zinc-500 mb-2 uppercase tracking-wide">Your Invite Link</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${window.location.origin}/tournament/invite/${successTeam.invite_code}`}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-lg font-mono text-sm"
                                    />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/tournament/invite/${successTeam.invite_code}`)}
                                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-rajdhani uppercase tracking-wider font-bold rounded-lg transition-colors whitespace-nowrap"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/tournament/dashboard')}
                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-rajdhani font-bold tracking-wider uppercase transition-colors rounded-lg"
                            >
                                Go to Team Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    )
}
